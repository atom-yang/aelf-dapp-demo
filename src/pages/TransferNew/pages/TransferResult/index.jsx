/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:46:04
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 14:48:49
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  WingBlank,
  WhiteSpace,
  List,
  Button,
  ActivityIndicator
} from 'antd-mobile';
import { SYMBOL, TOKEN_DECIMAL } from '@constants';
import {
  errorModal
} from '../../../../utils/error';
import {
  getTxResult
} from '../../../../utils/bridge';
import './index.css';

const { Item } = List;

class TransferResult extends PureComponent {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    bridge: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: null,
      receiverAddress: null,
      senderAddress: null,
      memo: null,
      txId: null,
      blockHeight: null,
      loading: true,
      status: null
    };
  }

  componentDidMount() {
    this.fetchTransactionResult();
  }

  getFormItems() {
    const {
      amount,
      receiverAddress,
      senderAddress,
      memo,
      txId,
      blockHeight
    } = this.state;

    const formItems = [
      {
        title: 'amount',
        value: <span className="transfer-amount">{`${amount} ${SYMBOL}`}</span>,
        isCopyable: false
      },
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

  fetchTransactionResult() {
    const { bridge, match } = this.props;
    const { txId } = match.params;
    this.setState({
      txId
    });

    new Promise((resolve, reject) => {
      getTxResult(bridge, txId, resolve, reject);
    }).then(transaction => {
      const { Status: status, TransactionId, Transaction } = transaction;
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
    }).catch(err => {
      this.setState({
        status: 'FAILED',
        loading: false
      });
      errorModal(err);
    });
  }

  render() {
    const { loading, status } = this.state;
    const formItems = this.getFormItems();

    return (
      <WingBlank size="lg">
        <WhiteSpace size="lg" />
        <Card>
          {loading ? (
            <ActivityIndicator
              className="transfer-result-loading"
              animating
              text="Loading..."
            />
          ) : (
            <Card.Body>
              <div className="transfer-status-container">
                <p className="transfer-status">
                  Transfer
                  {status}
                </p>
              </div>
              <List className="my-list">
                {formItems.map(item => (
                  <Item extra={item.value} key={item.title}>
                    {item.title}
                    :
                  </Item>
                ))}
              </List>
            </Card.Body>
          )}
        </Card>
        <Button
          type="primary"
          href="#/personal-center"
        >
          Back
        </Button>
        <WhiteSpace size="lg" />
      </WingBlank>
    );
  }
}

const mapStateToProps = state => ({
  ...state.common
});

export default connect(mapStateToProps)(TransferResult);
