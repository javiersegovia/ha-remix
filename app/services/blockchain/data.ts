export const blockchainNetworks = {
  mainnet: {
    bsc: 56,
  },
  testnet: {
    bsc: 97,
  },
}

export const contractAddresses = {
  [blockchainNetworks.mainnet.bsc]: {
    busd: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      blockExplorer: 'https://bscscan.com/',
      symbol: 'BUSD',
      decimals: 18,
      imageUrl:
        'https://cdn.freelogovectors.net/wp-content/uploads/2021/10/binance-usd-busd-logo-freelogovectors.net_.png',
    },
  },
  [blockchainNetworks.testnet.bsc]: {
    busd: {
      address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
      blockExplorer: 'https://testnet.bscscan.com/',
    },
  },
}
