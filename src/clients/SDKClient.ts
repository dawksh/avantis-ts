import IntegratedClient from "./IntegratedClient";
import PairsCache from "../rpc/PairsCache";

class AvantisSDK {
    private client: IntegratedClient;
    private pairsCache: PairsCache;

    constructor(client: IntegratedClient) {
        this.client = client;
        this.pairsCache = new PairsCache(client);
    }

    public getClient() {
        return this.client;
    }

    async getPairs(forceUpdate = false) {
        return this.pairsCache.getPairsInfo(forceUpdate);
    }
}

export default AvantisSDK