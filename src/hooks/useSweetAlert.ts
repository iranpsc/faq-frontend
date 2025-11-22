import { useCallback } from 'react';
import Swal from 'sweetalert2';

// Helper function to detect current theme
const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

// Centralized SweetAlert2 hook for consistent usage across the app
export function useSweetAlert() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fire = useCallback(async (options: any) => {
    return await Swal.fire(options);
  }, []);

  const showLoading = useCallback(() => {
    Swal.showLoading();
  }, []);

  const close = useCallback(() => {
    Swal.close();
  }, []);

  const showValidationMessage = useCallback((message: string) => {
    Swal.showValidationMessage(message);
  }, []);

  const showAuthenticationDialog = useCallback(async (onLogin: () => Promise<void>) => {
    console.log('showAuthenticationDialog called'); // Debug log
    
    const isDark = isDarkMode();
    
    const result = await Swal.fire({
      html: `
        <div style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">وارد حساب کاربری شوید</h2>
          <p style="margin: 0;">برای ادامه این عملیات باید وارد حساب کاربری خود شوید.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'ورود',
      confirmButtonColor: isDark ? '#60a5fa' : '#3b82f6',
      focusConfirm: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      showLoaderOnConfirm: true,
      backdrop: true,
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f9fafb' : '#171717',
      preConfirm: async () => {
        try {
          console.log('Login button clicked'); // Debug log
          await onLogin();
          return true;
        } catch (error) {
          console.error('Login error:', error);
          Swal.showValidationMessage('خطا در ورود. لطفاً دوباره تلاش کنید.');
          return false;
        }
      }
    });

    console.log('SweetAlert result:', result); // Debug log

    if (result.isConfirmed) {
      console.log('Login confirmed'); // Debug log
      // Login was initiated in preConfirm
    } else {
      console.log('Dialog dismissed:', result.dismiss); // Debug log
    }
  }, []);

  const showRegisterRedirect = useCallback(async () => {
    console.log('showRegisterRedirect called'); // Debug log
    
    const isDark = isDarkMode();
    
    // Show loading dialog
    await Swal.fire({
      title: 'در حال انتقال...',
      text: 'لطفاً صبر کنید',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f9fafb' : '#171717',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Wait a bit to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Opening registration page...'); // Debug log
      
      // Try to open the registration page in a new tab
      const registrationUrl = 'https://accounts.irpsc.com/register';
      const newWindow = window.open(registrationUrl, '_blank', 'noopener,noreferrer');
      
      // Close the loading dialog
      Swal.close();
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked or failed, redirect in the same window
        console.log('Popup blocked or failed, redirecting in same window');
        // Small delay to ensure dialog closes
        await new Promise(resolve => setTimeout(resolve, 200));
        window.location.href = registrationUrl;
        return;
      }
      
      // Successfully opened in new tab, close the dialog
      // The dialog is already closed above
    } catch (error) {
      console.error('Register redirect error:', error);
      Swal.close();
      
      // Show error dialog
      const isDarkError = isDarkMode();
      await Swal.fire({
        title: 'خطا',
        text: 'خطا در باز کردن صفحه ثبت نام. لطفاً دوباره تلاش کنید.',
        icon: 'error',
        confirmButtonText: 'باشه',
        background: isDarkError ? '#1f2937' : '#ffffff',
        color: isDarkError ? '#f9fafb' : '#171717',
        confirmButtonColor: isDarkError ? '#60a5fa' : '#3b82f6',
      });
    }
  }, []);

  return {
    fire,
    showLoading,
    close,
    showValidationMessage,
    showAuthenticationDialog,
    showRegisterRedirect,
    DismissReason: Swal.DismissReason
  };
}
