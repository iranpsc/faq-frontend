/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'sweetalert2' {
  const Swal: any;
  export default Swal;
}

declare module 'clsx' {
  function clsx(...inputs: any[]): string;
  export = clsx;
  export default clsx;
}
