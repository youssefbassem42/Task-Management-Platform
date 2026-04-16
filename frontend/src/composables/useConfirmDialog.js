import { reactive } from 'vue';

const dialogState = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: null
});

export function useConfirmDialog() {
  const open = (options) => {
    dialogState.title = options.title || 'Confirm Action';
    dialogState.message = options.message || 'Are you sure you want to proceed?';
    dialogState.confirmText = options.confirmText || 'Confirm';
    dialogState.cancelText = options.cancelText || 'Cancel';
    dialogState.onConfirm = async () => {
      if (options.onConfirm) {
        await options.onConfirm();
      }
      close();
    };
    dialogState.isOpen = true;
  };

  const close = () => {
    dialogState.isOpen = false;
    dialogState.onConfirm = null;
  };

  return { dialogState, open, close };
}
