
const opcUa = require("node-opcua-client")

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
}

const options = {
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: opcUa.MessageSecurityMode.None,
    securityPolicy: opcUa.SecurityPolicy.None,
    endpointMustExist: false,
}



class OpcUaReader {
    constructor(url) {
        this.connected = false
        this.url = url
        this.client = opcUa.OPCUAClient.create(options)
    }
    async connect() {
        try {
            await this.client.connect(this.url)
            this.connected = true
            console.log(`Connection with ${this.url} established`)
        } catch (error) {
            console.error(`Cannot connect with ${this.url}`)
        }
    }
    async disconnect() {
        this.client.disconnect()
        console.log(`Disconnected with ${this.url}`)
    }
    async readValue(node) {
        if (this.connected) {
            try {
                const session = await this.client.createSession()
                const maxAge = 0;
                const nodeToRead = {
                    nodeId: node,
                    attributeId: opcUa.AttributeIds.Value
                };
                const dataValue = await session.read(nodeToRead, maxAge);
                await session.close()

                return dataValue.value.value
            } catch (error) {
                console.error(`Error during reading data from ${this.url}`)
                this.disconnect()
                this.connected = false
                return null
            }
        } else {
            await this.connect()
            return null
        }
    }
}


module.exports = OpcUaReader