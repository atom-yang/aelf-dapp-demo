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
  Toast
} from 'antd-mobile';
import { PacmanLoader } from 'react-spinners';
import { css } from '@emotion/core';
import { SYMBOL, TOKEN_DECIMAL } from '@constants';
import {
  errorModal,
  handleResponse
} from '../../../../utils/error';
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
      status: null
    };

    this.jump = this.jump.bind(this);
  }

  componentDidMount() {
    this.fetchTransactionResult();
  }

  fetchTransactionResult() {
    const { txId } = this.props.match.params;
    const { bridge } = this.props;
    this.setState({
      txId
    });

    setTimeout(async () => {
      try {
        const txResult = handleResponse(await bridge.api({
          apiPath: '/api/blockChain/transactionResult', // api路径
          arguments: [
            {
              name: 'transactionResult',
              value: txId
            }
          ]
        }));
        const { Status: status, TransactionId, Transaction } = txResult.data;
        if (status.toUpperCase() === 'MINED') {
          const {
            From: senderAddress,
            RefBlockNumber: blockHeight
          } = Transaction;
          const params = JSON.parse(Transaction.Params);
          const { amount, memo, to } = params;
          this.setState({
            amount: +amount / TOKEN_DECIMAL,
            receiverAddress: to,
            senderAddress,
            memo,
            txId: TransactionId,
            blockHeight,
            status,
            loading: false
          });
        } else if (status.toUpperCase() === 'FAILED') {
          this.setState({
            txId: TransactionId,
            status,
            loading: false
          });
        } else {
          this.fetchTransactionResult();
        }
      } catch (e) {
        console.error(e);
        errorModal(e);
        this.setState({
          loading: false,
          status: 'FAILED'
        });
      }
    }, 4000);
  }

  jump() {
    const { history } = this.props;
    history.push('/personal-center');
  }

  render() {
    const { loading, status } = this.state;
    const formItems = getFormItems.call(this);

    return (
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
