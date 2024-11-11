import type { SsoProfile } from "@aws-sdk/credential-provider-sso";
import type { CredentialProviderOptions } from "@aws-sdk/types";
import type { IniSection, Profile } from "@smithy/types";
/**
 * @internal
 */
export declare const resolveSsoCredentials: (profile: string, profileData: IniSection, options?: CredentialProviderOptions) => Promise<import("@aws-sdk/types").AttributedAwsCredentialIdentity>;
/**
 * @internal
 * duplicated from \@aws-sdk/credential-provider-sso to defer import.
 */
export declare const isSsoProfile: (arg: Profile) => arg is Partial<SsoProfile>;
