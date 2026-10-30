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
      
          <div v-if="loading" class="mt-8 border-l-4 border-red-700 bg-red-50 p-4" role="status">Loading attendance data...</div>
          <div v-else-if="error" class="mt-8 border-l-4 border-red-700 bg-red-50 p-4 text-red-900" role="alert">
            <p>Attendance data could not be loaded: {{ error }}</p>
            <button class="mt-3 rounded bg-red-700 px-4 py-2 text-white" @click="executeAttendance()">Retry attendance</button>
          </div>
          <div v-else-if="!recentEvents.length" class="flex justify-center mt-10">No events found.</div>
          <table v-else class="min-w-full shadow-md rounded">
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
          
          <AttendanceChart
            v-if="!loading && !error && recentEvents.length"
            :label="labels"
            :chart-data="chartData"
          ></AttendanceChart>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Clients by Zip Code
          </h1>
          
          <div v-if="zipLoading" class="mt-8 border-b-4 border-sky-700 bg-sky-50 p-4" role="status">Counting clients by ZIP code...</div>
          <div v-else-if="zipError" class="mt-8 border-b-4 border-sky-700 bg-sky-50 p-4 text-sky-950" role="alert">
            <p>ZIP code totals could not be loaded: {{ zipError }}</p>
            <button class="mt-3 rounded bg-sky-800 px-4 py-2 text-white" @click="executeZip()">Retry ZIP data</button>
          </div>
          <div v-else-if="!zips.length" class="flex justify-center mt-10">No clients found.</div>
          <table v-else class="min-w-full shadow-md rounded">
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
            <ZipChart :label="zipLabels" :chart-data="zipChartData"></ZipChart>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'

export default {
  setup() {
    const attendanceRequest = useApi(getAttendance)
    const zipRequest = useApi(getClientsByZipCode)

    return {
      attendanceData: attendanceRequest.data,
      loading: attendanceRequest.loading,
      error: attendanceRequest.error,
      executeAttendance: attendanceRequest.execute,
      zipData: zipRequest.data,
      zipLoading: zipRequest.loading,
      zipError: zipRequest.error,
      executeZip: zipRequest.execute
    }
  },
  components: {
    AttendanceChart,
    ZipChart,
  },
  mounted() {
    this.executeAttendance()
    this.executeZip()
  },
  computed: {
    recentEvents() {
      return this.attendanceData ?? []
    },
    zips() {
      return this.zipData ?? []
    },
    labels() {
      return this.recentEvents.map((item) => `${item.name} (${this.formatDate(item.date)})`)
    },
    chartData() {
      return this.recentEvents.map((item) => item.attendees.length)
    },
    zipLabels() {
      return this.zips.map((item) => item._id)
    },
    zipChartData() {
      return this.zips.map((item) => item.count)
    }
  },
  methods: {
    // method called to format the event date
    formatDate(date) {
      const isoDate = new Date(date);
      const year = isoDate.getUTCFullYear();
      const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(isoDate.getUTCDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    },
  }
}
</script>
