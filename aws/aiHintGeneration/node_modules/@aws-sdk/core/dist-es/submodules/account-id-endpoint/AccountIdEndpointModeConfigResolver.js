import { normalizeProvider } from "@smithy/util-middleware";
import { DEFAULT_ACCOUNT_ID_ENDPOINT_MODE, validateAccountIdEndpointMode, } from "./AccountIdEndpointModeConstants";
export const resolveAccountIdEndpointModeConfig = (input) => {
    const accountIdEndpointModeProvider = normalizeProvider(input.accountIdEndpointMode ?? DEFAULT_ACCOUNT_ID_ENDPOINT_MODE);
    return {
        ...input,
        accountIdEndpointMode: async () => {
            const accIdMode = await accountIdEndpointModeProvider();
            if (!validateAccountIdEndpointMode(accIdMode)) {
                throw new Error(`Invalid value for accountIdEndpointMode: ${accIdMode}. Valid values are: "required", "preferred", "disabled".`);
            }
            return accIdMode;
        },
    };
};
