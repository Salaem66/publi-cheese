
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
    <div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {String.fromCharCode(65 + (index % 26))}
          </span>
        </div>
        <span className="text-slate-400 text-sm">
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      <p className="text-white leading-relaxed break-words">
        {message.content}
      </p>
      
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
};
