/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 11:56:29
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-13 16:10:49
 * @Description: file content
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  InputItem,
  Button,
  Modal,
  ActivityIndicator // todo: Add Modal
} from 'antd-mobile';
import { createForm } from 'rc-form';
import Select from 'react-select';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';
import TokenContract from '@api/token';
import TokenConverterContract from '@api/tokenConverter';
import { centerEllipsis, formatToken } from '@utils/formatter';
import {
  errorModal,
  handleResponse
} from '@utils/error';
import {
  getTxResult
} from '@utils/bridge';
import { TOKEN_DECIMAL } from '@constants';

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(
  window.navigator.userAgent
);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault()
  };
}

function validateNumber(str) {
  try {
    const result = parseFloat(str);
    if (!result) {
      throw result;
    }
    return result;
  } catch (e) {
    errorModal(new Error('Please Input Valid Number'));
    return false;
  }
}


class ResourceMarket extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // };
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      address: null,
      copied: false,
      type: {
        value: 'RAM',
        label: 'RAM'
      },
      resourceWallet: {
        elf: {
          symbol: 'ELF',
          balance: '-'
        },
        resources: [
          {
            symbol: 'RAM',
            balance: '-'
          },
          {
            symbol: 'CPU',
            balance: '-'
          },
          {
            symbol: 'NET',
            balance: '-'
          },
          {
            symbol: 'STO',
            balance: '-'
          }
        ]
      },
      txResult: {
        elf: '-',
        amount: '-',
        txId: '-',
        blockHeight: '-'
      }
    };

    this.onResourceBuy = this.onResourceBuy.bind(this);
    this.onResourceSell = this.onResourceSell.bind(this);
  }

  async componentDidMount() {
    const { bridge } = this.props;

    try {
      const res = handleResponse(await bridge.account());
      // todo: Use a block to block the response from bridge
      const { address } = res.data.accounts[0];
      this.setState({
        address
      });
      await this.getAllBalances();
    } catch (e) {
      errorModal(e);
      console.error('resource mounted', e);
    }
  }

  componentDidUpdate(prevProps) {
    const { bridge } = this.props;

    if (bridge !== prevProps.bridge) {
      this.getAllBalances();
    }
  }

  async onResourceBuy() {
    const { form } = this.props;
    const { getFieldValue } = form;
    const buyNum = validateNumber(getFieldValue('buyNum'));
    if (!buyNum) return;
    this.setState({
      loading: true
    });
    await this.buyResource(buyNum);
  }

  async onResourceSell() {
    const { form } = this.props;
    const { getFieldValue } = form;

    const sellNum = validateNumber(getFieldValue('sellNum'));
    if (!sellNum) return;
    this.setState({
      loading: true
    });
    await this.sellResource(sellNum);
  }

  getFormItems() {
    const { copied, txResult } = this.state;
    const {
      amount,
      txId,
      blockHeight
    } = txResult;

    const formItems = [
      {
        title: 'amount',
        value: <span className="transfer-amount">{`${amount}`}</span>,
        isCopyable: false
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

  async getAllBalances() {
    const { resourceWallet, address } = this.state;

    const allTokens = [resourceWallet.elf, ...resourceWallet.resources];
    const tokenContract = new TokenContract();

    try {
      const resArr = await Promise.all(
        allTokens.map(item => tokenContract.fetchBalance({
          symbol: item.symbol,
          owner: address
        }))
      );
      const processedArr = resArr.map(item => {
        const { balance, symbol, owner } = item.data;
        return {
          balance: balance / TOKEN_DECIMAL,
          symbol,
          owner
        };
      });
      this.setState({
        resourceWallet: {
          elf: processedArr[0],
          resources: processedArr.slice(1)
        }
      });
    } catch (err) {
      errorModal(err);
      console.error('getAllBalances', err);
    }
  }

  handleChange = type => {
    this.setState({ type });
  };

  async sellResource(sellNum) {
    const tokenConverterContract = new TokenConverterContract();
    const { type } = this.state;

    try {
      const res = handleResponse(await tokenConverterContract.sell({
        symbol: type.value,
        amount: sellNum * TOKEN_DECIMAL
      }));

      await this.fetchTxResult(res.data.TransactionId);
      this.displayModal();
    } catch (err) {
      errorModal(err);
      console.error('sellResource', err);
    }
  }

  async buyResource(buyNum) {
    const tokenConverterContract = new TokenConverterContract();
    const { type } = this.state;

    try {
      const res = handleResponse(await tokenConverterContract.buy({
        symbol: type.value,
        amount: buyNum * TOKEN_DECIMAL
      }));
      await this.fetchTxResult(res.data.TransactionId);
      this.displayModal();

      console.log('buy', { buyNum, res });
    } catch (err) {
      errorModal(err);
      console.error('buy', err);
    }
  }

  fetchTxResult(txId) {
    const { bridge } = this.props;

    new Promise((resolve, reject) => {
      getTxResult(bridge, txId, resolve, reject);
    }).then(transaction => {
      this.setState({
        loading: false
      });
      this.getAllBalances();

      const { Status: status, TransactionId, Transaction } = transaction;
      const { RefBlockNumber: blockHeight } = Transaction;
      const params = JSON.parse(Transaction.Params);
      const { amount } = params;

      this.setState({
        txResult: {
          amount: +amount / TOKEN_DECIMAL,
          txId: TransactionId,
          blockHeight,
          status
        },
        loading: false
      });
    }).catch(err => {
      this.getAllBalances();
      this.setState({
        loading: false
      });
      errorModal(err);
    });
  }

  displayModal() {
    this.setState({
      modalVisible: true
    });
  }

  render() {
    const { form } = this.props;
    const { getFieldProps } = form;
    const {
      resourceWallet,
      address,
      modalVisible,
      type,
      loading
    } = this.state;

    const options = resourceWallet.resources.map(item => ({
      value: item.symbol,
      label: item.symbol
    }));

    return (
      <div className="resource-market">
        <div className="resource-wallet card-container">
          <div className="wallet-title">
            {address && centerEllipsis(address)}
          </div>
          <div className="wallet-balance">
            Balance:
            {' '}
            {formatToken(resourceWallet.elf.balance)}
          </div>
          <ul className="resource-item-group">
            {resourceWallet.resources.map(item => (
              <li key={item.symbol} className="resource-item">
                {`${
                  item.symbol
                }: ${formatToken(item.balance)}`}
              </li>
            ))}
          </ul>
        </div>
        <h1 className="card-title page-wrapper">Resource Center</h1>
        <div className="resource-trading card-container">
          <Select
            value={type}
            onChange={this.handleChange}
            options={options}
            className="type-select"
          />
          <div className="resource-buy">
            <div className="trading-box-header buy-header">Buy</div>
            <InputItem
              {...getFieldProps('buyNum', {
                normalize: (v, prev) => {
                  if (v && !/^(([1-9]\d*)|0)(\.\d{0,2}?)?$/.test(v)) {
                    if (v === '.') {
                      return '0.';
                    }
                    return prev;
                  }
                  return v;
                }
              })}
              symbol="money"
              placeholder="input number"
              clear
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            >
              Buy Num
            </InputItem>
            <Button
              className="trading-btn buy-btn"
              size="small"
              loading={loading}
              onClick={this.onResourceBuy}
            >
              Buy
            </Button>
          </div>
          <div className="resource-sell">
            <div className="trading-box-header sell-header">Sell</div>
            <InputItem
              {...getFieldProps('sellNum', {
                normalize: (v, prev) => {
                  if (v && !/^(([1-9]\d*)|0)(\.\d{0,2}?)?$/.test(v)) {
                    if (v === '.') {
                      return '0.';
                    }
                    return prev;
                  }
                  return v;
                }
              })}
              symbol="money"
              placeholder="input number"
              clear
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            >
              Sell Num
            </InputItem>
            <Button
              className="trading-btn sell-btn"
              size="small"
              loading={loading}
              onClick={this.onResourceSell}
            >
              Sell
            </Button>
          </div>
        </div>
        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false,
              copied: false,
              loading: false
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
  )(ResourceMarket)
);
