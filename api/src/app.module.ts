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
import { APP_GUARD } from '@nestjs/core';
import { UniversalThrottlerGuard } from './common/guards/universal-throttler.guard';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { EnableEmailPasswordLoginGuard } from './common/guards/auth/enable-email-password-login.guard';
import { DateScalar } from './common/graphql/scalars/date.scalar';
import { WorkspaceResolver } from './graphql/workspace/resolvers/workspace.resolver';
import { ModelProviderListResolver } from './graphql/workspace/resolvers/model-providers.resolver';
import { PluginModule } from './ai/plugin/plugin.module';
import { BasePluginClient } from './monie/classes/base-plugin-client';
import { PluginModelClientService } from './ai/plugin/services/plugin-model-client.service';
import { AccountResolver } from './graphql/account/account/resolvers/account.resolver';
import { CreateAccountResolver } from "./graphql/account/account/resolvers/account.resolver";
import { DeleteAccountResolver } from "./graphql/account/account/resolvers/account.resolver";
import { LoginResolver } from './graphql/account/account/resolvers/login.resolver';
import { ChangeEmailResolver, UpdateAccountFieldsResolver } from "./graphql/account/account/resolvers/update-account.resolver";
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
import { ForgetPasswordResolver } from './graphql/account/account/resolvers/forget-password.resolver';
import { SetTenantMiddleware } from './common/middleware/set-tenant.middleware';
import { UniversalAuthGuard } from './common/guards/universal-auth.guard';
import { FilesController } from './controllers/api/files.controller';
import { PreviewController } from './controllers/files/preview.controller';
import { TenantAccountService } from './service/tenant.service';
import { ModelProvidersResolver } from './graphql/marketplace/resolvers/model-providers.resolver';
import { PluginResolver } from './graphql/workspace/resolvers/plugin.resolver';
import { ModelResolver } from './graphql/workspace/resolvers/model.resolver';
import { ThrottlerConfig } from './config/throttler.config';
import { TypeOrmConfig } from './config/typeorm.config';
import { GraphQLFormatError } from './config/graphql.config';
import { BullConfig } from './config/bull.config';
import { TaskModule } from './tasks/task.module';

// const isWorkerThread = !require.main?.filename.includes('worker');
// console.log(`AppModule loaded in ${isWorkerThread ? 'main thread' : 'worker thread'}`);

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
      formatError: GraphQLFormatError,
    }),
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`),
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeOrmConfig,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ThrottlerConfig,
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
      useFactory: BullConfig,
    }),
    MailModule,
    PluginModule,
    ModelRuntimeModule,
    TaskModule,
  ],
  controllers: [
    AppController,
    FilesController,
    InternalPluginApiController,
    InternalPluginInvokeController,
    InternalWorkspaceController,
    PreviewController,
  ],
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
    TenantAccountService,
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
    { provide: APP_GUARD, useClass: UniversalAuthGuard },
    MailService,
    EnableEmailPasswordLoginGuard,
    UpdateAccountFieldsResolver,
    DateScalar,
    WorkspaceResolver,
    ModelProviderListResolver,
    ModelResolver,
    BasePluginClient,
    PluginModelClientService,
    SignUpResolver,
    ForgetPasswordResolver,
    ChangeEmailResolver,
    ModelProvidersResolver,
    PluginResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SetTenantMiddleware)
      .forRoutes('/graphql', '/api/*path');

    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('/internal/api/*path');
  }
}
