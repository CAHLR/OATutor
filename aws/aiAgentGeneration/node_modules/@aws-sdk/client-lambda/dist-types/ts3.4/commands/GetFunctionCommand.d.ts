import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import { GetFunctionRequest, GetFunctionResponse } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetFunctionCommandInput extends GetFunctionRequest {}
export interface GetFunctionCommandOutput
  extends GetFunctionResponse,
    __MetadataBearer {}
declare const GetFunctionCommand_base: {
  new (
    input: GetFunctionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFunctionCommandInput,
    GetFunctionCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetFunctionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFunctionCommandInput,
    GetFunctionCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetFunctionCommand extends GetFunctionCommand_base {
  protected static __types: {
    api: {
      input: GetFunctionRequest;
      output: GetFunctionResponse;
    };
    sdk: {
      input: GetFunctionCommandInput;
      output: GetFunctionCommandOutput;
    };
  };
}
