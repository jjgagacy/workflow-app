import { API_PREFIX, PUBLIC_API_PREFIX } from "@/config";

// 定义 Upload 函数的选项类型
interface UploadOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  data?: any;
  token?: string;
  xhr: XMLHttpRequest;
  onProgress?: (progress: number) => void;
  // 其他可能的选项
  [key: string]: any;
}

// 定义 Upload 函数的参数类型
interface UploadFunctionParams {
  options: UploadOptions;
  isPublicApi?: boolean;
  url?: string;
  searchParams?: string;
}

export async function Uploader({ options, isPublicApi = false, url, searchParams }: UploadFunctionParams): Promise<any> {
  const urlPrefix = isPublicApi ? PUBLIC_API_PREFIX : API_PREFIX;
  const token = options.token || '';
  const xhr = options.xhr;
  const defaultOptions = {
    method: 'POST',
    url: (url ? `${urlPrefix}${url}` : `${urlPrefix}/files/upload` + (searchParams || '')),
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {},
  };
  const mergedOptions: UploadOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return new Promise((resolve, reject) => {
    xhr.open(mergedOptions.method || 'POST', mergedOptions.url || '');
    if (mergedOptions.headers) {
      for (const key in mergedOptions.headers) {
        xhr.setRequestHeader(key, mergedOptions.headers[key]);
      }
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 201) {
          resolve(xhr.response);
        } else {
          reject(xhr);
        }
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network error'));
    };
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        if (typeof options.onProgress === 'function') {
          options.onProgress(progress);
        }
      }
    };

    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.send(mergedOptions.data);
  });
}

