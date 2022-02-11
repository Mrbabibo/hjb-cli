//改变终端输出样式的第三方npm库。console.log(chalk.blue('Hello world!'));
const chalk = require('chalk')
// 用户与命令行交互的工具
const Inquirer = require('inquirer')
// node的 util 模块 promisify可以把回调promise化
const { promisify } = require('util')
const axios = require('axios')
//默认是 master 分枝, 但你可以指定分枝和tag ，如 owner/name#my-branch.
// 下载git 仓库代码工具
const downloadGitRepo = promisify(require('download-git-repo'))
const { tempDirectory } = require('./config')
let gitName = ''
const { copyTempDir, waiteLoading } = require('./common')

const initQuestions = (name) => [
    {
        type: 'confirm',
        name: 'isInit',
        message: `您确定要在${chalk.underline.rgb(123, 45, 67).bgWhite(name)}文件夹下创建项目?`,
        prefix: '?',
    },
]
// 1.获取项目列表
//https://segmentfault.com/a/1190000015144126
//https://docs.github.com/cn/rest/reference/permissions-required-for-github-apps
const fetchRepoList = async () => {
    const { data } = await axios.get(`https://api.github.com/users/${gitName}/repos`)

    return data
}
// 1.获取项目tags
const fetchTags = async (proName) => {
    const { data } = await axios.get(`https://api.github.com/repos/${gitName}/${proName}/tags`)

    return data
}
// repo 仓库名字 tag 名字
const download = async (repo, tag) => {
    let api = `${gitName}/${repo}`
    if (tag) {
        api += `#${tag}`
    }
    // const dir = path.join(process.cwd(), 'TEMP') //这里可以自定义下载的地址
    // console.log(tempDirectory)
    const tempGitdir = `${tempDirectory}/${repo}`
    await downloadGitRepo(api, tempGitdir)
    return tempGitdir
}
const create = async (appName, githubName) => {
    gitName = githubName

    const repos = await waiteLoading(fetchRepoList, '正在从github 获取请稍等...')()
    // console.log(repos)
    reposName = repos.map((item) => item.name)
    // console.log(repos);
    // 在获取之前 显示loading 关闭loading
    // 选择模版 inquirer
    const { repo } = await Inquirer.prompt({
        name: 'repo', // 获取选择后的结果
        type: 'list', // 什么方式显示在命令行
        message: '请选择要使用的模板', // 提示信息
        choices: reposName, // 选择的数据
    })
    // console.log('选择的仓库', repo)
    const tagsName = await waiteLoading(fetchTags, '正在获取项目版本请稍等...')(repo)
    const hasTags = tagsName.length > 0 ? true : false

    const { tag } =
        hasTags &&
        (await Inquirer.prompt({
            name: 'tag', // 获取选择后的结果
            type: 'list', // 什么方式显示在命令行
            message: '请选择要使用的版本', // 提示信息
            choices: tagsName, // 选择的数据
        }))

    const { isInit } = await Inquirer.prompt(initQuestions(process.cwd()))
    if (isInit) {
        const tempGitdir = await waiteLoading(download, '正在拉取远程模板请稍等...')(repo, hasTags ? tag : '')
        copyTempDir(tempGitdir, appName)
    }
}

module.exports = create
