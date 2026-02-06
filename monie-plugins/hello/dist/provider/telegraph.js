import { ToolProvider } from "monie-plugin";
export class TelegraphProvider extends ToolProvider {
    async validateCredentials(credentials) {
        if (!credentials.accessToken) {
            throw new Error("Telegraph access token is required");
        }
        if (typeof credentials.accessToken !== "string") {
            throw new Error("Telegraph access token must be a string");
        }
        if (credentials.accessToken.trim().length === 0) {
            throw new Error("Telegraph access token cannot be empty");
        }
    }
}
//# sourceMappingURL=telegraph.js.map