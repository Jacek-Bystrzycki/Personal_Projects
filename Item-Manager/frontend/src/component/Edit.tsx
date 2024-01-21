import { ChangeEvent, FormEvent, ReactElement, useState } from 'react';
import { InitState } from '../context/GroceryContext';
import { EditItemType } from '../context/EditItemContext';
import { useEditContext } from '../hook/useEditItemContext';
import styled from 'styled-components';
import { BasicButton } from '../styledComponents/Buttons';
import { useQueryHooks } from '../hook/useQueryHooks';

type PropType = {
  item: InitState;
};

type EditType = {
  title: string;
  checked: boolean;
};

const Edit = ({ item }: PropType): ReactElement => {
  const { useUpdateItemQuery } = useQueryHooks();
  const { updateItem } = useUpdateItemQuery();
  const { applyItem }: EditItemType = useEditContext();
  const [editData, setEditData] = useState<EditType>({ title: item.title, checked: item.checked });

  const onChangeHandler = (ev: ChangeEvent<HTMLInputElement>): void => {
    if (ev.target.name === 'title') {
      setEditData({ ...editData, title: ev.target.value });
    } else if (ev.target.name === 'checkbox') {
      setEditData((prev) => {
        return { ...prev, checked: !prev.checked };
      });
    }
  };

  const onSubmitHandler = (ev: FormEvent<HTMLFormElement>): void => {
    ev.preventDefault();
    if (editData.title) {
      const newItem: InitState = { _id: item._id, title: editData.title, checked: editData.checked };
      updateItem(newItem);
      applyItem();
    }
  };

  const label: ReactElement = (
    <header>
      <h3>
        Editig item <span className="span-title">"{item.title}"</span>
      </h3>
      <h3>
        With ID: <span>"{item._id}"</span>
      </h3>
    </header>
  );

  const form: ReactElement = (
    <form onSubmit={onSubmitHandler}>
      <div className="title-container">
        <input className="checkbox" name="checkbox" type="checkbox" onChange={onChangeHandler} checked={editData.checked} />
        <input className="form-input" name="title" type="text" onChange={onChangeHandler} placeholder={item.title} value={editData.title} />
      </div>
      <div className="btn-container">
        <BasicButton type="submit">accept</BasicButton>
        <BasicButton onClick={applyItem}>cancel</BasicButton>
      </div>
    </form>
  );

  const pageContent: ReactElement = (
    <div>
      {label}
      {form}
    </div>
  );

  return <Wrapper>{pageContent}</Wrapper>;
};
export default Edit;

// =============== CSS ================
const Wrapper = styled.div`
  header {
    text-align: center;
    padding-block: 1rem;
  }
  span {
    color: black;
  }
  .span-title {
    font-size: 1.5rem;
  }
  .title-container {
    display: flex;
    margin-top: 1rem;
    align-items: center;
    justify-content: space-evenly;
  }
  .form-input {
    display: inline-block;
    width: 90%;
    padding: 0.5rem;
    border-radius: 3px;
  }
  .checkbox {
    width: 1.15rem;
    height: 1.15rem;
  }
  .btn-container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding-block: 1rem;
  }
`;
