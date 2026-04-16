import { ref, computed } from 'vue';

export function usePagination(itemsRef, pageSize = 10) {
  const currentPage = ref(1);
  
  const totalPages = computed(() => {
    return Math.ceil((itemsRef.value?.length || 0) / pageSize);
  });
  
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return (itemsRef.value || []).slice(start, start + pageSize);
  });
  
  const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };
  
  return { currentPage, totalPages, paginatedItems, setPage, pageSize };
}
