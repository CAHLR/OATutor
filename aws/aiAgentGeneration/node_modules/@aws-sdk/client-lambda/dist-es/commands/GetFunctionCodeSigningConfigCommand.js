import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetFunctionCodeSigningConfig } from "../schemas/schemas_0";
export { $Command };
export class GetFunctionCodeSigningConfigCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "GetFunctionCodeSigningConfig", {})
    .n("LambdaClient", "GetFunctionCodeSigningConfigCommand")
    .sc(GetFunctionCodeSigningConfig)
    .build() {
}
