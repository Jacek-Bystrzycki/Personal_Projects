import Form from './component/Form';
import ItemList from './component/ItemsList';
import { ReactElement } from 'react';
import { useEditContext } from './hook/useEditItemContext';
import { EditItemType } from './context/EditItemContext';
import Edit from './component/Edit';
import { GlobalStyles } from './styledComponents/GlobalStyles';
import { Wrapper } from './styledComponents/Wrapper';

const App = (): ReactElement => {
  const {
    edit: { item, isEdit },
  }: EditItemType = useEditContext();

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
            <ItemList />
          </Wrapper>
        </>
      )}
    </>
  );

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
