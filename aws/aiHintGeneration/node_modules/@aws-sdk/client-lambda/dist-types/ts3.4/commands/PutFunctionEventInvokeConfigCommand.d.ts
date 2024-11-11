import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  FunctionEventInvokeConfig,
  PutFunctionEventInvokeConfigRequest,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface PutFunctionEventInvokeConfigCommandInput
  extends PutFunctionEventInvokeConfigRequest {}
export interface PutFunctionEventInvokeConfigCommandOutput
  extends FunctionEventInvokeConfig,
    __MetadataBearer {}
declare const PutFunctionEventInvokeConfigCommand_base: {
  new (
    input: PutFunctionEventInvokeConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PutFunctionEventInvokeConfigCommandInput,
    PutFunctionEventInvokeConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PutFunctionEventInvokeConfigCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PutFunctionEventInvokeConfigCommandInput,
    PutFunctionEventInvokeConfigCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PutFunctionEventInvokeConfigCommand extends PutFunctionEventInvokeConfigCommand_base {
  protected static __types: {
    api: {
      input: PutFunctionEventInvokeConfigRequest;
      output: FunctionEventInvokeConfig;
    };
    sdk: {
      input: PutFunctionEventInvokeConfigCommandInput;
      output: PutFunctionEventInvokeConfigCommandOutput;
    };
  };
}
