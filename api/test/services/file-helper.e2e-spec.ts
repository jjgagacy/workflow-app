import { AppModule } from "@/app.module";
import { FileHelper } from "@/service/libs/helpers/file.helper";
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";

describe('FileHelper (e2e)', () => {
  let app: INestApplication<App>;
  let fileHelper: FileHelper;
  const mockFileId = 'test-file-id-123';
  const mockTimestamp = '1672531200000'; // 2023-01-01
  const mockNonce = 'test-nonce-123456';
  const mockSignature = 'mocked-signature-hex';
  const mockSecretKey = 'test-secret-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    fileHelper = app.get<FileHelper>(FileHelper);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(fileHelper).toBeDefined();
    })
  });

  describe('extractFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(fileHelper.extractFileExtension('image.jpg')).toBe('jpg');
      expect(fileHelper.extractFileExtension('archive.tar.gz')).toBe('gz');
      expect(fileHelper.extractFileExtension('file-without-extension')).toBe('');
      expect(fileHelper.extractFileExtension('.hiddenfile')).toBe('');
    })

    it('should return lowercase extension', () => {
      expect(fileHelper.extractFileExtension('image.JPG')).toBe('jpg');
      expect(fileHelper.extractFileExtension('document.PDF')).toBe('pdf');
    })
  });

  describe('validateFilename', () => {
    it('should accept valid filename', () => {
      const validNames = [
        'test.jpg',
        'my-document.pdf',
        'file_with_underscores.txt',
        'File-With-Caps.PNG',
        '2023-01-01-document.docx',
      ];
      validNames.forEach(name => {
        expect(() => fileHelper.validateFilename(name)).not.toThrow();
        expect(fileHelper.validateFilename(name)).toBe(name);
      })
    });

    it('should throw error for invalid name', () => {
      const invalidNames = [
        'test/file.jpg',
        'document\\path.pdf',
        'file:name.txt',
        'test*star.png',
        'question?.jpg',
        'quote".txt',
        'less<than.jpg',
        'greater>than.pdf',
        'pipe|symbol.png',
      ];
      invalidNames.forEach(name => {
        expect(() => fileHelper.validateFilename(name)).toThrow();
      })
    });

    it('should truncate filename if too long', () => {
      // 创建超长文件名 (210个字符)
      const longName = 'a'.repeat(200) + '.jpg';
      const truncated = fileHelper.validateFilename(longName);

      expect(truncated.length).toBeLessThanOrEqual(200);
      expect(truncated.endsWith('.jpg')).toBe(true);
    });

    it('should handle long filename with short extension', () => {
      const longName = 'a'.repeat(195) + '.jpg'; // 总共199个字符
      expect(fileHelper.validateFilename(longName)).toBe(longName);
    });
  });

  describe('generateFileSignature', () => {
    it('should generate signature with correct structure', () => {
      const result = fileHelper.generateFileSignature(mockFileId);

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('sign');
    })
  });

  describe('verifyFileSignature', () => {
    it('should return value for valid signature', () => {
      const result = fileHelper.generateFileSignature(mockFileId);
      const verify = fileHelper.verifyFileSignature(mockFileId, result.timestamp, result.nonce, result.sign);
      expect(verify).toBe(true);
    })
  });

  describe('verifyFileSignature (permanent)', () => {
    it('should return value for valid permanent signature', () => {
      const result = fileHelper.generateFileSignature(mockFileId, { permanent: true });
      const verify = fileHelper.verifyFileSignature(mockFileId, result.timestamp, result.nonce, result.sign);
      expect(verify).toBe(true);
    })
  });

  afterAll(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    await app.close();
  });
});
