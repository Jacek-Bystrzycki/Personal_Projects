import { ItemInterface } from '../model/Item';

export const isItemInterface = (item: unknown): item is ItemInterface => {
  if (item !== null && typeof item === 'object') {
    return 'checked' in item && 'title' in item;
  } else return false;
};

export const isItemInterfaceArray = (item: unknown): item is ItemInterface[] => {
  if (Array.isArray(item) && item.length > 0) {
    return item.every(isItemInterface);
  } else {
    return false;
  }
};
