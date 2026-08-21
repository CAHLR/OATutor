import localforage from "localforage";
import { PROGRESS_STORAGE_KEY } from "../config/config.js";

const CANVAS_PROGRESS_KEY_MARKER = "::canvas::";

class BrowserStorage {
    /**
     * @private
     * @param key
     * @return {*}
     */
    getCtxByKey = (key) => this._app['state']['additionalContext'][key]

    /**
     * @private
     * @return {*}
     */
    noRestore = () => this.getCtxByKey('noRestore')
    /**
     * @private
     */
    _app;

    constructor(app) {
        this._app = app
    }

    getStorageKey = (key) => {
        if (typeof key !== "string" || !key.startsWith(PROGRESS_STORAGE_KEY) || key.includes(CANVAS_PROGRESS_KEY_MARKER)) {
            return key;
        }

        const user = this._app.state.additionalContext.user || {};
        const isFromCanvas = String(user.tool_consumer_info_product_family_code || "").toLowerCase() === "canvas";
        const canvasProgressOwner = user.lis_result_sourcedid || user.user_id;

        return isFromCanvas && canvasProgressOwner
            ? `${key}${CANVAS_PROGRESS_KEY_MARKER}${encodeURIComponent(canvasProgressOwner)}`
            : key;
    }

    removeByKey = async key => localforage.removeItem(this.getStorageKey(key))
    getKeys = async () =>  !this.noRestore() && localforage.keys()
    getByKey = async key => !this.noRestore() && localforage.getItem(this.getStorageKey(key))
    /**
     *
     * @param key
     * @param value
     * @param [callback]
     * @return {Promise<*>}
     */
    setByKey = async (key, value, callback) => {
        const storageKey = this.getStorageKey(key);
        console.debug('setting key', storageKey, 'to value', value)
        return localforage.setItem(storageKey, value, callback)
    }
}

export default BrowserStorage
