import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GroceryContextProvider } from './context/GroceryContext.tsx';
import { EditContextProvider } from './context/EditItemContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GroceryContextProvider>
    <EditContextProvider>
      <App />
    </EditContextProvider>
  </GroceryContextProvider>
);
