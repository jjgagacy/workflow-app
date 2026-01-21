import { I18nTranslations } from "@/generated/i18n.generated";
import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

export class FileTooLargeError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE);
    this.name = 'FileTooLargeError';
  }

  static create(i18n: I18nService<I18nTranslations>): FileTooLargeError {
    return new FileTooLargeError(i18n.t('common.FILE.FILE_TOO_LARGE'));
  }
}

export class UnsupportedFileTypeError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    this.name = 'UnsupportedFileTypeError';
  }

  static create(i18n: I18nService<I18nTranslations>): UnsupportedFileTypeError {
    return new FileTooLargeError(i18n.t('common.FILE.UNSUPPORTED_FILE_TYPE'));
  }
}

export class InvalidFilenameError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFilenameError';
  }

  static create(i18n: I18nService<I18nTranslations>): InvalidFilenameError {
    return new InvalidFilenameError(i18n.t('common.FILE.INVALID_FILENAME'));
  }
}

export class FileNotFoundError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'FileNotFoundError';
  }

  static create(i18n: I18nService<I18nTranslations>): FileNotFoundError {
    return new FileNotFoundError(i18n.t('common.FILE.FILE_NOT_FOUND'));
  }
}

export class InvalidSignatureError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'InvalidSignatureError';
  }

  static create(i18n: I18nService<I18nTranslations>): InvalidSignatureError {
    return new InvalidSignatureError(i18n.t('common.FILE.INVALID_SIGNATURE'));
  }
}

