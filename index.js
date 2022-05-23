const RfidReaderService = require("./rifd-reader/RfidReaderService")
const OpcUaService = require("./opc-reader/OpcUaService")
const sleep = require("./utilities/sleep")
const configureInterceptors = require("./utilities/configureInterceptors")
const { OPC_PLC_SERVER, AUTOMATION_NODE, COUNTER_NODE } = require("./CONSTANTS")


console.log("Bispol MES System")
console.log("Card Reader and OPC Client")


configureInterceptors()

const serialReaderConfig = {
    portId: "/dev/ttyACM0",
    baudrate: 9600
}

const opcUaReaderConfig = {
    url: OPC_PLC_SERVER,
    automationNode: AUTOMATION_NODE,
    counterNode: COUNTER_NODE
}

const rfidReaderService = new RfidReaderService(serialReaderConfig)
const opcUaService = new OpcUaService(opcUaReaderConfig)


const main = async () => {
    await rfidReaderService.connect()
    await opcUaService.connect()

    while (true) {
        rfidReaderService.handleRfid()
        await opcUaService.handleOpc()

        await sleep(700)
    }

    await rfidReaderService.disconnect()
    await opcUaService.disconnect()
}


main()