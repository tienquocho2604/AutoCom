const schedule = require("node-schedule");

const job = schedule.scheduleJob("*/5 * * * * *", function(){
  console.log("The answer to life, the universe, and everything!");
})