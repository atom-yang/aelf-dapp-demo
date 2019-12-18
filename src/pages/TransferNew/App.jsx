import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'antd-mobile/dist/antd-mobile.css';

import Base from '@components/Base';
import routes from './routes';
import store from '../../redux/store';
import './App.css';
import '@style/common.less';
import 'minireset.css';

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
