const core = require('@actions/core');
const github = require('@actions/github');
const execSync = require('child_process').execSync;
const fs = require('fs');

const TsConfigJSON = {
  include: ['src/**/*.ts', 'src/**/*.js'],
  exclude: ['src/tests/**/*', 'src/ignoreCoverage/**/*'],
};

const LIST_SEPERATOR = " ";

try{
  let include = core.getInput("include");
  TsConfigJSON.include = include.split(LIST_SEPERATOR);
} catch (err){
  console.log("Variable: <include> not filled");
  console.log(err);
}

try {
  let exclude = core.getInput("exclude");
  TsConfigJSON.exclude = exclude.split(LIST_SEPERATOR);
} catch (err){
  console.log("Variable: <exclude> not filled");
  console.log(err);
}

let minPercentageCoverage = 80;
try{
  let minPercentageCoverageRaw = core.getInput("minPercentageCoverage")
  minPercentageCoverage = parseInt(minPercentageCoverageRaw);
} catch (err){
  console.log("Could not parse variable: <minPercentageCoverage>");
  console.log("minPercentageCoverageRaw: "+minPercentageCoverage);
  console.log(err);
}


runDocumentation();

function runDocumentation() {
  console.log('Install compodoc');
  const installOutput = execSync('npm install @compodoc/compodoc@1.0.5', {
    encoding: 'utf-8',
  });
  let output = '';
  console.log('Write tsconfic.doc.json');
  let stringJSON = JSON.stringify(TsConfigJSON, null, 2);
  console.log(stringJSON);
  fs.writeFileSync('./tsconfig.doc.json', stringJSON);

  try {
    output = execSync('npx compodoc -p tsconfig.doc.json --coverageTest', {
      encoding: 'utf-8',
    });
  } catch (err) {
    output = err.stdout;
  }

  console.log(output);

  let regex = /Documentation coverage \(\d+/g;
  let resultList = output.match(regex);
  console.log(resultList);
  if (resultList) {
    let result = resultList[0];
    let coverage = parseInt(result.split('(')[1]);
    if (!isNaN(coverage)) {
      console.log('Coverage is: ' + coverage);
      if (coverage > minPercentageCoverage) {
        console.log('This is fine :-)');
        return true;
      } else {
        console.log('Please write better comments ;-)');
        core.setFailed('Comment coverage not reached');
        return false;
      }
    }
  }

  core.setFailed('Comment coverage not found');
}