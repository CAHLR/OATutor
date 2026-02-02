import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { PutFunctionConcurrency } from "../schemas/schemas_0";
export { $Command };
export class PutFunctionConcurrencyCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "PutFunctionConcurrency", {})
    .n("LambdaClient", "PutFunctionConcurrencyCommand")
    .sc(PutFunctionConcurrency)
    .build() {
}
