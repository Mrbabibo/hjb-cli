#! /usr/bin/env node

//第一行其中#!/usr/bin/env node表示用node解析器执行本文件。
const program = require('commander')
// 用户与命令行交互的工具
const Inquirer = require('inquirer')
const { version } = require('../lib/config')
const create = require('../lib/create')
const { exec } = require('child_process')

// 配置指令命令
const mapActions = {
    create: {
        alias: 'c',
        description: 'create a project',
        examples: ['hjb-cli create <project-name>'],
    },
    '*': {
        alias: '',
        description: 'command not found',
        examples: [],
    },
}

Object.keys(mapActions).forEach((action) => {
    let alias = mapActions[action].alias
    let description = mapActions[action].description
    program
        .command(action)
        .alias(alias)
        .description(description)
        .action(async () => {
            if (action === '*') {
                console.log(description)
            } else {
                const githubName = await getGithubName()
                const appName = process.argv.slice(3)[0]

                create(appName, githubName)
            }
        })
})
const isAdminMode = () => [
    {
        type: 'confirm',
        name: 'isAdmin',
        message: `是否开启管理员模式?`,
        prefix: '?',
    },
    // {
    //   type: 'input',          // 类型
    //   name: 'yourName',       // 字段名称，在then里可以打印出来
    //   message: 'your name:',  // 提示信息
    //   default: 'noname',      // 默认值
    //   validate: function (v) {// 校验：当输入的值为是string类型，才能按回车，否则按了回车并无效果
    //       return typeof v === 'string'
    //   },
    //   transformer: function (v) {// 提示信息（输入的信息后缀添加(input your name)）
    //       return v + '(input your name)'
    //   },
    //   filter: function (v) {// 最终结果
    //       return 'name['+v+']'
    //   }
    // }, {
    //   type: 'number', // 类型（数字）
    //   name: 'num',
    //   message: 'your number'
    // }
]
//获取用户输入名字
const getGithubName = async () => {
    const { isAdmin } = await Inquirer.prompt(isAdminMode())
    if (isAdmin) {
        const { githubName } = await Inquirer.prompt([
            {
                name: 'githubName',
                type: 'input',
                message: '请输入github作者',
                default: 'Mrbabibo', //默认自己
            },
        ])
        return githubName
    }
    return 'Mrbabibo'
}

// Commands 操作 例子1
program
    // 命令与参数: <> 必填; [] 选填
    .command('exec <cmd> [env]')
    // 别名
    .alias('ex')
    // 帮助信息
    .description('execute the given remote cmd')
    // 执行的操作
    .action((cmd, env) => {
        exec(cmd, function (error, stdout, stderr) {
            console.log('error:' + error)
            console.log('stdout:' + stdout)
            console.log('stderr:' + stderr)
        })
        // 参数可以拿到
        console.log(`env is ${env}`)
        console.log('exec "%s"', cmd)
    })
    // 自定义help信息
    .on('--help', function () {
        console.log('exec自定义help信息')
    })
//Commands 操作  例子2
program
    .command('serve')
    .description('launch web server')
    .option('-p,--port <port_number>', 'web port')
    .action((options) => {
        console.log(options)
        console.log(`server on port ${options.port}`)
    })

// Commands 操作 例子3
program
    .command('html2md')
    .alias('md')
    .description('Get markdown from a remote url or a local html.')
    .option('-f, --file [file]', 'path to file')
    .option('-l, --url [url]', 'articles`s url')
    .option('-t, --target [target]', 'target to be saved')
    .option('-s, --selector [selector]', 'DOM element selector')
    .action(function (options) {
        console.log(options)
        // html2md(options)
    })

program.version(`Version is ${version}`).description('郝敬博私有脚手架')
// 监听用户的help事件
program.on('--help', () => {
    console.log('\nExamples:')
    Object.keys(mapActions).forEach((action) => {
        mapActions[action].examples.forEach((example) => {
            console.log(`${example}`)
        })
    })
})
// 解析命令行参数
program.parse(process.argv)
