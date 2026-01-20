export type StorageType = 'local_file' | 'opendal';

export interface ListOptions {
  files?: boolean;
  directories?: boolean;
}
