import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatPage from './features/chat/components/ChatPage';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-[#EDF3EE] text-[#253341]">
        <div className="flex-1">
          <ChatPage />
        </div>
        <footer className="w-full py-3 text-center text-xs bg-[#DCE3EA] text-[#3E5164] border-t border-[#BCC7D2]">
          <p>Geliştirici: <a href="https://www.yucelgumus.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold underline text-[#253341] hover:text-[#AB421C] transition-colors">Yücel Gümüş</a></p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;