import { ref } from 'vue';
import { saveAs } from 'file-saver';
import { useUIStore } from '@/stores/uiStore';

export function useDownload() {
  const isDownloading = ref(false);
  const uiStore = useUIStore();

  const downloadBlob = async (apiCall, defaultFilename = 'download') => {
    if (isDownloading.value) return;
    isDownloading.value = true;
    try {
      const response = await apiCall();
      // Assume the response is a Blob that axios interceptor returned.
      // Or if interceptor doesn't unwrap blob, we might need to handle it.
      // But let's just attempt to save the response directly.
      const blob = new Blob([response], { type: 'application/octet-stream' });
      saveAs(blob, `${defaultFilename}-${new Date().getTime()}.xlsx`);
      uiStore.addToast('success', 'Download complete');
    } catch (err) {
      uiStore.addToast('error', 'Download failed');
    } finally {
      isDownloading.value = false;
    }
  };

  return { isDownloading, downloadBlob };
}
