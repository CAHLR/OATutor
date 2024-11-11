module.exports = {
    apps: [{
        name: "OATutor-AI-Hint-Generation",
        script: 'index.js',
        watch: '.',
        watch_delay: 1000,

        max_restarts: 10,
        restart_delay: 500,
        autorestart: true,

        env: {
            PORT: 3003
        }
    }]
};
