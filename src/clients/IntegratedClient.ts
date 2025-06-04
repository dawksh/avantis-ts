import { type WalletClient, type PublicClient, createPublicClient, http } from 'viem';
import type { Abi } from 'abitype';
import * as fs from 'fs';
import * as path from 'path';
import { base } from "viem/chains"

class IntegratedClient {
    private walletClient: WalletClient;
    private publicClient: PublicClient;
    private abiBasePath: string;

    constructor(walletClient?: WalletClient, publicClient?: PublicClient, abiBasePath: string = './src/abis') {
        this.walletClient = walletClient!;
        this.publicClient = publicClient || createPublicClient({
            chain: base,
            transport: http(),
            batch: {
                multicall: {
                    batchSize: 100,
                }
            }
        }) as unknown as PublicClient;
        this.abiBasePath = abiBasePath;
    }

    /**
     * Loads the ABI from a JSON file.
     * @param folderName - The folder name under `abi/[Contract]/[Contract].json`.
     * @returns The ABI as an object.
     */
    private loadABI(contract: string): Abi {
        const abiPath = path.join(this.abiBasePath, `${contract}.sol`, `${contract}.json`);
        if (!fs.existsSync(abiPath)) {
            throw new Error(`ABI file not found at path: ${abiPath}`);
        }
        const abiFile = fs.readFileSync(abiPath, 'utf-8');
        return JSON.parse(abiFile).abi as Abi;
    }

    /**
     * Creates a contract instance using the provided ABI and address.
     * @param folderName - The folder name under `abi/[FolderName]/Folder.json`.
     * @param contractAddress - The address of the contract.
     * @returns The contract instance.
     */
    public getContract(contract: string, contractAddress: `0x${string}`) {
        const abi = this.loadABI(contract);
        return {
            read: async (functionName: string, args?: Array<any>) => {
                return await this.publicClient.readContract({
                    abi,
                    address: contractAddress,
                    functionName,
                    args
                })
            },
            write: async (functionName: string, args?: Array<any>, value?: bigint) => {
                return await this.walletClient.writeContract({
                    abi,
                    address: contractAddress,
                    functionName,
                    args,
                    chain: base,
                    account: this.walletClient.account || null,
                    value
                })
            },
            abi
        };
    }

    /**
     * Returns the integrated clients.
     * @returns An object containing the `WalletClient` and `PublicClient`.
     */
    public getClients() {
        return {
            walletClient: this.walletClient,
            publicClient: this.publicClient,
        };
    }
}

export default IntegratedClient