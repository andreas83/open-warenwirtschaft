<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-lg">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">Anmeldung</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="benutzername" class="sr-only">Benutzername</label>
            <input
              id="benutzername"
              name="benutzername"
              type="text"
              autocomplete="username"
              required
              class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Benutzername"
              v-model="benutzername"
            />
          </div>
          <div>
            <label for="passwort" class="sr-only">Passwort</label>
            <input
              id="passwort"
              name="passwort"
              type="password"
              autocomplete="current-password"
              required
              class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Passwort"
              v-model="passwort"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>

        <div>
          <button
            type="submit"
            class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <!-- Heroicon name: solid/lock-closed -->
              <svg
                class="w-5 h-5 text-indigo-400 group-hover:text-indigo-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            Anmelden
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()



setPageLayout('login')
definePageMeta({
  layout: false,
});

const router = useRouter()
const benutzername = ref('')
const passwort = ref('')
const error = ref('')

const handleSubmit = async () => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ benutzername: benutzername.value, passwort: passwort.value })
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || 'Anmeldung fehlgeschlagen'
      return
    }

    router.push('/')
  } catch (err) {
    error.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  }
}
</script>
