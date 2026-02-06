import { Endpoint, ToolInvokeMessage } from "monie-plugin";
export class Duck extends Endpoint {
    async invoke(r, values, settings) {
        const duckSounds = ["quack", "quack-quack", "quaaaack"];
        const randomSound = duckSounds[Math.floor(Math.random() * duckSounds.length)];
        return ToolInvokeMessage.createJson({
            statusCode: 200,
            body: {
                message: `Duck says: ${randomSound}`,
                timestamp: new Date().toISOString()
            }
        });
    }
}
//# sourceMappingURL=duck.js.map