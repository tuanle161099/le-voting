import { HardhatUserConfig } from 'hardhat/config'
import { Wallet } from 'ethers'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [':Atbash$'],
  },
  networks: {
    victionTestnet: {
      url: 'https://rpc.testnet.tomochain.com',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
    victionMainnet: {
      url: 'https://rpc.tomochain.com',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
  },
  // defaultNetwork: 'victionTestnet',
}

export default config
