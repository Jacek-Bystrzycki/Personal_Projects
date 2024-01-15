import { ReactElement } from 'react';
import { useGroceryContext } from '../hook/useGroceryContext';
import { InitState, UseGroceryReducer } from '../context/GroceryContext';
import styled from 'styled-components';
import { useEditContext } from '../hook/useEditItemContext';
import { EditItemType } from '../context/EditItemContext';
import iconDelete from '../images/trash-xmark.svg';
import iconEdit from '../images/file-edit.svg';

type PropsType = {
  item: InitState;
};

export const SingleItem = ({ item }: PropsType): ReactElement => {
  const { updateDB, removeFromDB }: UseGroceryReducer = useGroceryContext();

  const { editItem }: EditItemType = useEditContext();

  const onChangeHandler = (): void => {
    const newItem: InitState = { ...item, checked: !item.checked };
    updateDB(newItem);
  };

  const input: ReactElement = <input className="checkbox" type="checkbox" checked={item.checked} onChange={onChangeHandler} />;

  const title: ReactElement = <span className={item.checked ? ' title strike' : 'title'}>{item.title}</span>;

  const editButton: ReactElement = (
    <button className="btn" type="button" onClick={() => editItem(item)}>
      <img src={iconEdit} alt="edit" />
    </button>
  );

  const removeButton: ReactElement = (
    <button
      className="btn"
      type="button"
      onClick={() => {
        removeFromDB(item._id!);
      }}
    >
      <img src={iconDelete} alt="delete" />
    </button>
  );

  const content: ReactElement = (
    <article className="container">
      <div className="item-container">
        {input}
        {title}
      </div>
      <div className="btn-container">
        {removeButton}
        {editButton}
      </div>
    </article>
  );
  return <Wrapper>{content}</Wrapper>;
};

const Wrapper = styled.div`
  article {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: 0.25rem;
    padding-inline: 15px;
    margin-block: 0.5rem;
    background: var(--clr-neutral-100);
    border-radius: 15px;
  }

  .container:hover {
    background: var(--clr-neutral-400);
    color: white;
  }
  .btn {
    margin-left: 1rem;
    background: transparent;
    border: none;
  }
  .btn:hover {
    cursor: pointer;
  }
  .item-container {
    width: 70%;
    align-items: center;
    display: flex;
    justify-content: flex-start;
    margin-block: 0.5rem;
  }
  .btn-container {
    align-items: center;
    display: flex;
    justify-content: flex-start;
  }
  .title {
    margin-left: 1.5rem;
  }
  .strike {
    text-decoration: black line-through;
  }
  .checkbox {
    width: 1.15rem;
    height: 1.15rem;
  }
  .checkbox:hover {
    cursor: pointer;
  }
`;
