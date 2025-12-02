import { sum } from "monie-plugin";

async function bootstrap() {
  console.log('Starting application...');
  console.log('Sum of 1, 2 is ', sum(1, 2))
}

bootstrap();
