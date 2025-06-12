
import { useState, useEffect } from 'react';
import { MessageWall } from '../components/MessageWall';
import { AdminDashboard } from '../components/AdminDashboard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [keySequence, setKeySequence] = useState('');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const newSequence = keySequence + event.key.toLowerCase();
      
      // Garder seulement les derniers caractères nécessaires
      const trimmedSequence = newSequence.slice(-16); // "publicheeseadmin" = 16 caractères
      setKeySequence(trimmedSequence);
      
      // Vérifier si la séquence correspond
      if (trimmedSequence === 'publicheeseadmin') {
        setShowAdminLogin(true);
        setKeySequence(''); // Reset après activation
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keySequence]);

  const handleAdminLogin = () => {
    if (adminCode === 'pipicaca') {
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        {/* Header compact */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-black">publicheese</h1>
        </div>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 border border-gray-300 max-w-sm w-full mx-4">
              <h3 className="text-black text-lg font-semibold mb-4">Accès Administrateur</h3>
              <input
                type="password"
                placeholder="Code d'accès..."
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <div className="flex gap-2">
                <Button onClick={handleAdminLogin} className="flex-1 bg-black text-white hover:bg-gray-800">
                  Se connecter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 border-gray-300 text-black hover:bg-gray-50"
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
  );
};

export default Index;
