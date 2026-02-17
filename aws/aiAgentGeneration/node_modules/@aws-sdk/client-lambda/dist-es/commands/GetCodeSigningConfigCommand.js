import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetCodeSigningConfig } from "../schemas/schemas_0";
export { $Command };
export class GetCodeSigningConfigCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "GetCodeSigningConfig", {})
    .n("LambdaClient", "GetCodeSigningConfigCommand")
    .sc(GetCodeSigningConfig)
    .build() {
}
