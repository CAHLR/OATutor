import React from 'react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'


/**
 * @param {Partial<HTMLImageElement>} props
 */
const ZoomImage = (props) => {
    return <>
        <Zoom zoomMargin={40}>
            <img {...props} alt={props.alt}/>
        </Zoom>
    </>
}

export default ZoomImage
