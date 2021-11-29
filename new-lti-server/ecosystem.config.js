module.exports = {
  apps : [{
    name: "OATutor-LTI-Server",
    script: 'app.js',
    watch: '.',
    watch_delay: 1000,
    env: {
      PORT: 3003
    }
  }]
};
