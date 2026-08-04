import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatPage from './features/chat/components/ChatPage';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <ChatPage />
        </div>
        <footer className="w-full py-3 text-center text-xs text-gray-500 border-t border-gray-200/20">
          <p>Geliştirici: <a href="https://www.yucelgumus.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-gray-700 transition-colors">Yücel Gümüş</a></p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;