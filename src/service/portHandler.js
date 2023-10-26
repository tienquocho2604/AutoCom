let SerialPortGSM = require("serialport-gsm")
let MD5 = require("md5")

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

const initializeModem = (modem) => {
    return new Promise((resolve, reject) => {
        try{
            modem.initializeModem((result, error) => {
                setTimeout(() => {
                    return reject({
                        state: "fail",
                        message: "Mở cổng thất bại"
                    })
                }, 10000)
                if(error){
                    return reject({
                        state: "fail",
                        message: "Mở cổng thất bại"
                    })
                }
                if(result && result.status == "success"){
                    return resolve({
                        state: "success",
                        message: "Chờ cắm sim"
                    })
                }else{
                    return reject({
                        state: "fail",
                        message: "Mở cổng thất bại"
                    })
                }
            })
        }catch(error){
            return reject({
                state: "fail",
                message: "Mở cổng thất bại"
            })
        }
    })
}

const checkCPIN = (modem) => {
    return new Promise((resolve, reject) => {
        modem.executeCommand("AT+CPIN?", (result, error) => {
            if(error){
                return reject({
                    state: "fail",
                    message: "Cổng đóng"
                })
            }
            if(result && result.status == "success"){
                if(/READY/.test(result.data.result)){
                    console.log(result)
                    return resolve({
                        state: "success",
                        message: "Đã cắm sim"
                    })
                }
            }else{
                return reject({
                    state: "fail",
                    message: "Cổng đóng"
                })
            }
        }, false, 5000)
    })
}

const cancelUSSD = (modem) => {
    try{
        modem.executeCommand(`AT+CUSD=2\n`, (result, error) => {
            return Promise.resolve({
                state: "sucess"
            })
        }, false, 10000)
    }catch(error) {
        return Promise.resolve({
            state: "sucess"
        })
    }
}

const deleteAllSMS = (modem) => {
    return new Promise((resolve, reject) => {
        try{
            modem.deleteAllSimMessages((result) => {
                if(result && result.status == "success"){
                    return resolve({
                        state: "success",
                        message: "Xóa tin nhắn thành công"
                    })
                }else{
                    return resolve({
                        state: "fail",
                        message: "Xoá tin nhắn không thành công"
                    })
                }

            })
        }catch(error){
            return resolve({
                state: "fail",
                message: "Xoá tin nhắn không thành công"
            })
        }
    })
}

const getIMEI = (modem) => {
    return new Promise((resolve, reject) => {
        try{
            let parts = modem.executeCommand("AT+CGSN", () => {}, false, 5000)
            let timeout = setTimeout(() => {
                parts.logic = undefined
                return reject({
                    state: "fail",
                    message: "Lấy IMEI không thành công"
                })
            }, 5000)
            parts.logic = (part) => {
                if(/([0-9]*)/.test(part)){
                    clearTimeout(timeout)
                    let matches = /([0-9]*)/.test(part)
                    return resolve({
                        state: "success",
                        message: "Lấy IMEI thành công",
                        payload: {
                            imei: matches[1]
                        }
                    })
                }else if(part == "ERROR"){
                    clearTimeout(timeout)
                    return reject({
                        state: "fail",
                        message: "Lấy IMEI không thành công"
                    })
                }
            }
        }catch(error){
            return reject({
                state: "fail",
                message: "Lấy IMEI không thành công"
            })
        }
    })
}

const getSignal = (modem) => {
    return new Promise((resolve, reject) => {
        try{
            setTimeout(() => {
                return reject({
                    state: "fail",
                    message: "Lấy signal không thành công"
                })
            }, 10000)
            modem.executeCommand("AT+CSQ", (result, error) => {
                if(error){
                    return reject({
                        state: "fail",
                        message: "Lấy signal không thành công"
                    })
                }
                if(result && result.status == "success"){
                    if(/([0-9,]*)/.test(result.data.result)){
                        let matches = /([0-9,]*)/.exec(result.data.result)
                        return resolve({
                            state: "success",
                            message: "Lấy signal thành công",
                            payload: {
                                signal: matches[1]
                            }
                        })
                    }
                }else{
                    return reject({
                        state: "fail",
                        message: "Lấy signal không thành công"
                    })
                }
            }, false, 5000)
        }catch(error){
            return reject({
                state: "fail",
                message: "Lấy signal không thành công"
            })
        }
    })
}

const getICCID = (modem) => {
    return new Promise((resolve, reject) => {
        try{
            setTimeout(() => {
                return reject({
                    state: "fail",
                    message: "Lấy ICCID không thành công"
                })
            }, 10000)
            modem.executeCommand("AT+ICCID", (result, error) => {
                if(error){
                    return reject({
                        state: "fail",
                        message: "Lấy ICCID không thành công"
                    })
                }
                if(result && result.status == "success"){
                    if(/ ([0-9]*)/.test(result.data.result)){
                        let matches = / ([0-9]*)/.exec(result.data.result)
                        return resolve({
                            state: "success",
                            message: "Lấy ICCID thành công",
                            payload: {
                                iccid: matches[1]
                            }
                        })
                    }
                }else{
                    return reject({
                        state: "fail",
                        message: "Lấy ICCID không thành công"
                    })
                }
            }, false, 5000)
        }catch(error){
            return reject({
                state: "fail",
                message: "Lấy ICCID không thành công"
            })
        }
    })
}

const getOperator = (modem) => {
    return new Promise(async(resolve, reject) => {
        try{
            modem.executeCommand("AT+COPS?", (result, error) => {
                if(error){
                    return reject({
                        state: "fail",
                        message: "Nhận dạng nhà mạng không thành công"
                    })
                }
                if(result && result.status == "success"){
                    if(result.data.result.includes("Viettel")){
                        return resolve({
                            state: "success",
                            message: "Nhận dạng nhà mạng thành công",
                            payload: {
                                operator: "Viettel"
                            }
                        })
                    }else if(result.data.result.includes("Mobifone")){
                        return resolve({
                            state: "success",
                            message: "Nhận dạng nhà mạng thành công",
                            payload: {
                                operator: "Mobifone"
                            }
                        })
                    }else if(result.data.result.includes("VINAPHONE")){
                        return resolve({
                            state: "success",
                            message: "Nhận dạng nhà mạng thành công",
                            payload: {
                                operator: "Vinaphone"
                            }
                        })
                    }else if(result.data.result.includes("Vietnamobile")){
                        return resolve({
                            state: "success",
                            message: "Nhận dạng nhà mạng thành công",
                            payload: {
                                operator: "Vietnamobile"
                            }
                        })
                    }else{
                        return reject({
                            state: "fail",
                            message: "Nhận dạng nhà mạng không thành công"
                        })
                    }
                }else{
                    return reject({
                        state: "fail",
                        message: "Nhận dạng nhà mạng không thành công"
                    })
                }
            })
        }catch(error){
            return reject({
                state: "fail",
                message: "Nhận dạng nhà mạng không thành công"
            })
        }
    })
}

const getOwnNumber = (modem, operator) => {
    return new Promise(async(resolve, reject) => {
        await cancelUSSD(modem)
        try{
            if(operator == "Viettel"){
                modem.executeCommand(`AT+CUSD=1,"*098#",15`, async(result, error) => {
                    if(error){
                        return reject({
                            state: "fail",
                            message: "Nhận dạng số điện thoại không thành công"
                        })
                    }
                    if(result && result.status == "success"){
                        let regex = new RegExp("Moi ([0-9]*)")
                        if(regex.test(result.data.result)){
                            let matches = regex.exec(result.data.result)
                            return resolve({
                                state: "success",
                                message: "Nhận dạng số điện thoại thành công",
                                payload: {
                                    msisdn: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Nhận dạng số điện thoại không thành công"
                            })
                        }
                    }else{
                        return reject({
                            state: "fail",
                            message: "Nhận dạng số điện thoại không thành công"
                        })
                    }
                }, false, 30000)
            }else if(operator == "Mobifone"){
                modem.executeCommand(`AT+CUSD=1,"*0#",15`, async(result, error) => {
                    if(result && result.status == "success"){
                        let regex = new RegExp("([0-9]*)")
                        if(regex.test(result.data.result)){
                            let matches = regex.exec(result.data.result)
                            return resolve({
                                state: "success",
                                message: "Nhận dạng số điện thoại thành công",
                                payload: {
                                    msisdn: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Nhận dạng số điện thoại không thành công"
                            })
                        }
                    }else{
                        return reject({
                            state: "fail",
                            message: "Nhận dạng số điện thoại không thành công"
                        })
                    }
                }, false, 30000)
            }else if(operator == "Vinaphone"){
                modem.executeCommand(`AT+CUSD=1,"*101#",15`, async(result, error) => {
                    if(result && result.status == "success"){
                        let regex = new RegExp("So TB ([0-9]*)")
                        if(regex.test(result.data.result)){
                            let matches = regex.exec(result.data.result)
                            return resolve({
                                state: "success",
                                message: "Nhận dạng số điện thoại thành công",
                                payload: {
                                    msisdn: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Nhận dạng số điện thoại không thành công"
                            })
                        }
                    }else{
                        return reject({
                            state: "fail",
                            message: "Nhận dạng số điện thoại không thành công"
                        })
                    }
                }, false, 30000)
            }else if(operator == "Vietnamobile"){
                modem.executeCommand(`AT+CUSD=1,"*123#",15`, async(result, error) => {
                    if(result && result.status == "success"){
                        let regex = new RegExp("2,\"([0-9]*)\",15")
                        if(regex.test(result.data.result)){
                            let matches = regex.exec(result.data.result)
                            return resolve({
                                state: "success",
                                message: "Nhận dạng số điện thoại thành công",
                                payload: {
                                    msisdn: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Nhận dạng số điện thoại không thành công"
                            })
                        }
                    }else{
                        return reject({
                            state: "fail",
                            message: "Nhận dạng số điện thoại không thành công"
                        })
                    }
                }, false, 30000)
            }
        }catch(error){
            return reject({
                state: "fail",
                message: "Nhận dạng số điện thoại không thành công"
            })
        }
    })
}

const getBalance = (modem, operator) => {
    return new Promise(async(resolve, reject) => {
        await cancelUSSD(modem)
        try{
            if(operator == "Viettel"){
                let parts = modem.executeCommand(`AT+CUSD=1,"*101#",15`, () => {})
                let timeout = setTimeout(() => {
                    parts.logic = undefined
                    return reject({
                        state: "fail",
                        message: "Lấy số dư thất bại"
                    })
                }, 30000)
                parts.logic = (part) => {
                    if(part.includes("TKG")){
                        clearTimeout(timeout)
                        part = part.replace(".", "")
                        let regex = new RegExp("([0-9]*)d")
                        if(regex.test(part)){
                            let matches = regex.exec(part)
                            return resolve({
                                state: "success",
                                message: "Lấy số dư thành công",
                                payload: {
                                    balance: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Lấy số dư thất bại"
                            })
                        }
                    }else if(part == "ERROR"){
                        clearTimeout(timeout)
                        return reject({
                            state: "fail",
                            message: "Lấy số dư thất bại"
                        })
                    }
                }
            }else if(operator == "Mobifone"){
                let parts = modem.executeCommand(`AT+CUSD=1,"*101#",15`, () => {}, false, 30000)
                parts.logic = (part) => {
                    if(part.includes("TKC")){
                        console.log(part)
                        let regex = new RegExp("([0-9]*)d")
                        if(regex.test(part)){
                            let matches = regex.exec(part)
                            return resolve({
                                state: "success",
                                message: "Lấy số dư thành công",
                                payload: {
                                    balance: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Lấy số dư thất bại"
                            })
                        }
                    }else if(part == "ERROR"){
                        return reject({
                            state: "fail",
                            message: "Lấy số dư thất bại"
                        })
                    }
                }
            }else if(operator == "Vinaphone"){
                let parts = modem.executeCommand(`AT+CUSD=1,"*101#",15`, () => {}, false, 30000)
                parts.logic = (part) => {
                    if(part.includes("TKC")){
                        console.log(part)
                        let regex = new RegExp("([0-9]*)d")
                        if(regex.test(part)){
                            let matches = regex.exec(part)
                            return resolve({
                                state: "success",
                                message: "Lấy số dư thành công",
                                payload: {
                                    balance: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Lấy số dư thất bại"
                            })
                        }
                    }else if(part == "ERROR"){
                        return reject({
                            state: "fail",
                            message: "Lấy số dư thất bại"
                        })
                    }
                }
            }else if(operator == "Vietnamobile"){
                let parts = modem.executeCommand(`AT+CUSD=1,"*101#",15`, () => {})
                let timeout = setTimeout(() => {
                    parts.logic = undefined
                    return reject({
                        state: "fail",
                        message: "Lấy số dư thất bại"
                    })
                }, 30000)
                parts.logic = (part) => {
                    if(part.includes("TKC")){
                        clearTimeout(timeout)
                        let regex = new RegExp("([0-9]*)d")
                        if(regex.test(part)){
                            let matches = regex.exec(part)
                            return resolve({
                                state: "success",
                                message: "Lấy số dư thành công",
                                payload: {
                                    balance: matches[1]
                                }
                            })
                        }else{
                            return reject({
                                state: "fail",
                                message: "Lấy số dư thất bại"
                            })
                        }
                    }else if(part == "ERROR"){
                        clearTimeout(timeout)
                        return reject({
                            state: "fail",
                            message: "Lấy số dư thất bại"
                        })
                    }
                }
            }
        }catch(error){
            return reject({
                state: "fail",
                message: "Lấy số dư thất bại"
            })
        }
    })
}

const loadPort = (portIndex) => {
    return new Promise((resolve, reject) => {
        initializeModem(global.ports[portIndex].modem).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            return deleteAllSMS(global.ports[portIndex].modem)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            return getSignal(global.ports[portIndex].modem)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("signal", result.payload.signal)
            return getIMEI(global.ports[portIndex].modem)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("imei", result.payload.iccid)
            return getICCID(global.ports[portIndex].modem)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("iccid", result.payload.iccid)
            return getOperator(global.ports[portIndex].modem)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("operator", result.payload.operator)
            return getOwnNumber(global.ports[portIndex].modem, global.ports[portIndex].operator)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("msisdn", result.payload.msisdn)
            return getBalance(global.ports[portIndex].modem, global.ports[portIndex].operator)
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("balance", result.payload.balance)
            return Promise.resolve()
        }).then(() => {
            global.ports[portIndex].set("statement", "Sẵn sàng")
            return resolve({
                state: "success"
            })
        }).catch((error) => {
            global.ports[portIndex].set("statement", error.message)
            return reject({
                state: "fail",
                message: error.message
            })
        })
    })
}

const loadPorts = () => {
    let session = global.session
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
                        modem: modem,
                        state: "closed",
                        status: "pending",
                        statement: "Cổng đóng",
                        lock: false,
                        retries: 0,
                    }) - 1
                    global.ports[portIndex].index = portIndex
                    global.ports[portIndex].get = (propName) => {
                        return global.ports[portIndex][propName]
                    }
                    global.ports[portIndex].set = (propName, propValue) => {
                        global.ports[portIndex].status = "processing"
                        global.ports[portIndex][propName] = propValue
                        global.ports[portIndex].status = "pending"
                        return global.ports[portIndex][propName]
                    }
                    global.ports[portIndex].close = () => {
                        global.ports[portIndex].imei = ""
                        global.ports[portIndex].iccid = ""
                        global.ports[portIndex].operator = ""
                        global.ports[portIndex].msisdn = ""
                        global.ports[portIndex].balance = ""
                        global.ports[portIndex].state = "closed"
                        global.ports[portIndex].statement = "Cổng đóng"
                    }
                    let selfLoad = async() => {
                        if(global.ports[portIndex].lock){
                            setTimeout(() => {
                                return selfLoad()
                            }, 5000)
                        }
                        global.ports[portIndex].set("retries", global.ports[portIndex].retries + 1)
                        global.ports[portIndex].set("lock", true)
                        await loadPort(portIndex)
                        .then(() => {
                            global.ports[portIndex].set("state", "registed")
                            global.ports[portIndex].set("lock", false)
                        })
                        .catch(() => {
                            global.ports[portIndex].close()
                            global.ports[portIndex].set("lock", false)
                            setTimeout(() => {
                                return selfLoad()
                            }, 5000)
                        })
                    }
                    selfLoad()
                    global.ports[portIndex].modem.on("onPutOut", () => {
                        global.ports[portIndex].close()
                        selfLoad()
                    })
                    global.ports[portIndex].modem.on("onPutIn", () => {
                        global.ports[portIndex].set("statement", "Đã nhận sim, vui lòng chờ")
                    })
                })
            }catch (error){
                console.log(error)
            }
        }
    })
}

module.exports = {
    loadPorts
}