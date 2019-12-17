/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:45:14
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-13 16:06:46
 * @Description: file content
 */
import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { List, InputItem, Button, Toast, Modal } from "antd-mobile";
import { createForm } from "rc-form";
import { SYMBOL, TOKEN_DECIMAL } from "@constants";
import {
  errorModal,
  handleResponse
} from '../../../../utils/error';
import "./index.css";
import TokenContract from "@api/token";

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp("\\biPhone\\b|\\biPod\\b", "i").test(
  window.navigator.userAgent
);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault()
  };
}

const clsPrefix = "transfer";
const LABEL_NUM = 6;

class Transfer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.jumpToTransferResult = this.jumpToTransferResult.bind(this);
  }

  async jumpToTransferResult() {
    const { history, form } = this.props;
    console.log(form);
    const {
      validateFields
    } = form;
    const fields = ['money', 'address', 'memo'];
    try {
      this.setState({
        loading: true
      });
      const {
        money: amount,
        memo = '',
        address: to
      } = await validateFields(fields);
      const payload = {
        to,
        symbol: SYMBOL,
        amount: parseFloat(amount) * TOKEN_DECIMAL,
        memo
      };
      const tokenContract = new TokenContract();
      const res = handleResponse(await tokenContract.transfer(payload));
      this.setState({
        loading: false
      });
      history.push(`/transfer-result/${res.data.TransactionId}`);
    } catch (e) {
      errorModal(e);
      console.error("transfer", e);
      this.setState({
        loading: false
      });
    }
  }

  render() {
    const {
      getFieldDecorator
    } = this.props.form;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h3 className="title">Transfer</h3>
        <List className="transfer-form">
          {
            getFieldDecorator('money', {
              rules: [
                {
                  required: true,
                  message: 'Please enter the amount'
                }
              ]
            })(
              <InputItem
                type="money"
                labelNumber={LABEL_NUM}
                placeholder="input the transfer amount"
                clear
                moneyKeyboardAlign="left"
              >
                Amount
              </InputItem>
            )
          }
          {
            getFieldDecorator('address', {
              rules: [
                {
                  required: true,
                  message: 'Please enter the address'
                }
              ]
            })(
              <InputItem
                type="text"
                labelNumber={LABEL_NUM}
                placeholder="input the receiver address"
                clear
              >
                Receiver Address
              </InputItem>
            )
          }
          <p className="receiver-address-tip tip-color">
            (Only support transfer on main chain) &nbsp;&nbsp;&nbsp;
          </p>
          {
            getFieldDecorator('memo', {})(
              <InputItem
                type="text"
                placeholder="input the memo"
                labelNumber={LABEL_NUM}
                clear
              >
                Memo(Optional)
              </InputItem>
            )
          }
        </List>
        <div className="transfer-btn-container">
          <Button
            type="primary"
            inline
            onClick={this.jumpToTransferResult}
            loading={this.state.loading}
          >
            Next
          </Button>
        </div>
      </section>
    );
  }
}

export default withRouter(createForm()(Transfer));
