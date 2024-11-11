'use strict';

const Path = require('path');

const Hoek = require('@hapi/hoek');
const MimeDb = require('mime-db/db.json');          // Load JSON file to prevent loading or executing code


const internals = {
    compressibleRx: /^text\/|\+json$|\+text$|\+xml$/
};


exports.MimosEntry = class {

    constructor(type, mime) {

        this.type = type;
        this.source = 'mime-db';
        this.extensions = [];
        this.compressible = undefined;

        Object.assign(this, mime);

        if (this.compressible === undefined) {
            this.compressible = internals.compressibleRx.test(type);
        }
    }
};


internals.insertEntry = function (type, entry, db) {

    db.byType.set(type, entry);
    for (const ext of entry.extensions) {
        db.byExtension.set(ext, entry);
        if (ext.length > db.maxExtLength) {
            db.maxExtLength = ext.length;
        }
    }
};


internals.compile = function (mimedb) {

    const db = {
        byType: new Map(),
        byExtension: new Map(),
        maxExtLength: 0
    };

    for (const type in mimedb) {
        const entry = new exports.MimosEntry(type, mimedb[type]);
        internals.insertEntry(type, entry, db);
    }

    return db;
};


internals.getTypePart = function (fulltype) {

    const splitAt = fulltype.indexOf(';');
    return splitAt === -1 ? fulltype : fulltype.slice(0, splitAt);
};


internals.applyPredicate = function (mime) {

    if (mime.predicate) {
        return mime.predicate(Hoek.clone(mime));
    }

    return mime;
};


exports.Mimos = class Mimos {

    #db = internals.base;

    constructor(options = {}) {

        if (options.override) {
            Hoek.assert(typeof options.override === 'object', 'overrides option must be an object');

            // Shallow clone db

            this.#db = {
                ...this.#db,
                byType: new Map(this.#db.byType),
                byExtension: new Map(this.#db.byExtension)
            };

            // Apply overrides

            for (const type in options.override) {
                const override = options.override[type];
                Hoek.assert(!override.predicate || typeof override.predicate === 'function', 'predicate option must be a function');

                const from = this.#db.byType.get(type);
                const baseEntry = from ? Hoek.applyToDefaults(from, override) : override;

                const entry = new exports.MimosEntry(type, baseEntry);
                internals.insertEntry(type, entry, this.#db);
            }
        }
    }

    path(path) {

        const extension = Path.extname(path).slice(1).toLowerCase();
        const mime = this.#db.byExtension.get(extension) ?? {};

        return internals.applyPredicate(mime);
    }

    type(type) {

        type = internals.getTypePart(type);

        let mime = this.#db.byType.get(type);
        if (!mime) {
            // Retry with more expensive adaptations

            type = type.trim().toLowerCase();
            mime = this.#db.byType.get(type);
        }

        if (!mime) {
            mime = new exports.MimosEntry(type, {
                source: 'mimos'
            });

            // Cache the entry

            internals.insertEntry(type, mime, this.#db);

            return mime;
        }

        return internals.applyPredicate(mime);
    }
};


internals.base = internals.compile(MimeDb);
