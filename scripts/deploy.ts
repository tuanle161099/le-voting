import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  const lePay = await ethers.deployContract('Atbash', [deployer])

  await lePay.waitForDeployment()

  console.log('Atbash Address:', lePay.target)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
