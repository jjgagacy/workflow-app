import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { ModelWithProvider } from "@/ai/model_runtime/classes/provider-model-status.class";
import { FieldModelSchema, Provider, SimpleProvider } from "@/ai/model_runtime/classes/provider.class";
import { FetchFrom, ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { ModelStatus } from "@/ai/model_runtime/enums/model-status.enum";
import { FormType } from '@/ai/model_runtime/entities/form.entity';

describe("ModelProvider (e2e)", () => {

  describe("ModelWithProvider", () => {
    it('raiseForStatus() not throw', () => {
      const modelWithStatus = new ModelWithProvider({
        model: 'gpt-4',
        modelType: ModelType.LLM,
        modelProperties: {},
        label: { zh_Hans: 'GPT-4', en_US: 'GPT-4' },
        status: ModelStatus.ACTIVE,
        fetchFrom: FetchFrom.CUSTOMIZABLE_MODEL,
        loadBalancingEnabled: true,
        provider: new SimpleProvider()
      });
      modelWithStatus.raiseForStatus();
    });

    it('SimpleProvider create', () => {
      const simpleProvider = new SimpleProvider();
      simpleProvider.provider = 'openai';
      simpleProvider.supportedModelTypes = [ModelType.LLM, ModelType.TEXT_EMBEDDING];
    });

    it('toSimpleProvider create', () => {
      const provider = new Provider({
        provider: 'openai',
        label: { zh_Hans: 'OpenAI', en_US: 'OpenAI' },
        description: { zh_Hans: 'OpenAI提供的模型', en_US: 'Models provided by OpenAI' },
        supportedModelTypes: [ModelType.LLM, ModelType.TEXT_EMBEDDING],
        providerCredentialSchema: {},
        modelCredentialSchema: {
          model: new FieldModelSchema({ zh_Hans: '模型名称', en_US: 'Model Name' }),
          credentialFormSchema: [
            {
              label: { zh_Hans: 'API密钥', en_US: 'API Key' },
              variable: 'apiKey',
              type: FormType.ANY,
              required: true,
              placeholder: { zh_Hans: '请输入API密钥', en_US: 'Please enter the API key' },
              maxLength: 1000,
            }
          ]
        },
        configMethod: [],
        models: [],
      });
      provider.provider = 'openai';
      provider.supportedModelTypes = [ModelType.LLM, ModelType.TEXT_EMBEDDING];

      const simpleProvider = provider.toSimpleProvider();
      console.log(simpleProvider.provider);
    });
  });

});