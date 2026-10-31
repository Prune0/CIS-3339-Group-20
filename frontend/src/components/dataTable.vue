<template>
  <div class="flex flex-col">
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="col in columns"
            :key="colId(col)"
            class="p-4 text-left"
            :style="col.width ? { width: col.width } : null"
            :aria-sort="ariaSort(col)"
          >
            <button
              v-if="isSortable(col)"
              type="button"
              class="flex items-center gap-2 p-0 font-bold"
              @click="toggleSort(col)"
            >
              {{ col.label }}
              <span aria-hidden="true" class="text-sm">{{ sortIcon(col) }}</span>
            </button>
            <span v-else class="font-bold">{{ col.label }}</span>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-300">
        <!-- Empty state -->
        <tr v-if="!total">
          <td :colspan="columns.length" class="p-5 text-center text-gray-700">
            No results
          </td>
        </tr>

        <tr
          v-for="(row, i) in pagedRows"
          :key="row._id ?? i"
          class="data-row cursor-pointer"
          tabindex="0"
          @click="emit('row-click', row)"
          @keydown.enter="emit('row-click', row)"
        >
          <td v-for="col in columns" :key="colId(col)" class="p-2 text-left">
            {{ cell(row, col) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-gray-700">
        Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
      </p>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded border border-red-700 px-4 py-2 text-red-700 disabled:opacity-40"
          :disabled="page <= 1"
          @click="page--"
        >
          Previous
        </button>
        <span class="text-sm">Page {{ page }} of {{ totalPages }}</span>
        <button
          type="button"
          class="rounded border border-red-700 px-4 py-2 text-red-700 disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 }
})
const emit = defineEmits(['row-click'])

// ---- helpers -------------------------------------------------------------
const colId = (col) => col.key ?? col.label

// "address.city" -> row.address.city, safe when a link in the path is missing
const getValue = (row, key) => key?.split('.').reduce((obj, k) => obj?.[k], row)

const cell = (row, col) => (col.render ? col.render(row) : getValue(row, col.key) ?? '')

const isSortable = (col) => col.sortable !== false && (col.key || col.sortValue)

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function compare(a, b) {
  // empty values always sort last
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

// ---- sorting: asc -> desc -> unsorted -------------------------------------
const sortKey = ref(null)
const sortDir = ref(null) // 'asc' | 'desc' | null

function toggleSort(col) {
  const id = colId(col)
  if (sortKey.value !== id) {
    sortKey.value = id
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortKey.value = null
    sortDir.value = null
  }
  page.value = 1
}

const sortIcon = (col) =>
  sortKey.value !== colId(col) ? '↕' : sortDir.value === 'asc' ? '▲' : '▼'

const ariaSort = (col) =>
  sortKey.value !== colId(col) ? 'none' : sortDir.value === 'asc' ? 'ascending' : 'descending'

// Sorting works on a copy; the rows prop is never mutated.
const sortedRows = computed(() => {
  const col = props.columns.find((c) => colId(c) === sortKey.value)
  if (!col || !sortDir.value) return props.rows
  const valueOf = (row) => (col.sortValue ? col.sortValue(row) : getValue(row, col.key))
  const factor = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const va = valueOf(a)
    const vb = valueOf(b)
    const empty = (v) => v === null || v === undefined || v === ''
    // empties stay last in both directions, so they skip the direction flip
    if (empty(va) || empty(vb)) return compare(va, vb)
    return compare(va, vb) * factor
  })
})

// ---- pagination ----------------------------------------------------------
const page = ref(1)
const total = computed(() => sortedRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / props.pageSize)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

const rangeStart = computed(() => (total.value ? (page.value - 1) * props.pageSize + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * props.pageSize, total.value))

// New rows (search, clear search, retry) -> back to page 1 so old rows never linger.
watch(
  () => props.rows,
  () => {
    page.value = 1
  }
)

// Safety net: if the page count shrinks, never sit on a page that no longer exists.
watch(totalPages, (pages) => {
  if (page.value > pages) page.value = pages
})
</script>

<style scoped>
/* same red highlight the old tables used, now for hover and keyboard focus */
.data-row {
  transition: background-color 0.3s ease-in-out;
}
.data-row:hover,
.data-row:focus-visible {
  background-color: rgba(255, 0, 0, 0.1);
  outline: none;
}
</style>