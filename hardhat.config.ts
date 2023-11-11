import { HardhatUserConfig } from 'hardhat/config'
import { Wallet } from 'ethers'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: '0.8.21',
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [':Atbash$'],
  },
  networks: {
    sepolia: {
      url: 'https://sepolia.infura.io/v3/3a3c7d470c4b4d2c8e794139ef79f0d7',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
  },
}

export default config
