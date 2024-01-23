import { ReactElement } from 'react';
import { SingleItem } from './SingleItem';
import { useQueryHooks } from '../hook/useQueryHooks';
import { isInitStateArrayType } from '../utils/utils';

const ItemsList = (): ReactElement => {
  const { useFetchItemsQuery } = useQueryHooks();
  const { data } = useFetchItemsQuery();
  if (isInitStateArrayType(data?.data))
    return (
      <div>
        {data?.data.map((item) => {
          return <SingleItem key={item._id} item={item} />;
        })}
      </div>
    );
  return <></>;
};
export default ItemsList;
