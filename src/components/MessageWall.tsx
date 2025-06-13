
import { MessageForm } from './MessageForm';
import { MessageCard } from './MessageCard';
import { useMessages } from '../hooks/useMessages';

export const MessageWall = () => {
  const { messages, isLoading, addMessage } = useMessages();

  return (
    <div className="max-w-4xl mx-auto">
      <MessageForm onSubmit={addMessage} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun message pour le moment...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message, index) => (
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
