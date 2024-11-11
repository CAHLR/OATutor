"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DEFAULT_UA_APP_ID: () => DEFAULT_UA_APP_ID,
  getUserAgentMiddlewareOptions: () => getUserAgentMiddlewareOptions,
  getUserAgentPlugin: () => getUserAgentPlugin,
  resolveUserAgentConfig: () => resolveUserAgentConfig,
  userAgentMiddleware: () => userAgentMiddleware
});
module.exports = __toCommonJS(src_exports);

// src/configurations.ts
var import_core = require("@smithy/core");
var DEFAULT_UA_APP_ID = void 0;
function isValidUserAgentAppId(appId) {
  if (appId === void 0) {
    return true;
  }
  return typeof appId === "string" && appId.length <= 50;
}
__name(isValidUserAgentAppId, "isValidUserAgentAppId");
function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = (0, import_core.normalizeProvider)(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  return {
    ...input,
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent,
    userAgentAppId: async () => {
      var _a, _b;
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger = ((_b = (_a = input.logger) == null ? void 0 : _a.constructor) == null ? void 0 : _b.name) === "NoOpLogger" || !input.logger ? console : input.logger;
        if (typeof appId !== "string") {
          logger == null ? void 0 : logger.warn("userAgentAppId must be a string or undefined.");
        } else if (appId.length > 50) {
          logger == null ? void 0 : logger.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
        }
      }
      return appId;
    }
  };
}
__name(resolveUserAgentConfig, "resolveUserAgentConfig");

// src/user-agent-middleware.ts
var import_util_endpoints = require("@aws-sdk/util-endpoints");
var import_protocol_http = require("@smithy/protocol-http");

// src/check-features.ts
var import_core2 = require("@aws-sdk/core");
var ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
async function checkFeatures(context, config, args) {
  var _a, _b, _c, _d, _e, _f, _g;
  const request = args.request;
  if (((_a = request == null ? void 0 : request.headers) == null ? void 0 : _a["smithy-protocol"]) === "rpc-v2-cbor") {
    (0, import_core2.setFeature)(context, "PROTOCOL_RPC_V2_CBOR", "M");
  }
  if (typeof config.retryStrategy === "function") {
    const retryStrategy = await config.retryStrategy();
    if (typeof retryStrategy.acquireInitialRetryToken === "function") {
      if ((_c = (_b = retryStrategy.constructor) == null ? void 0 : _b.name) == null ? void 0 : _c.includes("Adaptive")) {
        (0, import_core2.setFeature)(context, "RETRY_MODE_ADAPTIVE", "F");
      } else {
        (0, import_core2.setFeature)(context, "RETRY_MODE_STANDARD", "E");
      }
    } else {
      (0, import_core2.setFeature)(context, "RETRY_MODE_LEGACY", "D");
    }
  }
  if (typeof config.accountIdEndpointMode === "function") {
    const endpointV2 = context.endpointV2;
    if (String((_d = endpointV2 == null ? void 0 : endpointV2.url) == null ? void 0 : _d.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) {
      (0, import_core2.setFeature)(context, "ACCOUNT_ID_ENDPOINT", "O");
    }
    switch (await ((_e = config.accountIdEndpointMode) == null ? void 0 : _e.call(config))) {
      case "disabled":
        (0, import_core2.setFeature)(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
        break;
      case "preferred":
        (0, import_core2.setFeature)(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
        break;
      case "required":
        (0, import_core2.setFeature)(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
        break;
    }
  }
  const identity = (_g = (_f = context.__smithy_context) == null ? void 0 : _f.selectedHttpAuthScheme) == null ? void 0 : _g.identity;
  if (identity == null ? void 0 : identity.$source) {
    const credentials = identity;
    if (credentials.accountId) {
      (0, import_core2.setFeature)(context, "RESOLVED_ACCOUNT_ID", "T");
    }
    for (const [key, value] of Object.entries(credentials.$source ?? {})) {
      (0, import_core2.setFeature)(context, key, value);
    }
  }
}
__name(checkFeatures, "checkFeatures");

// src/constants.ts
var USER_AGENT = "user-agent";
var X_AMZ_USER_AGENT = "x-amz-user-agent";
var SPACE = " ";
var UA_NAME_SEPARATOR = "/";
var UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
var UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
var UA_ESCAPE_CHAR = "-";

// src/encode-features.ts
var BYTE_LIMIT = 1024;
function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      if (buffer.length) {
        buffer += "," + val;
      } else {
        buffer += val;
      }
      continue;
    }
    break;
  }
  return buffer;
}
__name(encodeFeatures, "encodeFeatures");

// src/user-agent-middleware.ts
var userAgentMiddleware = /* @__PURE__ */ __name((options) => (next, context) => async (args) => {
  var _a, _b, _c, _d;
  const { request } = args;
  if (!import_protocol_http.HttpRequest.isInstance(request)) {
    return next(args);
  }
  const { headers } = request;
  const userAgent = ((_a = context == null ? void 0 : context.userAgent) == null ? void 0 : _a.map(escapeUserAgent)) || [];
  const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
  await checkFeatures(context, options, args);
  const awsContext = context;
  defaultUserAgent.push(
    `m/${encodeFeatures(
      Object.assign({}, (_b = context.__smithy_context) == null ? void 0 : _b.features, (_c = awsContext.__aws_sdk_context) == null ? void 0 : _c.features)
    )}`
  );
  const customUserAgent = ((_d = options == null ? void 0 : options.customUserAgent) == null ? void 0 : _d.map(escapeUserAgent)) || [];
  const appId = await options.userAgentAppId();
  if (appId) {
    defaultUserAgent.push(escapeUserAgent([`app/${appId}`]));
  }
  const prefix = (0, import_util_endpoints.getUserAgentPrefix)();
  const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent, ...userAgent, ...customUserAgent]).join(SPACE);
  const normalUAValue = [
    ...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")),
    ...customUserAgent
  ].join(SPACE);
  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
    }
    headers[USER_AGENT] = sdkUserAgentValue;
  } else {
    headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
  }
  return next({
    ...args,
    request
  });
}, "userAgentMiddleware");
var escapeUserAgent = /* @__PURE__ */ __name((userAgentPair) => {
  var _a;
  const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
  const version = (_a = userAgentPair[1]) == null ? void 0 : _a.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
  const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
  const prefix = name.substring(0, prefixSeparatorIndex);
  let uaName = name.substring(prefixSeparatorIndex + 1);
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  return [prefix, uaName, version].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
    switch (index) {
      case 0:
        return item;
      case 1:
        return `${acc}/${item}`;
      default:
        return `${acc}#${item}`;
    }
  }, "");
}, "escapeUserAgent");
var getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};
var getUserAgentPlugin = /* @__PURE__ */ __name((config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
}), "getUserAgentPlugin");
// Annotate the CommonJS export names for ESM import in node:

0 && (module.exports = {
  DEFAULT_UA_APP_ID,
  resolveUserAgentConfig,
  userAgentMiddleware,
  getUserAgentMiddlewareOptions,
  getUserAgentPlugin
});

