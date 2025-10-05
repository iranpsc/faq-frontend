/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'sweetalert2' {
  interface SweetAlertOptions {
    title?: string;
    text?: string;
    html?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    showCancelButton?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    reverseButtons?: boolean;
    showConfirmButton?: boolean;
    timer?: number;
    timerProgressBar?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    [key: string]: unknown;
  }

  interface SweetAlertResult {
    isConfirmed: boolean;
    isDenied?: boolean;
    isDismissed?: boolean;
    value?: unknown;
    dismiss?: string;
  }

  interface SweetAlert {
    fire(options: SweetAlertOptions): Promise<SweetAlertResult>;
    showLoading(): void;
    close(): void;
    showValidationMessage(message: string): void;
    DismissReason: {
      cancel: 'cancel';
      backdrop: 'backdrop';
      close: 'close';
      esc: 'esc';
      timer: 'timer';
    };
  }

  const Swal: SweetAlert;
  export default Swal;
}

declare module 'clsx' {
  type ClassValue = string | number | boolean | undefined | null | { [key: string]: unknown } | ClassValue[];
  function clsx(...inputs: ClassValue[]): string;
  export = clsx;
  export default clsx;
}
