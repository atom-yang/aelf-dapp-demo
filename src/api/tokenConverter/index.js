/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 16:01:36
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 15:39:13
 * @Description: file content
 */
import { getBridge } from '@utils/bridge';
import { getContractAdd } from '@utils/contracts';

// todo: How to share the bridge globally?
// Write the class as singleton mode to share the bridge and contractAdd
// Note: You can't get the bridge and contractAdd out of class/function as we get them in async way
// todo: Write a BaseBridge class that has this.bridge
export default class TokenConverterContract {
  static singleton = null;

  constructor() {
    if (TokenConverterContract.singleton) return TokenConverterContract.singleton;
    TokenConverterContract.singleton = this;

    this.bridge = getBridge();
    console.log('this.bridge', this.bridge);
    this.contractAdd = getContractAdd('tokenConverter');
  }

  fetchBalance({ symbol, owner }) {
    return this.bridge.invokeRead({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'GetBalance', // 合约方法名
      arguments: [
        {
          name: 'GetBalance',
          value: {
            owner,
            symbol
          }
        }
      ]
    });
  }

  buy({ symbol, amount }) {
    return this.bridge.invoke({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'Buy', // 合约方法名
      arguments: [
        {
          name: 'Buy',
          value: {
            symbol,
            amount
          }
        }
      ]
    });
  }

  sell({ symbol, amount }) {
    return this.bridge.invoke({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'Sell', // 合约方法名
      arguments: [
        {
          name: 'Sell',
          value: {
            symbol,
            amount
          }
        }
      ]
    });
  }
}
