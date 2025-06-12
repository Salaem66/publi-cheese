
import { useState, useEffect } from 'react';
import { Message } from './MessageWall';
import { Button } from '@/components/ui/button';
import { LogOut, Check, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });

  useEffect(() => {
    loadPendingMessages();
  }, []);

  const loadPendingMessages = () => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const pending = messages.filter(msg => msg.status === 'pending');
    const approved = messages.filter(msg => msg.status === 'approved');
    
    setPendingMessages(pending.sort((a, b) => b.timestamp - a.timestamp));
    setStats({
      pending: pending.length,
      approved: approved.length,
      total: messages.length
    });
  };

  const updateMessageStatus = (messageId: string, status: 'approved' | 'rejected') => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    );
    
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    loadPendingMessages();
    
    toast({
      title: status === 'approved' ? "Message approuvé" : "Message rejeté",
      description: status === 'approved' 
        ? "Le message est maintenant visible publiquement." 
        : "Le message a été supprimé.",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Admin</span>
            </h1>
            <p className="text-slate-400">Modération des messages</p>
          </div>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-slate-400 text-sm">En attente</p>
                <p className="text-white text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-slate-400 text-sm">Approuvés</p>
                <p className="text-white text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages en attente */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">Messages en attente de modération</h2>
          
          {pendingMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Aucun message en attente</p>
              <p className="text-slate-500 text-sm mt-2">Tous les messages ont été traités !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMessages.map((message) => (
                <div key={message.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-400 text-sm">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-white mb-4 leading-relaxed break-words">
                    {message.content}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateMessageStatus(message.id, 'approved')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                    
                    <Button
                      onClick={() => updateMessageStatus(message.id, 'rejected')}
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
      </div>
    </div>
  );
};
