import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListFunctions } from "../schemas/schemas_0";
export { $Command };
export class ListFunctionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListFunctions", {})
    .n("LambdaClient", "ListFunctionsCommand")
    .sc(ListFunctions)
    .build() {
}
