
type IfUndefinedElse<T, If, Else> = T extends undefined ? If : Else;

type EventNames<Events> = IfUndefinedElse<Events, string, keyof Events>;

type EventListenerParameters<Events> = Events[keyof Events] extends (...args: any) => any
  ? Parameters<Events[keyof Events]>
  : never
;

type EmitData<Events> = IfUndefinedElse<Events, any, EventListenerParameters<Events>>;

type EventListener<Events, TArgs extends unknown[], TContext extends object> = Podium.Listener<
  TContext,
  IfUndefinedElse<Events, TArgs, EventListenerParameters<Events>>
>;

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
    [Property in Key]-?: Type[Property];
};

/**
 * Node (semi) compatible event emitter with extra features.
 */
export class Podium<Events = undefined> {
    /**
     * Creates a new podium emitter.
     *
     * @param events - If present, the value is passed to podium.registerEvent().
     * @param options - optional configuration options passed to podium.registerEvent().
     */
    constructor(events?: Podium.Event<EventNames<Events>> | Podium.Event<EventNames<Events>>[], options?: Podium.EventSettings);

    /**
     * Register the specified events and their optional configuration. Events must be registered
     * before they can be emitted or subscribed to. This is done to detect event name mispelling
     * and invalid event activities.
     *
     * @param events - The event(s) to register.
     * @param options - optional configuration options.
     */
    registerEvent(events: Podium.Event<EventNames<Events>> | Podium.Event<EventNames<Events>>[], options?: Podium.EventSettings): void;

    /**
     * Emits an event update to all the subscribed listeners.

     * @param criteria - The event update criteria.
     * @param data - The value emitted to the subscribers.
     */
    emit(criteria: Podium.EmitCriteria<EventNames<Events>>, data?: EmitData<Events>): void;

    /**
     * Emits an event update to all the subscribed listeners and resolves an array of their results.

     * @param criteria - The event update criteria.
     * @param data - The value emitted to the subscribers.
     */
    gauge<T = unknown>(criteria: Podium.EmitCriteria<EventNames<Events>>, data?: EmitData<Events>): Promise<PromiseSettledResult<T>[]>;

    /**
     * Subscribe a handler to an event.
     *
     * @param criteria - The subscription criteria.
     * @param listener - The handler method set to receive event updates. The function signature
     *                   depends on the block, spread, and tags options.
     * @param context - Optional object that binds to the listener handler.
     *
     * @returns A reference to the current emitter.
     */
    on<TArgs extends any[] = unknown[], Tcontext extends object = this>
        (criteria: Podium.Criteria<EventNames<Events>>, listener: EventListener<Events, TArgs, Tcontext>, context?: Tcontext): this

    /**
     * Subscribe a handler to an event. Same as podium.on().
     *
     * @param criteria - The subscription criteria.
     * @param listener - The handler method set to receive event updates. The function signature
     *                   depends on the block, spread, and tags options.
     * @param context - Optional object that binds to the listener handler.
     *
     * @returns A reference to the current emitter.
     */
    addListener<TArgs extends any[] = unknown[], Tcontext extends object = this>
        (criteria: Podium.Criteria<EventNames<Events>>, listener: EventListener<Events, TArgs, Tcontext>, context?: Tcontext): this;

    /**
     * Same as podium.on() with the count option set to 1.
     *
     * Can also be called without an listener to wait for a single event.
     *
     * @param criteria - The subscription criteria.
     * @param listener - The handler method set to receive event updates. The function signature
     *                   depends on the block, spread, and tags options.
     * @param context - Optional object that binds to the listener handler.
     *
     * @returns A reference to the current emitter.
     */
    once<TArgs extends any[] = unknown[], Tcontext extends object = this>
        (criteria: Podium.OnceCriteria<EventNames<Events>>, listener: EventListener<Events, TArgs, Tcontext>, context?: Tcontext): this;

    /**
     * Subscribes to an event by returning a promise that resolves when the event is emitted.
     *
     * @param criteria - The subscription criteria.
     *
     * @returns Promise with array of emitted parameters.
     */
    once<TArgs extends any[] = unknown[], Tcontext extends object = this>(criteria: Podium.OnceCriteria<EventNames<Events>>): Promise<TArgs>;

    /**
     * Subscribes to an event by returning a promise that resolves when the event is emitted `count` times.
     *
     * @param criteria - The subscription criteria.
     *
     * @returns Promise with array where each item is an array of emitted arguments.
     */
    few<TArgs extends any[] = unknown[], Tcontext extends object = this>(criteria: Podium.FewCriteria<EventNames<Events>>): Promise<TArgs>;

    /**
     * Removes all listeners subscribed to a given event name matching the provided listener method.
     *
     * @param name - The event name string.
     * @param listener - The function reference provided when subscribed.
     *
     * @returns A reference to the current emitter.
     */
    off(name: string, listener: Podium.Listener): this;

    /**
     * Removes all listeners subscribed to a given event name matching the provided listener method.
     *
     * @param name - The event name string.
     * @param listener - The function reference provided when subscribed.
     *
     * @returns A reference to the current emitter.
     */
    removeListener(name: string, listener: Podium.Listener): this;

    /**
     * Removes all listeners subscribed to a given event name.
     *
     * @param name - The event name string.
     *
     * @returns A reference to the current emitter.
     */
    removeAllListeners(name: string): this;

    /**
     * Returns whether an event has any listeners subscribed.
     *
     * @param name  the event name string.
     *
     * @returns true if the event name has any listeners, otherwise false.
     */
    hasListeners(name: string): boolean;
}

declare namespace Podium {

    type EventName = string | number | symbol

    interface EmitCriteriaInterface<TName extends EventName> {

        /**
         * Event name.
         */
        readonly name: TName;

        /**
         * Channel name.
         */
        readonly channel?: string;

        /**
         * The tags to apply.
         */
        readonly tags?: string | string[] | { [tag: string]: boolean };
    }

    export type EmitCriteria<TName extends EventName> = EmitCriteriaInterface<TName> | TName

    interface EventOptionsInterface<TName extends EventName> {

        /**
         * Event name.
         */
        readonly name: TName;

        /**
         * A string or array of strings specifying the event channels available.
         *
         * Defaults to no channel restrictions - Event updates can specify a channel or not.
         */
        readonly channels?: string | string[];

        /**
         * Set to make podium.emit() clone the data object passed to it, before it is passed to the
         * listeners (unless an override specified by each listener).
         *
         * Defaults to false - Data is passed as-is.
         */
        readonly clone?: boolean;

        /**
         * Set to require the data object passed to podium.emit() to be an array, and make the
         * listener method called with each array element passed as a separate argument (unless an
         * override specified by each listener).
         *
         * This should only be used when the emitted data structure is known and predictable.
         *
         * Defaults to false - Data is emitted as a single argument regardless of its type.
         */
        readonly spread?: boolean;

        /**
         * Set to make any tags in the critieria object passed to podium.emit() map to an object
         * (where each tag string is the key and the value is true) which is appended to the emitted
         * arguments list at the end.
         *
         * A configuration override can be set by each listener.
         *
         * Defaults to false.
         */
        readonly tags?: boolean;

        /**
         * Set to allow the same event name to be registered multiple times, ignoring all but the
         * first.
         *
         * Note that if the registration config is changed between registrations, only the first
         * configuration is used.
         *
         * Defaults to false - A duplicate registration will throw an error.
         */
        readonly shared?: boolean;
    }

    type EventOptions<TName extends EventName> = EventOptionsInterface<TName> | TName

    type Event<TName extends EventName> = TName | EventOptions<TName>;

    export interface EventSettings {

        /**
         * If false, events are not validated. This is only allowed when the events
         * value is returned from Podium.validate().
         *
         * Defaults to true
         */
        readonly validate?: boolean;
    }

    type Listener<TContext extends object = any, TArgs extends any[] = any[]> =
        (this: TContext, ...args: TArgs) => unknown;

    interface CriteriaFilterOptionsObject {

        /**
         * A tag string or array of tag strings.
         */
        readonly tags?: string | string[];

        /**
         * Require all tags to be present for the event update to match the subscription.
         *
         * Default false - Require at least one matching tag.
         */
        readonly all?: boolean;
    }

    interface CriteriaInterface<TName extends EventName> {

        /**
         * Event name.
         */
        readonly name: TName;

        /**
         * The event channels to subscribe to.
         *
         * If the event registration specified a list of allowed channels, the channels array must
         * match the allowed channels. If channels are specified, event updates without any channel
         * designation will not be included in the subscription.
         *
         * Defaults to no channels filter.
         */
        readonly channels?: string | string[];

        /**
         * Set to clone the data object passed to podium.emit() before it is passed to the listener
         * method.
         *
         * Defaults to the event registration option (which defaults to false).
         */
        readonly clone?: boolean;

        /**
         * A positive non-zero integer indicating the number of times the listener can be called
         * after which the subscription is automatically removed.
         *
         * Does nothing when calling once(), where it will use the value 1.
         *
         * Defaults to no limit.
         */
        readonly count?: number;

        /**
         * The event tags (if present) to subscribe to.
         */
        readonly filter?: string | string[] | CriteriaFilterOptionsObject;

        /**
         * Override the value of spread from the event registraiont when the listener is called.
         *
         * This should only be used when the emitted data structure is known and predictable.
         *
         * Defaults to the event registration option (which defaults to false).
         */
        readonly spread?: boolean;

        /**
         * Override the value of tags from the event registraiont when the listener is called.
         *
         * Defaults to the event registration option (which defaults to false).
         */
        readonly tags?: boolean;
    }

    export type Criteria<TName extends EventName = string> = CriteriaInterface<TName> | TName
    export type OnceCriteria<TName extends EventName = string> = Omit<CriteriaInterface<TName>, 'count'> | TName
    export type FewCriteria<TName extends EventName = string> = WithRequiredProperty<CriteriaInterface<TName>, 'count'>
}
