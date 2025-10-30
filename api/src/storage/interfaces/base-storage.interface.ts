import { Readable } from "stream";
import { ListOptions } from "../types/storage.types";

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
    list?(dirPath: string, options?: ListOptions): Promise<string[]>;
}
