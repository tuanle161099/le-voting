import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { ethers } from 'hardhat'
import * as secp256k1 from '@noble/secp256k1'
import { expect } from 'chai'
import BN from 'bn.js'
import { Leaf } from '../src/leaf'
import { Tree } from '../src/tree'
import { keccak256 } from 'ethers'

const { data: PRIMARY_DUMMY_METADATA } = Buffer.from(
  'b2b68b298b9bfa2dd2931cd879e5c9997837209476d25319514b46f7b7911d31',
  'hex',
).toJSON()

const privateKey =
  BigInt(
    2760942959702842715352604833882983365211307188590135378997097481178767826057,
  )
const randomNumber = () => {
  const min = 1
  const max = 1_000
  return Math.floor(Math.random() * (max - min + 1)) + min
}
const pubkey = secp256k1.Point.BASE.multiply(privateKey)

const currentTime = Math.floor(Date.now() / 1000)

describe('Contract', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, ...receivers] = await ethers.getSigners()

    const Atbash = await ethers.getContractFactory('Atbash')
    const proposal = await Atbash.deploy()

    // Tree
    const leaves: Leaf[] = Array.from(Array(2).keys()).map(
      (i) => new Leaf(receivers[i].address),
    )
    const merkleDistributor = new Tree(leaves)

    return { owner, receivers, proposal, merkleDistributor }
  }

  describe('Atbash', async function () {
    const P = secp256k1.Point.BASE
    const p_2 = P.add(P)
    console.log(P.add(p_2))
    console.log(P.add(p_2).multiply(100000000))

    it('add 2 point', async function () {
      const { proposal } = await loadFixture(deployFixture)
      const x =
        BigInt(
          55066263022277343669578718895168534326250603453777594175500187360389116729240n,
        )
      const y =
        BigInt(
          32670510020758816978083085130507043184471273380659243275938904335757337482424n,
        )
      const x1 =
        BigInt(
          89565891926547004231252920425935692360644145829622209833684329913297188986597n,
        )
      const y1 =
        BigInt(
          12158399299693830322967808612713398636155367887041628176798871954788371653930n,
        )
      const [x2, y2] = await proposal.ecAdd(x, y, x1, y1)
      console.log(x2, y2)
      const t = await proposal.ecMul(100000000, x2, y2)
      console.log(t)
    })

    it('lenght list proposal should be at zero', async function () {
      const { proposal } = await loadFixture(deployFixture)

      const length = await proposal.getLength()
      expect(length).to.equal(0)
    })

    it('Is create proposal', async function () {
      const { proposal, owner, receivers, merkleDistributor } =
        await loadFixture(deployFixture)

      const candidates = Array.from(Array(2).keys()).map(
        (i) => receivers[i].address,
      )

      const merkleRoot = merkleDistributor.root.value

      const randomsNumber: number[] = []
      const ballotBoxes = candidates.map(() => {
        const r = randomNumber()
        randomsNumber.push(r)
        const M = secp256k1.Point.ZERO
        return {
          pointX: M.add(pubkey.multiply(r)).x,
          pointY: M.add(pubkey.multiply(r)).y,
        }
      })

      await proposal.initProposal(
        merkleRoot,
        Uint8Array.from(PRIMARY_DUMMY_METADATA),
        currentTime,
        currentTime + 5000,
        randomsNumber as any,
        candidates as any,
        ballotBoxes as any,
        owner.address,
      )
      const length = await proposal.getLength()
      const campaign = await proposal.getProposal(owner.address)

      expect(length).to.equal(1)
      expect(campaign.authority).to.equal(owner.address)
    })
  })
})
