
import { useState, useEffect } from 'react';
import { MessageForm } from './MessageForm';
import { MessageCard } from './MessageCard';

export interface Message {
  id: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const MessageWall = () => {
  const [approvedMessages, setApprovedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApprovedMessages();
    setIsLoading(false);
  }, []);

  const loadApprovedMessages = () => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const approved = messages
      .filter(msg => msg.status === 'approved')
      .sort((a, b) => b.timestamp - a.timestamp);
    setApprovedMessages(approved);
  };

  const handleNewMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      status: 'pending'
    };

    const existingMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = [...existingMessages, newMessage];
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MessageForm onSubmit={handleNewMessage} />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Messages Partagés
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : approvedMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Aucun message pour le moment...</p>
            <p className="text-slate-500 text-sm mt-2">Soyez le premier à partager vos pensées !</p>
          </div>
        ) : (
          <div className="space-y-6">
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
    </div>
  );
};
