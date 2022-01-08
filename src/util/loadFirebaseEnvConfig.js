function loadFirebaseEnvConfig(config) {
    try {
        let _rawEnvConfig = process.env.REACT_APP_FIREBASE_CONFIG.trim();
        if (_rawEnvConfig.indexOf(":") !== -1) {
            // is probably in the format of "Secret value:eyJhcG........"
            _rawEnvConfig = _rawEnvConfig.substr(_rawEnvConfig.lastIndexOf(":") + 1).trim();
        }
        const _envConfig = JSON.parse(atob(_rawEnvConfig))
        if (process.env.REACT_APP_BUILD_TYPE === 'staging') {
            console.debug("Found env config: ", _envConfig, typeof _envConfig)
        }
        if (typeof _envConfig === 'object') {
            Object.assign(config, _envConfig)
        }
    } catch (e) {
        // ignore
    }

    if (process.env.REACT_APP_BUILD_TYPE === 'staging') {
        console.debug("Final Firebase Config: ", config)
    }
}

export default loadFirebaseEnvConfig
