/*
 * MIT License
 *
 * Copyright (c) 2020 Axel Rauschmayer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

/**
 * Modified to use jsdoc and prevent source-map issues
 */
export class Enumify {

    //#################### Static

    /**
     * @type Array<string>
     */
    static enumKeys;
    /**
     * @type {Array<Enumify>}
     */
    static enumValues;

    static closeEnum() {
        /**
         * @type {Array<string>}
         */
        const enumKeys = [];
        /**
         * @type {Array<Enumify>}
         */
        const enumValues = [];
        // Traverse the enum entries
        for (const [key, value] of Object.entries(this)) {
            enumKeys.push(key);

            value.enumKey = key;
            value.enumOrdinal = enumValues.length;
            enumValues.push(value);
        }
        // Important: only add more static properties *after* processing the enum entries
        this.enumKeys = enumKeys;
        this.enumValues = enumValues;
        // TODO: prevent instantiation now. Freeze `this`?
    }

    /** Use case: parsing enum values
     * @param {string} str
     * @return { undefined | Enumify }
     */
    static enumValueOf(str) {
        const index = this.enumKeys.indexOf(str);
        if (index >= 0) {
            return this.enumValues[index];
        }
        return undefined;
    }

    static [Symbol.iterator]() {
        return this.enumValues[Symbol.iterator]();
    }

    //#################### Instance

    /**
     * @type {string}
     */
    enumKey;
    /**
     * @type {number}
     */
    enumOrdinal;

    toString() {
        return this.constructor.name + '.' + this.enumKey;
    }
}
