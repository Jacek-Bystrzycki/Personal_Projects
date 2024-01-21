import { ReactElement, createContext, useCallback, useState } from 'react';
import { AxiosResponse } from 'axios';

export type InitState = {
  checked: boolean;
  title: string;
  _id?: string;
  __v?: number;
};

const initState: InitState[] = [];

const useGroceryReducer = (initState: InitState[]) => {
  const [state, setState] = useState(initState);

  const loadFromDB = useCallback(async (data: AxiosResponse): Promise<void> => {
    setState(data.data);
  }, []);

  return { state, loadFromDB };
};

export type UseGroceryReducer = ReturnType<typeof useGroceryReducer>;
const initGroceryReducer: UseGroceryReducer = {
  state: initState,
  loadFromDB: async () => {},
};

export const GroceryContext = createContext<UseGroceryReducer>(initGroceryReducer);

type PropsType = {
  children?: ReactElement | ReactElement[];
};
export const GroceryContextProvider = ({ children }: PropsType): ReactElement => {
  return <GroceryContext.Provider value={useGroceryReducer(initState)}>{children}</GroceryContext.Provider>;
};
