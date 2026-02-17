import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListLayers } from "../schemas/schemas_0";
export { $Command };
export class ListLayersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListLayers", {})
    .n("LambdaClient", "ListLayersCommand")
    .sc(ListLayers)
    .build() {
}
