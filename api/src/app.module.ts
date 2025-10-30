import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join, resolve } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloResolver } from './common/graphql/hello.resolver';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './config/constants';
import { FooModule } from './foo/foo.module';
import { ModuleResolver } from './graphql/resolvers/module.resolver';
import { UpdateModuleResolver } from './graphql/resolvers/update-module.resolver';
import { CreateModuleResolver } from './graphql/resolvers/create-module.resolver';
import { DeleteModuleResolver } from './graphql/resolvers/delete-module.resolver';
import { ModuleService } from './account/module.service';
import { AccountResolver } from './graphql/resolvers/account.resolver';
import { CreateAccountResolver } from './graphql/resolvers/create-account.resolver';
import { CreateDepResolver } from './graphql/resolvers/create-dep.resolver';
import { CreateMenuResolver } from './graphql/resolvers/create-menu.resolver';
import { CreatePermResolver } from './graphql/resolvers/create-perm.resolver';
import { CreateRoleResolver } from './graphql/resolvers/create-role.resolver';
import { DeleteAccountResolver } from './graphql/resolvers/delete-account.resolver';
import { DeleteDepResolver } from './graphql/resolvers/delete-dep.resolver';
import { DeleteMenuResolver } from './graphql/resolvers/delete-menu.resolver';
import { DeletePermResolver } from './graphql/resolvers/delete-perm.resolver';
import { DeleteRoleResolver } from './graphql/resolvers/delete-role.resolver';
import { DepResolver } from './graphql/resolvers/dep.resolver';
import { MenuResolver } from './graphql/resolvers/menu.resolver';
import { RoleResolver } from './graphql/resolvers/role.resolver';
import { RoutesResolver } from './graphql/resolvers/routes.resolver';
import { SetRolePermsResolver } from './graphql/resolvers/set-role-perms.resolver';
import { UpdateAccountResolver } from './graphql/resolvers/update-account.resolver';
import { UpdateDepResolver } from './graphql/resolvers/update-dep.resolver';
import { UpdateMenuResolver } from './graphql/resolvers/update-menu.resolver';
import { UpdatePermResolver } from './graphql/resolvers/update-perm.resolver';
import { UpdateRoleResolver } from './graphql/resolvers/update-role.resolver';
import { AccountModule } from './account/account.module';
import { DepService } from './account/dep.service';
import { MenuService } from './account/menu.service';
import { MenuRoleService } from './account/menu-role.service';
import { ModulePermService } from './account/module-perm.service';
import { PermService } from './account/perm.service';
import { RoleMenuService } from './account/role-menu.service';
import { AccountRoleService } from './account/account-role.service';
import { FooService } from './foo/foo.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { AuthModule } from './auth/auth.module';
import { LoginResolver } from './graphql/resolvers/login.resolver';
import { AgentModule } from './ai/agent/agent.module';
import { ModelRuntimeModule } from './ai/model_runtime/model_runtime.module';
import { McpModule } from './ai/mcp/mcp.module';
import { PromptModule } from './ai/prompt/prompt.module';
import { RagModule } from './ai/rag/rag.module';
import { ToolModule } from './ai/tool/tool.module';
import { WorkflowModule } from './ai/workflow/workflow.module';
import { MonieModule } from './monie/monie.module';
import { GlobalLogger } from './logger/logger.service';
import { WinstonLogger } from './logger/winston.service';
import { LoggerModule } from './logger/logger.module';
import { I18nGlobalModule } from './i18n-global/i18n-global.module';
import { ServiceModule } from './service/service.module';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { InternalPluginApiController } from './controllers/internal/plugin/plugin.controller';
import { InternalPluginInvokeController } from './controllers/internal/plugin/invoke.controller';
import { InternalWorkspaceController } from './controllers/internal/workspace/workspace.controller';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { TenantContextGuard } from './common/guards/tenant-context.guard';
import { keyvConfig } from './config/keyv.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './events/event.module';
import { EncryptionModule } from './encryption/encryption.module';
import { EncryptionService } from './encryption/encryption.service';
import { StorageModule } from './storage/storage.module';
import { LocalFileStorage } from './storage/implements/local-file.storage';

@Module({
  imports: [
    AuthModule,
    CoreModule,
    JwtModule.register({
      secret: JWT_CONSTANTS.secret,
      signOptions: { expiresIn: JWT_CONSTANTS.expiresIn }
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      graphiql: true,
      formatError: (formattedError, error) => {
        //console.log('Original error:', error);
        //console.log('Formatted error:', formattedError);
        if (process.env.NODE_ENV === 'production') {
          // 移除堆栈跟踪
          if (formattedError.extensions?.stacktrace) {
            delete formattedError.extensions.stacktrace;
          }
          // 移除其他敏感信息
          if (formattedError.extensions?.exception) {
            delete formattedError.extensions.exception;
          }
          // 隐藏内部错误详情
          if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
            return {
              message: 'Internal server error',
              path: formattedError.path,
              extensions: {
                code: 'INTERNAL_SERVER_ERROR'
              }
            };
          }
        }
        return formattedError;
      }
    }),
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`),
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'), //
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        synchronize: process.env.NODE_ENV !== 'production', // development only
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        poolSize: configService.get<number>('POSTGRES_POOL_SIZE', 10), // 连接池大小
        extra: {
          connectionLimit: configService.get<number>('POSTGRES_CONNECTION_LIMIT', 10), // 连接限制
          acquireTimeout: configService.get<number>('POSTGRES_ACQUIRE_TIMEOUT', 30000), // 获取连接超时时间30s(毫秒milliseconds)
          timeout: configService.get<number>('POSTGRES_TIMEOUT', 30000),           // 查询超时 30 秒
          connectTimeout: configService.get<number>('POSTGRES_CONNECT_TIMEOUT', 10000),    // 连接建立超时 10 秒
          charset: configService.get<string>('POSTGRES_CHARSET', 'utf8mb4'),
          timezone: configService.get<string>('POSTGRES_TIMEZONE', '+08:00'),
        },
        retryAttempts: configService.get<number>('POSTGRES_RETRY_ATTEMPTS', 10),        // 重试次数
        retryDelay: configService.get<number>('POSTGRES_RETRY_DELAY', 3000),        // 重试延迟(毫秒)
        // logging: process.env.NODE_ENV !== 'production',
        // logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    FooModule,
    AccountModule,
    AgentModule,
    ModelRuntimeModule,
    McpModule,
    PromptModule,
    RagModule,
    ToolModule,
    WorkflowModule,
    MonieModule,
    AppModule,
    LoggerModule,
    I18nGlobalModule,
    ServiceModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: keyvConfig,
      inject: [ConfigService],
    }),
    HttpModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        timeout: Number(configService.get<number>('HTTP_TIMEOUT', 5000)),
        maxRedirects: Number(configService.get<number>('HTTP_MAX_REDIRECTS', 5)),
      }),
      inject: [ConfigService,]
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: true,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    EventModule,
    EncryptionModule,
    StorageModule,
  ],
  controllers: [AppController, InternalPluginApiController, InternalPluginInvokeController, InternalWorkspaceController],
  providers: [
    HelloResolver,
    LocalStrategy,
    JwtStrategy,
    JwtService,
    FooService,
    AppService,
    ConfigService,
    DepService,
    MenuService,
    AccountRoleService,
    MenuRoleService,
    RoleMenuService,
    ModuleService,
    ModulePermService,
    PermService,
    ModuleResolver,
    UpdateModuleResolver,
    CreateModuleResolver,
    DeleteModuleResolver,
    AccountResolver,
    CreateAccountResolver,
    CreateDepResolver,
    CreateMenuResolver,
    CreatePermResolver,
    CreateRoleResolver,
    DeleteAccountResolver,
    DeleteDepResolver,
    DeleteMenuResolver,
    DeletePermResolver,
    DeleteRoleResolver,
    DepResolver,
    MenuResolver,
    RoleResolver,
    RoutesResolver,
    SetRolePermsResolver,
    UpdateAccountResolver,
    UpdateDepResolver,
    UpdateMenuResolver,
    UpdatePermResolver,
    UpdateRoleResolver,
    LoginResolver,
    GlobalLogger,
    WinstonLogger,
    TenantContextGuard,
    EncryptionService,
    LocalFileStorage,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(AuthMiddleware)
    //   .forRoutes('graphql');

    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('/internal/api');
  }
}
