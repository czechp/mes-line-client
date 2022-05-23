const SerialPort = require("serialport")
const displayStatement = require("../utilities/displayStatement")
const sleep = require("../utilities/sleep")


class SerialPortReader {
    constructor({ portId, baudrate }) {
        this.portId = portId
        this.baudRate = baudrate
        this.connectionEstablished = false
        this.port = null
        this.connectedCallback = ()=>{}
    }

    async connect(connectedCallback = ()=>{}, errorCallback = ()=>{}) {
        this.connectedCallback = connectedCallback
        this.port = new SerialPort(this.portId, { baudRate: this.baudRate }, (error) => {
            if (error) {
                this.connectionErrorStatement()
                this.connectionEstablished = false
                this.connectedCallback()
            } else {
                this.connectionEstablishedStatement()
                this.connectionEstablished = true
                errorCallback()
            }
        })
        await sleep(1000)
    }

    connectionErrorStatement = () => {
        displayStatement(`Cannot connect with ${this.portId}`)
    }

    connectionEstablishedStatement = () => {
        displayStatement(`Connection with port ${this.portId} established`)
    }

    read() {
        let result = { data: "", connectionCorrect: false }
        if (this.port.isOpen) {
            const data = this.port.read()
            return { data, connectionCorrect: true }
        } else {
            this.port.open((error) => {
                if (error)
                    this.connectionErrorStatement()
                else{
                    this.connectionEstablishedStatement()
                    this.connectedCallback()
                }
            })
            return result
        }
    }
}



module.exports = SerialPortReader