import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { LambdaClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../LambdaClient";
import { GetFunctionRecursionConfigRequest, GetFunctionRecursionConfigResponse } from "../models/models_0";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link GetFunctionRecursionConfigCommand}.
 */
export interface GetFunctionRecursionConfigCommandInput extends GetFunctionRecursionConfigRequest {
}
/**
 * @public
 *
 * The output of {@link GetFunctionRecursionConfigCommand}.
 */
export interface GetFunctionRecursionConfigCommandOutput extends GetFunctionRecursionConfigResponse, __MetadataBearer {
}
declare const GetFunctionRecursionConfigCommand_base: {
    new (input: GetFunctionRecursionConfigCommandInput): import("@smithy/smithy-client").CommandImpl<GetFunctionRecursionConfigCommandInput, GetFunctionRecursionConfigCommandOutput, LambdaClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (__0_0: GetFunctionRecursionConfigCommandInput): import("@smithy/smithy-client").CommandImpl<GetFunctionRecursionConfigCommandInput, GetFunctionRecursionConfigCommandOutput, LambdaClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Returns your function's <a href="https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html">recursive loop detection</a> configuration.
 *     </p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { LambdaClient, GetFunctionRecursionConfigCommand } from "@aws-sdk/client-lambda"; // ES Modules import
 * // const { LambdaClient, GetFunctionRecursionConfigCommand } = require("@aws-sdk/client-lambda"); // CommonJS import
 * const client = new LambdaClient(config);
 * const input = { // GetFunctionRecursionConfigRequest
 *   FunctionName: "STRING_VALUE", // required
 * };
 * const command = new GetFunctionRecursionConfigCommand(input);
 * const response = await client.send(command);
 * // { // GetFunctionRecursionConfigResponse
 * //   RecursiveLoop: "Allow" || "Terminate",
 * // };
 *
 * ```
 *
 * @param GetFunctionRecursionConfigCommandInput - {@link GetFunctionRecursionConfigCommandInput}
 * @returns {@link GetFunctionRecursionConfigCommandOutput}
 * @see {@link GetFunctionRecursionConfigCommandInput} for command's `input` shape.
 * @see {@link GetFunctionRecursionConfigCommandOutput} for command's `response` shape.
 * @see {@link LambdaClientResolvedConfig | config} for LambdaClient's `config` shape.
 *
 * @throws {@link InvalidParameterValueException} (client fault)
 *  <p>One of the parameters in the request is not valid.</p>
 *
 * @throws {@link ResourceNotFoundException} (client fault)
 *  <p>The resource specified in the request does not exist.</p>
 *
 * @throws {@link ServiceException} (server fault)
 *  <p>The Lambda service encountered an internal error.</p>
 *
 * @throws {@link TooManyRequestsException} (client fault)
 *  <p>The request throughput limit was exceeded. For more information, see <a href="https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#api-requests">Lambda quotas</a>.</p>
 *
 * @throws {@link LambdaServiceException}
 * <p>Base exception class for all service exceptions from Lambda service.</p>
 *
 * @public
 */
export declare class GetFunctionRecursionConfigCommand extends GetFunctionRecursionConfigCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: GetFunctionRecursionConfigRequest;
            output: GetFunctionRecursionConfigResponse;
        };
        sdk: {
            input: GetFunctionRecursionConfigCommandInput;
            output: GetFunctionRecursionConfigCommandOutput;
        };
    };
}
