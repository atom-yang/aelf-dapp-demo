/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 17:20:46
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-21 14:24:06
 * @Description: file content
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
import SelectProxyType from '@components/SelectProxyType';
// import AElfBridge from '../../../bridge';
// import AElfBridge from 'aelf-bridge';

import { setBridge } from '../../redux/actions/common';

class Base extends Component {
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

  async componentDidUpdate(prevProps) {
    const { bridge } = this.props;
    if (bridge !== prevProps.bridge) {
      try {
        console.log('base');
        const res = await bridge.connect();
        console.log('res', res);
        if (res === false) {
          Toast.fail('Connect fail');
        }
      } catch (e) {
        console.error(e);
        Toast.fail('Connect fail');
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

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    setBridge
  },
  dispatch
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Base);
