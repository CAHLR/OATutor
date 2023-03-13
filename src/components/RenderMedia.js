import React from "react"
import ZoomImage from "./ZoomImage";

const REGEX_YOUTUBE = /^((?:https?:)?\/\/)?((?:www|m)\.)?(youtube(-nocookie)?\.com|youtu.be)(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

export default class RenderMedia extends React.Component {
    render() {
        const url = this.props.url?.toString() || ""
        const { problemID = "", contentSource } = this.props

        const yt_match = url.match(REGEX_YOUTUBE)
        if (yt_match) {
            const vid_id = yt_match[6]
            return <div style={{
                maxWidth: 520
            }}>
                <div style={{
                    paddingBottom: "56.25%",
                    position: "relative",
                    width: "100%"
                }}>
                    <iframe allowFullScreen={true} frameBorder={0} width={800} height={480}
                            title={"Video"}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%"
                            }}
                            src={`https://www.youtube-nocookie.com/embed/${vid_id}/?controls=1&modestbranding=1&showinfo=0&iv_load_policy=3&html5=1&fs=1&rel=0&hl=en&cc_lang_pref=en&cc_load_policy=1&start=0`}/>
                </div>
            </div>
        }

        return <ZoomImage src={`${process.env.PUBLIC_URL}/static/images/figures/${contentSource}/${problemID}/${url}`}
                          alt={`${problemID} figure`} style={{ width: "100%", objectFit: "scale-down" }}/>
    }
}
