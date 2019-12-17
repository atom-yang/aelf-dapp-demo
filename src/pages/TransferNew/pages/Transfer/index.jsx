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
      isModalShow: false,
      errors: [],
      transferAmount: null,
      receiverAddress: null,
      memos: null
    };

    this.jumpToTransferResult = this.jumpToTransferResult.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  jumpToTransferResult() {
    const { history, form } = this.props;
    const { getFieldValue } = form;
    const transferAmount = +getFieldValue('money');
    const memo = getFieldValue('memo');
    const receiverAddress = getFieldValue('address');

    const payload = {
      to: receiverAddress,
      symbol: SYMBOL,
      amount: transferAmount * TOKEN_DECIMAL,
      memo
    };
    const tokenContract = new TokenContract();

    tokenContract
      .transfer(payload)
      .then(res => {
        console.log("transfer", res);
        if (+res.code !== 0) {
          throw res;
        }
        history.push(`/transfer-result/${res.data.TransactionId}`);
      })
      .catch(err => {
        Toast.fail(
          'There are some errors',
          3
        );
        console.error("transfer", err);
      });
  }

  render() {
    const { getFieldProps } = this.props.form;
    const {
      isModalShow,
      errors
    } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h3 className="title">Transfer</h3>
        <List className="transfer-form">
          <InputItem
            {...getFieldProps("money")}
            type="money"
            labelNumber={LABEL_NUM}
            placeholder="input the transfer amount"
            clear
            moneyKeyboardAlign="left"
          >
            Amount
          </InputItem>
          <InputItem
            {...getFieldProps("address")}
            type="text"
            labelNumber={LABEL_NUM}
            placeholder="input the receiver address"
            clear
          >
            Receiver Address
          </InputItem>
          <p className="receiver-address-tip tip-color">
            (Only support main chain transfer) &nbsp;&nbsp;&nbsp;
          </p>
          <InputItem
            {...getFieldProps("memo")}
            type="text"
            placeholder="input the memo"
            labelNumber={LABEL_NUM}
            clear
          >
            Memo(Optional)
          </InputItem>
        </List>
        <div className="transfer-btn-container">
          <Button type="primary" inline onClick={this.jumpToTransferResult}>
            Next
          </Button>
        </div>
        <Modal
          visible={isModalShow}
          transparent
          maskClosable={false}
          onClose={this.onCloseModal}
          title="Failed"
          footer={[
            {
              text: "Ok",
              onPress: () => {
                console.log("ok");
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

export default withRouter(createForm()(Transfer));
