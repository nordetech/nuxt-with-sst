<script setup lang="ts">
const { data } = await useFetch("/api/hello")
</script>

<template>
	<div>
		Home
		{{ data }}
		<NuxtLink :to="'/blog'">Blog</NuxtLink>
	</div>
</template>
