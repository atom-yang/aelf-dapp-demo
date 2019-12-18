/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:01:32
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 20:40:54
 * @Description: file content
 */
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import Login from '@components/Login';
import VoteCenter from '../pages/VoteCenter';
import Vote from '../pages/Vote';
import Redeem from '../pages/Redeem';

export default (
  <Switch>
    <Route path="/login">
      <Login appName="Vote" route="/vote-center" />
    </Route>
    <Redirect from="/" to="/login" exact />

    <Route path="/vote-center" component={VoteCenter} />
    <Route path="/vote/:publicKey" component={Vote} />
    <Route path="/redeem/:publicKey" component={Redeem} />
  </Switch>
);
