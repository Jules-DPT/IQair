<template>
  <div class="app-shell">
    <!-- Config Panel -->
    <aside class="config-panel" :class="{ 'config-panel--open': configOpen }">
      <div class="config-header">
        <span class="config-title">⚙️ Configuration IQAir</span>
        <button class="config-close" @click="configOpen = false">✕</button>
      </div>

      <div class="config-body">
        <p class="config-desc">
          Renseignez vos identifiants IQAir pour connecter votre capteur.<br>
          Ces données sont stockées localement dans votre navigateur.
        </p>

        <label class="config-label">
          User ID
          <input v-model="form.userId" class="config-input" placeholder="ex: 60a1b2c3d4e5f6..." />
        </label>
        <label class="config-label">
          Device ID
          <input v-model="form.deviceId" class="config-input" placeholder="ex: ABCD1234..." />
        </label>
        <label class="config-label">
          Token API
          <input v-model="form.token" class="config-input" type="password" placeholder="••••••••••••" />
        </label>

        <button class="config-save" @click="saveConfig">
          💾 Sauvegarder &amp; Actualiser
        </button>

        <div v-if="saved" class="config-saved">✓ Configuration sauvegardée</div>

        <hr class="config-divider" />

        <p class="config-hint">
          <strong>Où trouver ces informations ?</strong><br>
          Connectez-vous sur <a href="https://www.iqair.com" target="_blank" class="config-link">iqair.com</a>,
          allez dans votre tableau de bord → Mes appareils → API.
        </p>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="configOpen" class="overlay" @click="configOpen = false" />

    <!-- Top bar -->
    <header class="topbar">
      <div class="topbar-brand">
        <span class="topbar-icon">🌬️</span>
        <span class="topbar-name">AirDash</span>
        <span class="topbar-sub">powered by IQAir</span>
      </div>
      <div class="topbar-actions">
        <button class="btn-refresh" @click="refresh" :disabled="loading" :title="lastUpdateText">
          <span :class="{ 'spin': loading }">↻</span>
          <span class="btn-refresh-label">{{ loading ? 'Actualisation…' : lastUpdateText }}</span>
        </button>
        <button class="btn-config" @click="configOpen = true" title="Configuration">
          ⚙️
        </button>
      </div>
    </header>

    <!-- Widget area -->
    <main class="main-content">
      <div class="widget-wrapper">
        <AirQualityWidget />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlugin_meteoIQAirApiStore } from './stores/usePlugin_meteoIQAirApiStore'
import AirQualityWidget from './components/AirQualityWidget.vue'

const api = usePlugin_meteoIQAirApiStore()
const configOpen = ref(false)
const saved = ref(false)
const loading = computed(() => api.loading)

const form = ref({
  userId:   localStorage.getItem('iqair-userId')   || '',
  deviceId: localStorage.getItem('iqair-deviceId') || '',
  token:    localStorage.getItem('iqair-token')     || '',
})

const lastUpdateText = computed(() => {
  if (!api.lastUpdated) return 'Jamais actualisé'
  const d = api.lastUpdated
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `Mis à jour à ${h}:${m}`
})

function saveConfig() {
  localStorage.setItem('iqair-userId',   form.value.userId)
  localStorage.setItem('iqair-deviceId', form.value.deviceId)
  localStorage.setItem('iqair-token',    form.value.token)
  api.config.userId   = form.value.userId
  api.config.deviceId = form.value.deviceId
  api.config.token    = form.value.token
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
  api.fetchPlugin_meteoIQAir()
  configOpen.value = false
}

function refresh() {
  api.fetchPlugin_meteoIQAir()
}

onMounted(() => {
  // Injecter les credentials depuis le localStorage si absents du .env
  if (!api.config.userId && form.value.userId)     api.config.userId   = form.value.userId
  if (!api.config.deviceId && form.value.deviceId) api.config.deviceId = form.value.deviceId
  if (!api.config.token && form.value.token)       api.config.token    = form.value.token

  // Ouvrir le panel si aucun credential configuré
  if (!api.config.userId || !api.config.deviceId || !api.config.token) {
    configOpen.value = true
  }
})
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background);
  position: relative;
  overflow: hidden;
}

/* ── Top bar ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--surface-raised);
  border-bottom: 1px solid #2a2f3d;
  flex-shrink: 0;
  z-index: 10;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-icon { font-size: 22px; }

.topbar-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
}

.topbar-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: 4px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #2a2f3d;
  border: 1px solid #3a4055;
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover:not(:disabled) { background: #333a4d; }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-refresh-label { font-size: 11px; color: var(--text-muted); }

.spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-config {
  padding: 6px 10px;
  background: #2a2f3d;
  border: 1px solid #3a4055;
  border-radius: 8px;
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-config:hover { background: #333a4d; }

/* ── Main ── */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px;
}

.widget-wrapper {
  width: 100%;
  height: 100%;
  max-width: 1200px;
}

/* ── Config panel ── */
.config-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 400px;
  height: 100vh;
  background: var(--surface-raised);
  border-left: 1px solid #2a2f3d;
  z-index: 100;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.config-panel--open { right: 0; }

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #2a2f3d;
  flex-shrink: 0;
}

.config-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.config-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.config-close:hover { background: #2a2f3d; }

.config-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

.config-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-input {
  padding: 9px 12px;
  background: var(--surface-hover);
  border: 1px solid #3a4055;
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  font-family: monospace;
}

.config-input:focus { border-color: #0EA5E9; }

.config-save {
  padding: 10px 16px;
  background: #0EA5E9;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.config-save:hover { background: #0284C7; }

.config-saved {
  text-align: center;
  color: #34d399;
  font-size: 13px;
  font-weight: 600;
}

.config-divider {
  border: none;
  border-top: 1px solid #2a2f3d;
}

.config-hint {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

.config-link {
  color: #0EA5E9;
  text-decoration: none;
}

.config-link:hover { text-decoration: underline; }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 90;
}
</style>
