module.exports = {
    apps: [{
        name: "OATutor-LTI-Server-Dev",
        script: 'app.js',
        watch: '.',
        watch_delay: 1000,

        max_restarts: 10,
        restart_delay: 500,
        autorestart: true,

        env: {
            PORT: 3004
        }
    }]
};

