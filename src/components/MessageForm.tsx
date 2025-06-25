
import { useState, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image selection triggered');
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image file selected:', file.name, file.size);
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    console.log('Processing image file:', file.name);
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      console.log('Image too large:', file.size);
      toast({
        title: "Image trop volumineuse",
        description: "L'image ne peut pas dépasser 5MB.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
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
      console.log('Image preview loaded');
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    console.log('Paste event triggered');
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        console.log('Image pasted from clipboard');
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          processImageFile(file);
        }
        break;
      }
    }
  };

  const removeImage = () => {
    console.log('Removing selected image');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== MESSAGE FORM SUBMISSION STARTED ===');
    console.log('Message content:', message);
    console.log('Selected image:', selectedImage?.name || 'none');
    console.log('User agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    
    if (!message.trim() && !selectedImage) {
      console.log('Empty message and no image - showing error');
      toast({
        title: "Message vide",
        description: "Veuillez écrire quelque chose ou ajouter une image.",
        variant: "destructive"
      });
      return;
    }

    if (message.length > 500) {
      console.log('Message too long:', message.length);
      toast({
        title: "Message trop long",
        description: "Votre message ne peut pas dépasser 500 caractères.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Calling onSubmit function...');
      await onSubmit(message || '', selectedImage || undefined);
      console.log('onSubmit completed successfully');
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      console.log('Form reset completed');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Vérifiez votre connexion.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      console.log('=== MESSAGE FORM SUBMISSION COMPLETED ===');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder="Votre message... (Vous pouvez coller une image avec Ctrl+V)"
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
                  title="Ajouter une image"
                >
                  <Image className="w-4 h-4 text-gray-500" />
                </label>
                <span className="text-xs text-gray-400">
                  Ou collez une image (Ctrl+V)
                </span>
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
