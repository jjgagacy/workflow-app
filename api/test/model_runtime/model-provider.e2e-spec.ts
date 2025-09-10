import { ModelWithProvider } from "src/model_runtime/classes/model-with-provider.class";
import { Provider } from "src/model_runtime/classes/provider.class";
import { SimpleProvider } from "src/model_runtime/classes/simple-provider.class";
import { ModelType } from "src/model_runtime/enums/model-runtime.enum";
import { ModelStatus } from "src/model_runtime/enums/model-status.enum";

describe("ModelProvider (e2e)", () => {

    describe("ModelWithProvider", () => {
        it('raiseForStatus() not throw', () => {
            const modelWithStatus = new ModelWithProvider();
            modelWithStatus.model = 'gpt-4';
            modelWithStatus.modelType = ModelType.LLM;
            modelWithStatus.status = ModelStatus.ACTIVE;
            modelWithStatus.loadBalancingEnabled = true;
            modelWithStatus.raiseForStatus();
        });

        it('SimpleProvider create', () => {
            const simpleProvider = new SimpleProvider();
            simpleProvider.provider = 'openai';
            simpleProvider.supportedModelTypes = [ModelType.LLM, ModelType.TEXT_EMBEDDING];
        });

        it('toSimpleProvider create', () => {
            const provider = new Provider();
            provider.provider = 'openai';
            provider.supportedModelTypes = [ModelType.LLM, ModelType.TEXT_EMBEDDING];

            const simpleProvider = provider.toSimpleProvider();
            console.log(simpleProvider.provider);
        });
    });

});