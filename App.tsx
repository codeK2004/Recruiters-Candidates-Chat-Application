
import React, { useState, useEffect } from 'react';
import AuthComponent from './components/AuthComponent';
import ChatComponent from './components/ChatComponent';
import { User } from './types';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('currentUser'); // Clear corrupted data
        return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      document.title = `${currentUser.username} - ${APP_TITLE}`; // Use username
    } else {
      localStorage.removeItem('currentUser');
      document.title = APP_TITLE; 
    }
  }, [currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthComponent onAuthSuccess={handleAuthSuccess} />;
  }

  return <ChatComponent currentUser={currentUser} onLogout={handleLogout} />;
};

export default App;