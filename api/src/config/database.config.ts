import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const dbConfig = async (configService: ConfigService) => {
  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USERNAME'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DATABASE'),
    synchronize: process.env.NODE_ENV !== 'production', // development only
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    // logging: process.env.NODE_ENV !== 'production',
    // logger: 'advanced-console',
  } as TypeOrmModuleOptions | Promise<TypeOrmModuleOptions>;
}