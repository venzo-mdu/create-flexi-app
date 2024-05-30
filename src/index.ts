#! /usr/bin/env node
import prompts, { PromptObject } from "prompts";
import fs from 'fs'
import path from "path";
import shell from 'shelljs'

const questions: PromptObject[] = [
    {
        type: 'text',
        name: 'projectName',
        message: 'What is the name of your new project .',
        validate: name => name.trim().length < 1 || typeof name !== 'string'?
            'Project name is required' : true
        
    },
    {
        type: 'select',
        name: 'templateName',
        message: 'Which template do you want to generate',
        validate: name => name.trim().length < 1 ?
            'Template name is required' : true,
        choices: [
            {
                title: 'Simple Project One',
                value: 'simple-project-one'
            },
            {
                title: 'Simple Project Two',
                value: 'simple-project-two'
            }
        ]
    }
];

prompts(questions )
.then((answers) => {
    const projectName = answers.projectName
    const templateName = answers.templateName

    const projectPath = path.join(process.cwd(), projectName)
            
    const templatePath = path.join(process.cwd(), 'templates', templateName)

    replicateTemplates(templatePath, projectPath)} 
    )
.catch(error => console.error(error.message))


const replicateTemplates = async (
    templatePath: string, projectPath: string
    ) =>{
    
            const content = {
                "name": "create-venzo-app",
                "version": "1.0.1",
                "description": "A react boilerplate cli tool",
                "main": "index.js",
                "scripts": {
                  "build": "tsc",
                  "dev": "ts-node src/index",
                  "start": "node ./build/index"
                },
                "bin": {
                  "create-venzo-app": "./build/index.js"
                },
                "author": "Vasanth",
                "license": "ISC",
                "devDependencies": {
                  "@tsconfig/node12": "^12.1.0",
                  "@tsconfig/node20": "^20.1.2",
                  "@types/node": "^20.8.10",
                  "@types/prompts": "^2.4.7",
                  "@types/shelljs": "^0.8.14",
                  "nodemon": "^3.0.1",
                  "ts-node": "^10.9.1",
                  "typescript": "^5.2.2"
                },
                "dependencies": {
                  "prompts": "^2.4.2",
                  "request": "^2.88.2",
                  "shelljs": "^0.8.5"
                }
              }
              
            console.log('[FILE]', 'Writing ' + "package1.json");
            // fs.writeFileSync("package1.json", JSON.stringify(content));
        // console.log(yaml, "yaml")

    //Get template files names
    let templateFilesNames = fs.readdirSync(templatePath)

    //filter out skip list
    const filesToBeSkipped = ['node_modules', 'build', 'dist', 'package-lock.json']
    templateFilesNames = templateFilesNames.filter(
        name => !filesToBeSkipped.includes(name)
    )  

        //Create new project directory
    if(!fs.existsSync(projectPath)){
        fs.mkdirSync(projectPath)
    } else{
        console.error(
            'Directory already exists. Choose another name'
        )
        return
    }

    fs.writeFileSync(`${projectPath}/package1.json`, JSON.stringify(content));
    
    templateFilesNames.forEach(name =>{
        
        const originPath = path.join(templatePath, name)
        const destinationPath = path.join(projectPath,name)
        const stats = fs.statSync(originPath)

        if(stats.isFile()){
            const content = fs.readFileSync(originPath, 'utf8')
            console.log(content)
            fs.writeFileSync(destinationPath,content)

        } else if (stats.isDirectory()){
            replicateTemplates(originPath,destinationPath)
        }
    })

    //Run post process commands
    //Check if the template directory contains package.json
    if(templateFilesNames.includes('package.json')){
        //change directory into project path
        shell.cd(projectPath)

        //Run npm install

        shell.exec('npm install')

        // ES Lint
        shell.exec('npm run pretty')
    }
}
