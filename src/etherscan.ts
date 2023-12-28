import got from 'got'
import { Address, Hex } from 'viem'

type SimpleTransaction = {
  from: Address
  hash: Hex
  gas: number
}

export async function getTransactionsFromEtherscan(): Promise<
  SimpleTransaction[]
> {
  const allTransactions = new Array<SimpleTransaction>()

  const workingGroupSafes: Address[] = [
    '0xcD42b4c4D102cc22864e3A1341Bb0529c17fD87d',
    '0x2686A8919Df194aA7673244549E68D42C1685d03',
    '0x6a016548310076285668e2378df70bd545396b5a',
    '0xddb53563586e2d5f9cde97b99b1062c4315785ec',
    '0xBa0c461b22d918FB1F52fEF556310230d177D1F2',
    '0x536013c57DAF01D78e8a70cAd1B1abAda9411819',
    '0x9B9c249Be04dd433c7e8FbBF5E61E6741b89966D',
    '0x69A79128462853833E22bBA1A43bcdAC4725761b',
    '0xb3a37c813d3d365a03dd1dd3e68cc11af019cdd6',
    '0x0d06a817584ac378849f03df6f11a9ad67dd786d',
    '0x91c32893216dE3eA0a55ABb9851f581d4503d39b',
    '0x4f4cadb8af8f1d463240c2b93952d8a16688a818',
    '0x83DD97A584C4aD50015f7aA6B48bf4970A056d8f',
    '0x8f730f4ac5fd234df9993e0e317f07e44fb869c1',
    '0xE43a63abac42C0Fd8c1159CA08E42B027c2b63A9',
    '0x9718ba71dC1284842fcE66dC3e34DFFC6C630074',
    '0x5D609c79C7e19AA334d77517b3B17A3daC6f54bC',
    '0xe8929029eA54113da91cdb8c9C1Ba297cF803838',
    '0x593a50cf05359bc88474D86B06eC6E1c1A2A899F',
    '0xb423e0f6E7430fa29500c5cC9bd83D28c8BD8978',
  ]

  for (const address of workingGroupSafes) {
    const transactions = await getTransactionsFromOneAddress(address)
    allTransactions.push(...transactions)
  }

  return allTransactions
}

async function getTransactionsFromOneAddress(address: Address) {
  const endpoint = 'https://api.etherscan.io/api?'

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    startblock: '0',
    endBlock: '17663941',
    address,
    sort: 'asc',
    apikey: process.env.ETHERSCAN_API_KEY!,
  })

  const res = (await got(endpoint + params.toString()).json()) as {
    status: string
    message: string
    result: {
      blockNumber: string
      timeStamp: string
      hash: Hex
      nonce: string
      blockHash: Hex
      transactionIndex: string
      from: Address
      to: Address
      value: string
      gas: string
      gasPrice: string
      isError: string
      txreceipt_status: string
      input: string
      contractAddress: Address
      cumulativeGasUsed: string
      gasUsed: string
      confirmations: string
      methodId: string
      functionName: string
    }[]
  }

  const transactions = res.result

  if (!transactions) {
    throw new Error('Error getting transactions from Etherscan')
  }

  // We only care about transactions that call `execTransaction` on one of the Safes
  const filteredTransactions = transactions.filter((txn) => {
    const functionNames = [
      'execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)',
    ]

    return functionNames.includes(txn.functionName)
  })

  return filteredTransactions.map((tx) => {
    const { hash, from, gasUsed, gasPrice } = tx
    const gas = (Number(gasUsed) * Number(gasPrice)) / 1e18

    return {
      from,
      hash,
      gas,
    }
  })
}
