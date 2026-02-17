import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  GetLayerVersionByArnRequest,
  GetLayerVersionResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetLayerVersionByArnCommandInput
  extends GetLayerVersionByArnRequest {}
export interface GetLayerVersionByArnCommandOutput
  extends GetLayerVersionResponse,
    __MetadataBearer {}
declare const GetLayerVersionByArnCommand_base: {
  new (
    input: GetLayerVersionByArnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetLayerVersionByArnCommandInput,
    GetLayerVersionByArnCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetLayerVersionByArnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetLayerVersionByArnCommandInput,
    GetLayerVersionByArnCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetLayerVersionByArnCommand extends GetLayerVersionByArnCommand_base {
  protected static __types: {
    api: {
      input: GetLayerVersionByArnRequest;
      output: GetLayerVersionResponse;
    };
    sdk: {
      input: GetLayerVersionByArnCommandInput;
      output: GetLayerVersionByArnCommandOutput;
    };
  };
}
