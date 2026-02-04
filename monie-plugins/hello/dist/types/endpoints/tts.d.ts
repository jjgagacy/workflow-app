import { Endpoint, Request, Response } from 'monie-plugin';
export declare class PinkTTS extends Endpoint {
    invoke(request: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response>;
    private createErrorResponse;
    private createStreamingResponse;
    private extractParameters;
    private validateInput;
    private createDirectResponse;
}
//# sourceMappingURL=tts.d.ts.map