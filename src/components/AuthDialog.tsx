'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface AuthDialogProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthDialog({ visible, onClose }: AuthDialogProps) {
  const { login } = useAuth();
  const { showAuthenticationDialog, showRegisterRedirect } = useSweetAlert();

  useEffect(() => {
    if (visible) {
      const handleLogin = async () => {
        try {
          await login();
        } catch (error) {
          console.error('Login error:', error);
          throw error; // Re-throw to let SweetAlert handle the error
        }
      };

      const handleRegister = async () => {
        console.log('handleRegister called in AuthDialog'); // Debug log
        await showRegisterRedirect();
      };

      showAuthenticationDialog(handleLogin, handleRegister).finally(() => {
        onClose();
      });
    }
  }, [visible, login, showAuthenticationDialog, showRegisterRedirect, onClose]);

  // This component doesn't render anything since SweetAlert2 handles the UI
  return null;
}
