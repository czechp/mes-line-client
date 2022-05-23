const OpcUaReader = require("./OpcUaReader")
const axios = require("axios").default
const displayStatement = require("../utilities/displayStatement")
const { OPC_READ_FREQUENCY, BACKEND_URL, LINE_ID } = require("../CONSTANTS")

class OpcUaService {
    constructor({ url, automationNode, counterNode }) {
        this.url = url
        this.opcUaReader = new OpcUaReader(url)
        this.automationNode = automationNode
        this.counterNode = counterNode
        this.cycleCounter = OPC_READ_FREQUENCY
    }

    async connect() {
        await this.opcUaReader.connect()
    }


    async handleOpc() {
        this.cycleCounter++
        if (this.cycleCounter >= OPC_READ_FREQUENCY) {
            const automation = await this.opcUaReader.readValue(this.automationNode)
            const counter = await this.opcUaReader.readValue(this.counterNode)
            this.cycleCounter = 0
            this.handleData(automation, counter)

        }
    }

    handleData(automation, counter) {
        if (automation !== null && counter !== null) {
            displayStatement(`Data read from PLC: \nautomation: ${automation}\ncounter: ${counter}`)
            this.sendData(automation, counter)
        }
        else {
            this.sendError()
        }
    }

    sendData(automation, counter) {
        axios.patch(`${BACKEND_URL}/lines/line-basic-info/${LINE_ID}`, {}, {
            params: {
                lineStatus: automation ? "ACTIVE" : "DEACTIVATED",
                lineCounter: counter
            }
        })
            .then((response) => {
                displayStatement("Line data updated")
            })
            .catch((error) => {
                displayStatement("Error during updated data about line")
                console.log(error)
            })

    }

    sendError() {
        axios.patch(`${BACKEND_URL}/lines/opc-error/${LINE_ID}`)
            .then((response) => {
                displayStatement("Reported error with OPC Server connection")
            })
            .catch((error)=>{
                displayStatement("Cannot report OPC UA connection error")
                console.log(error)
            })
    }


    async disconnect() {
        this.opcUaReader.disconnect()
    }


}

module.exports = OpcUaService