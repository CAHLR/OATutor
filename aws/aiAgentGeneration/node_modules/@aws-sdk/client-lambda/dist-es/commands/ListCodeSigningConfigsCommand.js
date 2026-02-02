import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListCodeSigningConfigs } from "../schemas/schemas_0";
export { $Command };
export class ListCodeSigningConfigsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListCodeSigningConfigs", {})
    .n("LambdaClient", "ListCodeSigningConfigsCommand")
    .sc(ListCodeSigningConfigs)
    .build() {
}
