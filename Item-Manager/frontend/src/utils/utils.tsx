import type { InitState } from '../context/GroceryContext';

const localKey: string = 'GROCERY';

export const saveToLacal = (data: InitState[]): void => {
  localStorage.setItem(localKey, JSON.stringify(data));
};

export const loadFromLocal = (): InitState[] => {
  if (localStorage.getItem(localKey) !== null) {
    return JSON.parse(localStorage.getItem(localKey) as string);
  } else {
    return [];
  }
};

export const isInitStateType = (item: unknown): item is InitState => {
  if (item !== null && typeof item === 'object') {
    return 'checked' in item && 'title' in item;
  } else return false;
};

export const isInitStateArrayType = (item: unknown): item is InitState[] => {
  if (Array.isArray(item) && item.length > 0) {
    return isInitStateType(item[0]);
  } else {
    return false;
  }
};
