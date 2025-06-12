
import { useState, useEffect } from 'react';
import { MessageForm } from './MessageForm';
import { MessageCard } from './MessageCard';
import { messageStorage, Message } from '../utils/messageStorage';

export const MessageWall = () => {
  const [approvedMessages, setApprovedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApprovedMessages();
    setIsLoading(false);
    
    // Ajouter un listener pour les changements
    const handleMessagesChange = () => {
      loadApprovedMessages();
    };
    
    messageStorage.addListener(handleMessagesChange);
    
    // Synchroniser toutes les 2 secondes pour s'assurer que tous voient les messages
    const interval = setInterval(loadApprovedMessages, 2000);
    
    return () => {
      messageStorage.removeListener(handleMessagesChange);
      clearInterval(interval);
    };
  }, []);

  const loadApprovedMessages = () => {
    const messages = messageStorage.getApprovedMessages();
    setApprovedMessages(messages);
  };

  const handleNewMessage = (content: string) => {
    const moderationEnabled = localStorage.getItem('moderationEnabled') !== 'false';
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      status: moderationEnabled ? 'pending' : 'approved'
    };

    messageStorage.addMessage(newMessage);
    
    // Si pas de modération, recharger immédiatement
    if (!moderationEnabled) {
      loadApprovedMessages();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <MessageForm onSubmit={handleNewMessage} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : approvedMessages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun message pour le moment...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvedMessages.map((message, index) => (
            <MessageCard 
              key={message.id} 
              message={message} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
