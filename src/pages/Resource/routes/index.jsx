/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:01:32
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 12:06:34
 * @Description: file content
 */
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import Login from '@components/Login';
import ResourceMarket from '../pages/ResourceMarket';
// import Transfer from '../pages/Transfer';
// import TransferResult from '../pages/TransferResult';

// todo: what if write other routes inner the home route? why it cause problem?
export default (
  <Switch>
    <Route path="/login">
      <Login appName="Resource" route="/resource-trading" />
    </Route>
    <Redirect from="/" to="/login" exact />

    <Route path="/resource-trading" component={ResourceMarket} />
    {/* <Route path='/transfer' component={Transfer} /> */}
    {/* <Route path='/transfer-result/:txId' component={TransferResult} /> */}
    {/* <Route path='*' component={NoMatch} /> */}
  </Switch>
);
