import localforage from "localforage";

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

    removeByKey = async key => localforage.removeItem(key)
    getKeys = async () =>  !this.noRestore() && localforage.keys()
    getByKey = async key => !this.noRestore() && localforage.getItem(key)
    /**
     *
     * @param key
     * @param value
     * @param [callback]
     * @return {Promise<*>}
     */
    setByKey = async (key, value, callback) => {
        console.debug('setting key', key, 'to value', value)
        return localforage.setItem(key, value, callback)
    }
}

export default BrowserStorage
