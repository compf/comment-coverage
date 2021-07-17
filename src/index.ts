const core = require('@actions/core');
const github = require('@actions/github');
const execSync = require('child_process').execSync;

console.log('Start Index');
runDocumentation();

function runDocumentation() {
  const installOutput = execSync('npm install @compodoc/compodoc@1.0.5', {
    encoding: 'utf-8',
  });
  let output = '';
  try {
    output = execSync('npx compodoc -p tsconfig.doc.json --coverageTest', {
      encoding: 'utf-8',
    });
  } catch (err) {
    output = err.stdout;
  }

  let regex = /Documentation coverage \(\d+/g;
  let resultList = output.match(regex);
  if (resultList) {
    let result = resultList[0];
    let coverage = parseInt(result.split('(')[1]);
    if (!isNaN(coverage)) {
      console.log('Coverage is: ' + coverage);
      if (coverage > 10) {
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
