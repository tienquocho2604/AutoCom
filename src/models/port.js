const initializeModem = (port) => {
    let modem = port.modem
    if(port.isInitial){
        return Promise.resolve({
            state: "success",
            message: ""
        })
    }
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

const getCFun = (port) => {
    let modem = port.modem
    return new Promise((resolve, reject) => {
        try{
            modem.executeCommand("AT+CGSN", (result, error) => {
                if(error){
                    return reject({
                        state: "fail",
                        message: "Lấy CFun không thành công"
                    })
                }
                console.log(result)
            }, false, 10000)
        }catch(error){
            return reject({
                state: "fail",
                message: "Lấy CFun không thành công"
            })
        }
    })
}

const fixLightOn = (port) => {
    let modem = port.modem
    return new Promise((resolve, reject) => {
        try{
            modem.executeCommand("AT+CFUN=0", (result, error) => {
                setTimeout(() => {
                    modem.executeCommand("AT+CFUN=1", (result, error) => {
                        return resolve({
                            state: "success",
                            message: "Đang FixLightOn, vui lòng chờ"
                        }) 
                    }, false, 5000)
                }, 3000)
            }, false, 5000)
        }catch(error){
            console.log(error)
            return reject({
                state: "fail",
                message: "Có lỗi khi FixLightOn"
            })
        }
    })
}

const cancelUSSD = (port) => {
    let modem = port.modem
    try{
        modem.executeCommand(`AT+CUSD=2\n`, (result, error) => {
            return Promise.resolve({
                state: "sucess"
            })
        }, false, 10000)
    }catch(error) {
        console.log(error)
        return Promise.resolve({
            state: "sucess"
        })
    }
}

const deleteAllSMS = (port) => {
    let modem = port.modem
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

const getIMEI = (port) => {
    if(port.imei){
        return Promise.resolve({
            state: "success",
            message: "",
            payload: {
                imei: port.imei
            }
        })
    }
    let modem = port.modem
    return new Promise((resolve, reject) => {
        try{
            let parts = modem.executeCommand("AT+CGSN", () => {}, false, 10000)
            let timeout = setTimeout(() => {
                parts.logic = undefined
                return reject({
                    state: "fail",
                    message: "Lấy IMEI không thành công"
                })
            }, 10000)
            parts.logic = (part) => {
                if(/(\d+)/.test(part)){
                    clearTimeout(timeout)
                    let matches = /(\d+)/.exec(part)
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

const getSignal = (port) => {
    let modem = port.modem
    return new Promise((resolve, reject) => {
        try{
            setTimeout(() => {
                return reject({
                    state: "fail",
                    message: "Lấy signal không thành công"
                })
            }, 5000)
            modem.executeCommand("AT+CSQ", (result, error) => {
                if(error){
                    return reject({
                        state: "fail",
                        message: "Lấy signal không thành công"
                    })
                }
                if(result && result.status == "success"){
                    if(/([0-9]*,[0-9])/.test(result.data.result)){
                        let matches = /([0-9]*,[0-9])/.exec(result.data.result)
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

const getICCID = (port) => {
    if(port.iccid){
        return Promise.resolve({
            state: "success",
            message: "",
            payload: {
                iccid: port.iccid
            }
        })
    }
    let modem = port.modem
    return new Promise((resolve, reject) => {
        try{
            setTimeout(() => {
                return reject({
                    state: "fail",
                    message: "Lấy ICCID không thành công"
                })
            }, 5000)
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

const getOperator = (port) => {
    if(port.operator){
        return Promise.resolve({
            state: "success",
            message: "",
            payload: {
                operator: port.operator
            }
        })
    }
    let modem = port.modem
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

const getOwnNumber = (port) => {
    if(port.msisdn){
        return Promise.resolve({
            state: "success",
            message: "",
            payload: {
                msisdn: port.msisdn
            }
        })
    }
    let modem = port.modem
    let operator = port.operator
    return new Promise(async(resolve, reject) => {
        await cancelUSSD(port)
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

const getBalance = (port) => {
    let modem = port.modem
    let operator = port.operator
    return new Promise(async(resolve, reject) => {
        await cancelUSSD(port)
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
        initializeModem(global.ports[portIndex]).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("isInitial", true)
            return deleteAllSMS(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("smsCounter", 0)
            return getSignal(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("signal", result.payload.signal)
            return getIMEI(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("imei", result.payload.imei)
            return getICCID(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("iccid", result.payload.iccid)
            return getOperator(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("operator", result.payload.operator)
            return getOwnNumber(global.ports[portIndex])
        }).then((result) => {
            global.ports[portIndex].set("statement", result.message)
            global.ports[portIndex].set("msisdn", result.payload.msisdn)
            return getBalance(global.ports[portIndex])
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

module.exports = {
    initializeModem,
    cancelUSSD,
    deleteAllSMS,
    getIMEI,
    getSignal,
    getICCID,
    fixLightOn,
    getOperator,
    getOwnNumber,
    getBalance,
    loadPort
}