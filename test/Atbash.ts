import * as secp256k1 from '@noble/secp256k1'
import { ethers } from 'hardhat'
import { describe } from 'mocha'

import { Leaf } from '../src/merkleDistributor/leaf'
import MerkleDistributor from '../src/merkleDistributor'
import { Atbash } from '../typechain-types'

const { data: PRIMARY_DUMMY_METADATA } = Buffer.from(
  'b2b68b298b9bfa2dd2931cd879e5c9997837209476d25319514b46f7b7911d31',
  'hex',
).toJSON()

const privateKey =
  BigInt(
    49360424492151327609744179530990798614627223631512818354400676568443765553532,
  )
const pubkey = secp256k1.Point.BASE.multiply(privateKey)

const randomNumber = () => {
  const min = 1_000
  const max = 100_000_000
  return Math.floor(Math.random() * (max - min + 1)) + min
}
describe('Contract', function () {
  const currentTime = Math.floor(Date.now() / 1000)
  let contractAtbash: Atbash
  let merkleDistributor: MerkleDistributor
  let candidates: string[]

  async function deployAtbash() {
    const [signer] = await ethers.getSigners()
    const atbash = await ethers.deployContract('Atbash', [], {
      gasLimit: 4000000,
      signer,
    })
    await atbash.waitForDeployment()
    console.log(`AmmContract was deployed to ${atbash.target}`)
    return atbash.target
  }

  before('Before test', async () => {
    const [signer, ...receivers] = await ethers.getSigners()
    // nonce = await signer.getNonce();

    const leaves: Leaf[] = Array.from(Array(2).keys()).map(
      (i) => new Leaf(receivers[i].address),
    )
    merkleDistributor = new MerkleDistributor(leaves)
    candidates = Array.from(Array(3).keys()).map((i) => receivers[i].address)

    const address = await deployAtbash()
    contractAtbash = (await ethers.getContractAt(
      'Atbash',
      address,
      signer,
    )) as any
  })

  it('Is create proposal', async function () {
    const merkleRoot = merkleDistributor.root.value

    const randomsNumber: number[] = []
    const ballotBoxes = candidates.map(() => {
      const r = randomNumber()
      randomsNumber.push(r)
      const zero = secp256k1.Point.ZERO
      const M = zero.add(pubkey.multiply(r))
      return { x: M.x, y: M.y }
    })

    await contractAtbash.initProposal(
      merkleRoot,
      Uint8Array.from(PRIMARY_DUMMY_METADATA),
      currentTime,
      currentTime + 5000,
      randomsNumber,
      candidates,
      ballotBoxes,
    )
    const proposalId = await contractAtbash.proposalId()
    const proposal = await contractAtbash.getProposal(Number(0))

    console.log(proposalId, proposal)
  })
})
