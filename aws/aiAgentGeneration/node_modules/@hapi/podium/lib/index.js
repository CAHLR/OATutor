'use strict';

const Hoek = require('@hapi/hoek');
const Teamwork = require('@hapi/teamwork');
const Validate = require('@hapi/validate');


const internals = {
    schema: {
        base: Validate.object({
            name: Validate.string().required(),
            clone: Validate.boolean(),
            tags: Validate.boolean(),
            spread: Validate.boolean(),
            channels: Validate.array().items(Validate.string()).single().unique().min(1).cast('set')
        })
    }
};


internals.schema.event = internals.schema.base.keys({
    shared: Validate.boolean()
});


internals.schema.listener = internals.schema.base.keys({
    listener: Validate.func().required(),
    context: Validate.object(),
    count: Validate.number().integer().min(1),
    filter: {
        tags: Validate.array().items(Validate.string()).single().unique().min(1).required(),
        all: Validate.boolean()
    }
});


exports.validate = function (events) {

    const normalized = [];
    events = [].concat(events);
    for (let event of events) {
        if (typeof event === 'string') {
            event = { name: event };
        }

        normalized.push(Validate.attempt(event, internals.schema.event, 'Invalid event options'));
    }

    return normalized;
};


exports.Podium = class {

    /** @type {Map<string,internals.EventListener>} */
    #listeners = new Map();

    constructor(events, options) {

        if (events) {
            this.registerEvent(events, options);
        }
    }

    registerEvent(events, options) {

        events = [].concat(events);
        for (let event of events) {
            if (typeof event === 'string') {
                event = { name: event };
            }

            if (options?.validate !== false) {                                                       // Defaults to true
                event = Validate.attempt(event, internals.schema.event, 'Invalid event options');
            }

            const name = event.name;
            if (this.#listeners.has(name)) {
                Hoek.assert(event.shared, `Event ${name} exists`);
                continue;
            }

            this.#listeners.set(name, new internals.EventListener(event));
        }
    }

    emit(criteria, data) {

        let thrownErr;

        this.#emitToEachListener(criteria, data, ([err]) => {

            thrownErr = thrownErr ?? err;
        });

        if (thrownErr) {
            throw thrownErr;
        }
    }

    async gauge(criteria, data) {

        const promises = [];

        this.#emitToEachListener(criteria, data, ([err, result]) => {

            promises.push(err ? Promise.reject(err) : result);
        });

        return await Promise.allSettled(promises);
    }

    #emitToEachListener(criteria, data, fn) {

        criteria = internals.criteria(criteria);

        const name = criteria.name;
        Hoek.assert(name, 'Criteria missing event name');

        const event = this.#listeners.get(name);
        Hoek.assert(event, `Unknown event ${name}`);

        if (!event.handlers) {
            return;
        }

        Hoek.assert(!criteria.channel || typeof criteria.channel === 'string', 'Invalid channel name');
        Hoek.assert(!criteria.channel || !event.flags.channels || event.flags.channels.has(criteria.channel), `Unknown ${criteria.channel} channel`);
        Hoek.assert(!event.flags.spread || Array.isArray(data) || typeof data === 'function', 'Data must be an array for spread event');

        if (typeof criteria.tags === 'string') {
            criteria = { ...criteria };
            criteria.tags = { [criteria.tags]: true };
        }

        if (criteria.tags &&
            Array.isArray(criteria.tags)) {

            // Map array to object

            const tags = {};
            for (const tag of criteria.tags) {
                tags[tag] = true;
            }

            criteria = { ...criteria };
            criteria.tags = tags;
        }

        let generated = false;

        for (const handler of event.handlers) {
            if (handler.channels &&
                !(criteria.channel && handler.channels.has(criteria.channel))) {

                continue;
            }

            if (handler.filter) {
                if (!criteria.tags) {
                    continue;
                }

                const match = Hoek.intersect(criteria.tags, handler.filter.tags, { first: !handler.filter.all });
                if (!match ||
                    handler.filter.all && match.length !== handler.filter.tags.length) {

                    continue;
                }
            }

            // Found a listener, now prepare to call it

            if (handler.count) {
                --handler.count;
                if (handler.count < 1) {
                    event.removeListener(handler.listener);
                }
            }

            if (!generated &&
                typeof data === 'function') {

                data = data();
                generated = true;
            }

            const update = event.flagged('clone', handler) ? Hoek.clone(data) : data;
            const args = event.flagged('spread', handler) && Array.isArray(update) ? update.slice(0) : [update];

            if (event.flagged('tags', handler) &&
                criteria.tags) {

                args.push(criteria.tags);
            }

            // Call the listener

            try {
                if (handler.context) {
                    fn([null, handler.listener.apply(handler.context, args)]);
                }
                else {
                    fn([null, handler.listener(...args)]);
                }
            }
            catch (err) {
                fn([err, null]);
            }
        }
    }

    addListener(criteria, listener, context) {

        criteria = internals.criteria(criteria);
        criteria.listener = listener;
        criteria.context = context;

        if (criteria.filter &&
            (typeof criteria.filter === 'string' || Array.isArray(criteria.filter))) {

            criteria = { ...criteria };
            criteria.filter = { tags: criteria.filter };
        }

        criteria = Validate.attempt(criteria, internals.schema.listener, 'Invalid event listener options');

        const name = criteria.name;
        const event = this.#listeners.get(name);
        Hoek.assert(event, `Unknown event ${name}`);

        event.addHandler(criteria);

        return this;
    }

    on(criteria, listener, context) {

        return this.addListener(criteria, listener, context);
    }

    once(criteria, listener, context) {

        criteria = { ...internals.criteria(criteria), count: 1 };

        if (listener) {
            return this.addListener(criteria, listener, context);
        }

        return new Promise((resolve) => {

            this.addListener(criteria, (...args) => resolve(args));
        });
    }

    few(criteria) {

        Hoek.assert(typeof criteria === 'object', 'Criteria must be an object');
        Hoek.assert(criteria.count, 'Criteria must include a count limit');

        const team = new Teamwork.Team({ meetings: criteria.count });
        this.addListener(criteria, (...args) => team.attend(args));
        return team.work;
    }

    removeListener(name, listener) {

        Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
        Hoek.assert(typeof listener === 'function', 'Listener must be a function');

        this.#listeners.get(name).removeListener(listener);
        return this;
    }

    off(name, listener) {

        return this.removeListener(name, listener);
    }

    removeAllListeners(name) {

        Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
        this.#listeners.get(name).handlers = null;
        return this;
    }

    hasListeners(name) {

        Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
        return !!this.#listeners.get(name).handlers;
    }
};


internals.EventListener = class {

    constructor(flags) {

        this.flags = flags;
        this.handlers = null;
    }

    addHandler(handler) {

        Hoek.assert(!handler.channels || !this.flags.channels || Hoek.intersect(this.flags.channels, handler.channels).length === handler.channels.size, `Unknown event channels ${handler.channels && [...handler.channels].join(', ')}`);

        this.handlers = this.handlers ? [...this.handlers, handler] : [handler];     // Don't mutate
    }

    removeListener(listener) {

        const filtered = this.handlers?.filter((item) => item.listener !== listener);
        this.handlers = filtered?.length ? filtered : null;
    }

    flagged(name, handler) {

        return handler[name] ?? this.flags[name] ?? false;
    }
};


internals.criteria = function (criteria) {

    if (typeof criteria === 'string') {
        return { name: criteria };
    }

    return criteria;
};
