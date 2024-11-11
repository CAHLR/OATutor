import { SsoProfile } from "@aws-sdk/credential-provider-sso";
import { CredentialProviderOptions } from "@aws-sdk/types";
import { IniSection, Profile } from "@smithy/types";
export declare const resolveSsoCredentials: (
  profile: string,
  profileData: IniSection,
  options?: CredentialProviderOptions
) => Promise<import("@aws-sdk/types").AttributedAwsCredentialIdentity>;
export declare const isSsoProfile: (arg: Profile) => arg is Partial<SsoProfile>;
