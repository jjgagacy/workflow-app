import { Test } from "@nestjs/testing";
import { FooService } from "src/foo/foo.service"

describe("Foo (e2e)", () => {
    let fooService: FooService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [FooService],
        }).compile();

        fooService = module.get<FooService>(FooService);
    });

    describe("getHello", () => {
        it("should return 'Hello from FooService!'", async () => {
            const result = await fooService.hello();
            expect(result).toBe("Hello from FooService!");
        });
    });

    // 可以添加更多测试用例
    describe('扩展功能', () => {
        it('当添加新方法时应该通过测试', () => {
            // 这里可以作为未来扩展的测试模板
            expect(fooService).toBeDefined();
        });
    });
});