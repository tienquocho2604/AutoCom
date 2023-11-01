const axios = require("axios")

class WebAPI {
    constructor(baseURL = process.env.API_URL, APIKEY = "") {
        this.apikey = apikey
        this.client = axios.create({
            baseURL: baseURL
        })
    }
    set apikey(apikey) {
        this.apikey = apikey
    }
    set params(params) {
        this.client.params = params   
    }
    request (method, endPoint) {
        if(method == "GET"){
            return this.client.get(endPoint)
        }
        return this.client.post(endPoint)
    }
}

module.exports = WebAPI