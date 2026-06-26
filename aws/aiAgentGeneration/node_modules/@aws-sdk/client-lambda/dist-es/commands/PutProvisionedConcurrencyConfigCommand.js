import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { PutProvisionedConcurrencyConfig } from "../schemas/schemas_0";
export { $Command };
export class PutProvisionedConcurrencyConfigCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "PutProvisionedConcurrencyConfig", {})
    .n("LambdaClient", "PutProvisionedConcurrencyConfigCommand")
    .sc(PutProvisionedConcurrencyConfig)
    .build() {
}
