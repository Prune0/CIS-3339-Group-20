<!-- This view allows a user to view/update a specific client's information. -->
<template>
  <main>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Client Details
    </h1>
    <div class="px-10 py-20">
      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Personal Details</h2>
        <!-- First Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">First Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.firstName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.firstName.$error" class="text-red-500">
            First Name is required
          </span>
        </div>

        <!-- Middle name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Middle Name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.middleName" />
          </label>
        </div>

        <!-- Last Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Last Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.lastName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.lastName.$error" class="text-red-500">
            Last Name is required
          </span>
        </div>
        <div></div>
        <!-- Email input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Email</span>
            <input type="email"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.email" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.email.$error" class="text-red-500">
            Valid Email is required
          </span>
        </div>
        <!-- Phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Phone Number</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              pattern="^[0-9]{3}[0-9]{3}[0-9]{4}$" v-model="client.phoneNumber.primary" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.phoneNumber.primary.$error" class="text-red-500">
            <span v-if="v$.client.phoneNumber.primary.required.$invalid">Phone Number is required</span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && v$.client.phoneNumber.primary.numeric.$invalid">
              Phone Number must contain only digits
            </span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && !v$.client.phoneNumber.primary.numeric.$invalid && (v$.client.phoneNumber.primary.minLength.$invalid || v$.client.phoneNumber.primary.maxLength.$invalid)">
              Phone Number must be exactly 10 digits
            </span>
          </span>
        </div>
        <!-- Alternative phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Alternative Phone Number</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.alternate" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Address Details</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 1</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 2</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">City</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.city" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.address.city.$error" class="text-red-500">
            City is required
          </span>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">County</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.county" />
          </label>
        </div>
        <!-- Zip code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Zip Code</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.zip" />
          </label>
        </div>
        <div></div>
      </div>

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="flex justify-between mt-10 mr-20"></div>
        <!--Update Client submit button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitUpdateClient" type="submit" class="bg-green-700 disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor">
            Update Client
          </button>
        </div>
        <!--Delete Client button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitDeleteClient" type="submit" class="bg-red-700 disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor">
            Delete Client
          </button>
        </div>
        <!--Go back button-->
        <div class="flex justify-between mt-10 mr-20">
          <button type="reset" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
            Go back
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <!-- Client Event Information -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mr-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">Events for Client</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Event Name</th>
              <th class="p-4 text-left">Date</th>
              <th class="p-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr @click="router.push({ name: 'eventdetails', params: { id: event._id } })"
            v-for="event in clientEvents" :key="event._id" class="cursor-pointer" 
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id" @mouseleave="hoverId = null">
              <td class="p-2 text-left">{{ event.name }}</td>
              <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
              <td class="p-2 text-right">
                <span class="remove-btn-wrapper">
                  <span class="remove-btn text-gray-400 cursor-pointer"
                    @click.stop="removeClientFromEvent(client._id, event._id)" v-if="hoverId === event._id && user.isEditor">X</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col">
        <!--MultiSelect to add client to events-->
        <VueMultiselect
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
          v-model="eventsSelected" :options="eventsFiltered" :custom-label="nameWithDate" :multiple="true"
          :close-on-select="true" placeholder="Select Events to be added" label="date" track-by="name" />
        <div class="flex justify-between">
          <!--button to add client to events-->
          <button @click="addClientToEvent" type="submit" class="mt-5 bg-red-700 disabled:opacity-50 text-white rounded"
            :disabled="eventsSelected.length === 0 || !user.isEditor">
            Add Client to Selected Events
          </button>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
// Composition API migration.
import { onMounted, reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import VueMultiselect from 'vue-multiselect'
import { useLoggedInUserStore } from "../store/loggedInUser";
import { getClientById, getClientEvents, getNonClientEvents, registerAttendee, deregisterAttendee, updateClient, deleteClientbyId } from '../api/api'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const user = useLoggedInUserStore()
const eventsFiltered = ref([])
const eventsSelected = ref([])
const clientEvents = ref([])
const client = reactive({
  firstName: null,
  middleName: null,
  lastName: null,
  email: null,
  phoneNumber: {
    primary: null,
    alternate: null
  },
  address: {
    line1: null,
    line2: null,
    city: null,
    county: null,
    zip: null
  }
})
const hoverId = ref(null)
const rules = {
  client: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    phoneNumber: {
      primary: {
        required,
        numeric,
        minLength: minLength(10),
        maxLength: maxLength(10)
      }
    },
    address: {
      city: { required }
    }
  }
}
const v$ = useVuelidate(rules, { client })

onMounted(async () => {
  try {
    const [clientResponse, clientEventsResponse, nonClientEventsResponse] = await Promise.all([
      getClientById(route.params.id),
      getClientEvents(route.params.id),
      getNonClientEvents(route.params.id)
    ])

    Object.assign(client, clientResponse)
    clientEvents.value = clientEventsResponse
    eventsFiltered.value = nonClientEventsResponse
  } catch (error) {
    toast.error(error.message)
  }
})

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

function nameWithDate({ name, date }) {
  return `${name} (${formatDate(date)})`
}

// B1: refresh both event lists after registering or deregistering
async function refreshClientEvents() {
  try {
    clientEvents.value = await getClientEvents(route.params.id)
    eventsFiltered.value = await getNonClientEvents(route.params.id)
  } catch (error) {
    toast.error(error.message)
  }
}

// B1: "Not registered" is a normal reply (status 200), not an error,
// so it shows as an info toast instead of a success or error.
async function removeClientFromEvent(clientId, eventId) {
  try {
    const result = await deregisterAttendee(eventId, clientId)
    if (result.changed) {
      toast.success(result.message)
    } else {
      toast.info(result.message)
    }
  } catch (error) {
    // 403 (viewer) or 404 (client/event missing or in another org)
    toast.error(error.message)
  }

  await refreshClientEvents()
}

// B1: register for each selected event and report each result.
// allSettled waits for every request, so one failure doesn't hide the others.
async function addClientToEvent() {
  const clientId = client._id
  const selected = [...eventsSelected.value]

  const results = await Promise.allSettled(
    selected.map((event) => registerAttendee(event._id, clientId))
  )

  results.forEach((result, i) => {
    const eventName = selected[i].name
    if (result.status === 'rejected') {
      toast.error(`${eventName}: ${result.reason.message}`)
    } else if (result.value.changed) {
      toast.success(`${eventName}: ${result.value.message}`)
    } else {
      toast.info(`${eventName}: ${result.value.message}`)
    }
  })

  eventsSelected.value = []
  await refreshClientEvents()
}

async function submitUpdateClient() {
  await v$.value.$validate()

  if (v$.value.$error) {
    return
  }

  try {
    const response = await updateClient(route.params.id, client)
    router.push('/findclient')
    toast.success(response)
  } catch (error) {
    toast.error(error.message)
  }
}

async function submitDeleteClient() {
  try {
    const response = await deleteClientbyId(route.params.id)
    toast.success(response)
    router.push('/findclient')
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<!--Style for multiselect-->
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.remove-btn-wrapper {
  display: inline-block;
  position: relative;
}

.remove-btn:hover {
  color: black;
}
</style>
