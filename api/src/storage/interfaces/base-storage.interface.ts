import { Readable } from "stream";

export interface BaseStorage {
    // Save data to storage
    save(filename: string, data: Buffer | string): Promise<void>;
    // Load entire file content
    load(filename: string): Promise<Buffer>;
    // Load file content as stream
    loadStream(filename: string): Promise<Readable>;
    // Copy file to local path
    copy(filename: string, targetPath: string): Promise<void>;
    // Check if file exists
    exists(filename: string): Promise<boolean>;
    // Delete file
    delete(filename: string): Promise<void>;
    // list files and directories 
    list?(path: string, options?: { files?: boolean; directories?: boolean }): Promise<string[]>;
}
