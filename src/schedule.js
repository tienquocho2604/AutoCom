const schedule = require("node-schedule")
const { getSignal, getCFun } = require("./models/port")


const getSignalJob = (port, scheduleRule) => {
    return schedule.scheduleJob(scheduleRule, function(){
        getSignal(port).then((result) => {
            global.ports[port.index].set("signal", result.payload.signal)
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

module.exports = {
    getSignalJob,
    getCFunJob
}