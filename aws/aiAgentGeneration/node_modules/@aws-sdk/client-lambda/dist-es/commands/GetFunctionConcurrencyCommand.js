import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetFunctionConcurrency } from "../schemas/schemas_0";
export { $Command };
export class GetFunctionConcurrencyCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "GetFunctionConcurrency", {})
    .n("LambdaClient", "GetFunctionConcurrencyCommand")
    .sc(GetFunctionConcurrency)
    .build() {
}
