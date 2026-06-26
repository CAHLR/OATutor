import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListVersionsByFunction } from "../schemas/schemas_0";
export { $Command };
export class ListVersionsByFunctionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListVersionsByFunction", {})
    .n("LambdaClient", "ListVersionsByFunctionCommand")
    .sc(ListVersionsByFunction)
    .build() {
}
