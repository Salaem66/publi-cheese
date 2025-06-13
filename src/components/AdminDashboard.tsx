
import { useState, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LogOut, Check, X, Clock, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { messages, pendingMessages, updateMessageStatus } = useMessages();
  const [moderationEnabled, setModerationEnabled] = useState(true);

  useEffect(() => {
    const setting = localStorage.getItem('moderationEnabled');
    setModerationEnabled(setting !== 'false');
  }, []);

  const toggleModeration = (enabled: boolean) => {
    setModerationEnabled(enabled);
    localStorage.setItem('moderationEnabled', enabled.toString());
    toast({
      title: enabled ? "Modération activée" : "Modération désactivée",
      description: enabled 
        ? "Les nouveaux messages devront être approuvés avant publication" 
        : "Les nouveaux messages seront publiés automatiquement.",
    });
  };

  const handleUpdateStatus = async (messageId: string, status: 'approved' | 'rejected') => {
    await updateMessageStatus(messageId, status);
    toast({
      title: status === 'approved' ? "Message approuvé" : "Message rejeté",
      description: status === 'approved' 
        ? "Le message est maintenant visible publiquement." 
        : "Le message a été supprimé.",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const stats = {
    pending: pendingMessages.length,
    approved: messages.length,
    total: messages.length + pendingMessages.length
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Dashboard Admin - publicheese
            </h1>
            <p className="text-gray-600">Modération des messages</p>
          </div>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Paramètres de modération */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-black">Modération</h3>
                <p className="text-gray-600 text-sm">
                  {moderationEnabled 
                    ? "Les messages doivent être approuvés avant publication" 
                    : "Les messages sont publiés automatiquement"}
                </p>
              </div>
            </div>
            <Switch
              checked={moderationEnabled}
              onCheckedChange={toggleModeration}
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-black text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Approuvés</p>
                <p className="text-black text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-black text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages en attente */}
        {moderationEnabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Messages en attente de modération</h2>
            
            {pendingMessages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun message en attente</p>
                <p className="text-gray-400 text-sm mt-2">Tous les messages ont été traités !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMessages.map((message) => (
                  <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-gray-500 text-sm">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    
                    {message.content && (
                      <p className="text-black mb-4 leading-relaxed break-words">
                        {message.content}
                      </p>
                    )}

                    {message.image_url && (
                      <div className="mb-4">
                        <img
                          src={message.image_url}
                          alt="Image du message"
                          className="max-w-64 h-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateStatus(message.id, 'approved')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      
                      <Button
                        onClick={() => handleUpdateStatus(message.id, 'rejected')}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!moderationEnabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Modération désactivée</p>
              <p className="text-gray-400 text-sm mt-2">Les messages sont publiés automatiquement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
