const SerialPortGSM = require("serialport-gsm")
const MD5 = require("md5")
const { loadPort, fixLightOn } = require("./models/port")
const { getSignalJob } = require("./schedule")

const options = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: false,
    enableConcatenation: true,
    incomingCallIndication: true,
    incomingSMSIndication: true,
    pin: "",
    customInitCommand: "",
    cnmiCommand: "AT+CNMI=2,1,0,0,0",
    logger: ""
}

const selfLoad = async(portIndex) => {
    if(global.ports[portIndex].lock){
        console.log(`${global.ports[portIndex].comName}: DeadLock`)
        // setTimeout(() => {
        //     return selfLoad(portIndex)
        // }, 5000)
    }
    global.ports[portIndex].set("retries", global.ports[portIndex].retries + 1)
    global.ports[portIndex].set("lock", true)
    await loadPort(portIndex)
    .then(() => {
        global.ports[portIndex].set("state", "registed")
        global.ports[portIndex].set("lock", false)
        global.ports[portIndex].jobs.push(getSignalJob(global.ports[portIndex], "*/30 * * * * *"))
    })
    .catch((error) => {
        console.log(error)
        global.ports[portIndex].close()
        global.ports[portIndex].set("lock", false)
        setTimeout(() => {
            return selfLoad(portIndex)
        }, 5000)
    })
}

const loadPorts = async() => {
    let session = global.session
    try{
        for(let port of global.ports){
            await port.modem.close((result) => {})
        }
    }catch (error){}

    return SerialPortGSM.list((error, ports) => {
        if(error){
            console.log(error)
            return reject(error)
        }
        ports = ports.filter((port) => {
            if(port.serialNumber == undefined || port.locationId == undefined || port.vendorId == undefined || port.productId == undefined){
                return false
            }
            return true
        })
        ports.sort((serialA, serialB) => {
            let locationA = serialA.locationId.replace(/\./g, "")
            let locationB = serialB.locationId.replace(/\./g, "")
            if(locationA != locationB){
                return locationA - locationB
            }
            let pnpA
            let pnpB
            if(/&([0-9]{4})/.test(serialA.pnpId)){
                let matches = /&([0-9]{4})/.exec(serialA.pnpId)
                pnpA = matches[1]
            }
            if(/&([0-9]{4})/.test(serialB.pnpId)){
                let matches = /&([0-9]{4})/.exec(serialB.pnpId)
                pnpB = matches[1]
            }
            return pnpA - pnpB
        })
        ports.map((port, index) => {
            ports[index].session = session
            ports[index].numod = index + 1
        })
        for(let port of ports){
            let modem = SerialPortGSM.Modem()
            try{
                modem.open(port.path, options, async(error) => {
                    if(error){
                        return
                    }
                    let portIndex = global.ports.push({
                        id: MD5(port.path),
                        comName: port.path,
                        numod: port.numod,
                        imei: "",
                        iccid: "",
                        signal: "",
                        operator: "",
                        msisdn: "",
                        balance: "",
                        smsCounter: "",
                        modem: modem,
                        jobs: [],
                        isInitial: false,
                        state: "closed",
                        status: "pending",
                        statement: "Cổng đóng",
                        lock: false,
                        retries: 0,
                    }) - 1
                    global.ports[portIndex].portIndex = portIndex
                    global.ports[portIndex].get = (propName) => {
                        return global.ports[portIndex][propName]
                    }
                    global.ports[portIndex].set = (propName, propValue) => {
                        global.ports[portIndex].status = "processing"
                        global.ports[portIndex][propName] = propValue
                        global.ports[portIndex].status = "pending"
                        return global.ports[portIndex][propName]
                    }
                    global.ports[portIndex].useable = () => {
                        let useable = ["id", "portIndex", "comName", "numod", "imei", "iccid", "signal", "operator", "msisdn", "balance", "smsCounter", "state", "status", "statement"]
                        let pick = (obj, keys) => {
                            return Object.keys(obj).filter(k => keys.includes(k)).reduce((res, k) => Object.assign(res, {[k]: obj[k]}), {})
                        }
                        return pick(global.ports[portIndex], useable)
                    }
                    global.ports[portIndex].cancelJobs = () => {
                        for(let index in global.ports[portIndex].jobs){
                            global.ports[portIndex].jobs[index].cancel()
                        }
                    }
                    global.ports[portIndex].close = () => {
                        global.ports[portIndex].state = "closed"
                        global.ports[portIndex].statement = "Cổng đóng"
                        global.ports[portIndex].cancelJobs()
                    }
                    global.ports[portIndex].clear = () => {
                        global.ports[portIndex].iccid = ""
                        global.ports[portIndex].operator = ""
                        global.ports[portIndex].msisdn = ""
                        global.ports[portIndex].balance = ""
                        global.ports[portIndex].signal = ""
                        global.ports[portIndex].smsCounter = ""
                    }
                    global.ports[portIndex].fixLightOn = () => {
                        return fixLightOn(global.ports[portIndex])
                    }
                    selfLoad(portIndex)
                    global.ports[portIndex].modem.on("onPutOut", () => {
                        global.ports[portIndex].clear()
                        global.ports[portIndex].close()
                        selfLoad(portIndex)
                    })
                    global.ports[portIndex].modem.on("onPutIn", () => {
                        global.ports[portIndex].set("statement", "Đã nhận sim, vui lòng chờ")
                        selfLoad(portIndex)
                    })
                    global.ports[portIndex].modem.on("onNewMessage", (messageDetails) => {
                        let messageDetail = messageDetails[0]
                        let otp = ""
                        if(/\b\d{4,8}\b/.test(messageDetail.message)){
                            let matches = /\b\d{4,8}\b/.exec(messageDetail.message)
                            otp = matches[0]
                        }
                        let message = {
                            comName: global.ports[portIndex].comName,
                            receiver: global.ports[portIndex].msisdn,
                            sender: messageDetail.sender,
                            message: messageDetail.message,
                            otp: otp,
                            dateTime: messageDetail.dateTimeSent
                        }
                        global.io.emit("onNewMessage", message)
                    })
                })
            }catch (error){
                console.log(error)
            }
        }
    })
}

module.exports = {
    loadPorts,
    selfLoad
}