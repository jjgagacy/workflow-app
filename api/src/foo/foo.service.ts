import { Injectable } from "@nestjs/common";

@Injectable()
export class FooService {
    // This service currently has no methods or properties.
    // It can be extended in the future as needed.
    hello(): string {
        return "Hello from FooService!";
    }
}