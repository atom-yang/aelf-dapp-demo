/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 16:01:36
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 15:29:27
 * @Description: file content
 */
import { getBridge } from '@utils/bridge';
import { getContractAdd } from '@utils/contracts';

// todo: How to share the bridge globally?
// Write the class as singleton mode to share the bridge and tokenContractAdd
// Note: You can't get the bridge and tokenContractAdd out of class/function as we get them in async way
export default class TokenContract {
  static singleton = null;

  constructor() {
    if (TokenContract.singleton) return TokenContract.singleton;
    TokenContract.singleton = this;

    this.bridge = getBridge();
    console.log('this.bridge', this.bridge);
    // todo: rename the variable refer to tokenConverter
    this.tokenContractAdd = getContractAdd('token');
  }

  fetchBalance({ symbol, owner }) {
    return this.bridge.invokeRead({
      contractAddress: this.tokenContractAdd, // 合约地址
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

  transfer({
    to, symbol, amount, memo
  }) {
    return this.bridge.invoke({
      contractAddress: this.tokenContractAdd, // 合约地址
      contractMethod: 'Transfer', // 合约方法名
      arguments: [
        {
          name: 'Transfer',
          value: {
            to,
            symbol,
            amount,
            memo
          }
        }
      ]
    });
  }
}
