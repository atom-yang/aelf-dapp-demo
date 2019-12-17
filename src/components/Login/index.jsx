/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:10:34
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-14 16:22:28
 * @Description: file content
 */

import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Toast, Modal } from "antd-mobile";

import "./index.less";
import { fetchContractAdds } from "@utils/contracts";
import TokenContract from "@api/token";
import { setBalance } from "@redux/actions/common";
import { SYMBOL, TOKEN_DECIMAL } from "@constants";

const clsPrefix = "login";

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false,
      errors: null,
      loading: false
    };

    this.login = this.login.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  async login() {
    const { history, route, bridge, setBalance } = this.props;

    this.setState({
      loading: true
    });
    const res = await bridge.account();
    const { chains, accounts } = res.data;
    const { address, publicKey } = accounts[0];
    localStorage.setItem("address", address);
    localStorage.setItem("publicKey", publicKey);
    // localStorage.setItem('chains', JSON.stringify(chains));
    const chainAdds = chains.map(item => item.url);
    fetchContractAdds(chainAdds)
      .then(async () => {
        const tokenContract = new TokenContract();

        const res = await tokenContract.fetchBalance({
          symbol: SYMBOL,
          owner: address
        });

        console.log("fetchBalance", res);

        setBalance(res.data.balance / TOKEN_DECIMAL);
      })
      .then(() => {
        this.setState({
          loading: false
        });
        history.push(route);
      })
      .catch(err => {
        console.log("fetchContractAdds", err);
        this.setState({
          loading: false
        });
      });
  }

  // todo: disable the login button
  render() {
    const { appName } = this.props;
    const { errors, isModalShow, loading } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h1 className="dapp-name">AElf {appName} Demo</h1>
        <div style={{ display: "block", width: "80%" }}>
          <Button
            type="primary"
            style={{ borderRadius: 20 }}
            onClick={this.login}
            loading={loading}
          >
            Login
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

const mapStateToProps = state => ({
  ...state.common
});

// todo: Snippet
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setBalance
    },
    dispatch
  );

const wrapper = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default wrapper(Login);
