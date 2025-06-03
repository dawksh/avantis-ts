import axios from "axios";
import type { IntegratedClient } from "../clients";
import { AVANTIS_SOCKET_API, MAINNET_ADDRESSES } from "../utils/constants";

export interface PairInfoWithData {
    from_: string;
    to: string;
    group_index: number;
    [key: string]: any;
}

export default class PairsCache {
    private client: IntegratedClient;
    private _pairInfoCache: Record<number, PairInfoWithData> = {};
    private _groupIndexesCache: Set<number> = new Set();
    private _pairMapping: Record<string, number> = {};

    private getContract(name: string) {
        return this.client.getContract(name, MAINNET_ADDRESSES[name as keyof typeof MAINNET_ADDRESSES] as `0x${string}`);
    }

    constructor(client: IntegratedClient) {
        this.client = client;
    }

    async getPairsInfo(forceUpdate = false): Promise<Record<number, PairInfoWithData>> {
        if (forceUpdate || Object.keys(this._pairInfoCache).length === 0) {
            const { data } = await axios.get(AVANTIS_SOCKET_API)
            const pairs = data.data.pairInfos
            for (const pair of Object.keys(pairs)) {
                this._pairInfoCache[Number(pair)] = pairs[pair] as PairInfoWithData
                this._groupIndexesCache.add(pairs[pair].group_index)
                this._pairMapping[`${pairs[pair].from_}/${pairs[pair].to}`] = Number(pair)
            }
            return this._pairInfoCache
        }
        return this._pairInfoCache
    }

    async getPairsCount(): Promise<number> {
        const PairStorage = this.getContract("PairStorage");
        return await PairStorage.read("pairsCount") as number;
    }

    async getGroupIndexes(): Promise<Set<number>> {
        if (this._groupIndexesCache.size === 0) {
            await this.getPairsInfo();
        }
        return this._groupIndexesCache;
    }

    async getPairIndex(pair: string): Promise<number> {
        await this.getPairsInfo();
        const index = this._pairMapping[pair];
        if (index === undefined) {
            throw new Error(`Pair ${pair} not found in pairs info.`);
        }
        return index;
    }

    async getPairNameFromIndex(pairIndex: number): Promise<string> {
        const pairsInfo = await this.getPairsInfo();
        const pair = pairsInfo[pairIndex];
        if (!pair) {
            throw new Error(`Pair index ${pairIndex} not found.`);
        }
        return `${pair.from_}/${pair.to}`;
    }
}