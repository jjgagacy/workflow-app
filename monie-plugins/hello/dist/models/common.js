"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCredentialsOptions = toCredentialsOptions;
function toCredentialsOptions(credentials) {
    const options = {
        apiKey: credentials['openai_api_key'],
        maxRetries: 1,
        timeout: 300000,
    };
    if (credentials['openai_api_base']) {
        const base = credentials['openai_api_base'].replace(/\/$/, '');
        options.baseURL = base;
    }
    if (credentials['openai_organization']) {
        // options.organization = credentials['openai_organization'];
    }
    return options;
}
//# sourceMappingURL=common.js.map