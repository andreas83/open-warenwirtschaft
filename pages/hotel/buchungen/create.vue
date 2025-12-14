<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('hotel.bookings.newBooking', 'Neue Buchung') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
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
                v-model="booking.checkInDatum"
                :label="$t('hotel.bookings.checkIn', 'Check-In')"
                required
                format="yyyy-MM-dd"
                :min-date="today"
              />
              <DatePicker
                v-model="booking.checkOutDatum"
                :label="$t('hotel.bookings.checkOut', 'Check-Out')"
                required
                format="yyyy-MM-dd"
                :min-date="booking.checkInDatum || today"
              />
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.adults', 'Erwachsene') }}</label>
                <input v-model.number="booking.anzahlErwachsene" type="number" min="1" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.children', 'Kinder') }}</label>
                <input v-model.number="booking.anzahlKinder" type="number" min="0" class="input" />
              </div>
            </div>
          </div>

          <!-- Room Selection -->
          <div class="card p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-secondary-800">{{ $t('hotel.bookings.rooms', 'Zimmer') }}</h2>
              <Button variant="secondary" size="sm" icon="i-mdi-plus" @click="addRoom">
                {{ $t('hotel.bookings.addRoom', 'Zimmer hinzufugen') }}
              </Button>
            </div>

            <div v-if="booking.zimmer.length === 0" class="text-center py-8 text-secondary-500">
              {{ $t('hotel.bookings.noRooms', 'Keine Zimmer ausgewahlt') }}
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(room, index) in booking.zimmer"
                :key="index"
                class="p-4 border border-secondary-200 rounded-lg"
              >
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.room', 'Zimmer') }}</label>
                      <select v-model="room.zimmerID" class="input" @change="updateRoomPrice(index)">
                        <option :value="null">{{ $t('common.select', 'Wahlen...') }}</option>
                        <option v-for="z in availableZimmer" :key="z.ZimmerID" :value="z.ZimmerID">
                          {{ z.Zimmernummer }} - {{ z.Zimmerkategorien?.Name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.pricePerNight', 'Preis/Nacht') }}</label>
                      <input v-model.number="room.preisProNacht" type="number" min="0" step="0.01" class="input" @input="calculateRoomTotal(index)" />
                    </div>
                    <div>
                      <label class="block text-sm text-secondary-600 mb-1">{{ $t('hotel.bookings.total', 'Gesamt') }}</label>
                      <input :value="formatCurrency(room.gesamtpreisNetto)" type="text" class="input bg-secondary-50" disabled />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="i-mdi-delete"
                    class="text-danger-600 hover:bg-danger-50"
                    @click="removeRoom(index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Main Guest -->
        <div v-show="activeTab === 'guest'" class="space-y-6">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('hotel.bookings.mainGuest', 'Hauptgast') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.firstName', 'Vorname') }} *</label>
                <input v-model="booking.gastVorname" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.lastName', 'Nachname') }} *</label>
                <input v-model="booking.gastNachname" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.email', 'E-Mail') }}</label>
                <input v-model="booking.email" type="email" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.phone', 'Telefon') }}</label>
                <input v-model="booking.telefon" type="tel" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.street', 'Strasse') }}</label>
                <input v-model="booking.strasse" type="text" class="input" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.zip', 'PLZ') }}</label>
                  <input v-model="booking.plz" type="text" class="input" />
                </div>
                <div class="col-span-2">
                  <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.city', 'Ort') }}</label>
                  <input v-model="booking.ort" type="text" class="input" />
                </div>
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.country', 'Land') }}</label>
                <input v-model="booking.land" type="text" class="input" placeholder="Deutschland" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.nationality', 'Nationalitat') }}</label>
                <input v-model="booking.nationalitaet" type="text" class="input" />
              </div>
              <DatePicker
                v-model="booking.geburtsdatum"
                :label="$t('hotel.bookings.birthDate', 'Geburtsdatum')"
                format="yyyy-MM-dd"
                :max-date="today"
              />
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.idType', 'Ausweisart') }}</label>
                <select v-model="booking.ausweisart" class="input">
                  <option value="">{{ $t('common.select', 'Wahlen...') }}</option>
                  <option value="Personalausweis">Personalausweis</option>
                  <option value="Reisepass">Reisepass</option>
                  <option value="Fuehrerschein">Fuhrerschein</option>
                  <option value="Andere">Andere</option>
                </select>
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.idNumber', 'Ausweisnummer') }}</label>
                <input v-model="booking.ausweisnummer" type="text" class="input" />
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

            <div v-if="booking.weitereGaeste.length === 0" class="text-center py-8 text-secondary-500">
              <span class="i-mdi-account-group w-12 h-12 mx-auto mb-2 opacity-50"></span>
              <p>{{ $t('hotel.bookings.noAdditionalGuests', 'Keine weiteren Gaste erfasst') }}</p>
              <p class="text-sm mt-1">{{ $t('hotel.bookings.guestRegistrationHint', 'Einige Lander erfordern die Erfassung aller Gaste') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(guest, index) in booking.weitereGaeste"
                :key="index"
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
                <textarea v-model="booking.besondereWuensche" class="input min-h-24" rows="4" :placeholder="$t('hotel.bookings.specialRequestsPlaceholder', 'z.B. spate Anreise, Allergien, Zimmerausstattung...')" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.internalNotes', 'Interne Notizen') }}</label>
                <textarea v-model="booking.interneNotizen" class="input min-h-24" rows="4" :placeholder="$t('hotel.bookings.internalNotesPlaceholder', 'Notizen fur das Personal...')" />
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
              <select v-model="booking.status" class="input">
                <option value="Angefragt">Angefragt</option>
                <option value="Bestaetigt">Bestatigt</option>
              </select>
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('hotel.bookings.paymentStatus', 'Zahlungsstatus') }}</label>
              <select v-model="booking.zahlungsstatus" class="input">
                <option value="Ausstehend">Ausstehend</option>
                <option value="Angezahlt">Angezahlt</option>
                <option value="Bezahlt">Bezahlt</option>
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
              <span class="text-secondary-600">{{ $t('hotel.bookings.subtotal', 'Zwischensumme') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('hotel.bookings.vat', 'MwSt. (7%)') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(vatAmount) }}</span>
            </div>
            <div class="border-t border-secondary-200 pt-2 mt-2">
              <div class="flex justify-between font-medium">
                <span class="text-secondary-800">{{ $t('hotel.bookings.totalPrice', 'Gesamtpreis') }}</span>
                <span class="text-lg text-primary-600">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Status -->
        <div v-if="!isValid" class="card p-4 bg-warning-50 border-warning-200">
          <div class="flex items-start gap-3">
            <span class="i-mdi-alert-circle text-warning-600 w-5 h-5 mt-0.5"></span>
            <div class="text-sm">
              <p class="font-medium text-warning-800">{{ $t('hotel.bookings.missingInfo', 'Fehlende Angaben') }}</p>
              <ul class="mt-1 text-warning-700 list-disc list-inside">
                <li v-if="!booking.gastVorname || !booking.gastNachname">{{ $t('hotel.bookings.guestNameRequired', 'Gastname erforderlich') }}</li>
                <li v-if="!booking.checkInDatum">{{ $t('hotel.bookings.checkInRequired', 'Check-In Datum erforderlich') }}</li>
                <li v-if="!booking.checkOutDatum">{{ $t('hotel.bookings.checkOutRequired', 'Check-Out Datum erforderlich') }}</li>
                <li v-if="booking.zimmer.length === 0">{{ $t('hotel.bookings.roomRequired', 'Mindestens ein Zimmer erforderlich') }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!isValid" @click="saveBooking">
            {{ $t('hotel.bookings.createBooking', 'Buchung erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/hotel/buchungen')">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const today = new Date().toISOString().split('T')[0]

const breadcrumbs = computed(() => [
  { label: t('menu.hotel', 'Hotel'), to: '/hotel' },
  { label: t('hotel.bookings.title', 'Buchungen'), to: '/hotel/buchungen' },
  { label: t('hotel.bookings.newBooking', 'Neue Buchung') }
])

const activeTab = ref('booking')
const formTabs = computed(() => [
  { value: 'booking', label: t('hotel.bookings.bookingDetails', 'Buchung'), icon: 'i-mdi-calendar-check' },
  { value: 'guest', label: t('hotel.bookings.mainGuest', 'Hauptgast'), icon: 'i-mdi-account' },
  { value: 'additionalGuests', label: t('hotel.bookings.additionalGuests', 'Weitere Gaste'), icon: 'i-mdi-account-multiple', badge: booking.value?.weitereGaeste?.length || undefined },
  { value: 'notes', label: t('hotel.bookings.notes', 'Notizen'), icon: 'i-mdi-note-text' }
])

interface AdditionalGuest {
  vorname: string
  nachname: string
  geburtsdatum: string | null
  nationalitaet: string
  ausweisart: string
  ausweisnummer: string
}

const booking = ref({
  // Main guest info
  gastVorname: '',
  gastNachname: '',
  email: '',
  telefon: '',
  strasse: '',
  plz: '',
  ort: '',
  land: 'Deutschland',
  nationalitaet: '',
  geburtsdatum: null as string | null,
  ausweisart: '',
  ausweisnummer: '',
  // Stay details
  checkInDatum: '',
  checkOutDatum: '',
  anzahlErwachsene: 2,
  anzahlKinder: 0,
  // Status
  status: 'Bestaetigt',
  zahlungsstatus: 'Ausstehend',
  // Notes
  besondereWuensche: '',
  interneNotizen: '',
  // Rooms and additional guests
  zimmer: [] as any[],
  weitereGaeste: [] as AdditionalGuest[]
})

const availableZimmer = ref<any[]>([])
const saving = ref(false)

const nights = computed(() => {
  if (!booking.value.checkInDatum || !booking.value.checkOutDatum) return 0
  const checkIn = new Date(booking.value.checkInDatum)
  const checkOut = new Date(booking.value.checkOutDatum)
  return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
})

const totalGuests = computed(() => {
  return booking.value.anzahlErwachsene + booking.value.anzahlKinder
})

const subtotal = computed(() => {
  return booking.value.zimmer.reduce((sum, room) => sum + (room.gesamtpreisNetto || 0), 0)
})

const vatAmount = computed(() => {
  return subtotal.value * 0.07
})

const grandTotal = computed(() => {
  return subtotal.value + vatAmount.value
})

const isValid = computed(() => {
  return booking.value.gastVorname &&
         booking.value.gastNachname &&
         booking.value.checkInDatum &&
         booking.value.checkOutDatum &&
         booking.value.zimmer.length > 0
})

async function fetchZimmer() {
  try {
    const response = await $fetch<{ rooms: any[] }>('/api/hotel/zimmer?status=Verfuegbar&istAktiv=true')
    availableZimmer.value = response?.rooms || []
  } catch (err) {
    console.error('Fetch Zimmer Error:', err)
  }
}

function addRoom() {
  booking.value.zimmer.push({
    zimmerID: null,
    preisProNacht: 0,
    gesamtpreisNetto: 0,
    mwStSatz: 7,
    mwStBetrag: 0
  })
}

function removeRoom(index: number) {
  booking.value.zimmer.splice(index, 1)
}

function updateRoomPrice(index: number) {
  const room = booking.value.zimmer[index]
  if (room.zimmerID) {
    const zimmer = availableZimmer.value.find(z => z.ZimmerID === room.zimmerID)
    if (zimmer?.Zimmerkategorien?.StandardPreisProNacht) {
      room.preisProNacht = Number(zimmer.Zimmerkategorien.StandardPreisProNacht)
      calculateRoomTotal(index)
    }
  }
}

function calculateRoomTotal(index: number) {
  const room = booking.value.zimmer[index]
  room.gesamtpreisNetto = (room.preisProNacht || 0) * nights.value
  room.mwStBetrag = room.gesamtpreisNetto * 0.07
}

function addGuest() {
  booking.value.weitereGaeste.push({
    vorname: '',
    nachname: '',
    geburtsdatum: null,
    nationalitaet: '',
    ausweisart: '',
    ausweisnummer: ''
  })
}

function removeGuest(index: number) {
  booking.value.weitereGaeste.splice(index, 1)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

async function saveBooking() {
  if (!isValid.value) return

  try {
    saving.value = true

    // Combine first and last name for gastname field
    const gastname = `${booking.value.gastVorname} ${booking.value.gastNachname}`.trim()

    await $fetch('/api/hotel/buchungen', {
      method: 'POST',
      body: {
        gastname,
        gastVorname: booking.value.gastVorname,
        gastNachname: booking.value.gastNachname,
        email: booking.value.email,
        telefon: booking.value.telefon,
        strasse: booking.value.strasse,
        plz: booking.value.plz,
        ort: booking.value.ort,
        land: booking.value.land,
        nationalitaet: booking.value.nationalitaet,
        geburtsdatum: booking.value.geburtsdatum,
        ausweisart: booking.value.ausweisart,
        ausweisnummer: booking.value.ausweisnummer,
        checkInDatum: booking.value.checkInDatum,
        checkOutDatum: booking.value.checkOutDatum,
        anzahlErwachsene: booking.value.anzahlErwachsene,
        anzahlKinder: booking.value.anzahlKinder,
        status: booking.value.status,
        zahlungsstatus: booking.value.zahlungsstatus,
        besondereWuensche: booking.value.besondereWuensche,
        interneNotizen: booking.value.interneNotizen,
        gesamtpreisNetto: subtotal.value,
        mwStGesamt: vatAmount.value,
        gesamtpreisBrutto: grandTotal.value,
        zimmer: booking.value.zimmer,
        weitereGaeste: booking.value.weitereGaeste
      }
    })
    toast.success(t('hotel.bookings.createSuccess', 'Buchung erfolgreich erstellt'))
    navigateTo('/hotel/buchungen')
  } catch (err: any) {
    toast.error(t('hotel.bookings.errorCreating', 'Fehler beim Erstellen der Buchung'))
    console.error('Create Booking Error:', err)
  } finally {
    saving.value = false
  }
}

watch([() => booking.value.checkInDatum, () => booking.value.checkOutDatum], () => {
  booking.value.zimmer.forEach((_, index) => calculateRoomTotal(index))
})

onMounted(() => {
  fetchZimmer()
})
</script>
