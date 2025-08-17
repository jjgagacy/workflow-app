import { useCallback, useMemo, useReducer } from "react";

export enum TagsViewActionType {
    DELETE = 'tagViewDelete',
    ADD = 'tagViewAdd',
    CLEAR = 'tagViewClear',
    UPDATE = 'tagViewUpdate',
    ADD_PAYLOAD = 'tagViewAddPayload',
}

export const TagsViewMax = 1000;

export interface TagItem {
    key: string;
    name: string;
    path: string;
    active?: boolean;
}

interface TagViewAction {
    type: TagsViewActionType;
    payload?: any;
}

function deleteKeepAlive(state: TagItem[], { key }: { key: string }): TagItem[] {
    const index = state.findIndex((item) => item.key === key);
    if (index === -1) return state;

    const newState = [...state];
    newState.splice(index, 1);
    return newState;
}

function addKeepAlive(state: TagItem[], newItem: TagItem): TagItem[] {
    if (state.some((item) => item.key === newItem.key && item.active)) {
        return state;
    }

    let isNew = true;
    const updatedState = state.map(item => {
        if (item.key === newItem.key) {
            isNew = false;
            return { ...item, active: true };
        }
        return { ...item, active: false };
    });

    if (isNew) {
        if (updatedState.length >= TagsViewMax) {
            updatedState.shift();
        }
        updatedState.push({ ...newItem, active: true });
    }
    return updatedState;
}

function updateKeepAlive(state: TagItem[], item: TagItem): TagItem[] {
    return state.map(existing =>
        existing.key === item.key ? { ...existing, ...item } : existing
    );
}

function updateKeepAliveList(state: TagItem[], items: TagItem[]): TagItem[] {
    return state.map(existing => {
        const updatedItem = items.find(item => item.key === existing.key);
        return updatedItem ? { ...existing, ...updatedItem } : existing;
    });
}

export function reducer(state: TagItem[], action: TagViewAction): TagItem[] {
    switch (action.type) {
        case TagsViewActionType.ADD:
            return addKeepAlive(state, action.payload);
        case TagsViewActionType.DELETE:
            return deleteKeepAlive(state, action.payload);
        case TagsViewActionType.CLEAR:
            return [];
        case TagsViewActionType.UPDATE:
            return Array.isArray(action.payload)
                ? updateKeepAliveList(state, action.payload)
                : updateKeepAlive(state, action.payload);
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}

export const useTagsView = (initialState: TagItem[] = []) => {
    const [tags, dispatch] = useReducer(reducer, initialState);

    const addTag = useCallback((tag: Omit<TagItem, 'active'>) => {
        dispatch({
            type: TagsViewActionType.ADD,
            payload: tag
        });
    }, []);

    const removeTag = useCallback((key: string) => {
        dispatch({
            type: TagsViewActionType.DELETE,
            payload: { key }
        });
    }, []);

    const clearTags = useCallback(() => {
        dispatch({ type: TagsViewActionType.CLEAR });
    }, []);

    const updateTag = useCallback((tag: TagItem) => {
        dispatch({
            type: TagsViewActionType.UPDATE,
            payload: tag
        });
    }, []);

    const updateTags = useCallback((tags: TagItem[]) => {
        dispatch({
            type: TagsViewActionType.UPDATE,
            payload: tags,
        });
    }, []);

    return {
        tags,
        addTag,
        removeTag,
        clearTags,
        updateTag,
        updateTags,
        include: useMemo(() => { return tags.map(tag => tag.key); }, [tags]),
    }
}
