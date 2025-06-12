
import { useState, useEffect } from 'react';
import { MessageWall } from '../components/MessageWall';
import { AdminDashboard } from '../components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleAdminLogin = () => {
    // Simple admin access avec code (dans un vrai projet, cela serait sécurisé)
    if (adminCode === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminCode('');
    } else {
      alert('Code incorrect');
    }
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Mur des <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Secrets</span>
              </h1>
              <p className="text-slate-400">Partagez vos pensées anonymement</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>

          {showAdminLogin && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm w-full mx-4">
                <h3 className="text-white text-lg font-semibold mb-4">Accès Administrateur</h3>
                <input
                  type="password"
                  placeholder="Code d'accès..."
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAdminLogin} className="flex-1">
                    Se connecter
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          <MessageWall />
        </div>
      </div>
    </div>
  );
};

export default Index;
