/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:08:34
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-04 17:27:17
 * @Description: file content
 */
import { createStore } from 'redux';
import rootReducer from '../reducers';

const store = createStore(
  rootReducer,
  {},
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export default store;
