import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  PutFunctionRecursionConfigRequest,
  PutFunctionRecursionConfigResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface PutFunctionRecursionConfigCommandInput
  extends PutFunctionRecursionConfigRequest {}
export interface PutFunctionRecursionConfigCommandOutput
  extends PutFunctionRecursionConfigResponse,
    __MetadataBearer {}
declare const PutFunctionRecursionConfigCommand_base: {
  new (
    input: PutFunctionRecursionConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PutFunctionRecursionConfigCommandInput,
    PutFunctionRecursionConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PutFunctionRecursionConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PutFunctionRecursionConfigCommandInput,
    PutFunctionRecursionConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PutFunctionRecursionConfigCommand extends PutFunctionRecursionConfigCommand_base {
  protected static __types: {
    api: {
      input: PutFunctionRecursionConfigRequest;
      output: PutFunctionRecursionConfigResponse;
    };
    sdk: {
      input: PutFunctionRecursionConfigCommandInput;
      output: PutFunctionRecursionConfigCommandOutput;
    };
  };
}
