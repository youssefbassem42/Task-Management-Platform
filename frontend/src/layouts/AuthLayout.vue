<template>
  <div class="relative min-h-screen overflow-hidden bg-surface text-on-surface">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[-8rem] top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-primary-fixed-dim/60 blur-[110px]"></div>
      <div class="absolute bottom-[-10rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-secondary-fixed/40 blur-[140px]"></div>
      <div class="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/60 to-transparent"></div>
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
      <section class="hidden lg:flex lg:flex-col lg:justify-center">
        <div class="max-w-xl">
          <AppLogo :size="56" />
          <h2 class="mt-10 font-['Sora'] text-5xl font-[700] leading-[1.02] tracking-[-0.05em] text-on-surface">
            Calm, structured work for teams that move fast.
          </h2>
          <p class="mt-5 max-w-lg text-lg text-on-surface-variant">
            Taskify brings boards, priorities, files, and accountability into one polished workflow surface.
          </p>
          <div class="mt-10 grid grid-cols-2 gap-4">
            <div class="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_24px_50px_-30px_rgba(0,37,102,0.5)] backdrop-blur">
              <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">space_dashboard</span>
              </div>
              <p class="font-semibold text-on-surface">Overview-first workspace</p>
              <p class="mt-2 text-sm text-on-surface-variant">Track boards, priorities, and delivery momentum without leaving the shell.</p>
            </div>
            <div class="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_24px_50px_-30px_rgba(0,37,102,0.5)] backdrop-blur">
              <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">bolt</span>
              </div>
              <p class="font-semibold text-on-surface">Fast onboarding flow</p>
              <p class="mt-2 text-sm text-on-surface-variant">The auth experience now matches the polished `/stitch` identity instead of default starter styles.</p>
            </div>
          </div>
        </div>
      </section>

      <main class="relative w-full max-w-[480px]">
        <div class="rounded-[34px] border border-white/70 bg-white/88 p-8 shadow-[0_32px_80px_-32px_rgba(0,37,102,0.38)] backdrop-blur sm:p-10">
          <header class="mb-8 flex flex-col gap-2">
            <AppLogo :size="42" />
          </header>

          <router-view></router-view>
        </div>
        <p class="mt-5 text-center text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant/80 lg:hidden">
          Taskify Workflow OS
        </p>
      </main>
    </div>

    <AppToast />
  </div>
</template>

<script setup>
import AppLogo from '@/components/shared/AppLogo.vue'
</script>
