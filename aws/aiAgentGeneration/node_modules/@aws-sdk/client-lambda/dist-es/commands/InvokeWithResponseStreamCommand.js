import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { InvokeWithResponseStream } from "../schemas/schemas_0";
export { $Command };
export class InvokeWithResponseStreamCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "InvokeWithResponseStream", {
    eventStream: {
        output: true,
    },
})
    .n("LambdaClient", "InvokeWithResponseStreamCommand")
    .sc(InvokeWithResponseStream)
    .build() {
}
