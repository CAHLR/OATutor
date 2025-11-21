import { EventEmitter } from 'events';
import {
    IncomingHttpHeaders,
    IncomingMessage,
    OutgoingHttpHeaders,
    ServerResponse
} from 'http';
import { Readable, Stream } from 'stream';
import { UrlObject } from 'url';

interface MockSocket extends EventEmitter {
    readonly remoteAddress: string;
    end(): void;
    setTimeout(): void;
}

export interface InjectedRequest extends Readonly<Readable> {
    readonly httpVersion: '1.1';
    readonly method: string;
    readonly url: string;
    readonly headers: Readonly<IncomingHttpHeaders>;
    readonly socket: MockSocket;
    readonly connection: MockSocket;
}

export type MaybeInjectedRequest = InjectedRequest | IncomingMessage;

export interface ResponseObject {
    /**
     * An object containing the raw request and response objects.
     */
    raw: {
        /**
         * The simulated request object.
         */
        req: InjectedRequest;

        /**
         * The simulated response object.
         */
        res: ServerResponse;
    };

    /**
     * An object containing the response headers.
     */
    headers: OutgoingHttpHeaders;

    /**
     * The HTTP status code. If response is aborted before headers are sent, the code is `499`.
     */
    statusCode: number;

    /**
     * The HTTP status message.
     */
    statusMessage: string;

    /**
     * The payload as a UTF-8 encoded string.
     */
    payload: string;

    /**
     * The raw payload as a Buffer.
     */
    rawPayload: Buffer;

    /**
     * An object containing the response trailers
     */
    trailers: NodeJS.Dict<string>;

    /**
     * A boolean which is `true` for aborted, ie. not fully transmitted, responses.
     */
    aborted?: true;
}

type PartialURL = Pick<UrlObject, 'protocol' | 'hostname' | 'port' | 'query'> & { pathname: string };

export interface RequestOptions {

    /**
     * The request URL.
     */
    url: string | PartialURL;

    /**
     * The HTTP request method.
     *
     * @default 'GET'
     */
    method?: string;

    /**
     * The HTTP HOST header value to be used if no header is provided,
     * and the url does not include an authority component.
     *
     * @default 'localhost'
     */
    authority?: string;

    /**
     * The request headers.
     */
    headers?: OutgoingHttpHeaders;

    /**
     * The client remote address.
     *
     * @default '127.0.0.1'
     */
    remoteAddress?: string;

    /**
     * A request payload. Can be a string, Buffer, Stream or object that will be stringified.
     */
    payload?: string | Buffer | Stream | object;

    /**
     * an object containing flags to simulate various conditions:
    */
    simulate?: {

        /**
         * indicates whether the request will fire an end event.
         *
         * @default true
         */
        end?: boolean;

        /**
         * indicates whether the request payload will be split into chunks.
         *
         * @default false
         */
        split?: boolean;

        /**
         * whether the request will emit an error event.
         * If set to true, the emitted error will have a message of 'Simulated'.
         *
         * @default false
         */
        error?: boolean;

        /**
         * whether the request will emit a close event.
         *
         * @default true
         */
        close?: boolean;
    };

    /**
     * Optional flag to validate this options object.
     *
     * @default true
     */
    validate?: boolean;
}

type InjectionListener = (req: InjectedRequest, res: ServerResponse) => void;

type MaybeInjectionListener = (req: MaybeInjectedRequest, res: ServerResponse) => void;

/**
 * Injects a fake request into an HTTP server.
 *
 * @param dispatchFunc - Listener function. Similar as you would pass to Http.createServer when making a node HTTP server.
 * @param options - Request options object or string with request url.
 *
 * @return A Promise that resolves with a ResponseObject object
 */
export function inject(dispatchFunc: InjectionListener, options: RequestOptions | string): Promise<ResponseObject>;
export function inject(dispatchFunc: MaybeInjectionListener, options: RequestOptions | string): Promise<ResponseObject>;

/**
 * Checks if given object is a Shot Request object.
 *
 * @param obj - the req or res object to test
 *
 * @return true if the object is a shot request, otherwise false.
 */
export function isInjection(obj: MaybeInjectedRequest | ServerResponse): boolean;
