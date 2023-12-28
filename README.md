Script to get the gas fees paid to execute transactions from the ENS DAO Working Group Multisig Wallets.

## How to run

Install dependencies

```bash
yarn install
```

Create a `.env` file and enter your [Etherscan API key](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics)

```bash
cp .env.example .env
```

Customize the [Safe addresses](https://github.com/gskril/ens-wg-gas-paid-to-safes/blob/main/src/etherscan.ts#L15-L36) and [block range](https://github.com/gskril/ens-wg-gas-paid-to-safes/blob/main/src/etherscan.ts#L52-L53) you want to query gas spending for in `./src/etherscan.ts`, then run the script

```bash
yarn start
```

The results will be saved in the `./output/` folder.
