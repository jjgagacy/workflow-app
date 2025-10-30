import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { LocalFileStorage } from '@/storage/implements/local-file.storage';
import { existsSync, mkdirSync, readFileSync, rmdirSync, rmSync } from 'fs';
import { join } from 'path';
import { Transform } from 'stream';
import { pipeline } from "node:stream/promises";
import { Readable } from 'node:stream';

describe('LocalFileStorage (e2e)', () => {
    let app: INestApplication<App>;
    let storage: LocalFileStorage;
    const testDir = 'test';
    const testFileName = 'test-file.txt';
    const testFileContent = 'Hello, World! 测试数据 🚀';
    const testBinaryContent = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]); // "Hello World" in binary

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        storage = app.get<LocalFileStorage>(LocalFileStorage);
    });

    beforeEach(async () => {
        if (existsSync(storage.getFullPath(testDir))) {
            rmSync(storage.getFullPath(testDir), { recursive: true });
        }
        mkdirSync(storage.getFullPath(testDir), { recursive: true });
    });

    describe('save operations', () => {
        it('should save test data successfully', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);

            const filePath = join(storage.getFullPath(testDir), testFileName);
            expect(existsSync(filePath)).toBe(true);

            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toBe(testFileContent);
        });

        it('should save binary data successfully', async () => {
            const bFname = 'binary-file.bin';
            await storage.save(join(testDir, bFname), testBinaryContent);

            const filePath = join(storage.getFullPath(testDir), bFname);
            expect(existsSync(filePath)).toBe(true);

            const fileContent = readFileSync(filePath);
            expect(fileContent).toEqual(testBinaryContent);
        });

        it('should overrite existing file', async () => {
            const newContent = 'This is new content';

            await storage.save(join(testDir, testFileName), newContent);
            await storage.save(join(testDir, testFileName), newContent);

            const filePath = join(storage.getFullPath(testDir), testFileName);
            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toBe(newContent);
        });

        it('should handle very large text data', async () => {
            const largeContent = 'a'.repeat(1024 * 1024); // 1MB
            await storage.save(join(testDir, testFileName), largeContent);

            const filePath = join(storage.getFullPath(testDir), testFileName);
            const fileContent = readFileSync(filePath, 'utf-8');
            expect(fileContent).toBe(largeContent);
        });
    });


    describe('load operations', () => {
        it('should load file content', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);

            const content = await storage.load(join(testDir, testFileName));
            expect(content.toString('utf-8')).toBe(testFileContent);
        });

        it('should load binary file content', async () => {
            const bFname = 'binary-file.bin';
            await storage.save(join(testDir, bFname), testBinaryContent);

            const content = await storage.load(join(testDir, bFname));
            expect(content).toEqual(testBinaryContent);
        });

        it('should throw error when loading non-existent file', async () => {
            await expect(storage.load('non-existent.txt')).rejects.toThrow();
        });
    });

    describe('loadStream operations', () => {
        it('should stream file content correctly', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);
            const stream = await storage.loadStream(join(testDir, testFileName));

            return new Promise<void>((resolve, reject) => {
                let receivedData = '';

                stream.on('data', (chunk) => {
                    receivedData += chunk.toString('utf8');
                });

                stream.on('end', () => {
                    try {
                        expect(receivedData).toBe(testFileContent);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('error', reject);
            });
        });

        it('should stream file content correctly (pipeline)', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);
            const stream = await storage.loadStream(join(testDir, testFileName));

            const chunks: Buffer[] = [];
            const collectStream = new Transform({
                transform(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback(null, chunk);
                }
            });
            await pipeline(stream, collectStream);

            const receivedData = Buffer.concat(chunks).toString('utf-8');
            expect(receivedData).toBe(testFileContent);
        });

        it('should stream file content correctly (pipeline string)', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);
            const stream = await storage.loadStream(join(testDir, testFileName));

            let receivedData = '';
            await pipeline(
                stream,
                async function* (source: Readable) {
                    for await (const chunk of source) {
                        receivedData += chunk.toString('utf-8');
                        yield chunk;
                    }
                }
            );
            expect(receivedData).toBe(testFileContent);
        });

        it('should stream file content correctly (pipeline buffer)', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);
            const stream = await storage.loadStream(join(testDir, testFileName));

            const chunks: Buffer[] = [];
            await pipeline(
                stream,
                async function* (source: Readable) {
                    for await (const chunk of source) {
                        chunks.push(chunk);
                        yield chunk;
                    }
                }
            );
            const receivedData = Buffer.concat(chunks).toString('utf8');
            expect(receivedData).toBe(testFileContent);
        });
    });

    describe('copy operation', () => {
        it('should copy file to target path', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);
            const targetPath = join(testDir, 'dest.txt');

            await storage.copy(join(testDir, testFileName), storage.getFullPath(targetPath));

            expect(existsSync(storage.getFullPath(targetPath))).toBe(true);

            const originalContent = readFileSync(storage.getFullPath(join(testDir, testFileName)), 'utf-8');
            const destContent = readFileSync(storage.getFullPath(targetPath), 'utf-8');
            expect(originalContent).toBe(destContent);
        });
    });

    describe('exists operation', () => {
        it('should return true for existing file', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);

            const exists = await storage.exists(join(testDir, testFileName));
            expect(exists).toBe(true);
        });

        it('it should return false for non-exist file', async () => {
            const exists = await storage.exists(join(testDir, 'non-existent.txt'));
            expect(exists).toBe(false);
        });
    });

    describe('delete operation', () => {
        it('should delete existing file', async () => {
            await storage.save(join(testDir, testFileName), testFileContent);

            let exists = await storage.exists(join(testDir, testFileName));
            expect(exists).toBe(true);

            await storage.delete(join(testDir, testFileName));

            exists = await storage.exists(join(testDir, testFileName));
            expect(exists).toBe(false);
        });

        it('should not throw error when deleting non-existent file', async () => {
            await expect(storage.delete('non-existent.txt')).resolves.not.toThrow();
        });
    });

    describe('listDirectory', () => {
        it('should list files and directories', async () => {
            await storage.save(join(testDir, 'file1.txt'), 'content1');
            await storage.save(join(testDir, 'file2.txt'), 'content2');

            const items = await storage.list(join(testDir, '.'), { files: true });
            expect(items).toContain(join(testDir, 'file1.txt'));
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
