import { ModelType } from "src/model_runtime/enums/model-runtime.enum";
import { ModelTypeUtil } from "src/model_runtime/utils/model-type.util";

describe("ModelType (e2e)", () => {

    describe("ModelType Util", () => {
        it('toValue() util function', () => {
            const llm = ModelType.LLM;
            const llm_value = ModelTypeUtil.toValue(llm);
            expect(llm_value).toBe('text-generation');
        });

        it('valueOf() util function', () => {
            const llm_object = ModelTypeUtil.valueOf('text-generation');
            expect(llm_object).toBe(ModelType.LLM);
        });

        it('valueOf() should throw error for invalid value', () => {
            expect(() => {
                ModelTypeUtil.valueOf("no-exists");
            }).toThrow();
        });

    });
});