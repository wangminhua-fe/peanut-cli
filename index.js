#!/usr/bin/env node
// 使用Node开发命令行工具执行JavaScript脚本必须在顶部加  #!/usr/bin/env node  声明

const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

const templates = {
  'base': {
    url: 'https://github.com/peanut-dev/peanut-template-vue-base.git',
    downloadUrl: 'http://github.com:peanut-dev/peanut-template-vue-base#master',
    description: '基础模板'
  },
  'admin': {
    url: 'https://github.com/peanut-dev/peanut-template-vue-admin.git',
    downloadUrl: 'http://github.com:peanut-dev/peanut-template-vue-admin#master',
    description: '后台管理系统模板'
  },
  'mobile': {
    url: 'https://github.com/peanut-dev/peanut-template-vue-mobile.git',
    downloadUrl: 'http://github.com:peanut-dev/peanut-template-vue-mobile#master',
    description: '移动端模板'
  },
  'datav': {
    url: 'https://github.com/peanut-dev/peanut-template-vue-datav.git',
    downloadUrl: 'http://github.com:peanut-dev/peanut-template-vue-datav#master',
    description: '大屏模板'
  }
};

// 1.获取用户输入命令
// 原生的方式：console.log(process.argv);
program.version('0.1.0');

program
  .command('init [templateName] [projectName]')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
    // 根据模板名下载对应的模板到本地，并初始化项目名为projectName
    if(!templateName) {
      console.log('提示：请选择项目模板!');
      return false;
    }
    if(!templates[templateName]) {
      console.log('提示：请输入正确的项目模板名称!');
      return false;
    }
    if(!projectName) {
      console.log('提示：请输入项目名称!');
      return false;
    }

    const spinner = ora('项目初始化中...').start();

    const { downloadUrl } = templates[templateName];
    download(downloadUrl, projectName, { clone: true }, function (err) {
      if(err) {
        spinner.fail();
        console.log(logSymbols.error, chalk.red('项目初始化失败', err));
        return false;
      }

      // 将项目中package.json文件读取出来
      // 使用向导的方式采集用户输入值
      // 使用模板引擎将用户输入内容解析到package.json文件中
      // 解析完毕，将解析后的结果重新写入package.json文件中
      inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: '请输入项目简介：'
        },
        {
          type: 'input',
          name: 'author',
          message: '请输入作者名称：'
        }
      ]).then(answers => {
        console.log(answers);
        const packagePath = `${projectName}/package.json`;
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageResult = handlebars.compile(packageContent)(answers);
        fs.writeFileSync(packagePath, packageResult);
        
        spinner.succeed();
        console.log(logSymbols.success, chalk.green('项目初始化成功'));
      });

    });
  });

program
  .command('list')
  .description('查看所有可用模板')
  .action(() => {
    for(let key in templates) {
      console.log(`${key}    ${templates[key].description}`);
    }
  })

program.parse(process.argv);