<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/hotel/buchungen')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ booking.Buchungsnummer }}</h1>
          <p class="text-secondary-500">{{ $t('hotel.bookings.editBooking', 'Buchung bearbeiten') }}</p>
        </div>
        <span :class="getStatusBadgeClass(booking.Status)" class="text-base">
          {{ booking.Status }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Tabs Navigation -->
          <Tabs v-model="activeTab" :tabs="formTabs" variant="underline" />

          <!-- Tab: Booking Details -->
          <div v-show="activeTab === 'booking'" class="space-y-6">
            <!-- Dates -->
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.stayDetails', 'Aufenthaltsdetails') }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  v-model="formData.checkInDatum"
                  :label="$t('hotel.bookings.checkIn', 'Check-In')"
                  required
                  format="yyyy-MM-dd"
                />
                <DatePicker
                  v-model="formData.checkOutDatum"
                  :label="$t('hotel.bookings.checkOut', 'Check-Out')"
                  required
                  format="yyyy-MM-dd"
                  :min-date="formData.checkInDatum"
                />
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.adults', 'Erwachsene') }}</label>
                  <input v-model.number="formData.anzahlErwachsene" type="number" min="1" class="input" />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.children', 'Kinder') }}</label>
                  <input v-model.number="formData.anzahlKinder" type="number" min="0" class="input" />
                </div>
              </div>
            </div>

            <!-- Rooms (read-only for now) -->
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.assignedRooms', 'Zugewiesene Zimmer') }}</h2>
              <div v-if="booking.HotelBuchungszimmer?.length" class="space-y-3">
                <div
                  v-for="bz in booking.HotelBuchungszimmer"
                  :key="bz.BuchungszimmerID"
                  class="flex justify-between items-center p-4 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-secondary-900">{{ bz.Zimmer?.Zimmernummer }} - {{ bz.Zimmer?.Zimmerkategorien?.Name }}</p>
                    <p class="text-sm text-secondary-500">{{ bz.AnzahlNaechte }} {{ $t('hotel.bookings.nights', 'Nachte') }}</p>
                  </div>
                  <p class="font-medium text-secondary-900">{{ formatCurrency(bz.GesamtpreisNetto) }}</p>
                </div>
              </div>
              <p v-else class="text-secondary-500 text-center py-4">{{ $t('hotel.bookings.noRooms', 'Keine Zimmer zugewiesen') }}</p>
            </div>
          </div>

          <!-- Tab: Main Guest -->
          <div v-show="activeTab === 'guest'" class="space-y-6">
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.mainGuest', 'Hauptgast') }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.firstName', 'Vorname') }} *</label>
                  <input v-model="formData.hauptgast.vorname" type="text" class="input" required />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.lastName', 'Nachname') }} *</label>
                  <input v-model="formData.hauptgast.nachname" type="text" class="input" required />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.email', 'E-Mail') }}</label>
                  <input v-model="formData.hauptgast.email" type="email" class="input" />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.phone', 'Telefon') }}</label>
                  <input v-model="formData.hauptgast.telefon" type="tel" class="input" />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.street', 'Strasse') }}</label>
                  <input v-model="formData.hauptgast.adresse" type="text" class="input" />
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.zip', 'PLZ') }}</label>
                    <input v-model="formData.hauptgast.plz" type="text" class="input" />
                  </div>
                  <div class="col-span-2">
                    <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.city', 'Ort') }}</label>
                    <input v-model="formData.hauptgast.stadt" type="text" class="input" />
                  </div>
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.country', 'Land') }}</label>
                  <input v-model="formData.hauptgast.land" type="text" class="input" />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.nationality', 'Nationalitat') }}</label>
                  <input v-model="formData.hauptgast.nationalitaet" type="text" class="input" />
                </div>
                <DatePicker
                  v-model="formData.hauptgast.geburtsdatum"
                  :label="$t('hotel.bookings.birthDate', 'Geburtsdatum')"
                  format="yyyy-MM-dd"
                  :max-date="today"
                />
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.idType', 'Ausweisart') }}</label>
                  <select v-model="formData.hauptgast.ausweisart" class="input">
                    <option value="">{{ $t('common.select', 'Wahlen...') }}</option>
                    <option value="Personalausweis">Personalausweis</option>
                    <option value="Reisepass">Reisepass</option>
                    <option value="Fuehrerschein">Fuhrerschein</option>
                    <option value="Andere">Andere</option>
                  </select>
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.idNumber', 'Ausweisnummer') }}</label>
                  <input v-model="formData.hauptgast.ausweisnummer" type="text" class="input" />
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Additional Guests -->
          <div v-show="activeTab === 'additionalGuests'" class="space-y-6">
            <div class="card p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-secondary-800">{{ $t('hotel.bookings.additionalGuests', 'Weitere Gaste') }}</h2>
                <Button variant="secondary" size="sm" icon="i-mdi-account-plus" @click="addGuest">
                  {{ $t('hotel.bookings.addGuest', 'Gast hinzufugen') }}
                </Button>
              </div>

              <div v-if="formData.weitereGaeste.length === 0" class="text-center py-8 text-secondary-500">
                <span class="i-mdi-account-group w-12 h-12 mx-auto mb-2 opacity-50"></span>
                <p>{{ $t('hotel.bookings.noAdditionalGuests', 'Keine weiteren Gaste erfasst') }}</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(guest, index) in formData.weitereGaeste"
                  :key="guest.id || index"
                  class="p-4 border border-secondary-200 rounded-lg"
                >
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-medium text-secondary-700">{{ $t('hotel.bookings.guest', 'Gast') }} {{ index + 2 }}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="i-mdi-delete"
                      class="text-danger-600 hover:bg-danger-50"
                      @click="removeGuest(index)"
                    />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.firstName', 'Vorname') }} *</label>
                      <input v-model="guest.vorname" type="text" class="input" required />
                    </div>
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.lastName', 'Nachname') }} *</label>
                      <input v-model="guest.nachname" type="text" class="input" required />
                    </div>
                    <DatePicker
                      v-model="guest.geburtsdatum"
                      :label="$t('hotel.bookings.birthDate', 'Geburtsdatum')"
                      format="yyyy-MM-dd"
                      :max-date="today"
                    />
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.nationality', 'Nationalitat') }}</label>
                      <input v-model="guest.nationalitaet" type="text" class="input" />
                    </div>
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.idType', 'Ausweisart') }}</label>
                      <select v-model="guest.ausweisart" class="input">
                        <option value="">{{ $t('common.select', 'Wahlen...') }}</option>
                        <option value="Personalausweis">Personalausweis</option>
                        <option value="Reisepass">Reisepass</option>
                        <option value="Fuehrerschein">Fuhrerschein</option>
                        <option value="Andere">Andere</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.idNumber', 'Ausweisnummer') }}</label>
                      <input v-model="guest.ausweisnummer" type="text" class="input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Notes -->
          <div v-show="activeTab === 'notes'" class="space-y-6">
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.notes', 'Anmerkungen') }}</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.specialRequests', 'Besondere Wunsche') }}</label>
                  <textarea v-model="formData.besondereWuensche" class="input min-h-24" rows="4" />
                </div>
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.internalNotes', 'Interne Notizen') }}</label>
                  <textarea v-model="formData.interneNotizen" class="input min-h-24" rows="4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.status', 'Status') }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.bookingStatus', 'Buchungsstatus') }}</label>
                <select v-model="formData.status" class="input">
                  <option value="Angefragt">Angefragt</option>
                  <option value="Bestaetigt">Bestatigt</option>
                  <option value="Eingecheckt">Eingecheckt</option>
                  <option value="Ausgecheckt">Ausgecheckt</option>
                  <option value="Abgeschlossen">Abgeschlossen</option>
                  <option value="Storniert">Storniert</option>
                </select>
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.paymentStatus', 'Zahlungsstatus') }}</label>
                <select v-model="formData.zahlungsstatus" class="input">
                  <option value="Ausstehend">Ausstehend</option>
                  <option value="Angezahlt">Angezahlt</option>
                  <option value="Teilbezahlt">Teilbezahlt</option>
                  <option value="Bezahlt">Bezahlt</option>
                  <option value="Rueckerstattet">Ruckerstattet</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.summary', 'Zusammenfassung') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('hotel.bookings.nights', 'Nachte') }}</span>
                <span class="text-secondary-900">{{ nights }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('hotel.bookings.guests', 'Gaste') }}</span>
                <span class="text-secondary-900">{{ totalGuests }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('hotel.bookings.subtotal', 'Netto') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(booking.GesamtpreisNetto) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('hotel.bookings.vat', 'MwSt.') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(booking.MwStGesamt) }}</span>
              </div>
              <div class="border-t border-secondary-200 pt-2 mt-2">
                <div class="flex justify-between font-medium">
                  <span class="text-secondary-800">{{ $t('hotel.bookings.totalPrice', 'Gesamtpreis') }}</span>
                  <span class="text-lg text-primary-600">{{ formatCurrency(booking.GesamtpreisBrutto) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button :loading="saving" @click="saveBooking">
              {{ $t('common.save', 'Speichern') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/hotel/buchungen')">
              {{ $t('common.cancel', 'Abbrechen') }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

const id = computed(() => parseInt(route.params.id as string))
const today = new Date().toISOString().split('T')[0]

const booking = ref<any>({})
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const activeTab = ref('booking')
const formTabs = computed(() => [
  { value: 'booking', label: t('hotel.bookings.bookingDetails', 'Buchung'), icon: 'i-mdi-calendar-check' },
  { value: 'guest', label: t('hotel.bookings.mainGuest', 'Hauptgast'), icon: 'i-mdi-account' },
  { value: 'additionalGuests', label: t('hotel.bookings.additionalGuests', 'Weitere Gaste'), icon: 'i-mdi-account-multiple', badge: formData.value?.weitereGaeste?.length || undefined },
  { value: 'notes', label: t('hotel.bookings.notes', 'Notizen'), icon: 'i-mdi-note-text' }
])

interface GuestData {
  id?: number
  vorname: string
  nachname: string
  geburtsdatum: string | null
  nationalitaet: string
  ausweisart: string
  ausweisnummer: string
  email?: string
  telefon?: string
  adresse?: string
  stadt?: string
  plz?: string
  land?: string
}

const formData = ref({
  checkInDatum: '',
  checkOutDatum: '',
  anzahlErwachsene: 1,
  anzahlKinder: 0,
  status: 'Bestaetigt',
  zahlungsstatus: 'Ausstehend',
  besondereWuensche: '',
  interneNotizen: '',
  hauptgast: {
    id: undefined as number | undefined,
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    adresse: '',
    stadt: '',
    plz: '',
    land: 'Deutschland',
    nationalitaet: '',
    geburtsdatum: null as string | null,
    ausweisart: '',
    ausweisnummer: ''
  },
  weitereGaeste: [] as GuestData[]
})

const breadcrumbs = computed(() => [
  { label: t('menu.hotel', 'Hotel'), to: '/hotel' },
  { label: t('hotel.bookings.title', 'Buchungen'), to: '/hotel/buchungen' },
  { label: booking.value?.Buchungsnummer || t('hotel.bookings.editBooking', 'Bearbeiten') }
])

const nights = computed(() => {
  if (!formData.value.checkInDatum || !formData.value.checkOutDatum) return 0
  const checkIn = new Date(formData.value.checkInDatum)
  const checkOut = new Date(formData.value.checkOutDatum)
  return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
})

const totalGuests = computed(() => {
  return formData.value.anzahlErwachsene + formData.value.anzahlKinder
})

async function fetchBooking() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/hotel/buchungen?id=${id.value}`)
    if (!response || (response as any).error) {
      error.value = t('hotel.bookings.notFound', 'Buchung nicht gefunden')
      return
    }

    booking.value = response

    // Format dates for input fields
    formData.value.checkInDatum = response.CheckInDatum ? new Date(response.CheckInDatum).toISOString().split('T')[0] : ''
    formData.value.checkOutDatum = response.CheckOutDatum ? new Date(response.CheckOutDatum).toISOString().split('T')[0] : ''
    formData.value.anzahlErwachsene = response.AnzahlErwachsene || 1
    formData.value.anzahlKinder = response.AnzahlKinder || 0
    formData.value.status = response.Status || 'Bestaetigt'
    formData.value.zahlungsstatus = response.Zahlungsstatus || 'Ausstehend'
    formData.value.besondereWuensche = response.BesondereWuensche || ''
    formData.value.interneNotizen = response.InterneNotizen || ''

    // Load guests
    if (response.HotelGaeste && response.HotelGaeste.length > 0) {
      const hauptgast = response.HotelGaeste.find((g: any) => g.IstHauptgast)
      if (hauptgast) {
        formData.value.hauptgast = {
          id: hauptgast.GastID,
          vorname: hauptgast.Vorname || '',
          nachname: hauptgast.Nachname || '',
          email: hauptgast.Email || '',
          telefon: hauptgast.Telefon || '',
          adresse: hauptgast.Adresse || '',
          stadt: hauptgast.Stadt || '',
          plz: hauptgast.PLZ || '',
          land: hauptgast.Land || 'Deutschland',
          nationalitaet: hauptgast.Nationalitaet || '',
          geburtsdatum: hauptgast.Geburtsdatum ? new Date(hauptgast.Geburtsdatum).toISOString().split('T')[0] : null,
          ausweisart: hauptgast.AusweisnummerTyp || '',
          ausweisnummer: hauptgast.Ausweisnummer || ''
        }
      } else {
        // If no main guest, use Gastname from booking
        const nameParts = (response.Gastname || '').split(' ')
        formData.value.hauptgast.vorname = nameParts[0] || ''
        formData.value.hauptgast.nachname = nameParts.slice(1).join(' ') || ''
        formData.value.hauptgast.email = response.Email || ''
        formData.value.hauptgast.telefon = response.Telefon || ''
      }

      // Load additional guests
      formData.value.weitereGaeste = response.HotelGaeste
        .filter((g: any) => !g.IstHauptgast)
        .map((g: any) => ({
          id: g.GastID,
          vorname: g.Vorname || '',
          nachname: g.Nachname || '',
          geburtsdatum: g.Geburtsdatum ? new Date(g.Geburtsdatum).toISOString().split('T')[0] : null,
          nationalitaet: g.Nationalitaet || '',
          ausweisart: g.AusweisnummerTyp || '',
          ausweisnummer: g.Ausweisnummer || ''
        }))
    } else {
      // No guests, use Gastname from booking
      const nameParts = (response.Gastname || '').split(' ')
      formData.value.hauptgast.vorname = nameParts[0] || ''
      formData.value.hauptgast.nachname = nameParts.slice(1).join(' ') || ''
      formData.value.hauptgast.email = response.Email || ''
      formData.value.hauptgast.telefon = response.Telefon || ''
    }
  } catch (err: any) {
    error.value = t('hotel.bookings.errorLoading', 'Fehler beim Laden der Buchung')
    console.error('Fetch Booking Error:', err)
  } finally {
    loading.value = false
  }
}

function addGuest() {
  formData.value.weitereGaeste.push({
    vorname: '',
    nachname: '',
    geburtsdatum: null,
    nationalitaet: '',
    ausweisart: '',
    ausweisnummer: ''
  })
}

function removeGuest(index: number) {
  formData.value.weitereGaeste.splice(index, 1)
}

async function saveBooking() {
  try {
    saving.value = true

    const gastname = `${formData.value.hauptgast.vorname} ${formData.value.hauptgast.nachname}`.trim()

    await $fetch('/api/hotel/buchungen', {
      method: 'PUT',
      body: {
        id: id.value,
        gastname,
        email: formData.value.hauptgast.email,
        telefon: formData.value.hauptgast.telefon,
        checkInDatum: formData.value.checkInDatum,
        checkOutDatum: formData.value.checkOutDatum,
        anzahlErwachsene: formData.value.anzahlErwachsene,
        anzahlKinder: formData.value.anzahlKinder,
        status: formData.value.status,
        zahlungsstatus: formData.value.zahlungsstatus,
        besondereWuensche: formData.value.besondereWuensche,
        interneNotizen: formData.value.interneNotizen,
        hauptgast: formData.value.hauptgast,
        weitereGaeste: formData.value.weitereGaeste
      }
    })

    toast.success(t('hotel.bookings.saveSuccess', 'Buchung erfolgreich gespeichert'))
    navigateTo('/hotel/buchungen')
  } catch (err: any) {
    toast.error(t('hotel.bookings.errorSaving', 'Fehler beim Speichern der Buchung'))
    console.error('Save Booking Error:', err)
  } finally {
    saving.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Bestaetigt': return `${baseClass} badge-info`
    case 'Eingecheckt': return `${baseClass} badge-success`
    case 'Ausgecheckt': return `${baseClass} badge-warning`
    case 'Abgeschlossen': return `${baseClass} bg-secondary-100 text-secondary-700`
    case 'Storniert': return `${baseClass} badge-danger`
    default: return `${baseClass} badge-warning`
  }
}

onMounted(() => {
  fetchBooking()
})
</script>
