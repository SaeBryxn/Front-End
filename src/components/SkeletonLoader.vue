<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        <div class="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'table'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex space-x-4">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'text'" class="space-y-2">
      <div v-for="i in lines" :key="i" class="h-4 bg-gray-200 rounded" :class="i === lines ? 'w-3/4' : 'w-full'"></div>
    </div>
    
    <div v-else class="h-4 bg-gray-200 rounded" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'table', 'text'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  },
  lines: {
    type: Number,
    default: 3
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  }
})
</script>