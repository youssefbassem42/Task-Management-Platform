<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-box glass-panel">
        <div class="brand">
          <h1 class="brand-text">Taskify</h1>
          <p class="brand-subtext">Manage, Track, Succeed.</p>
        </div>
        <router-view></router-view>
      </div>
    </div>
    <AppToast />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--c-bg) 0%, var(--c-secondary) 100%);
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

/* Background blob */
.auth-layout::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--c-primary-alpha) 0%, transparent 70%);
  top: -200px;
  left: -200px;
  z-index: 0;
}

.auth-container {
  width: 100%;
  max-width: 450px;
  z-index: 1;
}

.auth-box {
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.brand {
  text-align: center;
  margin-bottom: var(--space-8);
}
.brand-text {
  font-size: var(--font-size-3xl);
  color: var(--c-primary);
  margin-bottom: var(--space-1);
}
.brand-subtext {
  color: var(--c-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
