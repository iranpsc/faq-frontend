import { useCallback } from 'react';
import Swal from 'sweetalert2';

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

  const showAuthenticationDialog = useCallback(async (onLogin: () => Promise<void>, onRegister: () => Promise<void>) => {
    console.log('showAuthenticationDialog called'); // Debug log
    
    const result = await Swal.fire({
      html: `
        <div class="text-gray-800 dark:text-white">
          <h2 class="text-xl font-bold mb-2">وارد حساب کاربری شوید</h2>
          <p>برای ادامه این عملیات باید وارد حساب کاربری خود شوید. اگر حساب کاربری ندارید، ثبت نام کنید.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'ورود',
      cancelButtonText: 'ثبت نام',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#10b981',
      reverseButtons: true,
      focusConfirm: false,
      focusCancel: false,
      allowOutsideClick: true,
      allowEscapeKey: true,
      showLoaderOnConfirm: true,
      backdrop: true,
      background: '#ffffff',
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
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Register button clicked (cancel)'); // Debug log
      // User clicked the register button (cancel button)
      await onRegister();
    } else {
      console.log('Dialog dismissed for other reason:', result.dismiss); // Debug log
    }
  }, []);

  const showRegisterRedirect = useCallback(async () => {
    console.log('showRegisterRedirect called'); // Debug log
    
    await Swal.fire({
      title: 'در حال انتقال...',
      text: 'لطفاً صبر کنید',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Opening registration page...'); // Debug log
      
      // Try to open the registration page
      const newWindow = window.open('https://accounts.irpsc.com/register', '_blank');
      
      if (!newWindow) {
        // If popup was blocked, try redirecting in the same window
        console.log('Popup blocked, trying redirect in same window');
        Swal.close();
        window.location.href = 'https://accounts.irpsc.com/register';
        return;
      }
      
      Swal.close();
    } catch (error) {
      console.error('Register redirect error:', error);
      Swal.close();
      await Swal.fire({
        title: 'خطا',
        text: 'خطا در باز کردن صفحه ثبت نام.',
        icon: 'error',
        confirmButtonText: 'باشه'
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
