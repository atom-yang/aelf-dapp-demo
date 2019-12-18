import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  InputItem,
  List,
  Button,
  DatePicker,
  Modal,
  ActivityIndicator,
} from 'antd-mobile';
import { createForm } from 'rc-form';
import {
  getTxResult
} from '@utils/bridge';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';
import ElectionContract from '@api/election';
import { errorModal, handleResponse } from '@utils/error';

const LABEL_NUM = 6;

class Vote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      loading: true,
      voteAmount: null,
      lockTime: null,
      txResult: {
        amount: '-',
        txId: '-',
        blockHeight: '-',
        expiredTime: '-',
      },
      modalVisible: false,
    };

    this.publicKey = props.match.params.publicKey;

    this.onVoteClick = this.onVoteClick.bind(this);
  }

  async onVoteClick() {
    const { voteAmount } = this.state;
    let { lockTime } = this.state;

    this.electionContract = new ElectionContract();

    lockTime = moment(lockTime);
    const payload = {
      candidatePubkey: this.publicKey,
      amount: voteAmount,
      endTimestamp: {
        seconds: lockTime.unix(),
        nanos: lockTime.milliseconds() * 1000,
      }
    };

    try {
      this.setState({
        modalVisible: true,
      });
      const res = handleResponse(await this.electionContract.vote(payload));
      this.fetchTxResult(res.data.TransactionId);
      console.log('vote', res);
    } catch (err) {
      errorModal(err);
      console.error('vote', err);
    }
  }

  getFormItems() {
    const { copied, txResult } = this.state;
    const {
      amount,
      txId,
      blockHeight,
      expiredTime
    } = txResult;

    const formItems = [
      {
        title: 'amount',
        value: <span className="transfer-amount">{`${amount}`}</span>,
        isCopyable: false,
      },
      {
        title: 'expired time',
        value: moment(expiredTime).format('YYYY-MM-DD'),
        isCopyable: false,
      },
      {
        title: 'tx id',
        value: (
          <CopyToClipboard
            text={txId}
            onCopy={() => this.setState({ copied: true })}
          >
            <span>
              {txId.slice(0, 10)}
              ...
              <i className={`iconfont ${copied ? 'icon-duigou' : 'icon-copy'}`} />
            </span>
          </CopyToClipboard>
        ),
        isCopyable: true,
      },
      {
        title: 'block height',
        value: blockHeight,
        isCopyable: false,
      },
    ];

    return formItems;
  }

  fetchTxResult(txId) {
    const { bridge } = this.props;
    new Promise((resolve, reject) => {
      getTxResult(bridge, txId, resolve, reject);
    }).then(transaction => {
      const { Status: status, TransactionId, Transaction } = transaction;
      const { RefBlockNumber: blockHeight } = Transaction;
      const params = JSON.parse(Transaction.Params);
      const { amount, candidatePubkey, endTimestamp } = params;

      this.setState({
        txResult: {
          amount: +amount,
          txId: TransactionId,
          blockHeight,
          status,
          nodeAdd: candidatePubkey,
          expiredTime: endTimestamp
        },
        loading: false
      });
    }).catch(e => {
      this.setState({
        loading: false
      });
      errorModal(e);
    });
  }

  render() {
    const { form } = this.props;
    const { getFieldProps } = form;
    const {
      lockTime,
      modalVisible,
      voteAmount,
      loading
    } = this.state;

    return (
      <div>
        <h1 className="page-title">Vote</h1>
        {/* <List className='transfer-form'> */}
        <InputItem
          {...getFieldProps('money3')}
          labelNumber={LABEL_NUM}
          placeholder="input the transfer amount"
          clear
          moneyKeyboardAlign="left"
          value={this.publicKey}
          editable={false}
        >
          Add
        </InputItem>
        <InputItem
          type="number"
          labelNumber={LABEL_NUM}
          placeholder="input the amount"
          clear
          value={voteAmount}
          onChange={amount => this.setState({ voteAmount: amount })}
        >
          Vote Amount
        </InputItem>
        {/* <p className='reciever-pubkey-tip tip-color'>
          (Only support main chain transfer) &nbsp;&nbsp;&nbsp;
        </p> */}
        <DatePicker
          mode="date"
          title="Select Date"
          extra="Select"
          value={lockTime}
          onChange={time => this.setState({ lockTime: time })}
        >
          <List.Item arrow="horizontal">Expired Time</List.Item>
        </DatePicker>
        {/* </List> */}
        <div className="btn-container">
          <Button
            className="trading-btn"
            type="primary"
            onClick={this.onVoteClick}
          >
            Vote
          </Button>
        </div>

        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false,
              copied: false,
              loading: true,
            });
          }}
          closable
          title="Result"
          transparent
        >
          {loading ? (
            <ActivityIndicator animating={loading} />
          ) : (
            <ul>
              {this.getFormItems().map(item => (
                <li key={item.title}>
                  <span className="item-label">
                    {item.title}
:
                    {' '}
                  </span>
                  <span className="item-value">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = {};

export default createForm()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Vote)
);
