import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '../axios/axios';
import { InitState } from '../context/GroceryContext';
import { isInitStateType } from '../utils/utils';

export const useQueryHooks = () => {
  const useFetchItemsQuery = () => {
    const { data } = useQuery({
      queryKey: ['items'],
      queryFn: () => fetchData.get('/'),
      meta: {
        errorMessage: 'Error during fetching data...',
      },
    });
    return { data };
  };

  const useAddItemQuery = () => {
    const queryClient = useQueryClient();
    const { mutate: addItem } = useMutation({
      mutationFn: (title: string) => {
        const newState: InitState = {
          checked: false,
          title,
        };
        return fetchData.post('/', newState);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
      },
      onError: () => {
        console.log('Error during adding item...');
      },
    });
    return { addItem };
  };

  const useClearItemsQuery = () => {
    const queryClient = useQueryClient();
    const { mutate: clearItems } = useMutation({
      mutationFn: () => fetchData.delete('/'),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
      },
      onError: () => {
        console.log('Error during clearing...');
      },
    });
    return { clearItems };
  };

  const useUpdateItemQuery = () => {
    const queryClient = useQueryClient();
    const { mutate: updateItem } = useMutation({
      mutationFn: (item: InitState) => {
        if (!isInitStateType(item)) throw new Error('Wrong data');
        return fetchData.put(`/${item._id}`, item);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
      },
      onError: () => {
        console.log('Error during clearing...');
      },
    });
    return { updateItem };
  };

  const useRemoveItemQuery = () => {
    const queryClient = useQueryClient();
    const { mutate: removeItem } = useMutation({
      mutationFn: (_id: string) => fetchData.delete(`/${_id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
      },
      onError: () => {
        console.log('Error during removing item...');
      },
    });
    return { removeItem };
  };
  return { useFetchItemsQuery, useAddItemQuery, useClearItemsQuery, useUpdateItemQuery, useRemoveItemQuery };
};
