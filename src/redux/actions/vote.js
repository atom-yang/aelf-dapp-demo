import * as actionTypes from '../actionTypes/vote';

export const setUserVotes = userVotes => ({
  type: actionTypes.SET_USER_VOTES,
  payload: userVotes
});
