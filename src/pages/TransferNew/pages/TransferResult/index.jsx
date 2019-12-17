/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:46:04
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 14:48:49
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  Card,
  WingBlank,
  WhiteSpace,
  List,
  Icon,
  Button,
  Toast,
  Modal
} from 'antd-mobile';
import { PacmanLoader } from 'react-spinners';
import { css } from '@emotion/core';

import { SYMBOL, TOKEN_DECIMAL } from '@constants';
import './index.css';

const { Item } = List;

const override = css`
  display: block;
  margin: 30px auto;
`;

function getFormItems() {
  const {
    amount,
    // minerFee,
    receiverAddress,
    senderAddress,
    memo,
    txId,
    blockHeight
  } = this.state;

  const formItems = [
    {
      title: 'amount',
      value: <span className='transfer-amount'>{`${amount} ${SYMBOL}`}</span>,
      isCopyable: false
    },
    // {
    //   title: 'miner fee',
    //   value: minerFee,
    //   isCopyable: false
    // },
    {
      title: 'receiver address',
      value: receiverAddress,
      isCopyable: true
    },
    {
      title: 'sender address',
      value: senderAddress,
      isCopyable: true
    },
    {
      title: 'memo',
      value: memo,
      isCopyable: false
    },
    {
      title: 'tx id',
      value: txId,
      isCopyable: true
    },
    {
      title: 'block height',
      value: blockHeight,
      isCopyable: false
    }
  ];

  return formItems;
}

class TransferResult extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      amount: null,
      minerFee: null,
      receiverAddress: null,
      senderAddress: null,
      memo: null,
      txId: null,
      blockHeight: null,
      loading: true,
      status: null,
      isModalShow: false,
      errors: []
    };

    this.jump = this.jump.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  componentDidMount() {
    this.fetchTransactionResult();
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  fetchTransactionResult() {
    const { txId } = this.props.match.params;
    const { bridge } = this.props;
    this.setState({
      txId
    });
    console.log({
      txId
    });

    setTimeout(() => {
      const payload = {
        txId
      };
      bridge
        .api({
          apiPath: '/api/blockChain/transactionResult', // api路径
          arguments: [
            {
              name: 'transactionResult',
              value: txId
            }
          ]
        })
        .then(res => {
          console.log({
            res
          });
          if (+res.code !== 0) {
            this.setState({
              errors: res.error,
              isModalShow: true,
              loading: false
            });
            // todo: find a toast that can should multi-line
            Toast.fail(
              'There are some errors',
              3
            );
            return;
          }

          const { Status: status, TransactionId } = res.data;
          const {
            From: senderAddress,
            RefBlockNumber: blockHeight
          } = res.data.Transaction;
          const params = JSON.parse(res.data.Transaction.Params);
          const { amount, memo, to } = params;

          this.setState({
            amount: +amount / TOKEN_DECIMAL,
            // minerFee,
            receiverAddress: to,
            senderAddress,
            memo,
            txId: TransactionId,
            blockHeight,
            status,
            loading: false
          });
        })
        .catch(err =>
          console.log({
            err
          })
        );
    }, 4000);
  }

  jump() {
    const { history } = this.props;
    history.push('/personal-center');
  }

  // todo: the modal's code is repeating
  render() {
    const { loading, status, isModalShow, errors } = this.state;
    const formItems = getFormItems.call(this);

    return (
      <section>
        <WingBlank size='lg'>
          <WhiteSpace size='lg' />
          <Card>
            {loading ? (
              <PacmanLoader
                css={override}
                sizeUnit='px'
                size={25}
                color='#108ee9'
                loading={loading}
              />
            ) : (
              <Card.Body>
                <div className='transfer-status-container'>
                  <Icon type='check-circle' color='green' />
                  <p className='transfer-status'>Transfer {status}</p>
                  {/* <p className='tip-color transfer-time'>
                    {new Date().toLocaleString()}
                  </p> */}
                </div>
                <List className='my-list'>
                  {formItems.map(item => (
                    <Item extra={item.value} key={item.title}>
                      {item.title}:
                    </Item>
                  ))}
                </List>
              </Card.Body>
            )}
          </Card>
          <Button type='primary' onClick={this.jump}>
            Back
          </Button>
          <WhiteSpace size='lg' />
        </WingBlank>
        <Modal
          visible={isModalShow}
          transparent
          maskClosable={false}
          onClose={this.onCloseModal}
          title='Failed'
          footer={[
            {
              text: 'Ok',
              onPress: () => {
                console.log('ok');
                this.onCloseModal();
              }
            }
          ]}
        >
          <p>There are some error:</p>
          {Array.isArray(errors) &&
            errors.map(item => (
              <p key={item.errorCode}>
                {item.errorCode}: {item.errorMsg}
              </p>
            ))}
        </Modal>
      </section>
    );
  }
}

const mapStateToProps = state => ({
  ...state.common
});

const wrapper = compose(
  withRouter,
  connect(mapStateToProps)
);

export default wrapper(TransferResult);
