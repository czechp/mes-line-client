const SerialReader = require("./SerialPortReader")
const displayStatement = require("../utilities/displayStatement")
const { default: axios } = require("axios")
const { BACKEND_URL, LINE_ID } = require("../CONSTANTS")

class RfidReaderService {
    constructor(readerConfig) {
        this.currentRifd = ""
        this.serialPortReader = new SerialReader(readerConfig)
    }

    async connect() {
        await this.serialPortReader.connect(() => {
            this.sendData("")
        })
    }

    handleRfid() {
        const { data, connectionCorrect } = this.serialPortReader.read()
        if (connectionCorrect) {
            const rfid = data ? data.toString().substr(0, data.toString().indexOf("XXX")) : ""
            this.checkCard(rfid)
        } else {
            this.reportError()
        }
    }

    reportError() {
        axios.patch(`${BACKEND_URL}/lines/rfid-error/${LINE_ID}`)
            .then((response) => {
                console.log("Reported rifd reader faliure to backend system")
            })
            .catch((error) => {
                console.log("Error during reporting rfid reader error to backend system")
                console.log(error)
            })
    }


    checkCard(rfid) {
        if (this.currentRifd !== rfid) {
            const message = rfid !== "" ? `New card detected: ${rfid}` : "No card detected"
            displayStatement(message)
            this.currentRifd = rfid
            this.sendData(rfid)
        }
    }

    sendData(rfid) {
        const responseMessage = `Opeator updated. New id: ${rfid !== "" ? rfid : "empty"}`

        axios.patch(`${BACKEND_URL}/lines/operator/${LINE_ID}`, {}, {
            params: { rfid }
        })
            .then((response) => {
                displayStatement(responseMessage)
            })
            .catch((error) => {
                displayStatement("Error during updating operator in backend system")
            })
    }

    async disconnect() {
        await this.serialPortReader.disconnect()
    }

}

module.exports = RfidReaderService