import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { SITE_NAME, SITE_VERSION, ThemeContext } from "../../config/config";

function BrandLogoNav({ isPrivileged = false, noLink = false }) {
    const context = useContext(ThemeContext)

    return <>
        {/* specified to not link or was launched from lms as student*/}
        {noLink || (context.jwt.length !== 0 && !isPrivileged)
            ? <div style={{ textAlign: 'left', paddingTop: "3px" }}>
                {SITE_NAME} (v{SITE_VERSION})
            </div>
            : <Link to={"/"} style={{ color: 'unset', textDecoration: 'unset' }}>
                <div style={{ textAlign: 'left', paddingTop: "3px" }}>
                    {SITE_NAME} (v{SITE_VERSION})
                </div>
            </Link>
        }
    </>
}

export default BrandLogoNav
