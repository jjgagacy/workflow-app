import { ProviderModelStatus } from "./provider-model-status.class";
import { SimpleProvider } from "./simple-provider.class";

export class ModelWithProvider extends ProviderModelStatus {
    provider: SimpleProvider;
}
