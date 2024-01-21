import { useEffect } from 'react';
import Form from './component/Form';
import ItemList from './component/ItemsList';
import { ReactElement } from 'react';
import { useGroceryContext } from './hook/useGroceryContext';
import { useEditContext } from './hook/useEditItemContext';
import { UseGroceryReducer } from './context/GroceryContext';
import { EditItemType } from './context/EditItemContext';
import Edit from './component/Edit';
import { GlobalStyles } from './styledComponents/GlobalStyles';
import { Wrapper } from './styledComponents/Wrapper';
import { useQueryHooks } from './hook/useQueryHooks';

const App = (): ReactElement => {
  const { state, loadFromDB }: UseGroceryReducer = useGroceryContext();
  const {
    edit: { item, isEdit },
  }: EditItemType = useEditContext();
  const { useFetchItemsQuery } = useQueryHooks();
  const { data } = useFetchItemsQuery();

  const pageContent: ReactElement = (
    <>
      {isEdit ? (
        <Wrapper $maxWidth={400}>
          <Edit item={item} />
        </Wrapper>
      ) : (
        <>
          <Form />
          <Wrapper $maxWidth={400}>
            <ItemList state={state} />
          </Wrapper>
        </>
      )}
    </>
  );

  useEffect(() => {
    if (data) loadFromDB(data);
  }, [data]);

  return (
    <>
      <GlobalStyles />
      <Wrapper $maxWidth={600} $marginBlock={2}>
        {pageContent}
      </Wrapper>
    </>
  );
};

export default App;
