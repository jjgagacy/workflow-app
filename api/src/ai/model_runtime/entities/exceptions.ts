import { InternalServerErrorException } from "@nestjs/common";

export class DatabaseRecordCreatedError extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseRecordCreatedError';
  }
}
