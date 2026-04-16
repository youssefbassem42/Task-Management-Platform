<template>
  <div class="empty-state-page">
    <AppEmptyState title="404 - Page Not Found" description="The page you are looking for does not exist or has been moved.">
      <template #action>
        <AppButton @click="$router.push('/')">Go to Dashboard</AppButton>
      </template>
    </AppEmptyState>
  </div>
</template>

<style scoped>
.empty-state-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--c-bg);
}
</style>
