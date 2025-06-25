import { useState, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LogOut, Check, X, Clock, Settings, Trash2, Archive, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { messages, pendingMessages, archivedMessages, updateMessageStatus, deleteMessage, archiveMessage } = useMessages();
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');

  useEffect(() => {
    const setting = localStorage.getItem('moderationEnabled');
    setModerationEnabled(setting !== 'true');
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

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce message ?')) {
      await deleteMessage(messageId);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver ce message ?')) {
      await archiveMessage(messageId);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const stats = {
    pending: pendingMessages.length,
    approved: messages.length,
    archived: archivedMessages.length,
    total: messages.length + pendingMessages.length + archivedMessages.length
  };

  const renderMessageActions = (message: any, isPublished = false) => (
    <div className="flex gap-2 flex-wrap">
      {!isPublished && (
        <>
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
        </>
      )}
      
      {isPublished && (
        <Button
          onClick={() => handleArchiveMessage(message.id)}
          size="sm"
          variant="outline"
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <Archive className="w-4 h-4 mr-1" />
          Archiver
        </Button>
      )}
      
      <Button
        onClick={() => handleDeleteMessage(message.id)}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Supprimer
      </Button>
    </div>
  );

  const renderMessageCard = (message: any, isPublished = false) => (
    <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <span className="text-gray-500 text-sm">
          {formatTime(message.created_at)}
        </span>
        {isPublished && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Publié
          </span>
        )}
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
      
      {renderMessageActions(message, isPublished)}
    </div>
  );

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Archivés</p>
                <p className="text-black text-2xl font-bold">{stats.archived}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            En attente ({stats.pending})
          </button>
          
          <button
            onClick={() => setActiveTab('published')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'published'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Publiés ({stats.approved})
          </button>
          
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'archived'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Archive className="w-4 h-4 inline mr-2" />
            Archivés ({stats.archived})
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-6">Messages en attente de modération</h2>
              
              {pendingMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun message en attente</p>
                  <p className="text-gray-400 text-sm mt-2">Tous les messages ont été traités !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMessages.map((message) => renderMessageCard(message, false))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'published' && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-6">Messages publiés</h2>
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun message publié</p>
                  <p className="text-gray-400 text-sm mt-2">Les messages approuvés apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => renderMessageCard(message, true))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'archived' && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-6">Messages archivés</h2>
              
              {archivedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun message archivé</p>
                  <p className="text-gray-400 text-sm mt-2">Les messages archivés apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {archivedMessages.map((message) => renderMessageCard(message, false))}
                </div>
              )}
            </div>
          )}
        </div>

        {!moderationEnabled && activeTab === 'pending' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
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
