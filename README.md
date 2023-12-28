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

Run the script

```bash
yarn start
```

The results will be saved in the `./output/` folder.
