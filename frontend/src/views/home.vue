<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Events Attendance
          </h1>
      
          <div v-if="loading" class="flex justify-center mt-10">Loading events...</div>
          <div v-else-if="error" class="mt-10 bg-red-50 p-4 text-red-900">
            {{ error.message }}
          </div>
          <div v-else-if="!recentEvents.length" class="flex justify-center mt-10">No events found.</div>
          <table v-if="!loading && !error && recentEvents.length" class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Event Name</th>
                <th class="p-4 text-left">Event Date</th>
                <th class="p-4 text-left">Number of Attendees</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300"> 
              <tr
                @click="editEvent(event._id)"
                v-for="event in recentEvents"
                :key="event._id"
              >
                <td class="p-2 text-left">{{ event.name }}</td>
                <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                <td class="p-2 text-left">{{ event.attendees.length }}</td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="!loading && !error && recentEvents.length">
            <AttendanceChart
              :label="labels"
              :chart-data="chartData"
            ></AttendanceChart>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Clients by Zip Code
          </h1>
          
          <div v-if="zipLoading" class="flex justify-center mt-10">Loading clients...</div>
          <div v-else-if="zipError" class="mt-10 bg-red-50 p-4 text-red-900">
            {{ zipError.message }}
          </div>
          <div v-else-if="!zips.length" class="flex justify-center mt-10">No clients found.</div>
          <table v-if="!zipLoading && !zipError && zips.length" class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Zip Number</th>
                <th class="p-4 text-left">Client Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr
                v-for="zip in zips"
                :key="zip._id"
              >
                <td class="p-2 text-left">{{ zip._id }}</td>
                <td class="p-2 text-left">{{ zip.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!zipLoading && !zipError && zips.length" class="flex justify-center mt-10">
            <ZipChart
              :label="zipLabels"
              :chart-data="zipChartData"
            ></ZipChart>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'

// Composition API refs replace component data and expose dashboard loading state.
const router = useRouter()
const recentEvents = ref([])
const zips = ref([])
const labels = ref([])
const chartData = ref([])
const zipLabels = ref([])
const zipChartData = ref([])
const loading = ref(false)
const error = ref(null)
const zipLoading = ref(false)
const zipError = ref(null)

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

function editEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}

async function getAttendanceData() {
  error.value = null
  loading.value = true
  try {
    const attendance = await getAttendance()
    recentEvents.value = attendance
    labels.value = attendance.map(
      (item) => `${item.name} (${formatDate(item.date)})`
    )
    chartData.value = attendance.map((item) => item.attendees.length)
  } catch (err) {
    error.value = { title: 'Unable to load attendance', message: err.message }
  } finally {
    loading.value = false
  }
}

async function getZipData() {
  zipError.value = null
  zipLoading.value = true
  try {
    const zipdata = await getClientsByZipCode()
    zips.value = zipdata
    zipLabels.value = zipdata.map((item) => item._id)
    zipChartData.value = zipdata.map((item) => item.count)
  } catch (err) {
    zipError.value = { title: 'Unable to load ZIP code data', message: err.message }
  } finally {
    zipLoading.value = false
  }
}

onMounted(() => {
  getAttendanceData()
  getZipData()
})
</script>
