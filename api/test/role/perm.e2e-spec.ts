import { BaseModulePermDto } from "@/account/perm/dto/base-module-perm.dto";
import { CreatePermDto } from "@/account/perm/dto/create-perm.dto";
import { validate } from "class-validator";

describe('BaseModulePermDto Tests', () => {
    it('should validate when key is provided', async () => {
        const dto = new BaseModulePermDto();

        dto.key = "test_key";
        dto.restrictLevel = 1;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail validation when key is empty', async () => {
        const dto = new BaseModulePermDto();
        dto.key = "";

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
});

describe('CreatePermDto Tests', () => {
    it('should fail validation when name is empty', async () => {
        const dto = new CreatePermDto();
        dto.key = "test_key";
        dto.name = "";
        dto.level = 1;

        const errors = await validate(dto);

        console.log(errors.toString());


    })
})