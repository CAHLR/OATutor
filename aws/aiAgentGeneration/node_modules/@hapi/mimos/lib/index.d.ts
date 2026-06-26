// Declare our own interface to mime-db data

declare namespace MimeDb {

    type MimeSource = 'iana' | 'apache' | 'nginx';

    interface MimeEntry {

        /**
         * String with identifier for the source of the data.
         */
        source?: MimeSource;

        /**
         * Array of strings with possible lowercased file extensions, without the
         * dot.
         */
        extensions?: ReadonlyArray<string>;

        /**
         * Boolean that indicates if the contents is likely to become smaller if
         * gzip or similar compression is applied.
         */
        compressible?: boolean;

        /**
         * Charset for type.
         */
        charset?: string;
    }
}


// Helpers

type NoInfer<T> = [T][T extends any ? 0 : never];


export class MimosEntry {

    /**
     * String with the content-type.
     */
    type: string;

    /**
     * String with identifier for the source of the data.
     */
    source: MimeDb.MimeSource | 'mime-db' | 'mimos';

    /**
     * Array of strings with possible lowercased file extensions, without the
     * dot.
     */
    extensions: ReadonlyArray<string>;

    /**
     * Boolean that indicates if the contents is likely to become smaller if
     * gzip or similar compression is applied.
     */
    compressible: boolean;

    /**
     * Optional charset for type.
     */
    charset?: string;

    private constructor();
}

export interface MimosDeclaration<P extends object = {}> extends MimeDb.MimeEntry {

    /**
     * The `type` value of result objects, defaults to `key`.
     */
    type?: string;

    /**
     * Method with signature `function(mime)`.
     *
     * When this mime type is found in the database, this function will run.
     * This allows you make customizations to `mime` based on developer criteria.
     */
    predicate?: (mime: MimosEntry & P) => MimosEntry;
}

export interface MimosOptions<P extends object = {}> {

    /**
     * An object hash that is merged into the built-in mime information from
     * {@link https://github.com/jshttp/mime-db}.
     *
     * Each key value pair represents a single mime object override.
     *
     * Each override entry should follow this schema:
     *  * The key is the lower-cased correct mime-type. (Ex. "application/javascript").
     *  * The value should be an object following the structure from
     *    {@link https://github.com/jshttp/mime-db#data-structure} with additional
     *    optional values:
     *     * type - Specify the `type` value of result objects, defaults to `key`.
     *     * predicate - Method that is called with mime entry on lookup, that
     *       must return an entry. This allows you make customizations to `mime`
     *       based on developer criteria.
     */
    override?: {
        [type: string]: MimosDeclaration<P> & P;
    };
}

export class Mimos<P extends object = {}> {

    /**
     * Create a Mimos object for mime lookups.
     */
    constructor(options?: MimosOptions<NoInfer<P>>);

    /**
     * Extract extension from file path and lookup mime information.
     *
     * @param path - Path to file
     *
     * @return Found mime object, or {} if no match.
     */
    path(path: string): (Readonly<MimosEntry & Partial<P>>) | {};

    /**
     * Lookup mime information.
     *
     * @param type - The content-type to find mime information about.
     *
     * @return Mime object for provided type.
    */
    type(type: string): Readonly<MimosEntry & Partial<P>>;
}
