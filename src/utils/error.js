/**
 * @file error modal
 * @author atom-yang
 */
import {
  Modal
} from 'antd-mobile';

export const errorModal = (errors = [], title = '错误') => {
  if (Array.isArray(errors)) {
    Modal.alert(title, errors.reduce((acc, i) => {
      const msg = JSON.stringify(i, null, 2);
      return `${acc}\n${msg}`;
    }, ''));
  } else {
    Modal.alert(errors.msg || errors.message || title, JSON.stringify(errors.error || errors, null, 2));
  }
};

export const handleResponse = res => {
  if (res && +res.code === 0) {
    return res;
  }
  throw res;
};
