import { EditContext } from '../context/EditItemContext';
import { useContext } from 'react';

export const useEditContext = () => {
  return useContext(EditContext);
};
