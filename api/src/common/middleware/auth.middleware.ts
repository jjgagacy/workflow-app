import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    if (!req.headers.authorization) {
      throw new Error("Not authenticated");
    }
    next();
  }
}
