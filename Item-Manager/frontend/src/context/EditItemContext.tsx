import { ReactElement, createContext, useState } from 'react';
import { InitState } from './GroceryContext';

type EditStateType = {
  item: InitState;
  isEdit: boolean;
};

const initEditState: EditStateType = {
  item: { _id: '', checked: false, title: '' },
  isEdit: false,
};

const useEditItem = (initState: EditStateType) => {
  const [edit, setEdit] = useState<EditStateType>(initState);

  const editItem = (item: InitState): void => {
    setEdit({ item, isEdit: true });
  };

  const applyItem = (): void => {
    setEdit({ ...edit, isEdit: false });
  };

  return { edit, editItem, applyItem };
};

export type EditItemType = ReturnType<typeof useEditItem>;
const initEditContext: EditItemType = {
  edit: initEditState,
  editItem: () => {},
  applyItem: () => {},
};

export const EditContext = createContext(initEditContext);

type EditContextProp = {
  children: ReactElement | ReactElement[];
};

export const EditContextProvider = ({ children }: EditContextProp): ReactElement => {
  return <EditContext.Provider value={useEditItem(initEditState)}>{children}</EditContext.Provider>;
};
