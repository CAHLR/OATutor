import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  FunctionConfiguration,
  UpdateFunctionConfigurationRequest,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface UpdateFunctionConfigurationCommandInput
  extends UpdateFunctionConfigurationRequest {}
export interface UpdateFunctionConfigurationCommandOutput
  extends FunctionConfiguration,
    __MetadataBearer {}
declare const UpdateFunctionConfigurationCommand_base: {
  new (
    input: UpdateFunctionConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateFunctionConfigurationCommandInput,
    UpdateFunctionConfigurationCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: UpdateFunctionConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateFunctionConfigurationCommandInput,
    UpdateFunctionConfigurationCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class UpdateFunctionConfigurationCommand extends UpdateFunctionConfigurationCommand_base {
  protected static __types: {
    api: {
      input: UpdateFunctionConfigurationRequest;
      output: FunctionConfiguration;
    };
    sdk: {
      input: UpdateFunctionConfigurationCommandInput;
      output: UpdateFunctionConfigurationCommandOutput;
    };
  };
}
