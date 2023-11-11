import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { ethers } from 'hardhat'
import * as secp256k1 from '@noble/secp256k1'

describe('Contract', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, receiver] = await ethers.getSigners()

    const Atbash = await ethers.getContractFactory('Atbash')
    const curve = await Atbash.deploy()

    return { curve, owner, receiver }
  }

  describe('Atbash', async function () {
    const P = secp256k1.Point.BASE
    const p_2 = P.add(P)
    console.log(P.add(p_2))
    console.log(P.add(p_2).multiply(100000000))

    it('add 2 point', async function () {
      const { curve } = await loadFixture(deployFixture)
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
      const [x2, y2] = await curve.ecAdd(x, y, x1, y1)
      console.log(x2, y2)
      const t = await curve.ecMul(100000000, x2, y2)
      console.log(t)
    })
  })
})
