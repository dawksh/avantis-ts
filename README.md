# @dawksh/avantis

TypeScript SDK for trading on [Avantis](https://avantisfi.com).

## Installation

```sh
npm install @dawksh/avantis
```

## Usage

```ts
import { IntegratedClient, AvantisSDK } from '@dawksh/avantis'
import { createWalletClient, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const walletClient = createWalletClient({ chain: base, transport: http(), account: /* your account */ })
const publicClient = createPublicClient({ chain: base, transport: http() })
const client = new IntegratedClient(walletClient, publicClient)
const sdk = new AvantisSDK(client)

sdk.getPairs().then(console.log)
```

## API

-   `IntegratedClient(walletClient, publicClient, abiBasePath?)`
    -   `.getContract(contract, address)`
    -   `.getClients()`
-   `AvantisSDK(client)`
    -   `.getClient()`
    -   `.getPairs(forceUpdate?)`

ABIs must be present in `src/abis/{Contract}.sol/{Contract}.json`.

## License

MIT
