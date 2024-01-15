import { ReactElement, createContext, useReducer, useCallback } from 'react';
import { saveToLacal } from '../utils/utils';
import { isInitStateType, isInitStateArrayType } from '../utils/utils';
import { fetchData } from '../axios/axios';
import axios from 'axios';

export type InitState = {
  checked: boolean;
  title: string;
  _id?: string;
  __v?: number;
};

const initState: InitState[] = [];

const REDUCER_ACTION = {
  ADD: 'ADD',
  CHECK: 'CHECK',
  REMOVE: 'REMOVE',
  CLEAR: 'CLEAR',
  LOAD: 'LOAD',
  UPDATE: 'UPDATE',
};

export type ReducerPayloadCheckType = Pick<InitState, '_id' | 'checked'>;
type ReducerAction = {
  type: string;
  payload?: unknown;
};

const reducer = (state: InitState[], action: ReducerAction): InitState[] => {
  switch (action.type) {
    case REDUCER_ACTION.ADD:
      const newState = action.payload;
      if (isInitStateType(newState)) return [...state, newState];
      return state;

    case REDUCER_ACTION.LOAD:
      //data already checked during fetch in useGroceryReducer
      return action.payload as InitState[];

    case REDUCER_ACTION.CLEAR:
      return [];

    case REDUCER_ACTION.REMOVE:
      if (!action.payload || typeof action.payload !== 'string') throw new Error('Payload as String is needed in the "Remove" reducer action!');
      const removeId: string = action.payload;
      const filteredState: InitState[] = state.filter((item) => item._id !== removeId);
      saveToLacal(filteredState);
      return [...filteredState];

    case REDUCER_ACTION.UPDATE:
      if (!action.payload) throw new Error("Payload is required in 'UPDATE' action");

      if (!isInitStateType(action.payload)) throw new Error('Wrong type');
      const newItem: InitState = action.payload;
      const updatedState: InitState[] = state.map((item) => {
        if (item._id === newItem._id) item = newItem;
        return item;
      });
      saveToLacal(updatedState);
      return updatedState;

    default:
      throw new Error('Wrong reducer action');
  }
};

const useGroceryReducer = (initState: InitState[]) => {
  const [state, dispatch] = useReducer(reducer, initState);

  const loadFromDB = useCallback(async (): Promise<void> => {
    try {
      const { data } = await fetchData.get('/');
      if (!Array.isArray(data) && !isInitStateArrayType(data)) throw new Error('Wrong data received from API server');
      dispatch({ type: REDUCER_ACTION.LOAD, payload: data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.message);
        return;
      }
      console.log(error);
    }
  }, []);

  const addToDB = useCallback(async (title: string): Promise<void> => {
    const newState: InitState = {
      checked: false,
      title,
    };
    try {
      const { data } = await fetchData.post('/', newState);
      dispatch({ type: REDUCER_ACTION.ADD, payload: data });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const clearDB = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchData.delete('/');
      if ((data.status = 200)) dispatch({ type: REDUCER_ACTION.CLEAR });
    } catch (error) {}
  }, []);

  const updateDB = useCallback(async (item: InitState): Promise<void> => {
    try {
      if (!isInitStateType(item)) throw new Error('Wrong data');
      await fetchData.put(`/${item._id}`, item);
      dispatch({ type: REDUCER_ACTION.UPDATE, payload: item });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const removeFromDB = useCallback(async (_id: string): Promise<void> => {
    try {
      await fetchData.delete(`/${_id}`);
      dispatch({ type: REDUCER_ACTION.REMOVE, payload: _id });
    } catch (error) {
      console.log(error);
    }
  }, []);

  return { state, loadFromDB, addToDB, clearDB, updateDB, removeFromDB };
};

export type UseGroceryReducer = ReturnType<typeof useGroceryReducer>;
const initGroceryReducer: UseGroceryReducer = {
  state: initState,
  loadFromDB: async () => {},
  addToDB: async () => {},
  clearDB: async () => {},
  updateDB: async () => {},
  removeFromDB: async () => {},
};

export const GroceryContext = createContext<UseGroceryReducer>(initGroceryReducer);

type PropsType = {
  children?: ReactElement | ReactElement[];
};
export const GroceryContextProvider = ({ children }: PropsType): ReactElement => {
  return <GroceryContext.Provider value={useGroceryReducer(initState)}>{children}</GroceryContext.Provider>;
};
