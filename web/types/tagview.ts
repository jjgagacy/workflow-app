export enum TagsViewActionType {
  DELETE = 'tagViewDelete',
  ADD = 'tagViewAdd',
  CLEAR = 'tagViewClear',
  UPDATE = 'tagViewUpdate',
  ADD_PAYLOAD = 'tagViewAddPayload',
}

export interface TagItem {
  key: string;
  name: string;
  path: string;
  active?: boolean;
}

export interface TagViewAction {
  type: TagsViewActionType;
  payload?: any;
}