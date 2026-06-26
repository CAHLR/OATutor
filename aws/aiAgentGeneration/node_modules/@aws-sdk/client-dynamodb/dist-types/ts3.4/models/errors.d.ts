import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { DynamoDBServiceException as __BaseException } from "./DynamoDBServiceException";
import {
  AttributeValue,
  CancellationReason,
  ThrottlingReason,
} from "./models_0";
export declare class BackupInUseException extends __BaseException {
  readonly name: "BackupInUseException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<BackupInUseException, __BaseException>
  );
}
export declare class BackupNotFoundException extends __BaseException {
  readonly name: "BackupNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<BackupNotFoundException, __BaseException>
  );
}
export declare class InternalServerError extends __BaseException {
  readonly name: "InternalServerError";
  readonly $fault: "server";
  constructor(
    opts: __ExceptionOptionType<InternalServerError, __BaseException>
  );
}
export declare class RequestLimitExceeded extends __BaseException {
  readonly name: "RequestLimitExceeded";
  readonly $fault: "client";
  ThrottlingReasons?: ThrottlingReason[] | undefined;
  constructor(
    opts: __ExceptionOptionType<RequestLimitExceeded, __BaseException>
  );
}
export declare class ThrottlingException extends __BaseException {
  readonly name: "ThrottlingException";
  readonly $fault: "client";
  throttlingReasons?: ThrottlingReason[] | undefined;
  constructor(
    opts: __ExceptionOptionType<ThrottlingException, __BaseException>
  );
}
export declare class InvalidEndpointException extends __BaseException {
  readonly name: "InvalidEndpointException";
  readonly $fault: "client";
  Message?: string | undefined;
  constructor(
    opts: __ExceptionOptionType<InvalidEndpointException, __BaseException>
  );
}
export declare class ProvisionedThroughputExceededException extends __BaseException {
  readonly name: "ProvisionedThroughputExceededException";
  readonly $fault: "client";
  ThrottlingReasons?: ThrottlingReason[] | undefined;
  constructor(
    opts: __ExceptionOptionType<
      ProvisionedThroughputExceededException,
      __BaseException
    >
  );
}
export declare class ResourceNotFoundException extends __BaseException {
  readonly name: "ResourceNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ResourceNotFoundException, __BaseException>
  );
}
export declare class ItemCollectionSizeLimitExceededException extends __BaseException {
  readonly name: "ItemCollectionSizeLimitExceededException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<
      ItemCollectionSizeLimitExceededException,
      __BaseException
    >
  );
}
export declare class ReplicatedWriteConflictException extends __BaseException {
  readonly name: "ReplicatedWriteConflictException";
  readonly $fault: "client";
  $retryable: {};
  constructor(
    opts: __ExceptionOptionType<
      ReplicatedWriteConflictException,
      __BaseException
    >
  );
}
export declare class ContinuousBackupsUnavailableException extends __BaseException {
  readonly name: "ContinuousBackupsUnavailableException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<
      ContinuousBackupsUnavailableException,
      __BaseException
    >
  );
}
export declare class LimitExceededException extends __BaseException {
  readonly name: "LimitExceededException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<LimitExceededException, __BaseException>
  );
}
export declare class TableInUseException extends __BaseException {
  readonly name: "TableInUseException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<TableInUseException, __BaseException>
  );
}
export declare class TableNotFoundException extends __BaseException {
  readonly name: "TableNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<TableNotFoundException, __BaseException>
  );
}
export declare class GlobalTableAlreadyExistsException extends __BaseException {
  readonly name: "GlobalTableAlreadyExistsException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<
      GlobalTableAlreadyExistsException,
      __BaseException
    >
  );
}
export declare class ResourceInUseException extends __BaseException {
  readonly name: "ResourceInUseException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ResourceInUseException, __BaseException>
  );
}
export declare class TransactionConflictException extends __BaseException {
  readonly name: "TransactionConflictException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<TransactionConflictException, __BaseException>
  );
}
export declare class PolicyNotFoundException extends __BaseException {
  readonly name: "PolicyNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<PolicyNotFoundException, __BaseException>
  );
}
export declare class ExportNotFoundException extends __BaseException {
  readonly name: "ExportNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ExportNotFoundException, __BaseException>
  );
}
export declare class GlobalTableNotFoundException extends __BaseException {
  readonly name: "GlobalTableNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<GlobalTableNotFoundException, __BaseException>
  );
}
export declare class ImportNotFoundException extends __BaseException {
  readonly name: "ImportNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ImportNotFoundException, __BaseException>
  );
}
export declare class DuplicateItemException extends __BaseException {
  readonly name: "DuplicateItemException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<DuplicateItemException, __BaseException>
  );
}
export declare class IdempotentParameterMismatchException extends __BaseException {
  readonly name: "IdempotentParameterMismatchException";
  readonly $fault: "client";
  Message?: string | undefined;
  constructor(
    opts: __ExceptionOptionType<
      IdempotentParameterMismatchException,
      __BaseException
    >
  );
}
export declare class TransactionInProgressException extends __BaseException {
  readonly name: "TransactionInProgressException";
  readonly $fault: "client";
  Message?: string | undefined;
  constructor(
    opts: __ExceptionOptionType<TransactionInProgressException, __BaseException>
  );
}
export declare class ExportConflictException extends __BaseException {
  readonly name: "ExportConflictException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ExportConflictException, __BaseException>
  );
}
export declare class InvalidExportTimeException extends __BaseException {
  readonly name: "InvalidExportTimeException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<InvalidExportTimeException, __BaseException>
  );
}
export declare class PointInTimeRecoveryUnavailableException extends __BaseException {
  readonly name: "PointInTimeRecoveryUnavailableException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<
      PointInTimeRecoveryUnavailableException,
      __BaseException
    >
  );
}
export declare class ImportConflictException extends __BaseException {
  readonly name: "ImportConflictException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ImportConflictException, __BaseException>
  );
}
export declare class TableAlreadyExistsException extends __BaseException {
  readonly name: "TableAlreadyExistsException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<TableAlreadyExistsException, __BaseException>
  );
}
export declare class InvalidRestoreTimeException extends __BaseException {
  readonly name: "InvalidRestoreTimeException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<InvalidRestoreTimeException, __BaseException>
  );
}
export declare class ReplicaAlreadyExistsException extends __BaseException {
  readonly name: "ReplicaAlreadyExistsException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ReplicaAlreadyExistsException, __BaseException>
  );
}
export declare class ReplicaNotFoundException extends __BaseException {
  readonly name: "ReplicaNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<ReplicaNotFoundException, __BaseException>
  );
}
export declare class IndexNotFoundException extends __BaseException {
  readonly name: "IndexNotFoundException";
  readonly $fault: "client";
  constructor(
    opts: __ExceptionOptionType<IndexNotFoundException, __BaseException>
  );
}
export declare class ConditionalCheckFailedException extends __BaseException {
  readonly name: "ConditionalCheckFailedException";
  readonly $fault: "client";
  Item?: Record<string, AttributeValue> | undefined;
  constructor(
    opts: __ExceptionOptionType<
      ConditionalCheckFailedException,
      __BaseException
    >
  );
}
export declare class TransactionCanceledException extends __BaseException {
  readonly name: "TransactionCanceledException";
  readonly $fault: "client";
  Message?: string | undefined;
  CancellationReasons?: CancellationReason[] | undefined;
  constructor(
    opts: __ExceptionOptionType<TransactionCanceledException, __BaseException>
  );
}
