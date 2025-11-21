import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListFunctionUrlConfigs } from "../schemas/schemas_0";
export { $Command };
export class ListFunctionUrlConfigsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListFunctionUrlConfigs", {})
    .n("LambdaClient", "ListFunctionUrlConfigsCommand")
    .sc(ListFunctionUrlConfigs)
    .build() {
}
