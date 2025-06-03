import IntegratedClient from "./IntegratedClient";

class AvantisSDK {
    private client: IntegratedClient;

    constructor(client: IntegratedClient) {
        this.client = client;
    }

    public getClient() {
        return this.client;
    }

    async getPairs() {

    }
}

export default AvantisSDK