
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Image, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageFormProps {
  onSubmit: (content: string, imageFile?: File) => void;
}

export const MessageForm = ({ onSubmit }: MessageFormProps) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image trop volumineuse",
          description: "L'image ne peut pas dépasser 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner une image.",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedImage) {
      toast({
        title: "Message vide",
        description: "Veuillez écrire quelque chose ou ajouter une image.",
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
      await onSubmit(message || '', selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-black placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              rows={2}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer p-1 hover:bg-gray-200 rounded"
                >
                  <Image className="w-4 h-4 text-gray-500" />
                </label>
              </div>
              <span className={`text-xs ${message.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                {message.length}/500
              </span>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || (!message.trim() && !selectedImage)}
            size="sm"
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="max-w-32 max-h-32 rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
