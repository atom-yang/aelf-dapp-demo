/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:00:27
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 21:24:22
 * @Description: file content
 */
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'antd-mobile/dist/antd-mobile.css';

import store from '@redux/store';
import Base from '@components/Base';
import routes from './routes';
// import './App.css';
import '@style/common.less';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Base>
          <HashRouter>{routes}</HashRouter>
        </Base>
      </Provider>
    </div>
  );
}

export default App;
