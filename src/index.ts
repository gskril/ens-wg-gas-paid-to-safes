import 'dotenv/config'
import * as fs from 'fs'
import { Address, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { getTransactionsFromEtherscan } from './etherscan.js'

const ethClient = createPublicClient({
  transport: http('https://rpc.ankr.com/eth', { batch: { batchSize: 10_240 } }),
  chain: mainnet,
})

const transactions = await getTransactionsFromEtherscan()

// delete all the old files
fs.readdirSync('./output').forEach((file) => {
  if (file === '.keep') return

  fs.unlinkSync(`./output/${file}`)
})

// combine multiple transactions from the same address into one
const gasSpenders = transactions.reduce((acc, curr) => {
  const existing = acc.find((tx) => tx.from === curr.from)
  if (existing) {
    existing.gas += curr.gas // Ensure curr.gas is a number
    existing.transactionCount += 1
  } else {
    acc.push({ from: curr.from, gas: curr.gas, transactionCount: 1 }) // Ensure curr.gas is a number
  }

  return acc
}, [] as { from: Address; gas: number; transactionCount: number; name?: string }[])

const gasSpendersEnsNames = await Promise.all(
  gasSpenders.map((account) => ethClient.getEnsName({ address: account.from }))
)

if (!gasSpendersEnsNames) {
  throw new Error('Error resolving ENS names')
}

gasSpenders.map((account, i) => {
  account.name = gasSpendersEnsNames[i] || undefined
})

// filter out addresses that don't have a primary ENS name
// they are all some weird forwarding addresses
const filteredGasSpenders = gasSpenders.filter(
  (account) => account.name !== undefined
)

console.table(filteredGasSpenders)

// write csv file with all the accounts
fs.writeFileSync(
  `./output/gas-spending.csv`,
  filteredGasSpenders
    .map(
      (account) =>
        `${account.name},${account.from},${account.gas},${account.transactionCount}`
    )
    .join('\n')
)
