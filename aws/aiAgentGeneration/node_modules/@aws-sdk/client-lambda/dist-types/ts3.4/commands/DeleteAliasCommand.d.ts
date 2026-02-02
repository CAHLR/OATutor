import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  LambdaClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../LambdaClient";
import { DeleteAliasRequest } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface DeleteAliasCommandInput extends DeleteAliasRequest {}
export interface DeleteAliasCommandOutput extends __MetadataBearer {}
declare const DeleteAliasCommand_base: {
  new (
    input: DeleteAliasCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteAliasCommandInput,
    DeleteAliasCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: DeleteAliasCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteAliasCommandInput,
    DeleteAliasCommandOutput,
    LambdaClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteAliasCommand extends DeleteAliasCommand_base {
  protected static __types: {
    api: {
      input: DeleteAliasRequest;
      output: {};
    };
    sdk: {
      input: DeleteAliasCommandInput;
      output: DeleteAliasCommandOutput;
    };
  };
}
