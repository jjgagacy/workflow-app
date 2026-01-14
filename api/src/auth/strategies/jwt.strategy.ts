import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request as RequestType } from 'express';
import { JWT_CONSTANTS } from "@/config/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.secret
    })
  }

  // return value of validate will be attached to the Request object
  async validate(payload: any) {
    return { id: payload.sub, name: payload.name };
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'token' in req.cookies && req.cookies.token.length > 0) {
      return req.cookies.token;
    }
    const auth = req.get('Authorization');
    if (auth !== undefined && auth.length > 0) {
      return auth.split(' ')[1] || null;
    }
    return null;
  }
}


// https://tigran.tech/nestjs-cookie-based-jwt-authentication/
// https://docs.nestjs.com/techniques/cookies
// https://docs.nestjs.com/recipes/passport#implementing-passport-strategies
