// 存放用户所需要的常量
const { version } = require('../package.json')
// 存储模版的位置
const USER_HOME = process.env.HOME || process.env.USERPROFILE
const tempDirectory = `${USER_HOME}/.template`
//'C:\\Users\\15226
// console.log(tempDirectory)
module.exports = {
    version,
    tempDirectory,
}
