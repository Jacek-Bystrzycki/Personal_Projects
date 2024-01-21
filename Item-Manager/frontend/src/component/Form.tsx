import { ReactElement, useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import { useGroceryContext } from '../hook/useGroceryContext';
import { UseGroceryReducer } from '../context/GroceryContext';
import { setupBorder } from '../styledComponents/Utils';
import { BasicButton } from '../styledComponents/Buttons';
import { useQueryHooks } from '../hook/useQueryHooks';

const Form = () => {
  const { state }: UseGroceryReducer = useGroceryContext();
  const [value, setValue] = useState<string>('');
  const { useAddItemQuery, useClearItemsQuery } = useQueryHooks();
  const { addItem } = useAddItemQuery();
  const { clearItems } = useClearItemsQuery();

  const handleOnChange = (ev: ChangeEvent<HTMLInputElement>): void => {
    setValue(ev.target.value);
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>): void => {
    ev.preventDefault();
    if (value) {
      addItem(value);
      setValue('');
    }
  };

  const handleOnClick = (): void => {
    clearItems();
  };

  const title: ReactElement = (
    <div className="title-container">
      <h2>Items manager</h2>
    </div>
  );

  const clearButton: ReactElement = <BasicButton onClick={handleOnClick}>clear</BasicButton>;

  const form: ReactElement = (
    <form onSubmit={handleSubmit}>
      <input className="form-input" value={value} onChange={handleOnChange} />
      <div className="btn-container">
        <BasicButton type="submit">add</BasicButton>
        {state.length > 0 && clearButton}
      </div>
    </form>
  );

  return (
    <Wrapper>
      {title}
      {form}
    </Wrapper>
  );
};
export default Form;

// ============== CSS ================
const Wrapper = styled.div`
  .title-container {
    text-align: center;
    padding-block: 0.5rem;
  }
  .form-input {
    display: block;
    width: 90%;
    margin-top: 1rem;
    margin-inline: auto;
    padding: 0.5rem;
    border-radius: 3px;
    border: ${setupBorder({ width: 1, color: 'black' })};
  }
  .btn-container {
    display: flex;
    justify-content: space-evenly;
    padding-block: 1.5rem;
  }
`;
