import axios from 'axios'
import { defineStore } from 'pinia'

export const usePlugin_meteoIQAirApiStore = defineStore('plugin-plugin_meteoIQAir-api', {
  state: () => ({
    aqiIndoor:   0  as number | null,
    pm25Indoor:  0  as number | null,
    co2:         500 as number | null,
    tempIndoor:  20 as number | null,
    humIndoor:   45 as number | null,
    aqiOutdoor:  0  as number | null,
    tempOutdoor: 20 as number | null,
    humOutdoor:  50 as number | null,
    co2Outdoor:  40 as number | null,
    pm25Outdoor: 20 as number | null,
    name:        'IQAir' as string,
    serial:      '' as string,
    isConnected: false as boolean,
    location:    { city: '', country: '' },
    history:     [] as any[],
    loading:     false,
    error:       null as string | null,
    lastUpdated: null as Date | null,
    config: {
      // Priority: .env vars → localStorage → empty
      userId:   import.meta.env.VITE_IQAIR_USER_ID   || localStorage.getItem('iqair-userId'),
      deviceId: import.meta.env.VITE_IQAIR_DEVICE_ID || localStorage.getItem('iqair-deviceId'),
      token:    import.meta.env.VITE_IQAIR_TOKEN      || localStorage.getItem('iqair-token'),
      baseUrl:  'https://website-api.airvisual.com/v2',
    },
  }),

  actions: {
    async fetchPlugin_meteoIQAir(type: 'instant' | 'hourly' | 'daily' = 'instant') {
      // Restaurer le cache
      try {
        const raw = localStorage.getItem('iqair-cache')
        if (raw) {
          const c = JSON.parse(raw)
          Object.assign(this, c)
        }
      } catch { /* cache corrompu, on ignore */ }

      // Vérifier que les credentials sont présents
      if (!this.config.userId || !this.config.deviceId || !this.config.token) {
        this.error = 'Configuration manquante — veuillez renseigner vos identifiants IQAir via le panneau ⚙️'
        return
      }

      this.loading = true
      this.error   = null

      try {
        const url = `${this.config.baseUrl}/users/${this.config.userId}/devices/${this.config.deviceId}`
        
        const response = await axios.get(url, {
          params: {
            'units.system': 'metric',
            'AQI':          'US',
            'language':     'en',
          },
          headers: {
            'x-login-token': this.config.token,
            'accept':        'application/json',
          },
        })

        const data    = response.data
        const current = data.current  || {}
        const outdoor = current.outdoor || {}

        this.aqiIndoor   = current.aqi?.value         ?? null
        this.pm25Indoor  = current.pm25?.value         ?? null
        this.co2         = current.co2?.value          ?? null
        this.tempIndoor  = current.temperature?.value  ?? null
        this.humIndoor   = current.humidity?.value     ?? null
        this.pm25Outdoor = outdoor.pm25                ?? null
        this.aqiOutdoor  = outdoor.aqi                 ?? null
        this.co2Outdoor  = outdoor.co2                 ?? null
        this.tempOutdoor = outdoor.temperature         ?? null
        this.humOutdoor  = outdoor.humidity            ?? null
        this.name        = data.name                   || 'IQAir'
        this.serial      = data.serialNumber           || ''
        this.isConnected = data.isConnected            || false
        this.location    = { city: data.city || '', country: data.country || '' }

        if (data.historical?.[type]) {
          this.history = data.historical[type]
        }

        this.lastUpdated = new Date()

        // Mettre en cache
        localStorage.setItem('iqair-cache', JSON.stringify({
          aqiIndoor:   this.aqiIndoor,
          pm25Indoor:  this.pm25Indoor,
          co2:         this.co2,
          tempIndoor:  this.tempIndoor,
          humIndoor:   this.humIndoor,
          aqiOutdoor:  this.aqiOutdoor,
          tempOutdoor: this.tempOutdoor,
          humOutdoor:  this.humOutdoor,
          pm25Outdoor: this.pm25Outdoor,
          name:        this.name,
        }))

      } catch (e: any) {
        this.error = e.response?.data?.message || e.message || 'Erreur lors de la récupération IQAir'
        console.error('IQAir Store Error:', e)
      } finally {
        this.loading = false
      }
    },
  },
})
