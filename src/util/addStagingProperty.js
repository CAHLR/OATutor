/**
 * Only adds the props if the app is in staging or development environment
 * @param {Object} props
 */
function stagingProp(props) {
    if (process.env.REACT_APP_BUILD_TYPE === "staging" || process.env.REACT_APP_BUILD_TYPE === "development") {
        return props
    }
    return {}
}

export {
    stagingProp
}
