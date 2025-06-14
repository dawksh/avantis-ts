import { encodeFunctionData, erc20Abi, type Call } from "viem";
import type { IntegratedClient } from "../clients";
import { MAINNET_ADDRESSES } from "../utils/constants";

class Trading {
  private client: IntegratedClient;

  constructor(client: IntegratedClient) {
    this.client = client;
  }

  async getUsdcAllowance(user?: `0x${string}`) {
    const trading = MAINNET_ADDRESSES["Trading"] as `0x${string}`
    const usdc = MAINNET_ADDRESSES["USDC"] as `0x${string}`
    const allowance = await this.client.getClients().publicClient.readContract({
      address: usdc,
      abi: erc20Abi,
      functionName: "allowance",
      args: [user || this.client.getClients().walletClient.account?.address!, trading]
    })
    return allowance
  }

  async generateUsdcAllowanceTx(user?: `0x${string}`, amount?: number) {
    const trading = MAINNET_ADDRESSES["Trading"] as `0x${string}`
    const usdc = MAINNET_ADDRESSES["USDC"] as `0x${string}`
    const calldata = {
      to: usdc,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [trading, BigInt(amount || 100000000)]
      })
    }
    return calldata
  }

  async createMarketOrder(
    pairIndex: number,
    index: number,
    buy: boolean,
    leverage: number,
    margin: number,
    openPrice: number,
    tp = 0,
    sl = 0,
    timestamp = Date.now(),
    user?: `0x${string}`
  ) {
    const calls: Call[] = []
    const allowance = await this.getUsdcAllowance(user)
    if (allowance < BigInt(margin)) {
      const approvalCall = await this.generateUsdcAllowanceTx(user, margin)
      calls.push(approvalCall)
    }
    const trading = this.client.getContract(
      "Trading",
      MAINNET_ADDRESSES["Trading"] as `0x${string}`
    );
    const calldata = encodeFunctionData({
      abi: trading.abi,
      functionName: "openTrade",
      args: [
        [
          user || this.client.getClients().walletClient.account?.address!,
          BigInt(pairIndex),
          BigInt(index),
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

    calls.push({
      to: MAINNET_ADDRESSES["Trading"] as `0x${string}`,
      data: calldata,
    })

    return calls
  }

  async closeMarketOrder(pairIndex: number, index: number, collateral: number) {
    const trading = MAINNET_ADDRESSES["Trading"]
    const tradingContract = this.client.getContract("Trading", trading as `0x${string}`)
    const calldata = encodeFunctionData({
      abi: tradingContract.abi,
      functionName: "closeTradeMarket",
      args: [BigInt(collateral), BigInt(index), BigInt(pairIndex)]
    })
    return calldata
  }

  async getCurrentOrders(user?: `0x${string}`) {
    const multicall = this.client.getContract("Multicall", MAINNET_ADDRESSES["Multicall"] as `0x${string}`);
    const trades = await multicall.read("getPositions", [user])
    return trades
  }

  async getHistory(user?: `0x${string}`) { }
}

export default Trading;
