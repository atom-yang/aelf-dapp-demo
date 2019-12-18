import store from '@redux/store';
import {
  handleResponse
} from '@utils/error';

export const getBridge = () => store.getState().common.bridge;

export const getTxResult = (bridge, txId, resolve, reject, time = 0) => {
  setTimeout(async () => {
    const currentTime = time + 1;
    try {
      const res = handleResponse(await bridge.api({
        apiPath: '/api/blockChain/transactionResult', // api路径
        arguments: [
          {
            name: 'transactionResult',
            value: txId
          }
        ]
      }));
      const { Status: status } = res.data;
      if (currentTime === 3) {
        reject(res.data);
      }
      if (status.toUpperCase() === 'MINED') {
        resolve(res.data);
      } else if (status.toUpperCase() === 'FAILED') {
        reject(res.data);
      } else {
        getTxResult(bridge, txId, resolve, reject, currentTime);
      }
    } catch (e) {
      console.error('get tx result', e);
      reject(e);
    }
  }, 4000);
};
