import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { EditContextProvider } from './context/EditItemContext.tsx';
import { QueryClientProvider, QueryClient, QueryCache } from '@tanstack/react-query';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) {
        console.log(`${error}: ${query.meta.errorMessage}`);
      }
    },
  }),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <EditContextProvider>
      <App />
    </EditContextProvider>
  </QueryClientProvider>
);
