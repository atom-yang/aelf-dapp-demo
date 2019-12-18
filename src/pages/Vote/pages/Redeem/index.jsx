import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  InputItem,
  List,
  Button,
  Modal,
  Picker,
  ActivityIndicator,
} from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';
import ElectionContract from '@api/election';
import { computeRedeemableVoteRecords, getFormatedLockTime } from '@utils/time';
import { publicKeyToAddress } from '@utils/encrypt';
import {
  getTxResult
} from '@utils/bridge';
import {
  errorModal, handleResponse
} from '@utils/error';

const LABEL_NUM = 6;

class Redeem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      loading: true,
      activeVotesForOne: null,
      redeemableVotesForOne: null,
      txResult: {
        amount: '-',
        txId: '-',
        blockHeight: '-',
        expiredTime: '-',
      },
      modalVisible: false,
      redeemableVoteRecordsForOneCandidate: [],
    };

    this.publicKey = props.match.params.publicKey;

    this.onRedeemClick = this.onRedeemClick.bind(this);
  }

  componentDidMount() {
    const { userVotes } = this.props;
    if (userVotes) {
      this.computeUserVotes();
    }
  }

  componentDidUpdate(prevProps) {
    const { userVotes } = this.props;

    if (prevProps.userVotes !== userVotes) {
      this.computeUserVotes();
    }
  }

  async onRedeemClick() {
    const { form } = this.props;
    const { getFieldValue } = form;
    this.electionContract = new ElectionContract();

    const payload = getFieldValue('voteToRedeem');

    try {
      const res = handleResponse(await this.electionContract.withdraw(payload));
      this.setState({
        modalVisible: true,
      });
      this.fetchTxResult(res.data.TransactionId);
    } catch (err) {
      errorModal(err);
      console.error('withdraw', err);
    }
  }

  getFormItems() {
    const {
      copied,
      txResult
    } = this.state;
    const {
      txId,
      blockHeight
    } = txResult;

    const formItems = [
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

  computeUserVotes() {
    const { userVotes } = this.props;

    const activeVoteRecordsForOneCandidate = userVotes.activeVotingRecords.filter(
      item => item.candidate === this.publicKey
    );
    const activeVotesForOne = activeVoteRecordsForOneCandidate.reduce(
      (total, item) => total + +item.amount,
      0
    );
    const redeemableVoteRecordsForOneCandidate = computeRedeemableVoteRecords(
      activeVoteRecordsForOneCandidate
    );
    const redeemableVotesForOne = redeemableVoteRecordsForOneCandidate.reduce(
      (total, item) => total + +item.amount,
      0
    );
    const redeem = redeemableVoteRecordsForOneCandidate.map(item => {
      const formatedLockTime = getFormatedLockTime(item);
      const formatedVoteTime = moment
        .unix(item.voteTimestamp.seconds)
        .format('YYYY-MM-DD HH:mm:ss');
      const name = publicKeyToAddress(item.candidate);

      // For display
      const label = `amount: ${item.amount} ${item.formatedVoteTime}`;
      const value = item.voteId;
      return {
        ...item,
        formatedLockTime,
        formatedVoteTime,
        name,
        label,
        value
      };
    });

    this.setState({
      redeemableVoteRecordsForOneCandidate: redeem,
      activeVotesForOne,
      redeemableVotesForOne,
    });
  }

  fetchTxResult(txId) {
    const { bridge } = this.props;
    new Promise((resolve, reject) => {
      getTxResult(bridge, txId, resolve, reject);
    }).then(transaction => {
      const { Status: status, TransactionId, Transaction } = transaction;
      const { RefBlockNumber: blockHeight } = Transaction;
      const params = JSON.parse(Transaction.Params);
      const { candidatePubkey, endTimestamp } = params;
      this.setState({
        txResult: {
          txId: TransactionId,
          blockHeight,
          status,
          nodeAdd: candidatePubkey,
          expiredTime: endTimestamp,
        },
        loading: false,
      });
    }).catch(err => {
      errorModal(err);
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    const { form } = this.props;
    const { getFieldProps } = form;
    const {
      modalVisible,
      redeemableVoteRecordsForOneCandidate,
      activeVotesForOne,
      redeemableVotesForOne,
      loading
    } = this.state;

    return (
      <div>
        <h1 className="page-title">Redeem</h1>
        <InputItem
          {...getFieldProps('money3')}
          labelNumber={LABEL_NUM}
          placeholder="input the transfer amount"
          clear
          moneyKeyboardAlign="left"
          value={this.publicKey}
        >
          Add
        </InputItem>
        <InputItem
          type="number"
          labelNumber={LABEL_NUM}
          value={activeVotesForOne}
          editable={false}
        >
          Total Votes
        </InputItem>
        <p className="item-tip tip-color">
          redeemable votes:
          {' '}
          {redeemableVotesForOne}
          {' '}
          &nbsp;&nbsp;&nbsp;
        </p>
        <Picker
          data={redeemableVoteRecordsForOneCandidate}
          cols={1}
          {...getFieldProps('voteToRedeem')}
          className="forss"
        >
          <List.Item arrow="horizontal">Select Vote</List.Item>
        </Picker>
        <div className="btn-container">
          <Button
            disabled={!(redeemableVotesForOne > 0)}
            className="trading-btn"
            type="primary"
            onClick={this.onRedeemClick}
          >
            Redeem
          </Button>
        </div>
        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false,
              loading: true,
              copied: false,
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

const mapStateToProps = state => ({ ...state.common, ...state.vote });

const mapDispatchToProps = {};

export default createForm()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Redeem)
);
