import { IS_STAGING } from "./getBuildType";

function loadFirebaseEnvConfig(config) {
    try {
        let _rawEnvConfig = process.env.REACT_APP_FIREBASE_CONFIG.trim();
        if (_rawEnvConfig.indexOf(":") !== -1) {
            // is probably in the format of "Secret value:eyJhcG........"
            _rawEnvConfig = _rawEnvConfig.substr(_rawEnvConfig.lastIndexOf(":") + 1).trim();
        }
        const _envConfig = JSON.parse(atob(_rawEnvConfig))
        if (IS_STAGING) {
            console.debug("Found env config: ", _envConfig, typeof _envConfig)
        }
        if (typeof _envConfig === 'object') {
            Object.assign(config, _envConfig)
        }
    } catch (e) {
        // ignore
    }

    if (IS_STAGING) {
        console.debug("Final Firebase Config: ", config)
    }
}

export default loadFirebaseEnvConfig
