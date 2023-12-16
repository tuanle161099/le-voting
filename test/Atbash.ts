import * as secp256k1 from '@noble/secp256k1'
import { ethers } from 'hardhat'
import { describe } from 'mocha'

import { Leaf } from '../src/leaf'
import { MerkleDistributor } from '../src/merkleDistributor'
import { Atbash } from '../typechain-types'
import { BSGS } from '../src/utils'

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
  const r = secp256k1.utils.randomBytes(16)

  return secp256k1.utils.mod(
    BigInt(`0x${secp256k1.utils.bytesToHex(r)}`),
    secp256k1.CURVE.P,
  )
}
describe('Contract', function () {
  const currentTime = Math.floor(Date.now() / 1000)
  const zero = secp256k1.Point.ZERO
  const P = secp256k1.Point.BASE
  const commitment = randomNumber()

  let contractAtbash: Atbash
  let merkleDistributor: MerkleDistributor
  let candidates: string[]
  let voters: Leaf[]
  let nonce: number

  async function deployAtbash() {
    const [signer] = await ethers.getSigners()
    const atbash = await ethers.deployContract('Atbash', [], {
      gasLimit: 30000000,
      signer,
      nonce: nonce++,
    })
    await atbash.waitForDeployment()
    console.log(`AmmContract was deployed to ${atbash.target}`)
    return atbash.target
  }

  before('Before test', async () => {
    const [signer, ...receivers] = await ethers.getSigners()

    nonce = await signer.getNonce()
    const address = await deployAtbash()

    const mineVote = new Leaf(signer.address)
    voters = Array.from(Array(2).keys()).map(
      (i) => new Leaf(receivers[i].address),
    )
    merkleDistributor = new MerkleDistributor([...voters, mineVote])
    candidates = Array.from(Array(3).keys()).map((i) => receivers[i].address)

    contractAtbash = (await ethers.getContractAt(
      'Atbash',
      address,
      signer,
    )) as any
  })

  it('Is create proposal', async function () {
    const merkleRoot = merkleDistributor.root.value
    const randomsNumber: bigint[] = []
    const ballotBoxes = candidates.map(() => {
      const r = randomNumber()
      randomsNumber.push(r)
      const M = zero.add(pubkey.multiply(r))
      return { x: M.x, y: M.y }
    })
    await contractAtbash.initProposal(
      merkleRoot,
      Uint8Array.from(PRIMARY_DUMMY_METADATA),
      currentTime,
      currentTime + 5000,
      commitment,
      randomsNumber,
      candidates,
      ballotBoxes,
      {
        gasLimit: 30000000,
        nonce: nonce++,
      },
    )
    const proposal = await contractAtbash.getProposal(Number(0))
  })

  // it('Is vote for 1 ', async function () {
  //   const votFor = candidates[1]
  //   const proof = merkleDistributor.prove(voters[0])
  //   const proof_r: bigint[] = []
  //   const proof_t: secp256k1.Point[] = []

  //   await Promise.all(
  //     Array.from(Array(2).keys()).map(async () => {
  //       const randomsNumber: bigint[] = []
  //       const votes = candidates.map((candidate) => {
  //         const x = randomNumber()
  //         randomsNumber.push(x)
  //         const v = randomNumber()
  //         const T = pubkey.multiply(v)
  //         // r = v + cx
  //         const r = v + c * x
  //         proof_r.push(r)
  //         proof_t.push(T)

  //         const M = candidate === votFor ? P : zero
  //         const C = M.add(pubkey.multiply(x)) // C = M + rG
  //         return { x: C.x, y: C.y }
  //       })

  //       await contractAtbash.vote(
  //         0,
  //         randomsNumber,
  //         votes,
  //         proof.map((e) => e.value),
  //         proof_r,
  //         proof_t,
  //       )
  //     }),
  //   )
  //   const proposal = await contractAtbash.getProposal(Number(0))

  //   console.log(proposal)
  // })

  it('Is vote for 2', async function () {
    const votFor = candidates[2]
    const [signer] = await ethers.getSigners()
    const proof_r: bigint[] = []
    const proof_t: secp256k1.Point[] = []
    console.log('====>', await contractAtbash.proposals(0))

    const randomsNumber: bigint[] = []
    const proof = merkleDistributor.prove(new Leaf(signer.address))
    const votes = candidates.map((candidate) => {
      const x = randomNumber()
      randomsNumber.push(x)

      const v = randomNumber()
      const T = pubkey.multiply(v)
      // r = v + cx
      const r = v + commitment * x
      proof_r.push(r)
      proof_t.push(T)

      const M = candidate === votFor ? P : zero
      const C = M.add(pubkey.multiply(x)) // C = M + rG
      return { x: C.x, y: C.y }
    })

    await contractAtbash.vote(
      0,
      randomsNumber,
      votes,
      proof.map((e) => e.value),
      proof_r,
      proof_t,
      {
        gasLimit: 30000000,
      },
    )
    // const proposal = await contractAtbash.getProposal(Number(0))

    // console.log(proposal)
  })

  // it('Is vote for 2 the second times', async function () {
  //   const votFor = candidates[2]
  //   const [signer] = await ethers.getSigners()

  //   const randomsNumber: bigint[] = []
  //   const proof = merkleDistributor.prove(new Leaf(signer.address))

  //   const votes = candidates.map((candidate) => {
  //     const x = randomNumber()
  //     randomsNumber.push(x)

  //     const M = candidate === votFor ? P : zero
  //     const C = M.add(pubkey.multiply(x)) // C = M + rG
  //     return { x: C.x, y: C.y }
  //   })

  //   await contractAtbash.vote(
  //     0,
  //     randomsNumber,
  //     votes,
  //     proof.map((e) => e.value),
  //   )
  //   const proposal = await contractAtbash.getProposal(Number(0))

  //   console.log(proposal)
  // })

  it('Is get winners', async function () {
    const ballotBoxesDecrypted: secp256k1.Point[] = []
    const proposal = await contractAtbash.getProposal(Number(0))
    proposal.ballotBoxes.forEach(({ x, y }, i) => {
      const C = new secp256k1.Point(x, y)
      const R = P.multiply(proposal.randomNumbers[i])
      const M = C.subtract(R.multiply(privateKey)) //M = C - R * x
      ballotBoxesDecrypted.push(M)
    })
    const totalBallot: number[] = await BSGS(ballotBoxesDecrypted)
    console.log(totalBallot)
  })
  // it('Is soundness work', async () => {
  //   //P = Gx;
  //   const x = randomNumber()
  //   const G = pubkey
  //   const P = G.multiply(x)

  //   //T = Gv;
  //   const abiCoder = new AbiCoder()
  //   const v = BigInt(
  //     keccak256(toBeArray(abiCoder.encode(['string', 'string'], [G.x, G.y]))),
  //   )
  //   console.log('v====>', v)
  //   const T = G.multiply(v)

  //   const c = randomNumber()

  //   // r = v + cx
  //   const r = v + BigInt(c) * x

  //   console.log(x, r, v)

  //   //=========================================//
  //   console.log(
  //     G.multiply(r)
  //       .subtract(P.multiply(BigInt(c)))
  //       .equals(T),
  //   )
  //   //=========================================//
  // })
})
//0x5FbDB2315678afecb367f032d93F642f64180aa3
