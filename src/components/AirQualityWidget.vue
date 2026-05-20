<template>
  <article
    ref="rootEl"
    class="flex w-full h-full flex-col items-center rounded-3xl bg-surface-raised overflow-hidden"
  >
    <header
      class="w-full shrink-0 flex items-center justify-between px-8 pt-3 rounded-xl"
      :style="{ fontSize: titleSize }"
    >
      <span class="font-bold" style="color: var(--text)">Qualité de l'Air</span>
      <span class="tracking-widest" style="font-size: 10px; color: var(--text-muted)">
        Capteurs IQAir Analytics
      </span>
    </header>

    <section
      v-if="api.error && api2.error"
      class="z-2 rounded-2xl grow flex items-center justify-center w-11/12 mb-2"
    >
      <div class="text-center px-4">
        <div style="font-size: 48px; margin-bottom: 12px">⚠️</div>
        <p style="color: #f87171;" :style="{ fontSize: contentSize }">{{ api.error }}</p>
      </div>
    </section>

    <section
      v-else-if="api.loading && api2.loading"
      class="z-2 rounded-2xl grow flex items-center justify-center w-11/12 mb-2"
    >
      <div class="text-center">
        <div class="loading-spinner"></div>
        <p style="color: var(--text-muted); margin-top: 12px; font-size: 14px">Chargement des données…</p>
      </div>
    </section>

    <section
      v-else
      class="z-2 rounded-2xl grow w-11/12 mb-2 flex gap-4 min-h-0"
    >
      <template v-for="(sensor, idx) in sensors" :key="idx">
        <div
          class="flex-1 grid min-h-0"
          style="grid-template-columns: 0.8fr 0.8fr 1fr 1fr; grid-template-rows: auto 1fr 1fr 0.5fr;"
        >
          <div 
            class="flex items-center justify-between px-2 pb-1" 
            style="grid-column: 1 / 5; grid-row: 1 / 2;"
          >
            <span class="font-bold uppercase tracking-tight" style="color: var(--text); font-size: 11px">
              {{ idx === 0 ? api.name : api2.name }}
            </span>
            <span 
              v-if="idx === 1" 
              class="text-sky-400 font-bold italic animate-pulse" 
              style="font-size: 9px"
            >
              ❄️ AIR CONDITIONNÉ
            </span>
          </div>

          <div
            class="flex bg-surface-hover rounded-2xl m-1 text-center justify-center"
            style="grid-column: 1 / 3; grid-row: 2 / 4; padding: 4px;"
          >
            <div class="z-50 flex flex-col items-center justify-center w-full h-full">
              <div class="relative flex items-center justify-center w-full h-full">
                <canvas
                  :ref="el => { if (el) windCanvases[idx] = el as HTMLCanvasElement }"
                  class="absolute inset-0 w-full h-full"
                ></canvas>
                <div
                  class="absolute flex flex-col items-center justify-center rounded-full bg-transparent"
                  :style="['width:', scoreInnerSize, 'height:', scoreInnerSize].join('')"
                >
                  <p class="font-semibold leading-none" :style="{ fontSize: scoreTopSize, color: sensor.windColor.value }">
                    {{ Math.round(sensor.globalScore.value) }}
                  </p>
                  <div class="w-3/5 border-t my-1" :style="{ borderColor: sensor.windColor.value }"></div>
                  <span class="leading-none" :style="{ fontSize: scoreBottomSize, color: sensor.windColor.value }">10</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex text-center px-1 pb-1" style="grid-column: 1 / 5; grid-row: 4 / 5;">
            <div class="flex items-stretch bg-surface-hover rounded-xl overflow-hidden w-full h-full">
              <div class="relative shrink-0 overflow-hidden h-full" :style="{ width: cityImgWidth }">
                <img src="../assets/larochelle.jpg" alt="City" class="h-full w-full object-cover">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="absolute inset-0 flex items-center justify-center p-1">
                  <span class="text-white font-bold drop-shadow-lg text-center leading-tight w-full" :style="{ fontSize: cityLabelSize }">
                    {{ idx === 0 ? (api.location?.city || '') : (api2.location?.city || '') }}, {{ idx === 0 ? (api.location?.country || '') : (api2.location?.country || '') }}
                  </span>
                </div>
              </div>

              <div class="flex flex-1 items-center overflow-hidden h-full">
                <div
                  v-for="(metric, i) in sensor.outdoorMetrics.value"
                  :key="metric.label"
                  class="flex flex-1 flex-col items-start justify-center px-2 overflow-hidden h-full"
                  :style="i < sensor.outdoorMetrics.value.length - 1 ? 'border-right: 1px solid var(--text-muted)' : ''"
                >
                  <span class="font-semibold truncate w-full text-left" style="color: var(--text-muted)" :style="{ fontSize: metricLabelSize }">
                    {{ metric.label }}
                  </span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <img :src="metric.icon" :alt="metric.label" :style="{ width: metricIconSize, height: metricIconSize }" class="opacity-80 shrink-0">
                    <span class="font-bold leading-none" style="color: var(--text)" :style="{ fontSize: metricValueSize }">
                      {{ metric.value }}<span class="font-medium" style="color: #9ca3af" :style="{ fontSize: metricUnitSize }">{{ metric.unit }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-1 grid-cols-2 grid-rows-2 m-1" style="grid-column: 3 / 5; grid-row: 2 / 4;">
            <div
              v-for="tile in sensor.indoorTiles.value"
              :key="tile.label"
              class="flex flex-col bg-surface-hover rounded-2xl overflow-hidden min-h-0 min-w-0"
            >
              <div class="flex items-center px-4 pt-2 pb-0.5 shrink-0">
                <span class="font-semibold truncate" style="color: #6b7280" :style="{ fontSize: tileLabelSize }">{{ tile.label }}</span>
              </div>
              <div class="flex flex-1 items-center justify-start px-2 py-1 min-h-0 overflow-hidden">
                <img :src="tile.icon" :alt="tile.label" :style="{ width: tileIconSize, height: tileIconSize }" class="shrink-0 opacity-80">
                <span class="flex-1 text-center font-bold leading-none overflow-hidden" :style="{ fontSize: tileValueSize }">
                  {{ tile.value }}<span class="font-medium" style="color: var(--text-muted)" :style="{ fontSize: tileUnitSize }">{{ tile.unit }}</span>
                </span>
              </div>
              <div class="flex items-center justify-left px-2 py-2 shrink-0">
                <div
                  class="shrink-0 text-center px-3 py-0.5 rounded-full"
                  :class="scoreToColor(tile.score)"
                  style="color: white"
                  :style="{ fontSize: tileBadgeSize }"
                >
                  {{ scoreToLabel(tile.score) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="idx === 0" class="w-px bg-surface-hover self-stretch my-4 shrink-0"></div>
      </template>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick, onBeforeMount, type Ref } from 'vue'
import { usePlugin_meteoIQAirApiStore } from '../stores/usePlugin_meteoIQAirApiStore'
import { usePlugin_meteoIQAir2ApiStore } from '../stores/usePlugin_meteoIQAir2ApiStore'

import imgTemperature from '/src/assets/temperature.png'
import imgHumidite    from '/src/assets/humidite.png'
import imgParticules  from '/src/assets/particules.png'
import imgCo2         from '/src/assets/co2.png'

const rootEl       = ref<HTMLElement | null>(null)
const windCanvases = ref<HTMLCanvasElement[]>([])
const pluginWidth  = ref(0)
const pluginHeight = ref(0)

const api  = usePlugin_meteoIQAirApiStore()
const api2 = usePlugin_meteoIQAir2ApiStore()

const thetaRm  = ref<number | null>(null)
const thetaRm2 = ref<number | null>(null)

let ro: ResizeObserver | null = null
let animationFrameIds: number[] = []
let canvasRos: (ResizeObserver | null)[] = []
let timer: ReturnType<typeof setInterval> | null = null
const windSpeed = 0.5

// ── Helpers ──
function lerp(v: number, vMin: number, vMax: number, outMin: number, outMax: number): number {
  const t = Math.min(1, Math.max(0, (v - vMin) / (vMax - vMin)))
  return outMin + t * (outMax - outMin)
}
function px(v: number): string { return `${Math.round(v)}px` }

// ── Responsive sizes ──
const headerH  = computed(() => lerp(pluginHeight.value, 50, 600, 24, 48))
const sectionH = computed(() => Math.max(0, pluginHeight.value - headerH.value))
const colW     = computed(() => pluginWidth.value * 0.48)

const scoreCellW = computed(() => colW.value * 0.40)
const scoreCellH = computed(() => sectionH.value * 0.65)
const scoreBoxPx = computed(() => Math.min(scoreCellW.value, scoreCellH.value) * 0.62)
const scoreInnerSize  = computed(() => px(scoreBoxPx.value * 0.72))
const scoreTopSize    = computed(() => px(scoreBoxPx.value * 0.27))
const scoreBottomSize = computed(() => px(scoreBoxPx.value * 0.19))

const bandCellH     = computed(() => sectionH.value * 0.18)
const cityImgWidth  = computed(() => px(lerp(bandCellH.value, 20, 120, 40, 140)))
const cityLabelSize = computed(() => px(lerp(bandCellH.value, 20, 120, 6, 14)))
const metricLabelSize = computed(() => px(lerp(bandCellH.value, 20, 120, 5, 11)))
const metricValueSize = computed(() => px(lerp(bandCellH.value, 20, 120, 8, 22)))
const metricUnitSize  = computed(() => px(lerp(bandCellH.value, 20, 120, 5, 11)))
const metricIconSize  = computed(() => px(lerp(bandCellH.value, 20, 120, 8, 26)))

const tileCellW = computed(() => colW.value * 0.25)
const tileCellH = computed(() => sectionH.value * 0.35)
const tileMin   = computed(() => Math.min(tileCellW.value, tileCellH.value))
const tileLabelSize = computed(() => px(lerp(tileMin.value, 30, 200, 8, 14)))
const tileValueSize = computed(() => px(lerp(tileMin.value, 30, 200, 9, 30)))
const tileUnitSize  = computed(() => px(lerp(tileMin.value, 30, 200, 5, 14)))
const tileIconSize  = computed(() => px(lerp(tileMin.value, 30, 200, 10, 32)))
const tileBadgeSize = computed(() => px(lerp(tileMin.value, 30, 200, 5, 11)))

const titleSize   = computed(() => px(lerp(pluginWidth.value, 200, 700, 11, 22)))
const contentSize = computed(() => px(lerp(pluginWidth.value, 200, 700, 10, 18)))

// ── Score Logic ──
function interpolate(x: number, x1: number, y1: number, x2: number, y2: number): number {
  const a = (y1 - y2) / (x1 - x2)
  return Math.max(0, Math.min(10, a * x + (y1 - a * x1)))
}

function getSubIndexTemp(temp: number | null): number {
  if (temp === null) return 0
  const opt = 21.5
  if (temp >= opt) {
    if (temp <= 24) return interpolate(temp, opt, 10, 24, 7.5)
    if (temp <= 25) return interpolate(temp, 24, 7.5, 25, 5)
    if (temp <= 26) return interpolate(temp, 25, 5, 26, 2.5)
    return interpolate(temp, 26, 2.5, 27, 0)
  } else {
    if (temp >= 19) return interpolate(temp, 19, 7.5, opt, 10)
    if (temp >= 18) return interpolate(temp, 18, 5, 19, 7.5)
    if (temp >= 17) return interpolate(temp, 17, 2.5, 18, 5)
    return interpolate(temp, 16, 0, 17, 2.5)
  }
}

function getSubIndexHum(hum: number | null): number {
  if (hum === null) return 0
  const opt = 52.5
  if (hum >= opt) {
    if (hum <= 60) return interpolate(hum, opt, 10, 60, 7.5)
    if (hum <= 70) return interpolate(hum, 60, 7.5, 70, 5)
    if (hum <= 80) return interpolate(hum, 70, 5, 80, 2.5)
    return interpolate(hum, 80, 2.5, 90, 0)
  } else {
    if (hum >= 45) return interpolate(hum, 45, 7.5, opt, 10)
    if (hum >= 40) return interpolate(hum, 40, 5, 45, 7.5)
    if (hum >= 35) return interpolate(hum, 35, 2.5, 40, 5)
    return interpolate(hum, 30, 0, 35, 2.5)
  }
}

function getSubIndexCO2(co2: number | null): number {
  if (co2 === null) return 0
  if (co2 <= 400)  return 10
  if (co2 <= 800)  return interpolate(co2, 400, 10, 800, 7.5)
  if (co2 <= 1000) return interpolate(co2, 800, 7.5, 1000, 5)
  if (co2 <= 1200) return interpolate(co2, 1000, 5, 1200, 2.5)
  return interpolate(co2, 1200, 2.5, 1500, 0)
}

function getSubIndexPM25(pm: number | null): number {
  if (pm === null) return 0
  if (pm <= 0)  return 10
  if (pm <= 11) return interpolate(pm, 0, 10, 11, 7.5)
  if (pm <= 14) return interpolate(pm, 11, 7.5, 14, 5)
  if (pm <= 19) return interpolate(pm, 14, 5, 19, 2.5)
  return interpolate(pm, 19, 2.5, 21, 0)
}

function scoreToLabel(score: number): string {
  if (score >= 9.5) return 'Optimum'
  if (score >= 7.5) return 'Excellent'
  if (score >= 5)   return 'Bon'
  if (score >= 2.5) return 'Moyen'
  return 'Mauvais'
}

function scoreToColor(score: number): string {
  if (score >= 9.5) return 'bg-sky-300'
  if (score >= 7.5) return 'bg-sky-500'
  if (score >= 5)   return 'bg-blue-500'
  if (score >= 2.5) return 'bg-cyan-700'
  return 'bg-gray-700'
}

function globalScoreToColor(score: number): string {
  if (score >= 9.5) return '#7DD3FC'
  if (score >= 7.5) return '#0EA5E9'
  if (score >= 5)   return '#9CA3AF'
  if (score >= 2.5) return '#6B7280'
  return '#374151'
}

function isHorsSaisonChauffe(): boolean {
  const month = new Date().getMonth()
  const day   = new Date().getDate()
  if (month >= 5 && month <= 10) return true
  if (month === 4 && day >= 15)  return true
  if (month === 10 && day <= 15) return true
  return false
}

function updateThetaRm(thetaRmPrev: number, thetaEdPrev: number): number {
  return 0.2 * thetaEdPrev + 0.8 * thetaRmPrev
}

function getThetaOpt(tR: number): number {
  return 0.33 * tR + 18.8
}

function getSubIndexTempHorsSaisonChauffe(tempIndoor: number, tR: number): number {
  const opt = getThetaOpt(tR)
  if (tempIndoor >= opt) {
    if (tempIndoor <= opt + 1) return interpolate(tempIndoor, opt, 10, opt + 1, 7.5)
    if (tempIndoor <= opt + 2) return interpolate(tempIndoor, opt + 1, 7.5, opt + 2, 5)
    if (tempIndoor <= opt + 3) return interpolate(tempIndoor, opt + 2, 5, opt + 3, 2.5)
    return interpolate(tempIndoor, opt + 3, 2.5, opt + 4, 0)
  } else {
    if (tempIndoor >= opt - 1) return interpolate(tempIndoor, opt - 1, 7.5, opt, 10)
    if (tempIndoor >= opt - 2) return interpolate(tempIndoor, opt - 2, 5, opt - 1, 7.5)
    if (tempIndoor >= opt - 3) return interpolate(tempIndoor, opt - 3, 2.5, opt - 2, 5)
    return interpolate(tempIndoor, opt - 4, 0, opt - 3, 2.5)
  }
}

// ── Factory ──
type AnyStore = ReturnType<typeof usePlugin_meteoIQAirApiStore>

function makeSensorData(store: AnyStore, tR: Ref<number | null>, forceChauffe = false) {
  const subIndexTemp = computed(() => {
    if (!forceChauffe && isHorsSaisonChauffe() && tR.value !== null) {
      return getSubIndexTempHorsSaisonChauffe(store.tempIndoor ?? 0, tR.value)
    }
    return getSubIndexTemp(store.tempIndoor)
  })

  const subIndexHum  = computed(() => getSubIndexHum(store.humIndoor))
  const subIndexCO2  = computed(() => getSubIndexCO2(store.co2))
  const subIndexPM25 = computed(() => getSubIndexPM25(store.pm25Indoor))

  const globalScore = computed(() =>
    Math.min(subIndexTemp.value, subIndexHum.value, subIndexCO2.value, subIndexPM25.value)
  )

  const windColor = computed(() => globalScoreToColor(globalScore.value))

  const outdoorMetrics = computed(() => [
    { label: 'Température', icon: imgTemperature, value: store.tempOutdoor,  unit: '°C'      },
    { label: 'Humidité',    icon: imgHumidite,    value: store.humOutdoor,   unit: '%'       },
    { label: 'Particules',  icon: imgParticules,  value: store.pm25Outdoor,  unit: ' µg/m³' },
    { label: 'CO₂',         icon: imgCo2,         value: 420,                unit: ' ppm'    },
  ])

  const indoorTiles = computed(() => [
    { label: 'Température', icon: imgTemperature, value: store.tempIndoor,  unit: '°C',      score: subIndexTemp.value  },
    { label: 'Humidité',    icon: imgHumidite,    value: store.humIndoor,   unit: '%',       score: subIndexHum.value   },
    { label: 'Particules',  icon: imgParticules,  value: store.pm25Indoor,  unit: ' µg/m³', score: subIndexPM25.value  },
    { label: 'CO₂',         icon: imgCo2,         value: store.co2,         unit: ' ppm',   score: subIndexCO2.value   },
  ])

  return { globalScore, windColor, outdoorMetrics, indoorTiles }
}

const sensor1 = makeSensorData(api, thetaRm)
const sensor2 = makeSensorData(api2 as unknown as AnyStore, thetaRm2, true) // Force Chauffe/AC

const sensors = computed(() => [sensor1, sensor2])

// ── Canvas animation ──
function startWindAnimation(canvas: HTMLCanvasElement, getColor: () => string, idx: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resizeCanvas() {
    if (!canvas?.parentElement) return
    canvas.width  = canvas.parentElement.clientWidth  * 2
    canvas.height = canvas.parentElement.clientHeight * 2
  }

  const cRo = new ResizeObserver(() => resizeCanvas())
  cRo.observe(canvas.parentElement!)
  canvasRos[idx] = cRo
  resizeCanvas()

  let t = 0
  function draw() {
    if (!canvas || !ctx) return
    const w = canvas.width
    const h = canvas.height
    const radius = Math.min(w, h) / 2.5
    const color  = getColor()

    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2)
    ctx.clip()

    for (let i = -60; i < 60; i += 1) {
      ctx.strokeStyle = color + '80'
      ctx.lineWidth   = 0.8
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      for (let j = 0; j < w; j += 10) {
        ctx.lineTo(
          10 * Math.sin(i / 10) + j + 0.008 * j * j,
          Math.floor(
            h / 2 + j / 2 * Math.sin(j / 50 - t / 50 - i / 118) +
            (i * 0.9) * Math.sin(j / 25 - (i + t) / 65)
          )
        )
      }
      ctx.stroke()
    }
    ctx.restore()

    ctx.beginPath()
    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2)
    ctx.lineWidth   = 5
    ctx.strokeStyle = color
    ctx.stroke()

    t += windSpeed
    animationFrameIds[idx] = requestAnimationFrame(draw)
  }
  draw()
}

// ── Lifecycle ──
onBeforeMount(() => {
  api.fetchPlugin_meteoIQAir()
  api2.fetchPlugin_meteoIQAir()
})

onMounted(() => {
  timer = setInterval(() => {
    api.fetchPlugin_meteoIQAir()
    api2.fetchPlugin_meteoIQAir()
  }, 300_000)

  if (rootEl.value) {
    ro = new ResizeObserver(([entry]) => {
      pluginWidth.value  = entry.contentRect.width
      pluginHeight.value = entry.contentRect.height
    })
    ro.observe(rootEl.value)
  }
})

watch(() => api.tempOutdoor, (newTemp) => {
  if (newTemp === null) return
  thetaRm.value = thetaRm.value === null ? newTemp : updateThetaRm(thetaRm.value, newTemp)
})

watch(() => api2.tempOutdoor, (newTemp) => {
  if (newTemp === null) return
  thetaRm2.value = thetaRm2.value === null ? newTemp : updateThetaRm(thetaRm2.value, newTemp)
})

watch(windCanvases, async (canvases) => {
  animationFrameIds.forEach(id => cancelAnimationFrame(id))
  animationFrameIds = []
  canvasRos.forEach(r => r?.disconnect())
  canvasRos = []

  for (let i = 0; i < canvases.length; i++) {
    if (!canvases[i]) continue
    await nextTick()
    const idx = i
    startWindAnimation(
      canvases[idx],
      () => sensors.value[idx]?.windColor.value ?? '#0EA5E9',
      idx
    )
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  animationFrameIds.forEach(id => cancelAnimationFrame(id))
  ro?.disconnect()
  canvasRos.forEach(r => r?.disconnect())
})
</script>

<style scoped>
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2f3d;
  border-top-color: #0EA5E9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>