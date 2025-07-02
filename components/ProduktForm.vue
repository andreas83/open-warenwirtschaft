<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">{{ mode === 'create' ? $t('produktForm.newProduct') : $t('produktForm.editProduct') }}</h2>
<div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">
  <div class="i-svg-spinners:blocks-wave inline-block" />
  {{ $t('produktForm.loadingProduct') }}
</div>
<div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveProdukt" class="space-y-6">
          <div class="flex border-b border-gray-200 dark:border-gray-600 mb-6">
<button
  v-for="tab in tabs"
  :key="tab.id"
  type="button"
  :class="['px-4 py-2 -mb-px', activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300']"
  @click="activeTab = tab.id"
>
  {{ $t(`produktForm.tabs.${tab.id}`) }}
</button>
          </div>
          
          <BasicInfo
            :active-tab="activeTab"
            :produkt="produkt"
            :mode="mode"
            :einheiten="einheiten"
            :umsatzsteuersaetze="umsatzsteuersaetze"
            :kategorien="kategorien"
            :selected-kategorien="selectedKategorien"
            :einheit-search="einheitSearch"
            :umsatzsteuersatz-search="umsatzsteuersatzSearch"
            @select-einheit="selectEinheit"
            @select-umsatzsteuersatz="selectUmsatzsteuersatz"
          />
          
          <ProductImages
            :active-tab="activeTab"
            :produkt-bilder="produktBilder"
            :image-previews="imagePreviews"
            @set-hauptbild="setHauptbild"
            @delete-produkt-bild="deleteProduktBild"
            @remove-image-preview="removeImagePreview"
            @handle-image-upload="handleImageUpload"
          />
          
          <ProductSuppliers
            :active-tab="activeTab"
            :lieferanten-details="lieferantenDetails"
            :lieferanten="lieferanten"
            @add-lieferant-detail="addLieferantDetail"
            @edit-lieferant-detail="editLieferantDetail"
            @delete-lieferant-detail="deleteLieferantDetail"
          />
          
          <ProductPrices
            :active-tab="activeTab"
            :preise="preise"
            :standorte="standorte"
            @add-preis="addPreis"
            @edit-preis="editPreis"
            @delete-preis="deletePreis"
          />

          <div class="flex justify-end space-x-3 pt-6">
<NuxtLink to="/produkte" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">{{ $t('produktForm.cancel') }}</NuxtLink>
<button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">{{ mode === 'create' ? $t('produktForm.create') : $t('produktForm.save') }}</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        :show="showConfirmModal"
        title="Datenkonflikt"
        message="Die Daten wurden von einem anderen Benutzer geändert. Möchten Sie die neuesten Daten laden und Ihre Änderungen erneut versuchen?"
        confirmText="Ja, Daten laden"
        cancelText="Nein, abbrechen"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />

      <PriceModal
        :show-preis-modal="showPreisModal"
        :editing-preis="editingPreis"
        :current-preis="currentPreis"
        :standorte="standorte"
        :kundengruppen="kundengruppen"
        :standort-search="standortSearch"
        :kundengruppe-search="kundengruppeSearch"
        @close-preis-modal="closePreisModal"
        @save-preis="savePreis"
        @select-standort="selectStandort"
        @select-kundengruppe="selectKundengruppe"
      />
      
      <SupplierModal
        :show-lieferant-modal="showLieferantModal"
        :editing-lieferant="editingLieferant"
        :current-lieferant-detail="currentLieferantDetail"
        :lieferanten="lieferanten"
        :lieferant-search="lieferantSearch"
        @close-lieferant-modal="closeLieferantModal"
        @save-lieferant-detail="saveLieferantDetail"
        @select-lieferant="selectLieferant"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import Autocomplete from '~/components/Autocomplete.vue'
import BasicInfo from '~/components/BasicInfo.vue'
import ProductImages from '~/components/ProductImages.vue'
import ProductSuppliers from '~/components/ProductSuppliers.vue'
import ProductPrices from '~/components/ProductPrices.vue'
import PriceModal from '~/components/PriceModal.vue'
import SupplierModal from '~/components/SupplierModal.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'

const activeTab = ref('basic')
const tabs = [
  { id: 'basic', label: 'Basic Information' },
  { id: 'images', label: 'Product Images' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'prices', label: 'Prices' }
]

const props = defineProps(['mode', 'id'])
const route = useRoute()
const router = useRouter()
const produktId = props.id || route.params.id

const produkt = ref({
  Produktname: '',
  Artikelnummer: '',
  EAN_Code: '',
  Hersteller: '',
  Beschreibung: '',
  Gewicht: null,
  Volumen: null,
  EinheitID: null,
  UmsatzsteuersatzID: null
})
const preise = ref([])
const einheiten = ref([])
const umsatzsteuersaetze = ref([])
const kategorien = ref([])
const selectedKategorien = ref([])
const lieferanten = ref([])
const lieferantenDetails = ref([])
const produktBilder = ref([])
const imageFiles = ref([])
const imagePreviews = ref([])
const loading = ref(props.mode === 'edit')
const error = ref(null)
const showPreisModal = ref(false)
const editingPreis = ref(false)
const showLieferantModal = ref(false)
const editingLieferant = ref(false)
const currentLieferantDetail = ref({
  LieferantenID: null,
  LieferantenArtikelnummer: '',
  Lieferzeit: null,
  Mindestbestellmenge: null,
  PreisBeimLieferanten: null,
  WaehrungLieferant: 'EUR'
})
const currentLieferantIndex = ref(-1)
const lieferantSearch = ref('')
const currentPreis = ref({
  PreisID: null,
  ProduktID: produktId ? parseInt(produktId) : null,
  Preis: 0.00,
  Waehrung: 'EUR',
  GueltigAb: new Date().toISOString().split('T')[0],
  GueltigBis: '',
  StandortID: null,
  KundengruppeID: null,
  PreisTyp: 'Standard'
})
const currentPreisIndex = ref(-1)
const standorte = ref([])
const kundengruppen = ref([])
const standortSearch = ref('')
const kundengruppeSearch = ref('')
const einheitSearch = ref('')
const umsatzsteuersatzSearch = ref('')

async function fetchProdukt() {
  if (props.mode !== 'edit' || !produktId) {
    loading.value = false
    return
  }
  try {
    loading.value = true
    const response = await $fetch(`/api/produkte?id=${produktId}`)
    if (response.status === 404) {
      error.value = 'Produkt nicht gefunden'
    } else {
      produkt.value = response
      setInitialAutocompleteValues()
      if (response.ProduktZuKategorie && response.ProduktZuKategorie.length > 0) {
        selectedKategorien.value = response.ProduktZuKategorie.map(item => item.KategorieID)
      }
      if (response.ProduktLieferanten && response.ProduktLieferanten.length > 0) {
        lieferantenDetails.value = response.ProduktLieferanten.map(item => ({
          LieferantenID: item.LieferantenID,
          LieferantenArtikelnummer: item.LieferantenArtikelnummer || '',
          Lieferzeit: item.Lieferzeit || null,
          Mindestbestellmenge: item.Mindestbestellmenge || null,
          PreisBeimLieferanten: item.PreisBeimLieferanten || null,
          WaehrungLieferant: item.WaehrungLieferant || 'EUR'
        }))
      }
      if (response.ProduktBilder && response.ProduktBilder.length > 0) {
        produktBilder.value = response.ProduktBilder
      }
      await fetchPreise()
    }
  } catch (err) {
    error.value = 'Fehler beim Laden des Produkts: ' + err.message
  } finally {
    loading.value = false
  }
}

async function fetchEinheiten() {
  try {
    const response = await $fetch(`/api/einheiten`)
    if (response && response.data && Array.isArray(response.data)) {
      einheiten.value = response.data
    } else if (Array.isArray(response)) {
      einheiten.value = response
    } else {
      einheiten.value = []
      console.error('Ungültige Antwort vom Server für Einheiten:', response)
    }
  } catch (err) {
    console.error('Fehler beim Laden der Einheiten:', err.message)
    einheiten.value = []
  }
}

async function fetchUmsatzsteuersaetze() {
  try {
    const response = await $fetch(`/api/umsatzsteuersaetze`)
    umsatzsteuersaetze.value = response
  } catch (err) {
    console.error('Fehler beim Laden der Umsatzsteuersätze:', err.message)
  }
}

function selectEinheit(einheit) {
  if (einheit) {
    produkt.value.EinheitID = einheit.EinheitID
    einheitSearch.value = einheit.Name
  } else {
    produkt.value.EinheitID = null
    einheitSearch.value = ''
  }
}

function selectUmsatzsteuersatz(satz) {
  if (satz) {
    produkt.value.UmsatzsteuersatzID = satz.UmsatzsteuersatzID
    umsatzsteuersatzSearch.value = satz.Name
  } else {
    produkt.value.UmsatzsteuersatzID = null
    umsatzsteuersatzSearch.value = ''
  }
}

async function fetchPreise() {
  if (props.mode !== 'edit' || !produktId) return
  try {
    const response = await $fetch(`/api/preise`)
    preise.value = response.filter(preis => preis.ProduktID === parseInt(produktId))
  } catch (err) {
    console.error('Fehler beim Laden der Preise:', err.message)
  }
}

async function fetchStandorte() {
  try {
    const response = await $fetch(`/api/standorte`)
    standorte.value = response
  } catch (err) {
    console.error('Fehler beim Laden der Standorte:', err.message)
  }
}

async function fetchKundengruppen() {
  try {
    const response = await $fetch(`/api/kundengruppen`)
    kundengruppen.value = response
  } catch (err) {
    console.error('Fehler beim Laden der Kundengruppen:', err.message)
  }
}

async function fetchKategorien() {
  try {
    const response = await $fetch(`/api/produktkategorien`)
    kategorien.value = response
  } catch (err) {
    console.error('Fehler beim Laden der Produktkategorien:', err.message)
  }
}

async function fetchLieferanten() {
  try {
    const response = await $fetch(`/api/lieferanten`)
    if (response && response.data && Array.isArray(response.data)) {
      lieferanten.value = response.data;
    } else if (Array.isArray(response)) {
      lieferanten.value = response;
    } else {
      lieferanten.value = [];
    }
    console.log('Fetched Lieferanten:', lieferanten.value.length, 'items')
  } catch (err) {
    console.error('Fehler beim Laden der Lieferanten:', err.message)
    lieferanten.value = []
  }
}

function selectStandort(standort) {
  if (standort) {
    currentPreis.value.StandortID = standort.StandortID
    standortSearch.value = standort.Name
  } else {
    currentPreis.value.StandortID = null
    standortSearch.value = ''
  }
}

function selectKundengruppe(gruppe) {
  if (gruppe) {
    currentPreis.value.KundengruppeID = gruppe.KundengruppeID
    kundengruppeSearch.value = gruppe.Name
  } else {
    currentPreis.value.KundengruppeID = null
    kundengruppeSearch.value = ''
  }
}

async function saveProdukt() {
  try {
    let produktData = { 
      ...produkt.value, 
      Kategorien: selectedKategorien.value,
      LieferantenDetails: lieferantenDetails.value
    }
    let newProduktId = produktId;
    let success = false;
    if (props.mode === 'create') {
      // Map field names to match the original create.vue structure
      produktData = {
        Produktname: produkt.value.Produktname,
        Beschreibung: produkt.value.Beschreibung,
        Preis: produkt.value.Preis || 0.00,
        Kategorie: produkt.value.Kategorie || '',
        EAN: produkt.value.EAN_Code || '',
        Artikelnummer: produkt.value.Artikelnummer,
        EinheitID: produkt.value.EinheitID,
        UmsatzsteuersatzID: produkt.value.UmsatzsteuersatzID,
        Hersteller: produkt.value.Hersteller,
        Gewicht: produkt.value.Gewicht ? parseFloat(produkt.value.Gewicht) : null,
        Volumen: produkt.value.Volumen ? parseFloat(produkt.value.Volumen) : null,
        LieferantenDetails: lieferantenDetails.value
      }
      const response = await $fetch('/api/produkte', {
        method: 'POST',
        body: produktData
      })
      newProduktId = response.ProduktID
      for (const preis of preise.value) {
        const preisData = {
          ProduktID: newProduktId,
          Preis: parseFloat(preis.Preis),
          Waehrung: preis.Waehrung || 'EUR',
          GueltigAb: preis.GueltigAb ? new Date(preis.GueltigAb).toISOString() : new Date().toISOString(),
          GueltigBis: preis.GueltigBis ? new Date(preis.GueltigBis).toISOString() : null,
          StandortID: preis.StandortID ? parseInt(preis.StandortID) : null,
          KundengruppeID: preis.KundengruppeID ? parseInt(preis.KundengruppeID) : null,
          PreisTyp: preis.PreisTyp || 'Standard'
        }
        console.log('Sending Preis data:', preisData)
        try {
          await $fetch('/api/preise', {
            method: 'POST',
            body: preisData
          })
        } catch (preisErr) {
          console.error('Fehler beim Erstellen des Preises:', preisErr)
          throw new Error(`[POST] "/api/preise": 500 Fehler beim Erstellen des Preises: ${preisErr.message}`)
        }
      }
      success = true;
    } else {
      // Ensure LieferantenDetails are included in the update request
      produktData = {
        ...produkt.value,
        Kategorien: selectedKategorien.value,
        LieferantenDetails: lieferantenDetails.value.map(detail => ({
          LieferantenID: detail.LieferantenID,
          LieferantenArtikelnummer: detail.LieferantenArtikelnummer || '',
          Lieferzeit: detail.Lieferzeit ? parseInt(detail.Lieferzeit) : null,
          Mindestbestellmenge: detail.Mindestbestellmenge ? parseInt(detail.Mindestbestellmenge) : null,
          PreisBeimLieferanten: detail.PreisBeimLieferanten ? parseFloat(detail.PreisBeimLieferanten) : null,
          WaehrungLieferant: detail.WaehrungLieferant || 'EUR'
        }))
      }
      await $fetch(`/api/produkte?id=${produktId}`, {
        method: 'PUT',
        body: produktData
      })
      success = true;
    }
    // Upload images if any
    if (imageFiles.value.length > 0) {
      const formData = new FormData()
      formData.append('produktId', newProduktId.toString())
      imageFiles.value.forEach(file => {
        formData.append('images', file)
      })
      try {
        await fetch('/api/produktbilder', {
          method: 'POST',
          body: formData
        })
      } catch (imageErr) {
        console.error('Fehler beim Hochladen der Bilder:', imageErr)
        alert($t('produktForm.errorUploadingImages') + imageErr.message)
        return
      }
    }
    if (success) {
      router.push('/produkte')
    }
  } catch (err) {
    if (err.status === 409) {
      showConfirmModal.value = true;
    } else {
      alert($t('produktForm.errorSavingProduct') + err.message)
    }
  }
}

function handleConfirm() {
  showConfirmModal.value = false;
  fetchProdukt();
}

function handleCancel() {
  showConfirmModal.value = false;
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('de-DE')
}

function addPreis() {
  editingPreis.value = false
  currentPreis.value = {
    PreisID: null,
    ProduktID: produktId ? parseInt(produktId) : null,
    Preis: 0.00,
    Waehrung: 'EUR',
    GueltigAb: new Date().toISOString().split('T')[0],
    GueltigBis: '',
    StandortID: null,
    KundengruppeID: null,
    PreisTyp: 'Standard'
  }
  standortSearch.value = ''
  kundengruppeSearch.value = ''
  currentPreisIndex.value = -1
  showPreisModal.value = true
}

function editPreis(index) {
  editingPreis.value = true
  currentPreis.value = { ...preise.value[index] }
  currentPreis.value.GueltigAb = currentPreis.value.GueltigAb ? new Date(currentPreis.value.GueltigAb).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  currentPreis.value.GueltigBis = currentPreis.value.GueltigBis ? new Date(currentPreis.value.GueltigBis).toISOString().split('T')[0] : ''
  standortSearch.value = currentPreis.value.StandortID ? standorte.value.find(s => s.StandortID === currentPreis.value.StandortID)?.Name || '' : ''
  kundengruppeSearch.value = currentPreis.value.KundengruppeID ? kundengruppen.value.find(g => g.KundengruppeID === currentPreis.value.KundengruppeID)?.Name || '' : ''
  currentPreisIndex.value = index
  showPreisModal.value = true
}

async function deletePreis(index) {
  if (confirm($t('produktForm.confirmDeletePrice'))) {
    if (props.mode === 'edit' && preise.value[index].PreisID) {
      try {
        const preisId = preise.value[index].PreisID
        await $fetch(`/api/preise?id=${preisId}`, { method: 'DELETE' })
      } catch (err) {
        alert($t('produktForm.errorDeletingPrice') + err.message)
      }
    }
    preise.value.splice(index, 1)
  }
}

function addLieferantDetail() {
  editingLieferant.value = false
  currentLieferantDetail.value = {
    LieferantenID: null,
    LieferantenArtikelnummer: '',
    Lieferzeit: null,
    Mindestbestellmenge: null,
    PreisBeimLieferanten: null,
    WaehrungLieferant: 'EUR'
  }
  lieferantSearch.value = ''
  currentLieferantIndex.value = -1
  showLieferantModal.value = true
  console.log('Adding new Lieferant, search value cleared')
}

function editLieferantDetail(index) {
  editingLieferant.value = true
  currentLieferantDetail.value = { ...lieferantenDetails.value[index] }
  lieferantSearch.value = currentLieferantDetail.value.LieferantenID ? lieferanten.value.find(l => l.LieferantenID === currentLieferantDetail.value.LieferantenID)?.Firmenname || '' : ''
  console.log('Editing Lieferant:', currentLieferantDetail.value.LieferantenID, 'Search value:', lieferantSearch.value)
  currentLieferantIndex.value = index
  showLieferantModal.value = true
}

function deleteLieferantDetail(index) {
  if (confirm($t('produktForm.confirmRemoveSupplier'))) {
    lieferantenDetails.value.splice(index, 1)
  }
}

function closeLieferantModal() {
  showLieferantModal.value = false
}

function selectLieferant(lieferant) {
  if (lieferant) {
    currentLieferantDetail.value.LieferantenID = lieferant.LieferantenID
    lieferantSearch.value = lieferant.Firmenname
    console.log('Selected Lieferant:', lieferant.LieferantenID, lieferant.Firmenname)
  } else {
    currentLieferantDetail.value.LieferantenID = null
    lieferantSearch.value = ''
    console.log('Cleared Lieferant selection')
  }
}

async function saveLieferantDetail() {
  try {
    if (!currentLieferantDetail.value.LieferantenID) {
      alert($t('produktForm.selectSupplierPrompt'))
      return
    }
    if (editingLieferant.value && currentLieferantIndex.value >= 0) {
      lieferantenDetails.value[currentLieferantIndex.value] = { ...currentLieferantDetail.value }
    } else {
      // Check if the Lieferant is already added
      if (lieferantenDetails.value.some(detail => detail.LieferantenID === currentLieferantDetail.value.LieferantenID)) {
        alert($t('produktForm.supplierAlreadyAdded'))
        return
      }
      lieferantenDetails.value.push({ ...currentLieferantDetail.value })
    }
    closeLieferantModal()
  } catch (err) {
    alert($t('produktForm.errorSavingSupplier') + err.message)
  }
}

function closePreisModal() {
  showPreisModal.value = false
}

async function savePreis() {
  try {
    if (editingPreis.value && currentPreisIndex.value >= 0) {
      if (props.mode === 'edit' && currentPreis.value.PreisID) {
        await $fetch(`/api/preise?id=${currentPreis.value.PreisID}`, {
          method: 'PUT',
          body: {
            ProduktID: currentPreis.value.ProduktID,
            Preis: parseFloat(currentPreis.value.Preis),
            Waehrung: currentPreis.value.Waehrung,
            GueltigAb: currentPreis.value.GueltigAb,
            GueltigBis: currentPreis.value.GueltigBis || null,
            StandortID: currentPreis.value.StandortID ? parseInt(currentPreis.value.StandortID) : null,
            KundengruppeID: currentPreis.value.KundengruppeID ? parseInt(currentPreis.value.KundengruppeID) : null,
            PreisTyp: currentPreis.value.PreisTyp
          }
        })
      }
      preise.value[currentPreisIndex.value] = { ...currentPreis.value }
    } else {
      if (props.mode === 'edit') {
        const response = await $fetch('/api/preise', {
          method: 'POST',
          body: {
            ProduktID: currentPreis.value.ProduktID,
            Preis: parseFloat(currentPreis.value.Preis),
            Waehrung: currentPreis.value.Waehrung,
            GueltigAb: currentPreis.value.GueltigAb,
            GueltigBis: currentPreis.value.GueltigBis || null,
            StandortID: currentPreis.value.StandortID ? parseInt(currentPreis.value.StandortID) : null,
            KundengruppeID: currentPreis.value.KundengruppeID ? parseInt(currentPreis.value.KundengruppeID) : null,
            PreisTyp: currentPreis.value.PreisTyp
          }
        })
        preise.value.push(response)
      } else {
        preise.value.push({ ...currentPreis.value })
      }
    }
    closePreisModal()
  } catch (err) {
    alert($t('produktForm.errorSavingPrice') + err.message)
  }
}

function setInitialAutocompleteValues() {
  einheitSearch.value = produkt.value.EinheitID && einheiten.value.length > 0 ? einheiten.value.find(e => e.EinheitID === produkt.value.EinheitID)?.Name || '' : ''
  umsatzsteuersatzSearch.value = produkt.value.UmsatzsteuersatzID && umsatzsteuersaetze.value.length > 0 ? umsatzsteuersaetze.value.find(u => u.UmsatzsteuersatzID === produkt.value.UmsatzsteuersatzID)?.Name || '' : ''
}

function handleImageUpload(event) {
  const files = event.target.files
  if (files) {
    imageFiles.value = Array.from(files)
    imagePreviews.value = imageFiles.value.map(file => URL.createObjectURL(file))
  }
}

function removeImagePreview(index) {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

async function deleteProduktBild(index) {
  if (confirm($t('produktForm.confirmDeleteImage'))) {
    const bild = produktBilder.value[index]
    if (bild.BildID) {
      try {
        await $fetch(`/api/produktbilder?id=${bild.BildID}`, { method: 'DELETE' })
      } catch (err) {
        alert($t('produktForm.errorDeletingImage') + err.message)
      }
    }
    produktBilder.value.splice(index, 1)
  }
}

async function setHauptbild(index) {
  const bild = produktBilder.value[index]
  if (bild.BildID) {
    try {
      await $fetch(`/api/produktbilder?id=${bild.BildID}`, {
        method: 'PUT',
        body: { IstHauptbild: true }
      })
      produktBilder.value.forEach((b, i) => {
        b.IstHauptbild = i === index
      })
    } catch (err) {
      alert($t('produktForm.errorSettingMainImage') + err.message)
    }
  }
}

const showConfirmModal = ref(false);

onMounted(async () => {
  await Promise.all([
    fetchEinheiten(),
    fetchUmsatzsteuersaetze(),
    fetchStandorte(),
    fetchKundengruppen(),
    fetchKategorien(),
    fetchLieferanten()
  ])
  await fetchProdukt()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
