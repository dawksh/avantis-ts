import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { IntegratedClient, AvantisSDK } from "./index";
import { createPublicClient, createWalletClient, http, type PublicClient } from "viem";
import { base } from "viem/chains";

const acc = privateKeyToAccount(generatePrivateKey())

const publicClient = createPublicClient({
    chain: base,
    transport: http(),
    batch: {
        multicall: {
            batchSize: 100,
            wait: 1000,
        }
    },
}) as PublicClient

const walletClient = createWalletClient({
    chain: base,
    transport: http(),
    account: acc
})

const client = new IntegratedClient(walletClient, publicClient)
const sdk = new AvantisSDK(client)

sdk.getPairs().then(pairs => console.log(pairs[0]))
