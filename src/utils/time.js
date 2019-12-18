/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 21:19:45
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:23:04
 * @Description: file content
 */
import moment from 'moment';

// eslint-disable-next-line max-len
export const computeRedeemableVoteRecords = records => records.filter(item => item.unlockTimestamp.seconds < moment().unix());

export const getFormatedLockTime = vote => {
  const start = moment.unix(vote.voteTimestamp.seconds);
  const end = moment.unix(vote.unlockTimestamp.seconds);
  const formatedLockTime = end.from(start, true);
  return formatedLockTime;
};
