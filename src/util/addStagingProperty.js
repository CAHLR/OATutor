/**
 * Only adds the props if the app is in staging or development environment
 * @param {Object} props
 */
import { IS_STAGING_OR_DEVELOPMENT } from "./getBuildType";

function stagingProp(props) {
    if (IS_STAGING_OR_DEVELOPMENT) {
        return props
    }
    return {}
}

export {
    stagingProp
}
