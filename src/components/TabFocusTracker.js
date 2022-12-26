import { useEffect } from "react";
import useWindowFocus from "use-window-focus";
import { useLocation } from 'react-router-dom';

export default function TabFocusTracker(props) {
    const { context } = props
    const { firebase } = context
    const windowFocused = useWindowFocus();
    const pathname = useLocation()?.pathname;

    useEffect(() => {
        if (!firebase) return
        ;(async () => {
            if (pathname.startsWith("/lessons/")) {
                await firebase.submitFocusChange(windowFocused);
            }
        })()
    }, [windowFocused, firebase, pathname])

    return <></>
}
