/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 17:20:46
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-21 14:24:06
 * @Description: file content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
// import AElfBridge from '../../../bridge';
import AElfBridge from 'aelf-bridge';

import { fetchContractAdds } from '@utils/contracts';
import { setBridge } from '../../redux/actions/common';
import SelectProxyType from '@components/SelectProxyType';

export class Base extends Component {
  componentDidMount() {
    // const { setBridge } = this.props;
    // const bridge = new AElfBridge({
    //   proxyType: 'SOCKET.IO',
    //   socketUrl: 'http://localhost:35443'
    // });
    // const bridge = new AElfBridge({
    //   timeout: 1000000 // ms, 毫秒
    // });
    // this.connectBridgeAndGetContractAdds(bridge);
    // setBridge(bridge);
  }

  async componentDidUpdate(prevProps, prevState) {
    const { bridge } = this.props;
    if (bridge !== prevProps.bridge) {
      const res = await bridge.connect();
      if (res === false) {
        Toast.fail('Connect ');
      }
    }
  }

  // connectBridgeAndGetContractAdds(bridge) {
  //   bridge.connect().then(res => {
  //     console.log(res);
  //     if (res === false) {
  //       Toast.fail('Connect failed.');
  //       return;
  //     }
  //     // return bridge.account();
  //   });
  //   // .then(res => {
  //   //   const { chains } = res.data;
  //   //   // localStorage.setItem('chains', JSON.stringify(chains));
  //   //   const chainAdds = chains.map(item => item.url);
  //   //   fetchContractAdds(chainAdds);
  //   // });
  // }

  render() {
    const { children, bridge } = this.props;

    return <div>{bridge ? children : <SelectProxyType />}</div>;
  }
}

Base.defaultProps = {
  bridge: null
};

// Base.propTypes = {
//   bridge: PropTypes.shape({

//   })
// };

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setBridge
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Base);
