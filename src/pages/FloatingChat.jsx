import { useState,useEffect } from 'react';
import { MessageCircle } from 'lucide-react'; // Make sure this icon library is installed
import Chatbot from './Chatbot';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((v) => !v);

    const onOpen = () => open();
    const onClose = () => close();
    const onToggle = () => toggle();

    document.addEventListener('safehaven:chatbot-open', onOpen);
    document.addEventListener('safehaven:chatbot-close', onClose);
    document.addEventListener('safehaven:chatbot-toggle', onToggle);

    return () => {
      document.removeEventListener('safehaven:chatbot-open', onOpen);
      document.removeEventListener('safehaven:chatbot-close', onClose);
      document.removeEventListener('safehaven:chatbot-toggle', onToggle);
    };
  }, []);
  return (
   
    <div
    data-nav="chatbot"
    className={`fixed bottom-20 right-4 z-50`}
  >
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white shadow-lg rounded-lg overflow-hidden mb-3 border border-gray-300" data-tour="chatbot-panel">
          <Chatbot />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1e3a8a] hover:bg-[#1e3a8a] text-white p-4 rounded-full shadow-lg focus:outline-none transition-all"
        data-tour="chatbot-button"  
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingChat;