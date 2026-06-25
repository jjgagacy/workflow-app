import { FileTransferMethod, FileType } from "./file.enum";

export interface FileConfig {
  id?: string;
  tenantId: string;
  type: FileType;
  transferMethod: FileTransferMethod;
  name?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  storageKey?: string;
  url?: string;
  relatedId?: string | null;
}

export class File {
  public id?: string | null;
  public remoteUrl?: string | null;
  public relatedId?: string | null;
  public filename?: string | null;
  public extension?: string | null;
  public mimeType?: string | null;
  public size?: number;

  public storageKey?: string;

  private constructor(
    readonly tenant_id: string,
    readonly type: FileType,
    readonly transferMethod: FileTransferMethod,
  ) { }

  static create(config: FileConfig): File {
    const file = new File(config.tenantId, config.type, config.transferMethod);
    file.id = config.id || null;
    file.remoteUrl = config.transferMethod === FileTransferMethod.REMOTE_URL ? config.url || null : null;
    file.relatedId = config.relatedId || null; // 关联的其他实体ID，初始为null
    file.filename = config.name || null;
    file.extension = config.extension || null;
    file.mimeType = config.mimeType || null;
    file.size = config.size || 0;
    file.storageKey = config.storageKey || '';
    // 调用 validate 方法进行验证
    file.validate();
    return file;
  }

  private validate(): void {
    switch (this.transferMethod) {
      case FileTransferMethod.REMOTE_URL:
        if (!this.remoteUrl) {
          throw new Error('Remote URL is required for REMOTE_URL transfer method.');
        }
        if (typeof this.remoteUrl !== 'string' || !this.remoteUrl.startsWith('http')) {
          throw new Error('Invalid remote URL format.');
        }
        break;
      case FileTransferMethod.LOCAL_FILE:
        if (!this.storageKey) {
          throw new Error('Storage key is required for LOCAL_FILE transfer method.');
        }
        if (!this.relatedId) {
          throw new Error('Related ID is required for LOCAL_FILE transfer method.');
        }
        break;
      default:
        throw new Error(`Unsupported transfer method: ${this.transferMethod}`);
    }
  }

}