type MoreInfo = {
    conversationId?: string;
    taskId?: string;
    messageId: string;
    errorMessage?: string;
    errorCode?: string;
}

export type OnData = (message: string, isFirstMessage: boolean, moreInfo: MoreInfo) => void;
export type OnError = (message: string, code?: string) => void;

export type OtherOptions = {
    isPublicAPI?: boolean;
    silent?: boolean;
    onData?: OnData;
    onError?: OnError;
};

export const request = async<T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    // todo
}

export const get = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, Object.assign({}, options, { method: 'GET' }), otherOptions);
}

export const getPublic = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, options, { ...otherOptions, isPublicAPI: true });
}

export const post = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, Object.assign({}, options, { method: 'POST' }), otherOptions);
}

export const postPublic = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return post<T>(url, options, { ...otherOptions, isPublicAPI: true });
}

export const put = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, Object.assign({}, options, { method: 'PUT' }), otherOptions);
}

export const putPublic = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return put<T>(url, options, { ...otherOptions, isPublicAPI: true });
}

export const del = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, Object.assign({}, options, { method: 'DELETE' }), otherOptions);
}

export const delPublic = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return del<T>(url, options, { ...otherOptions, isPublicAPI: true });
}

export const patch = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return request<T>(url, Object.assign({}, options, { method: 'PATCH' }), otherOptions);
}

export const patchPublic = <T>(url: string, options = {}, otherOptions?: OtherOptions) => {
    return patch<T>(url, options, { ...otherOptions, isPublicAPI: true });
}
