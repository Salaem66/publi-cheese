
import { Message } from './MessageWall';

interface MessageCardProps {
  message: Message;
  index: number;
}

export const MessageCard = ({ message, index }: MessageCardProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {String.fromCharCode(65 + (index % 26))}
          </span>
        </div>
        <span className="text-gray-400 text-sm">
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      <p className="text-black leading-relaxed break-words">
        {message.content}
      </p>
    </div>
  );
};
