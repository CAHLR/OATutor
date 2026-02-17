import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ListProvisionedConcurrencyConfigs } from "../schemas/schemas_0";
export { $Command };
export class ListProvisionedConcurrencyConfigsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSGirApiService", "ListProvisionedConcurrencyConfigs", {})
    .n("LambdaClient", "ListProvisionedConcurrencyConfigsCommand")
    .sc(ListProvisionedConcurrencyConfigs)
    .build() {
}
