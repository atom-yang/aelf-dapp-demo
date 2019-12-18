/* eslint-disable no-await-in-loop */
/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 16:21:26
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 19:06:51
 * @Description: file content
 */

import * as AElf from 'aelf-sdk';

const contractNames = [
  {
    nickName: 'consensus',
    name: 'AElf.ContractNames.Consensus'
  },
  {
    nickName: 'token',
    name: 'AElf.ContractNames.Token'
  },
  {
    nickName: 'tokenConverter',
    name: 'AElf.ContractNames.TokenConverter'
  },
  {
    nickName: 'election',
    name: 'AElf.ContractNames.Election'
  },
  {
    nickName: 'profit',
    name: 'AElf.ContractNames.Profit'
  },
  {
    nickName: 'vote',
    name: 'AElf.ContractNames.Vote'
  }
];

// const chains = localStorage.getItem('chains')

const privateKey = '66e4918d15048730923e0decbc88e5823d394fe57e1ca1109ea713f94052705b';

const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);

export const fetchContractAdds = async (chains = []) => {
  if (localStorage.getItem('contractAdds')) {
    return JSON.parse(localStorage.getItem('contractAdds'));
  }
  let mainChainUrl = chains.filter(v => v.isMainChain === true);
  if (mainChainUrl.length === 0) {
    throw new Error('There is no main chain url');
  }
  mainChainUrl = mainChainUrl[0].url;
  const result = {};
  const aelf = new AElf(new AElf.providers.HttpProvider(mainChainUrl));
  const { GenesisContractAddress } = await aelf.chain.getChainStatus();
  console.log('GenesisContractAddress', GenesisContractAddress);
  const genesisContract = await aelf.chain.contractAt(
    GenesisContractAddress,
    wallet
  );

  return Promise.all(
    contractNames.map(item => genesisContract.GetContractAddressByName.call(
      AElf.utils.sha256(item.name)
    ))
  ).then(resArr => {
    contractNames.forEach((item, index) => {
      result[item.nickName] = resArr[index];
    });
    localStorage.setItem('contractAdds', JSON.stringify(result));
  });
};

export const getContractAdd = contractName => JSON.parse(localStorage.getItem('contractAdds'))[contractName];
