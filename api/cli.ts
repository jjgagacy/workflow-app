import { CommandFactory } from 'nest-commander';
import { CliModule } from './src/cli/cli.module';

async function bootstrap() {
  process.env.LOG_LEVEL = 'error';
  process.env.NODE_ENV = 'production';
  process.env.IS_CLI = 'true';

  await CommandFactory.run(CliModule, {
    logger: false,
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
