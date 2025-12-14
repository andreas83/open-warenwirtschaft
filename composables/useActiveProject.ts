import { ref, computed, watch } from 'vue'

interface ModuleItem {
  modulId: number
  modulName: string
  displayName: string
  icon: string
  route: string
  kategorie: string
  sortOrder: number
}

interface MenuItem {
  to: string
  icon: string
  label: string
  children?: MenuItem[]
}

// Global state for the active project
const activeProjectId = ref<number | null>(null)
const activeModules = ref<ModuleItem[]>([])
const isLoading = ref(false)

export function useActiveProject() {
  // Initialize from localStorage on client
  if (process.client && activeProjectId.value === null) {
    const saved = localStorage.getItem('activeProjectId')
    if (saved) {
      activeProjectId.value = parseInt(saved)
    }
  }

  // Save to localStorage when changed
  watch(activeProjectId, (newId) => {
    if (process.client) {
      if (newId) {
        localStorage.setItem('activeProjectId', newId.toString())
      } else {
        localStorage.removeItem('activeProjectId')
      }
    }
  })

  // Fetch modules for active project
  async function fetchActiveModules() {
    if (!activeProjectId.value) {
      activeModules.value = []
      return
    }

    isLoading.value = true
    try {
      const modules = await $fetch<ModuleItem[]>(`/api/projekte/${activeProjectId.value}/modules`)
      activeModules.value = modules
    } catch (error) {
      console.error('Error fetching modules:', error)
      activeModules.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Set active project
  async function setActiveProject(projectId: number | null) {
    activeProjectId.value = projectId
    await fetchActiveModules()
  }

  // Check if a module is active
  function isModuleActive(modulName: string): boolean {
    return activeModules.value.some((m) => m.modulName === modulName)
  }

  // Build menu items from active modules
  const menuItems = computed<MenuItem[]>(() => {
    // If no project is selected, show all default items
    if (!activeProjectId.value || activeModules.value.length === 0) {
      return getDefaultMenuItems()
    }

    return buildMenuFromModules(activeModules.value)
  })

  return {
    activeProjectId: computed(() => activeProjectId.value),
    activeModules: computed(() => activeModules.value),
    isLoading: computed(() => isLoading.value),
    menuItems,
    setActiveProject,
    fetchActiveModules,
    isModuleActive,
  }
}

function getDefaultMenuItems(): MenuItem[] {
  return [
    { to: '/projekte', icon: 'i-mdi-folder-multiple', label: 'menu.projects' },
    { to: '/standorte', icon: 'i-mdi-map-marker', label: 'menu.locations' },
    { to: '/produkte', icon: 'i-mdi-package', label: 'menu.products' },
    { to: '/kategorien', icon: 'i-mdi-tag-multiple', label: 'menu.categories' },
    { to: '/kunden', icon: 'i-mdi-account-group', label: 'menu.customers' },
    { to: '/kundengruppen', icon: 'i-mdi-account-multiple', label: 'menu.customerGroups' },
    { to: '/rechnungen', icon: 'i-mdi-receipt', label: 'menu.invoices' },
    { to: '/bestellungen', icon: 'i-mdi-clipboard-list', label: 'menu.orders' },
    { to: '/lieferanten', icon: 'i-mdi-truck', label: 'menu.suppliers' },
    { to: '/kassen', icon: 'i-mdi-cash-register', label: 'menu.cashRegister' },
    {
      to: '/inventory',
      icon: 'i-mdi-warehouse',
      label: 'menu.inventory',
      children: [
        { to: '/bestand', icon: 'i-mdi-package-variant', label: 'menu.stock' },
        { to: '/lagerbewegungen', icon: 'i-mdi-swap-horizontal', label: 'menu.stockMovements' },
      ],
    },
    {
      to: '/finance',
      icon: 'i-mdi-finance',
      label: 'menu.finance',
      children: [
        { to: '/zahlungen', icon: 'i-mdi-credit-card', label: 'menu.payments' },
        { to: '/rabatte', icon: 'i-mdi-percent', label: 'menu.discounts' },
        { to: '/retouren', icon: 'i-mdi-package-variant-closed-remove', label: 'menu.returns' },
      ],
    },
    {
      to: '/wholesale',
      icon: 'i-mdi-domain',
      label: 'menu.wholesale',
      children: [
        { to: '/angebote', icon: 'i-mdi-file-document-edit', label: 'menu.quotes' },
        { to: '/preisvertraege', icon: 'i-mdi-file-sign', label: 'menu.priceContracts' },
        { to: '/vertreter', icon: 'i-mdi-account-tie', label: 'menu.representatives' },
        { to: '/kreditmanagement', icon: 'i-mdi-credit-card-check', label: 'menu.creditManagement' },
        { to: '/lieferungen', icon: 'i-mdi-truck-delivery', label: 'menu.deliveries' },
      ],
    },
    {
      to: '/restaurant',
      icon: 'i-mdi-silverware-fork-knife',
      label: 'restaurant.title',
      children: [
        { to: '/restaurant/tische', icon: 'i-mdi-table-furniture', label: 'restaurant.tables.title' },
        { to: '/restaurant/reservierungen', icon: 'i-mdi-calendar-check', label: 'restaurant.reservations.title' },
        { to: '/restaurant/bestellungen', icon: 'i-mdi-food', label: 'restaurant.orders.title' },
      ],
    },
    {
      to: '/hotel',
      icon: 'i-mdi-hotel',
      label: 'hotel.title',
      children: [
        { to: '/hotel/zimmer', icon: 'i-mdi-bed', label: 'hotel.rooms.title' },
        { to: '/hotel/zimmerkategorien', icon: 'i-mdi-tag-multiple', label: 'hotel.categories.title' },
        { to: '/hotel/buchungen', icon: 'i-mdi-calendar-clock', label: 'hotel.bookings.title' },
      ],
    },
    {
      to: '/shop',
      icon: 'i-mdi-shopping',
      label: 'shop.title',
      children: [
        { to: '/shop/bestellungen', icon: 'i-mdi-cart', label: 'shop.orders.title' },
        { to: '/shop/kategorien', icon: 'i-mdi-folder-outline', label: 'shop.categories.title' },
        { to: '/shop/produkte', icon: 'i-mdi-package-variant', label: 'shop.products.title' },
      ],
    },
    { to: '/berichte', icon: 'i-mdi-chart-bar', label: 'menu.reports' },
    {
      to: '/settings',
      icon: 'i-mdi-cog',
      label: 'menu.settings',
      children: [
        { to: '/umsatzsteuersaetze', icon: 'i-mdi-currency-eur', label: 'menu.vat' },
        { to: '/einheiten', icon: 'i-mdi-ruler', label: 'menu.unit' },
      ],
    },
  ]
}

function buildMenuFromModules(modules: ModuleItem[]): MenuItem[] {
  const menuItems: MenuItem[] = []
  const moduleMap = new Map(modules.map((m) => [m.modulName, m]))

  // Always include projects
  menuItems.push({ to: '/projekte', icon: 'i-mdi-folder-multiple', label: 'menu.projects' })

  // Standard modules mapping
  const standardModules: { name: string; label: string }[] = [
    { name: 'standorte', label: 'menu.locations' },
    { name: 'produkte', label: 'menu.products' },
    { name: 'kunden', label: 'menu.customers' },
    { name: 'rechnungen', label: 'menu.invoices' },
    { name: 'lieferanten', label: 'menu.suppliers' },
    { name: 'kassen', label: 'menu.cashRegister' },
    { name: 'berichte', label: 'menu.reports' },
  ]

  for (const mod of standardModules) {
    const moduleDef = moduleMap.get(mod.name)
    if (moduleDef) {
      menuItems.push({
        to: moduleDef.route,
        icon: moduleDef.icon,
        label: mod.label,
      })
    }
  }

  // Restaurant module with children
  if (moduleMap.has('restaurant')) {
    const restaurantChildren: MenuItem[] = []
    if (moduleMap.has('restaurant_tische')) {
      restaurantChildren.push({
        to: '/restaurant/tische',
        icon: moduleMap.get('restaurant_tische')!.icon,
        label: 'restaurant.tables.title',
      })
    }
    if (moduleMap.has('restaurant_reservierungen')) {
      restaurantChildren.push({
        to: '/restaurant/reservierungen',
        icon: moduleMap.get('restaurant_reservierungen')!.icon,
        label: 'restaurant.reservations.title',
      })
    }

    menuItems.push({
      to: '/restaurant',
      icon: moduleMap.get('restaurant')!.icon,
      label: 'restaurant.title',
      children: restaurantChildren.length > 0 ? restaurantChildren : undefined,
    })
  }

  // Hotel module with children
  if (moduleMap.has('hotel')) {
    const hotelChildren: MenuItem[] = []
    if (moduleMap.has('hotel_zimmer')) {
      hotelChildren.push({
        to: '/hotel/zimmer',
        icon: moduleMap.get('hotel_zimmer')!.icon,
        label: 'hotel.rooms.title',
      })
    }
    if (moduleMap.has('hotel_zimmerkategorien')) {
      hotelChildren.push({
        to: '/hotel/zimmerkategorien',
        icon: moduleMap.get('hotel_zimmerkategorien')!.icon,
        label: 'hotel.categories.title',
      })
    }
    if (moduleMap.has('hotel_buchungen')) {
      hotelChildren.push({
        to: '/hotel/buchungen',
        icon: moduleMap.get('hotel_buchungen')!.icon,
        label: 'hotel.bookings.title',
      })
    }

    menuItems.push({
      to: '/hotel',
      icon: moduleMap.get('hotel')!.icon,
      label: 'hotel.title',
      children: hotelChildren.length > 0 ? hotelChildren : undefined,
    })
  }

  // Shop module with children
  if (moduleMap.has('shop')) {
    const shopChildren: MenuItem[] = []
    if (moduleMap.has('shop_bestellungen')) {
      shopChildren.push({
        to: '/shop/bestellungen',
        icon: moduleMap.get('shop_bestellungen')!.icon,
        label: 'shop.orders.title',
      })
    }
    if (moduleMap.has('shop_kategorien')) {
      shopChildren.push({
        to: '/shop/kategorien',
        icon: moduleMap.get('shop_kategorien')!.icon,
        label: 'shop.categories.title',
      })
    }

    menuItems.push({
      to: '/shop',
      icon: moduleMap.get('shop')!.icon,
      label: 'shop.title',
      children: shopChildren.length > 0 ? shopChildren : undefined,
    })
  }

  // Settings (always visible)
  const settingsChildren: MenuItem[] = []
  if (moduleMap.has('umsatzsteuersaetze')) {
    settingsChildren.push({
      to: '/umsatzsteuersaetze',
      icon: moduleMap.get('umsatzsteuersaetze')!.icon,
      label: 'menu.vat',
    })
  }
  if (moduleMap.has('einheiten')) {
    settingsChildren.push({
      to: '/einheiten',
      icon: moduleMap.get('einheiten')!.icon,
      label: 'menu.unit',
    })
  }

  if (settingsChildren.length > 0) {
    menuItems.push({
      to: '/settings',
      icon: 'i-mdi-cog',
      label: 'menu.settings',
      children: settingsChildren,
    })
  }

  return menuItems
}
