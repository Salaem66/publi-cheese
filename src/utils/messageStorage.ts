
export interface Message {
  id: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

// Simuler un stockage partagé avec localStorage mais avec un mécanisme de synchronisation
const STORAGE_KEY = 'publicheese_messages';
const SYNC_KEY = 'publicheese_sync';

let messageListeners: (() => void)[] = [];

export const messageStorage = {
  // Obtenir tous les messages
  getMessages(): Message[] {
    try {
      const messages = localStorage.getItem(STORAGE_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch {
      return [];
    }
  },

  // Sauvegarder les messages
  saveMessages(messages: Message[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    localStorage.setItem(SYNC_KEY, Date.now().toString());
    // Notifier tous les listeners
    messageListeners.forEach(listener => listener());
  },

  // Ajouter un nouveau message
  addMessage(message: Message): void {
    const messages = this.getMessages();
    messages.push(message);
    this.saveMessages(messages);
  },

  // Mettre à jour le statut d'un message
  updateMessageStatus(messageId: string, status: 'approved' | 'rejected'): void {
    const messages = this.getMessages();
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    );
    this.saveMessages(updatedMessages);
  },

  // Obtenir les messages approuvés
  getApprovedMessages(): Message[] {
    return this.getMessages()
      .filter(msg => msg.status === 'approved')
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  // Obtenir les messages en attente
  getPendingMessages(): Message[] {
    return this.getMessages()
      .filter(msg => msg.status === 'pending')
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  // Ajouter un listener pour les changements
  addListener(listener: () => void): void {
    messageListeners.push(listener);
  },

  // Supprimer un listener
  removeListener(listener: () => void): void {
    messageListeners = messageListeners.filter(l => l !== listener);
  },

  // Vérifier si les données ont été mises à jour par un autre onglet
  getLastSync(): number {
    const sync = localStorage.getItem(SYNC_KEY);
    return sync ? parseInt(sync, 10) : 0;
  }
};

// Écouter les changements du localStorage pour synchroniser entre onglets
window.addEventListener('storage', (e) => {
  if (e.key === SYNC_KEY) {
    messageListeners.forEach(listener => listener());
  }
});
