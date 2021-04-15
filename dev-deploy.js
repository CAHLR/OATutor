var ghpages = require('gh-pages');

console.log("Deploying to dev remote.")
console.log("Will be live at: https://cahlr.github.io/OpenITS-dev/#/")
ghpages.publish('build', {
  repo: 'https://github.com/CAHLR/OpenITS-dev.git'
}, () => console.log("Finished!"));