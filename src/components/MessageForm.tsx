
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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-white font-medium mb-2">
            Partagez vos pensées anonymement
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message ici... (max 500 caractères)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-sm ${message.length > 450 ? 'text-red-400' : 'text-slate-400'}`}>
              {message.length}/500
            </span>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Envoi en cours...
            </div>
          ) : (
            <div className="flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Envoyer anonymement
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};
