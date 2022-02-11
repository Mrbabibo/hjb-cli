const fse = require('fs-extra')
// const fs = require('fs') // 引入fs模块
const path = require('path')
//添加优雅的终端转轮的第三方npm库。
const ora = require('ora')
//改变终端输出样式的第三方npm库。console.log(chalk.blue('Hello world!'));
const chalk = require('chalk')

// 复制项目从临时文件到本地工做项目
const copyTempDir = async (tempGitdir, appName) => {
    // console.log(path.resolve())
    // console.log(__dirname)
    //     path.resolve 是基于命令行所在路径为地址
    // __dirname 变量 是以文件所处的路径为值
    const finaPath = path.join(process.cwd(), appName)
    try {
        if (fse.pathExists(finaPath)) {
            await fse.emptyDir(finaPath)
        }

        await fse.copy(tempGitdir, finaPath)

        fse.remove(tempGitdir)
        console.error(chalk.green('模板已下载成功！'))
    } catch (error) {
        console.log(chalk.red(`copyTempDir出错了！${error}`))
    }
}

const waiteLoading = (fn, info) => {
    return async (...arg) => {
        let spinner = ora(`${chalk.blue(info)}`)
        spinner.start()
        try {
            let res = await fn(...arg)
            spinner.succeed()
            return res
        } catch (error) {
            console.log(chalk.red(`出错了！${error}`))
            spinner.stop()
        }
    }
}

module.exports = {
    copyTempDir,
    waiteLoading,
}
