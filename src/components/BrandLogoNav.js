import React, { useContext } from "react";
import { ThemeContext } from "../config/config";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import {ReactComponent as Logo} from "../assets/Logo.svg";

const useStyles = makeStyles({
    "siteNavLink": {
        textAlign: 'left',
        paddingTop: "3px",
        "&:hover": {
            cursor: "pointer"
        }
    },
    "logo": {
        height: "28px",
        "&:hover": {
            cursor: "pointer"
        }
    }


})

function BrandLogoNav({ isPrivileged = false, noLink = false }) {
    const context = useContext(ThemeContext)
    const history = useHistory()

    const classes = useStyles()

    const navigateLink = (evt) => {
        if (evt.type === "click" || evt.key === "Enter") {
            history.push("/")
        }
    }

    return <>
        {/* specified to not link or was launched from lms as student*/}
        {noLink || (context.jwt.length !== 0 && !isPrivileged)
            ? <div style={{ textAlign: 'left', paddingTop: 6, paddingLeft: 28 }}>
                <Logo className={classes.logo} />
            </div>
            :
            <div role={"link"} tabIndex={0} onClick={navigateLink} onKeyDown={navigateLink}
                 className={classes.siteNavLink}>
                <Logo className={classes.logo}/>
            </div>
        }
    </>
}

export default BrandLogoNav
