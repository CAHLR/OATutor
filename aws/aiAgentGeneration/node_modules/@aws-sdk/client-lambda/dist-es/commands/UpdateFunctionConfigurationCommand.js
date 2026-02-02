import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { UpdateFunctionConfiguration } from "../schemas/schemas_0";
export { $Command };
export class UpdateFunctionConfigurationCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "UpdateFunctionConfiguration", {})
    .n("LambdaClient", "UpdateFunctionConfigurationCommand")
    .sc(UpdateFunctionConfiguration)
    .build() {
}
