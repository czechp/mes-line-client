const axios = require("axios").default
const { USERNAME, PASSOWRD, PASSWORD } = require("../CONSTANTS")

const configureInterceptors = () => {
    axios.interceptors.request.use((config) => {
        const token = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64")
        config.headers.Authorization = token
        return config
    })
}

module.exports = configureInterceptors