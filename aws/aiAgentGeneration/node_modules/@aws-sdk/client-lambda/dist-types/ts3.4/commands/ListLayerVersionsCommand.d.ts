import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import {
  ListLayerVersionsRequest,
  ListLayerVersionsResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface ListLayerVersionsCommandInput
  extends ListLayerVersionsRequest {}
export interface ListLayerVersionsCommandOutput
  extends ListLayerVersionsResponse,
    __MetadataBearer {}
declare const ListLayerVersionsCommand_base: {
  new (
    input: ListLayerVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListLayerVersionsCommandInput,
    ListLayerVersionsCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: ListLayerVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListLayerVersionsCommandInput,
    ListLayerVersionsCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ListLayerVersionsCommand extends ListLayerVersionsCommand_base {
  protected static __types: {
    api: {
      input: ListLayerVersionsRequest;
      output: ListLayerVersionsResponse;
    };
    sdk: {
      input: ListLayerVersionsCommandInput;
      output: ListLayerVersionsCommandOutput;
    };
  };
}
