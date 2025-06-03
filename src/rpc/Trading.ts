import { encodeFunctionData } from "viem";
import type { IntegratedClient } from "../clients";
import { MAINNET_ADDRESSES } from "../utils/constants";

class Trading {
    private client: IntegratedClient;

    constructor(client: IntegratedClient) {
        this.client = client;
    }

    async createMarketOrder(
        pair: number,
        buy: boolean,
        leverage: number,
        margin: number,
        openPrice: number,
        tp = 0,
        sl = 0,
        timestamp = Date.now()
    ) {
        const trading = this.client.getContract(
            "Trading",
            MAINNET_ADDRESSES["Trading"] as `0x${string}`
        );
        const calldata = encodeFunctionData({
            abi: trading.abi,
            functionName: "openTrade",
            args: [
                [
                    this.client.getClients().walletClient.account?.address,
                    BigInt(pair),
                    0,
                    0n,
                    BigInt(margin),
                    BigInt(openPrice),
                    buy,
                    BigInt(leverage),
                    BigInt(tp),
                    BigInt(sl),
                    BigInt(timestamp),
                ],
                0n,
                30000000000n,
            ],
        });
        return calldata
    }
}

export default Trading;
