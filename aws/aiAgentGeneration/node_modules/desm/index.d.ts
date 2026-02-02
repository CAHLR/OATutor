export default urlDirname;
declare function urlDirname(url: string): string;
declare function urlJoin(url: string, ...str: string[]): string;
declare function fileURLToPath(url: string | URL): string;
export { fileURLToPath as filename, urlJoin as join, urlDirname as dirname };
