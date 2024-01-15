import { useContext } from 'react';
import { GroceryContext } from '../context/GroceryContext';

export const useGroceryContext = () => {
  return useContext(GroceryContext);
};
