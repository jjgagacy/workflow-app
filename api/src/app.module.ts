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
import { ModuleService } from './account/module.service';
import { RoutesResolver } from './graphql/account/routes/routes.resolver';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { UniversalThrottlerGuard } from './common/guards/universal-throttler.guard';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { EnableEmailPasswordLoginGuard } from './common/guards/auth/enable-email-password-login.guard';
import { DateScalar } from './common/graphql/scalars/date.scalar';
import { WorkspaceResolver } from './graphql/workspace/resolvers/workspace.resolver';
import { ModelProviderResolver } from './graphql/workspace/resolvers/model-provider.resolver';
import { PluginModule } from './ai/plugin/plugin.module';
import { BasePluginClient } from './monie/classes/base-plugin-client';
import { PluginModelClientService } from './ai/plugin/services/model-client.service';
import { AccountResolver } from './graphql/account/account/resolvers/account.resolver';
import { CreateAccountResolver } from './graphql/account/account/resolvers/create-account.resolver';
import { DeleteAccountResolver } from './graphql/account/account/resolvers/delete-account.resolver';
import { LoginResolver } from './graphql/account/account/resolvers/login.resolver';
import { UpdateAccountFieldsResolver } from './graphql/account/account/resolvers/update-account-fields.resolver';
import { UpdateAccountResolver } from './graphql/account/account/resolvers/update-account.resolver';
import { CreateDepResolver } from './graphql/account/dep/resolvers/create-dep.resolver';
import { DeleteDepResolver } from './graphql/account/dep/resolvers/delete-dep.resolver';
import { DepResolver } from './graphql/account/dep/resolvers/dep.resolver';
import { UpdateDepResolver } from './graphql/account/dep/resolvers/update-dep.resolver';
import { CreateMenuResolver } from './graphql/account/menu/resolvers/create-menu.resolver';
import { DeleteMenuResolver } from './graphql/account/menu/resolvers/delete-menu.resolver';
import { MenuResolver } from './graphql/account/menu/resolvers/menu.resolver';
import { UpdateMenuResolver } from './graphql/account/menu/resolvers/update-menu.resolver';
import { CreateModuleResolver } from './graphql/account/module/resolvers/create-module.resolver';
import { DeleteModuleResolver } from './graphql/account/module/resolvers/delete-module.resolver';
import { ModuleResolver } from './graphql/account/module/resolvers/module.resolver';
import { UpdateModuleResolver } from './graphql/account/module/resolvers/update-module.resolver';
import { CreatePermResolver } from './graphql/account/perm/resolvers/create-perm.resolver';
import { DeletePermResolver } from './graphql/account/perm/resolvers/delete-perm.resolver';
import { SetRolePermsResolver } from './graphql/account/role/resolvers/set-role-perms.resolver';
import { UpdatePermResolver } from './graphql/account/perm/resolvers/update-perm.resolver';
import { CreateRoleResolver } from './graphql/account/role/resolvers/create-role.resolver';
import { DeleteRoleResolver } from './graphql/account/role/resolvers/delete-role.resolver';
import { RoleResolver } from './graphql/account/role/resolvers/role.resolver';
import { UpdateRoleResolver } from './graphql/account/role/resolvers/update-role.resolver';
import { SignUpResolver } from './graphql/account/account/resolvers/signup.resolver';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ForgetPasswordResolver } from './graphql/account/account/resolvers/forget-password.resolver';
import { SetTenantMiddleware } from './common/middleware/set-tenant.middleware';

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
      context: ({ req, res }) => ({ req, res }),
      csrfPrevention: process.env.NODE_ENV !== 'production',
      formatError: (formattedError, error) => {
        // console.log('Original error:', error);
        // console.log('Formatted error:', formattedError);
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
              message: 'Internal Server Error',
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
        logging: process.env.NODE_ENV !== 'production',
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000, // 1 second
            limit: process.env.NODE_ENV !== 'production' ? 100 : 3,   // 3 requests per second
          },
          {
            name: 'medium',
            ttl: 10000, // 10 seconds
            limit: process.env.NODE_ENV !== 'production' ? 100 : 20,  // 20 requests per 10 seconds
          },
          {
            name: 'long',
            ttl: 60000, // 1 minute
            limit: process.env.NODE_ENV !== 'production' ? 500 : 100, // 100 requests per minute
          },
        ]
      })
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
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
        prefix: 'queue',
        // 其他全局设置
        defaultJobOptions: {
          removeOnComplete: 100, // 保留最近100个完成的任务
          removeOnFail: 100,     // 保留最近100个失败的任务
          attempts: 3,           // 默认重试3次
          backoff: {             // 重试策略
            type: 'exponential',
            delay: 1000,
          },
        },
        // 连接设置
        settings: {
          lockDuration: 30000,   // 任务锁持续时间(ms)
          stalledInterval: 30000, // 检查卡住任务的间隔
          maxStalledCount: 1,    // 最大卡住次数
        }
      }),
    }),
    MailModule,
    PluginModule,
    ModelRuntimeModule,
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
    { provide: APP_GUARD, useClass: UniversalThrottlerGuard },
    MailService,
    EnableEmailPasswordLoginGuard,
    UpdateAccountFieldsResolver,
    DateScalar,
    WorkspaceResolver,
    ModelProviderResolver,
    BasePluginClient,
    PluginModelClientService,
    SignUpResolver,
    ForgetPasswordResolver,
    //    { provide: APP_FILTER, useClass: GraphQLExceptionFilter },
    // { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(AuthMiddleware)
    //   .forRoutes('graphql');
    consumer
      .apply(SetTenantMiddleware)
      .forRoutes('graphql');

    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('/internal/api');
  }
}
