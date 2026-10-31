import dataTable from '../components/dataTable.vue'
<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date" v-model="eventDate" v-on:keyup.enter="handleSubmitForm" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--Table showing List of Events-->
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div v-if="loading" class="col-span-2 border-t-4 border-amber-500 bg-amber-50 p-5 text-amber-950" role="status">
        Fetching the event calendar...
      </div>
      <div v-else-if="error" class="col-span-2 border-t-4 border-amber-700 bg-amber-50 p-5 text-amber-950" role="alert">
        <p>Event search failed: {{ error }}</p>
        <button class="mt-3 rounded bg-amber-700 px-4 py-2 text-white" @click="execute()">Try again</button>
      </div>
      <div v-else-if="!events.length" class="col-span-2 border-dashed border-2 border-amber-300 p-5 text-amber-900">
        No events match the selected search.
      </div>
      <div v-else class="flex flex-col col-span-2">
        <DataTable
          :columns="columns"
          :rows="events"
          @row-click="(e) => router.push({ name: 'eventdetails', params: { id: e._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()
const request = useApi(getEvents)
const events = computed(() => request.data.value ?? [])
const { loading, error, execute } = request
const searchBy = ref(null)
const name = ref(null)
const eventDate = ref(null)


const columns = [
  { label: 'Event Name', key: 'name' },
  { label: 'Event Date', key: 'date', render: (e) => formatDate(e.date) },
  { label: 'Event Address', key: 'address.line1' }
]

async function loadData() {
  searchBy.value = null
  name.value = null
  eventDate.value = null
  await execute()
}

async function handleSubmitForm() {
  if (searchBy.value === 'Event Name' && name.value) {
    await execute(() => searchEvents({
      searchBy: 'name',
      name: name.value
    }))
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    const formattedDate = new Date(eventDate.value).toISOString().substring(0, 10)
    await execute(() => searchEvents({
      searchBy: 'date',
      eventDate: formattedDate
    }))
  }
}

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

onMounted(loadData)
</script>
