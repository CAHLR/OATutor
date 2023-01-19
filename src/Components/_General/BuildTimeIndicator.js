export default function BuildTimeIndicator (props) {
    const buildTime = +process.env.REACT_APP_BUILD_TIMESTAMP

    if (isNaN(buildTime)) {
        return <></>
    }

    return <h4>
        (Built on: {new Date(buildTime).toUTCString()})
    </h4>
}
