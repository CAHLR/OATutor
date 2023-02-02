const buildType = process.env.REACT_APP_BUILD_TYPE || ""

console.debug(`This has the build type: ${buildType}`)

const IS_STAGING = buildType.includes("staging")
const IS_STAGING_CONTENT = buildType === "staging-content"
const IS_STAGING_PLATFORM = buildType === "staging-platform"

const IS_PRODUCTION = buildType.includes("production")

const IS_DEVELOPMENT = buildType.includes("development")

const IS_STAGING_OR_DEVELOPMENT = IS_STAGING || IS_DEVELOPMENT

export {
    IS_PRODUCTION,
    IS_DEVELOPMENT,
    IS_STAGING_CONTENT,
    IS_STAGING_PLATFORM,
    IS_STAGING,
    IS_STAGING_OR_DEVELOPMENT
}
