<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Produktkategorien</h2>
      <button @click="openAddModal" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-200 text-sm font-medium">
        Neue Kategorie
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">
      <div class="i-svg-spinners:blocks-wave inline-block" />
      Lade Kategorien...
    </div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else-if="kategorien.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-12">
      Keine Kategorien gefunden.
    </div>
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl overflow-hidden">
      <div class="p-4">
        <draggable
          v-model="nestedKategorien"
          group="kategorien"
          @start="drag=true"
          @end="onDragEnd"
          item-key="KategorieID"
          class="space-y-2"
          handle=".handle"
        >
          <template #item="{element, index}">
            <div
              class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              :style="{ 'margin-left': element.level * 20 + 'px' }"
            >
              <div class="handle cursor-move text-gray-400 dark:text-gray-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zM3 9.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zM3 14.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-gray-100">{{ element.Name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ element.Beschreibung || '-' }}</div>
              </div>
              <div v-if="element.KategorieBilder && element.KategorieBilder.length > 0" class="mr-4">
                <img :src="getMainImage(element.KategorieBilder)" class="w-10 h-10 object-cover rounded-md" alt="Hauptbild" />
              </div>
              <div class="flex space-x-3">
                <button @click="editKategorie(element)" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">Bearbeiten</button>
                <button @click="deleteKategorie(element.KategorieID)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Löschen</button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Modal for Adding/Editing Categories -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-xl p-6 w-full max-w-lg">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">{{ modalMode === 'add' ? 'Neue Kategorie' : 'Kategorie Bearbeiten' }}</h3>
        <form @submit.prevent="saveKategorie" class="space-y-5">
          <div>
            <label for="name" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Name</label>
            <input id="name" v-model="currentKategorie.Name" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
          </div>
          <div>
            <label for="beschreibung" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Beschreibung (optional)</label>
            <textarea id="beschreibung" v-model="currentKategorie.Beschreibung" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
          </div>
          <div>
            <label for="parentCategory" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Übergeordnete Kategorie (optional)</label>
            <Autocomplete
              id="parentCategory"
              :items="kategorien"
              id-key="KategorieID"
              :display-fn="item => item.Name"
              :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
              :initial-value="parentCategorySearch"
              placeholder="Übergeordnete Kategorie suchen..."
              @select="selectParentCategory"
            />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Bilder (optional)</label>
            <div class="mb-3">
              <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" multiple class="hidden" />
              <button type="button" @click="$refs.fileInput.click()" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">
                Bilder auswählen
              </button>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">{{ uploadedFiles.length }} Datei(en) ausgewählt</span>
            </div>
            <div v-if="currentKategorie.KategorieBilder && currentKategorie.KategorieBilder.length > 0 || uploadedFiles.length > 0" class="space-y-3">
              <div v-for="bild in currentKategorie.KategorieBilder" :key="bild.BildID" class="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                <div class="flex items-center">
                  <img :src="bild.BildPfad" class="w-12 h-12 object-cover rounded-md mr-3" alt="Kategorie Bild" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ bild.BildPfad.split('/').pop() }}</span>
                </div>
                <div class="flex space-x-2">
                  <button type="button" @click="setMainImage(bild.BildID)" :class="{'text-green-500 dark:text-green-400': bild.IstHauptbild, 'text-gray-500 dark:text-gray-400': !bild.IstHauptbild}" class="hover:text-green-700 dark:hover:text-green-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path v-if="bild.IstHauptbild" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      <path v-else fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM8 13.417l-2.259 1.647a.5.5 0 01-.648-.236L4.07 11.582a.5.5 0 01.182-.559l2.259-1.647a.5.5 0 01.588 0l2.259 1.647a.5.5 0 01.182.559l-1.023 3.246a.5.5 0 01-.648.236L8 13.417z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" @click="deleteImage(bild.BildID)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                <div class="flex items-center">
                  <img :src="file.preview" class="w-12 h-12 object-cover rounded-md mr-3" alt="Vorschau" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ file.name }}</span>
                </div>
                <div class="flex space-x-2">
                  <button type="button" @click="setNewMainImage(index)" :class="{'text-green-500 dark:text-green-400': file.isMain, 'text-gray-500 dark:text-gray-400': !file.isMain}" class="hover:text-green-700 dark:hover:text-green-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path v-if="file.isMain" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      <path v-else fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM8 13.417l-2.259 1.647a.5.5 0 01-.648-.236L4.07 11.582a.5.5 0 01.182-.559l2.259-1.647a.5.5 0 01.588 0l2.259 1.647a.5.5 0 01.182.559l-1.023 3.246a.5.5 0 01-.648.236L8 13.417z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" @click="removeUploadedFile(index)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</button>
            <button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">{{ modalMode === 'add' ? 'Erstellen' : 'Speichern' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Autocomplete from '~/components/Autocomplete.vue'
//import draggable from 'vuedraggable'
import draggable from 'vuedraggable/src/vuedraggable'


const kategorien = ref([])
const nestedKategorien = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const currentKategorie = ref({
  KategorieID: null,
  Name: '',
  Beschreibung: '',
  UebergeordneteKategorieID: null,
  KategorieBilder: []
})
const parentCategorySearch = ref('')
const uploadedFiles = ref([])
const drag = ref(false)

const fileInput = ref(null)

async function fetchKategorien() {
  try {
    loading.value = true
    const response = await $fetch('/api/produktkategorien')
    kategorien.value = response
    nestedKategorien.value = buildNestedCategories(response)
  } catch (err) {
    error.value = 'Fehler beim Laden der Kategorien: ' + err.message
  } finally {
    loading.value = false
  }
}

function buildNestedCategories(categories, parentId = null, level = 0) {
  const result = []
  const filtered = categories.filter(cat => cat.UebergeordneteKategorieID === parentId)
  
  filtered.forEach(cat => {
    result.push({
      ...cat,
      level
    })
    const children = buildNestedCategories(categories, cat.KategorieID, level + 1)
    result.push(...children)
  })
  
  return result
}

function getParentCategoryName(id) {
  if (!id) return null
  const parent = kategorien.value.find(k => k.KategorieID === id)
  return parent ? parent.Name : null
}

function openAddModal() {
  modalMode.value = 'add'
  currentKategorie.value = {
    KategorieID: null,
    Name: '',
    Beschreibung: '',
    UebergeordneteKategorieID: null,
    KategorieBilder: []
  }
  parentCategorySearch.value = ''
  uploadedFiles.value = []
  showModal.value = true
}

function editKategorie(kategorie) {
  modalMode.value = 'edit'
  currentKategorie.value = { ...kategorie }
  parentCategorySearch.value = kategorie.UebergeordneteKategorieID ? getParentCategoryName(kategorie.UebergeordneteKategorieID) : ''
  uploadedFiles.value = []
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function selectParentCategory(kategorie) {
  if (kategorie) {
    currentKategorie.value.UebergeordneteKategorieID = kategorie.KategorieID
    parentCategorySearch.value = kategorie.Name
  } else {
    currentKategorie.value.UebergeordneteKategorieID = null
    parentCategorySearch.value = ''
  }
}

async function saveKategorie() {
  try {
    let savedKategorie;
    if (modalMode.value === 'add') {
      const response = await $fetch('/api/produktkategorien', {
        method: 'POST',
        body: currentKategorie.value
      })
      savedKategorie = response.data
      kategorien.value.push(savedKategorie)
    } else {
      const response = await $fetch(`/api/produktkategorien?id=${currentKategorie.value.KategorieID}`, {
        method: 'PUT',
        body: currentKategorie.value
      })
      savedKategorie = response.data
      const index = kategorien.value.findIndex(k => k.KategorieID === currentKategorie.value.KategorieID)
      if (index !== -1) {
        kategorien.value[index] = savedKategorie
      }
    }
    
    // Upload images if any
    if (uploadedFiles.value.length > 0 && savedKategorie.KategorieID) {
      for (const file of uploadedFiles.value) {
        const formData = {
          KategorieID: savedKategorie.KategorieID,
          file: {
            name: file.name,
            data: file.data
          },
          IstHauptbild: file.isMain || false
        }
        await $fetch('/api/kategoriebilder', {
          method: 'POST',
          body: formData
        })
      }
    }
    
    nestedKategorien.value = buildNestedCategories(kategorien.value)
    closeModal()
  } catch (err) {
    alert('Fehler beim Speichern der Kategorie: ' + err.message)
  }
}

async function deleteKategorie(id) {
  if (confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
    try {
      await $fetch(`/api/produktkategorien?id=${id}`, {
        method: 'DELETE'
      })
      kategorien.value = kategorien.value.filter(k => k.KategorieID !== id)
      nestedKategorien.value = buildNestedCategories(kategorien.value)
    } catch (err) {
      alert('Fehler beim Löschen der Kategorie: ' + err.message)
    }
  }
}

function onDragEnd(evt) {
  drag.value = false
  const movedItem = nestedKategorien.value[evt.newIndex]
  let newParentId = null
  let newLevel = 0
  
  // Determine new parent and level based on position
  if (evt.newIndex > 0) {
    const prevItem = nestedKategorien.value[evt.newIndex - 1]
    newLevel = prevItem.level
    if (evt.newIndex < nestedKategorien.value.length - 1) {
      const nextItem = nestedKategorien.value[evt.newIndex + 1]
      if (nextItem.level > prevItem.level) {
        newLevel = prevItem.level + 1
        newParentId = prevItem.KategorieID
      } else if (nextItem.level < prevItem.level) {
        newLevel = nextItem.level
        // Find the parent at the correct level
        for (let i = evt.newIndex - 1; i >= 0; i--) {
          if (nestedKategorien.value[i].level === newLevel - 1) {
            newParentId = nestedKategorien.value[i].KategorieID
            break
          }
        }
      } else {
        newParentId = prevItem.UebergeordneteKategorieID
      }
    } else {
      newParentId = prevItem.UebergeordneteKategorieID
    }
  }
  
  // Update the moved item's level and parent ID
  movedItem.level = newLevel
  if (movedItem.UebergeordneteKategorieID !== newParentId) {
    movedItem.UebergeordneteKategorieID = newParentId
    updateKategorieParent(movedItem.KategorieID, newParentId)
  }
  
  // Update the kategorien array with the new level and parent for consistency
  const kategorieIndex = kategorien.value.findIndex(k => k.KategorieID === movedItem.KategorieID)
  if (kategorieIndex !== -1) {
    kategorien.value[kategorieIndex].UebergeordneteKategorieID = newParentId
  }
  
  // Rebuild the nested structure to reflect the changes
  nestedKategorien.value = buildNestedCategories(kategorien.value)
}

async function updateKategorieParent(id, parentId) {
  try {
    const kategorieIndex = kategorien.value.findIndex(k => k.KategorieID === id)
    if (kategorieIndex !== -1) {
      kategorien.value[kategorieIndex].UebergeordneteKategorieID = parentId
      await $fetch(`/api/produktkategorien?id=${id}`, {
        method: 'PUT',
        body: kategorien.value[kategorieIndex]
      })
    }
  } catch (err) {
    alert('Fehler beim Aktualisieren der Hierarchie: ' + err.message)
  }
}

function handleFileUpload(event) {
  const files = event.target.files
  uploadedFiles.value = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        name: file.name,
        data: e.target.result.split(',')[1], // Base64 data
        preview: e.target.result,
        isMain: i === 0 // Set first image as main by default
      })
    }
    reader.readAsDataURL(file)
  }
}

function removeUploadedFile(index) {
  uploadedFiles.value.splice(index, 1)
}

function setNewMainImage(index) {
  uploadedFiles.value.forEach((file, i) => {
    file.isMain = i === index
  })
}

async function setMainImage(bildId) {
  try {
    await $fetch(`/api/kategoriebilder?id=${bildId}`, {
      method: 'PUT',
      body: { IstHauptbild: true }
    })
    // Update local data
    currentKategorie.value.KategorieBilder.forEach(bild => {
      bild.IstHauptbild = bild.BildID === bildId
    })
  } catch (err) {
    alert('Fehler beim Setzen des Hauptbildes: ' + err.message)
  }
}

async function deleteImage(bildId) {
  if (confirm('Sind Sie sicher, dass Sie dieses Bild löschen möchten?')) {
    try {
      await $fetch(`/api/kategoriebilder?id=${bildId}`, {
        method: 'DELETE'
      })
      // Remove from local data
      currentKategorie.value.KategorieBilder = currentKategorie.value.KategorieBilder.filter(bild => bild.BildID !== bildId)
    } catch (err) {
      alert('Fehler beim Löschen des Bildes: ' + err.message)
    }
  }
}

function getMainImage(bilder) {
  const mainImage = bilder.find(bild => bild.IstHauptbild)
  return mainImage ? mainImage.BildPfad : bilder[0].BildPfad
}

onMounted(() => {
  fetchKategorien()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
