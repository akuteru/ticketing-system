<template>
  <v-img max-width="48" width="48" max-height="48" height="48" aspect-ratio="1" :src="src" />
</template>

<script>
export default {
  props: { src: { type: String, default: '' } }
}
</script>