/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-20 11:49:33
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-21 14:25:13
 * @Description: file content
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'antd-mobile';
// import AElfBridge from '../../../bridge';
import AElfBridge from 'aelf-bridge';

import { setBridge } from '../../redux/actions/common';

class SelectProxyType extends Component {
  setBridgeConfig(config) {
    // eslint-disable-next-line no-shadow
    const { setBridge } = this.props;

    const bridge = new AElfBridge(config);
    setBridge(bridge);
    // localStorage.setItem('hasSetProxyType', true);
  }

  render() {
    return (
      <Modal
        visible
        transparent
        title="Select Proxy Type"
        maskClosable={false}
        footer={[
          {
            text: 'SOCKET.IO',
            onPress: () => {
              this.setBridgeConfig({
                proxyType: 'SOCKET.IO',
                socketUrl: 'http://localhost:35443'
                // channelType: 'ENCRYPT'
              });
            }
          },
          {
            text: 'POST MESSAGE',
            onPress: () => {
              this.setBridgeConfig({
                timeout: 1000000 // ms, 毫秒
              });
            }
          }
        ]}
      />
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    setBridge
  },
  dispatch
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectProxyType);
