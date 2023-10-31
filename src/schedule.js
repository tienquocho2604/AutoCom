const schedule = require("node-schedule")
const { getSignal, getCFun, getCPIN } = require("./models/port")


const getSignalJob = (port, scheduleRule) => {
    return schedule.scheduleJob(scheduleRule, function(){
        getSignal(port).then((result) => {
            global.ports[port.portIndex].set("signal", result.payload.signal)
        }).catch((error) => {
            console.log(error)
        })
    })
}

const getCFunJob = (port, scheduleRule) => {
    return schedule.scheduleJob(scheduleRule, function(){
        getCFun(port).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })
    })
}

const getCPINJob = (port, scheduleRule) => {
    return schedule.scheduleJob(scheduleRule, function(){
        getCPIN(port).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })
    })
}

module.exports = {
    getSignalJob,
    getCFunJob,
    getCPINJob
}