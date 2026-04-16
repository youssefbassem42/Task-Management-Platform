import { ref } from 'vue';
import { useUIStore } from '@/stores/uiStore';

export function useFileUpload(options = { maxSizeMB: 5, accept: 'image/jpeg, image/png' }) {
  const file = ref(null);
  const preview = ref(null);
  const error = ref(null);
  const uiStore = useUIStore();

  const handleFileChange = (e) => {
    error.value = null;
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      file.value = null;
      preview.value = null;
      return;
    }

    if (options.accept && !options.accept.includes(selectedFile.type)) {
      error.value = 'Invalid file type';
      uiStore.addToast('error', error.value);
      return;
    }

    if (options.maxSizeMB && selectedFile.size > options.maxSizeMB * 1024 * 1024) {
      error.value = `File is too large (Max ${options.maxSizeMB}MB)`;
      uiStore.addToast('error', error.value);
      return;
    }

    file.value = selectedFile;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.value = e.target.result;
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    file.value = null;
    preview.value = null;
    error.value = null;
  };

  return { file, preview, error, handleFileChange, clearFile };
}
