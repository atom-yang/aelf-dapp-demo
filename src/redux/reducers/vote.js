/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 20:46:23
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:12:07
 * @Description: file content
 */
import * as actionTypes from '../actionTypes/vote';

const initialState = {
  userVotes: null
};

const vote = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_USER_VOTES:
      return { ...state, userVotes: payload.userVotes };
    default:
      return state;
  }
};

export default vote;
