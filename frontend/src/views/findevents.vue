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
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Event Name</th>
              <th class="p-4 text-left">Event Date</th>
              <th class="p-4 text-left">Event Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr @click="$router.push({name: 'eventdetails', params: { id: event._id } })"
              v-for="event in events" :key="event._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id"
              @mouseleave="hoverId = null">
              <td class="p-2 text-left">{{ event.name }}</td>
              <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
              <td class="p-2 text-left">{{ event.address.line1 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script>
import { getEvents, searchEvents } from '../api/api'
import { computed } from 'vue'
import { useApi } from '../composables/useApi'

export default {
  setup() {
    const request = useApi(() => getEvents())
    return {
      ...request,
      events: computed(() => request.data.value ?? [])
    }
  },
  data() {
    return {
      // Parameters for search to occur
      searchBy: null,
      name: null,
      eventDate: null,
      // variable stores the ID of the row that the mouse is currently hovering over (to highlight the row red)
      hoverId: null,
    }
  },
  mounted() {
    // when component is mounted, load the data
    this.loadData();
  },
  methods: {
    // method called when component is mounted
    async loadData() {
      // Resets variables used for search
      this.searchBy = null
      this.name = null
      this.eventDate = null

      await this.execute()
    },

    // method called when user searches for an event
    async handleSubmitForm() {
      // if user searches by event name
      if (this.searchBy === 'Event Name') {
        if (this.name) {
          const query = {
            searchBy: 'name',
            name: this.name
          };
          await this.execute(() => searchEvents(query))
        }
        // if user searches by event date
      } else if (this.searchBy === 'Event Date') {
        if (this.eventDate) {
          const eventDate = new Date(this.eventDate);
          const formattedDate = eventDate.toISOString().substring(0, 10);
          const query = {
            searchBy: 'date',
            eventDate: formattedDate
          };
          await this.execute(() => searchEvents(query))
        }
      }
    },

    // method called for each event date so it will be formatted correctly on the table
    formatDate(date) {
      const isoDate = new Date(date);
      const year = isoDate.getUTCFullYear();
      const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(isoDate.getUTCDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    },
  },
}
</script>
