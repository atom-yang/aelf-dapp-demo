import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'antd-mobile';
import TokenContract from '@api/token';
import ElectionContract from '@api/election';
import { centerEllipsis, formatToken } from '@utils/formatter';
import {
  errorModal,
  handleResponse
} from '@utils/error';
import * as voteActions from '@redux/actions/vote';
import {
  TOKEN_DECIMAL,
  SYMBOL
} from '../../../../constants';
import './index.less';

class VoteCenter extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    setUserVotes: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      balance: '-',
      totalVoteAmount: '-',
      totalRedeemAmount: '-',
      nodesData: []
    };

    this.address = localStorage.getItem('address');
    this.publicKey = localStorage.getItem('publicKey');
  }

  async componentDidMount() {
    await this.getBalance();

    await this.fetchUserVoteRecords();

    await this.fetchNodesData();
  }

  async getBalance() {
    const tokenContract = new TokenContract();
    try {
      const res = handleResponse(await tokenContract.fetchBalance({
        symbol: SYMBOL,
        owner: this.address
      }));

      this.setState({
        balance: res.data.balance / TOKEN_DECIMAL
      });
    } catch (err) {
      errorModal(err);
      console.error('fetchBalance', err);
    }
  }

  async fetchUserVoteRecords() {
    const { setUserVotes } = this.props;
    this.electionContract = new ElectionContract();

    try {
      const res = handleResponse(await this.electionContract.getElectorVoteWithAllRecords({
        value: this.publicKey
      }));

      setUserVotes({
        userVotes: res.data
      });
      const { activeVotedVotesAmount, withdrawnVotesRecords } = res.data;
      const totalRedeemAmount = withdrawnVotesRecords.reduce(
        (total, current) => total + +current.amount,
        0
      );
      this.setState({
        totalVoteAmount: activeVotedVotesAmount,
        totalRedeemAmount
      });
    } catch (err) {
      errorModal(err);
      console.error('fetchUserVoteRecords', err);
    }
  }

  async fetchNodesData() {
    try {
      const res = handleResponse(await this.electionContract.getPageableCandidateInformation({
        start: 0,
        length: 1000000
      }));
      const nodesData = res.data.value
        .sort((a, b) => +b.obtainedVotesAmount - +a.obtainedVotesAmount)
        .map((item, index) => ({
          ...item,
          ...item.candidateInformation,
          rank: index + 1
        }));
      this.setState({
        nodesData
      });
    } catch (err) {
      errorModal(err);
      console.error('fetchNodesData', err);
    }
  }

  render() {
    const {
      balance,
      totalRedeemAmount,
      totalVoteAmount,
      nodesData
    } = this.state;

    return (
      <div className="resource-market">
        <div className="resource-wallet card-container">
          <div className="wallet-title">
            {this.address && centerEllipsis(this.address)}
          </div>
          <div className="wallet-balance">
            balance:&nbsp;
            {formatToken(balance)}
          </div>
          <ul className="resource-item-group">
            <li className="resource-item">
              {`total votes: ${formatToken(
                totalVoteAmount.toLocaleString()
              )}`}
            </li>
            <li className="resource-item">
              {`total redeems: ${formatToken(
                totalRedeemAmount.toLocaleString()
              )}`}
            </li>
          </ul>
        </div>
        <h1 className="card-title page-wrapper">Nodes List</h1>
        <div className="node-group-container">
          <ul className="node-group">
            {nodesData.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className="node-item card-container" key={index}>
                <div className="node-rank">{item.rank}</div>
                <div className="node-name ellipsis">{item.pubkey}</div>
                <div className="node-votes">
                  votes:
                  {' '}
                  {item.obtainedVotesAmount}
                </div>
                <div className="btn-group">
                  <Button
                    className="round-btn vote-btn"
                    type="primary"
                    size="small"
                    inline
                    href={`#/vote/${item.pubkey}`}
                  >
                    Vote
                  </Button>
                  <Button
                    className="round-btn redeem-btn"
                    type="primary"
                    size="small"
                    inline
                    href={`#/redeem/${item.pubkey}`}
                  >
                    Redeem
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    ...voteActions
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(VoteCenter);
