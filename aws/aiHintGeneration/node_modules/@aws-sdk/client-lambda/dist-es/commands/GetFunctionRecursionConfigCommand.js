import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetFunctionRecursionConfigCommand, se_GetFunctionRecursionConfigCommand } from "../protocols/Aws_restJson1";
export { $Command };
export class GetFunctionRecursionConfigCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AWSGirApiService", "GetFunctionRecursionConfig", {})
    .n("LambdaClient", "GetFunctionRecursionConfigCommand")
    .f(void 0, void 0)
    .ser(se_GetFunctionRecursionConfigCommand)
    .de(de_GetFunctionRecursionConfigCommand)
    .build() {
}
