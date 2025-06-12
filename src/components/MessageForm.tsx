
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageFormProps {
  onSubmit: (content: string) => void;
}

export const MessageForm = ({ onSubmit }: MessageFormProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message vide",
        description: "Veuillez écrire quelque chose avant d'envoyer.",
        variant: "destructive"
      });
      return;
    }

    if (message.length > 500) {
      toast({
        title: "Message trop long",
        description: "Votre message ne peut pas dépasser 500 caractères.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit(message);
      setMessage('');
      toast({
        title: "Message envoyé !",
        description: "Votre message sera visible après modération.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-black placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            rows={2}
            maxLength={500}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${message.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
              {message.length}/500
            </span>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          size="sm"
          className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
