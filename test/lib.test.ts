import { Atbash, Leaf, MerkleDistributor } from 'atbash-evm'
import { JsonRpcProvider, Wallet } from 'ethers'
import 'dotenv/config'

const { data: PRIMARY_DUMMY_METADATA } = Buffer.from(
  'b2b68b298b9bfa2dd2931cd879e5c9997837209476d25319514b46f7b7911d31',
  'hex',
).toJSON()

describe('lib test', function () {
  let candidates: string[]
  let voters: string[]
  let merkleDistributor: MerkleDistributor
  const alice = '0x1428c88b3E72735bb20cEF0811b4B97348b39d97'
  const bob = '0x212C9c192971C3743cef30D5212e19f30b63754a'
  const carol = '0x299FDFfD23974167c599dd74853C06B7c94917a2'

  async function deployFixture() {
    const provider = new JsonRpcProvider('https://rpc.testnet.tomochain.com')
    const wallet = new Wallet(process.env.PRIVKEY || '', provider)

    const contract = new Atbash({ wallet })
    return { contract, wallet }
  }
  before(async () => {
    const { wallet } = await deployFixture()
    candidates = [alice, bob, carol]
    voters = [wallet.address]
    merkleDistributor = new MerkleDistributor(
      voters.map((voter) => new Leaf(voter)),
    )
  })

  // it('init proposals', async function () {
  //   const { contract } = await deployFixture()
  //   const startTime = Math.round(Date.now() / 1000 + 5)
  //   const endTime = Math.round(Date.now() / 1000 + 500)
  //   const txId = await contract.initializeProposal({
  //     candidates,
  //     voters,
  //     endTime,
  //     startTime,
  //     metadata: PRIMARY_DUMMY_METADATA,
  //   })
  //   console.log(txId)
  // })

  it('vote', async function () {
    const { contract, wallet } = await deployFixture()
    const proof = merkleDistributor.prove(new Leaf(wallet.address))
    const txId = await contract.vote({
      owner: wallet.address,
      proof,
      proposalId: 2,
      votFor: alice,
    })
    console.log(txId)
  })

  it('it get result', async function () {
    const { contract } = await deployFixture()
    const result = await contract.getWinner({ proposalId: 2 })
    console.log(result)
  })
})
