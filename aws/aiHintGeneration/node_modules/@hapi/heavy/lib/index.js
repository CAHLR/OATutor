'use strict';

const PerfHooks = require('perf_hooks');
const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');
const Validate = require('@hapi/validate');


const internals = {};


internals.schema = Validate.object({
    sampleInterval: Validate.number().min(0),
    maxHeapUsedBytes: Validate.number().min(0),
    maxEventLoopDelay: Validate.number().min(0),
    maxEventLoopUtilization: Validate.number().min(0),
    maxRssBytes: Validate.number().min(0)
})
    .unknown();


internals.defaults = {
    sampleInterval: 0,                          // Frequency of load sampling in milliseconds (zero is no sampling)
    maxHeapUsedBytes: 0,                        // Reject requests when V8 heap is over size in bytes (zero is no max)
    maxRssBytes: 0,                             // Reject requests when process RSS is over size in bytes (zero is no max)
    maxEventLoopDelay: 0,                       // Milliseconds of delay after which requests are rejected (zero is no max)
    maxEventLoopUtilization: 0                  // Max event loop utilization value after which requests are rejected (zero is no max)
};


exports.Heavy = class Heavy {

    constructor(options) {

        options = options || {};

        Validate.assert(options, internals.schema, 'Invalid load monitoring options');
        this.settings = Hoek.applyToDefaults(internals.defaults, options);
        Hoek.assert(this.settings.sampleInterval || (!this.settings.maxEventLoopDelay && !this.settings.maxHeapUsedBytes && !this.settings.maxRssBytes && !this.settings.maxEventLoopUtilization), 'Load sample interval must be set to enable load limits');

        this._eventLoopTimer = null;
        this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization();
        this._loadBench = new Hoek.Bench();
        this.load = {
            eventLoopDelay: 0,
            eventLoopUtilization: 0,
            heapUsed: 0,
            rss: 0
        };
    }

    start() {

        if (!this.settings.sampleInterval) {
            return;
        }

        const loopSample = () => {

            this._loadBench.reset();
            const measure = () => {

                const mem = process.memoryUsage();

                // Retain the same this.load object to keep external references valid

                this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization(this._eventLoopUtilization);

                this.load.eventLoopDelay = (this._loadBench.elapsed() - this.settings.sampleInterval);
                this.load.eventLoopUtilization = this._eventLoopUtilization.utilization;
                this.load.heapUsed = mem.heapUsed;
                this.load.rss = mem.rss;

                loopSample();
            };

            this._eventLoopTimer = setTimeout(measure, this.settings.sampleInterval);
        };

        loopSample();
    }

    stop() {

        clearTimeout(this._eventLoopTimer);
        this._eventLoopTimer = null;
    }

    check() {

        if (!this.settings.sampleInterval) {
            return;
        }

        Hoek.assert(this._eventLoopTimer, 'Cannot check load when sampler is not started');

        const elapsed = this._loadBench.elapsed();
        const load = this.load;

        if (elapsed > this.settings.sampleInterval) {
            this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization(this._eventLoopUtilization);

            load.eventLoopDelay = Math.max(load.eventLoopDelay, elapsed - this.settings.sampleInterval);
            load.eventLoopUtilization = this._eventLoopUtilization.utilization;
        }

        if (this.settings.maxEventLoopDelay &&
            load.eventLoopDelay > this.settings.maxEventLoopDelay) {

            throw Boom.serverUnavailable('Server under heavy load (event loop)', load);
        }

        if (this.settings.maxEventLoopUtilization &&
            load.eventLoopUtilization > this.settings.maxEventLoopUtilization) {

            throw Boom.serverUnavailable('Server under heavy load (event loop utilization)', load);
        }

        if (this.settings.maxHeapUsedBytes &&
            load.heapUsed > this.settings.maxHeapUsedBytes) {

            throw Boom.serverUnavailable('Server under heavy load (heap)', load);
        }

        if (this.settings.maxRssBytes &&
            load.rss > this.settings.maxRssBytes) {

            throw Boom.serverUnavailable('Server under heavy load (rss)', load);
        }
    }
};
