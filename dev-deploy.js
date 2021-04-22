var ghpages = require('gh-pages');

console.log("Deploying to dev remote.")
console.log("Will be live at: https://cahlr.github.io/OpenITS-dev/#/")
ghpages.publish('build', {
  history: true,
  branch: "gh-pages",
  repo: 'https://github.com/matthew29tang/OpenITS.git'
}, (err) => {
    if (err) {
        console.log(err)
    } else{
        console.log("Finished!")
    }
});