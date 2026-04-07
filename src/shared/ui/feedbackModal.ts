import Swal from 'sweetalert2';

type ModalType = 'success' | 'error' | 'warning' | 'info';

const getThemeColors = () => {
  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    return {
      background: '#0f172a',
      color: '#e2e8f0',
      confirmButtonColor: '#10b981',
    };
  }

  return {
    background: '#ffffff',
    color: '#0f172a',
    confirmButtonColor: '#10b981',
  };
};

const openModal = async (type: ModalType, title: string, text: string) => {
  const theme = getThemeColors();

  await Swal.fire({
    icon: type,
    title,
    text,
    background: theme.background,
    color: theme.color,
    confirmButtonColor: theme.confirmButtonColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'rounded-2xl',
      title: 'font-bold',
      confirmButton: 'rounded-lg font-semibold px-6 py-2',
    },
  });
};

export const showSuccessModal = (message: string, title = 'Sucesso') =>
  openModal('success', title, message);

export const showErrorModal = (message: string, title = 'Erro') =>
  openModal('error', title, message);

export const showWarningModal = (message: string, title = 'Atenção') =>
  openModal('warning', title, message);

export const showInfoModal = (message: string, title = 'Informação') =>
  openModal('info', title, message);

export const showConfirmModal = async (
  message: string,
  title = 'Confirmação',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
) => {
  const theme = getThemeColors();

  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    background: theme.background,
    color: theme.color,
    showCancelButton: true,
    confirmButtonColor: theme.confirmButtonColor,
    cancelButtonColor: '#64748b',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'rounded-2xl',
      title: 'font-bold',
      confirmButton: 'rounded-lg font-semibold px-5 py-2',
      cancelButton: 'rounded-lg font-semibold px-5 py-2',
    },
  });

  return result.isConfirmed;
};
