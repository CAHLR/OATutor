import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  GetFunctionRecursionConfigRequest,
  GetFunctionRecursionConfigResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetFunctionRecursionConfigCommandInput
  extends GetFunctionRecursionConfigRequest {}
export interface GetFunctionRecursionConfigCommandOutput
  extends GetFunctionRecursionConfigResponse,
    __MetadataBearer {}
declare const GetFunctionRecursionConfigCommand_base: {
  new (
    input: GetFunctionRecursionConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFunctionRecursionConfigCommandInput,
    GetFunctionRecursionConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetFunctionRecursionConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFunctionRecursionConfigCommandInput,
    GetFunctionRecursionConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetFunctionRecursionConfigCommand extends GetFunctionRecursionConfigCommand_base {
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
