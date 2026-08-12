<!-- HeartImage.vue -->
<template>
  <div class="heart-wrapper">
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      class="heart-svg"
    >
      <defs>
        <clipPath id="heartClip">
          <path
            d="M50 85
            C50 85 10 58 10 32
            C10 18 20 10 30 10
            C38 10 45 15 50 22
            C55 15 62 10 70 10
            C80 10 90 18 90 32
            C90 58 50 85 50 85Z"
          />
        </clipPath>
      </defs>

      <!-- imaginea clippată în formă de inimă -->
      <image
        :href="src"
        x="10"
        y="10"
        width="80"
        height="80"
        preserveAspectRatio="xMidYMid slice"
        clip-path="url(#heartClip)"
      />

      <!-- contur inimă -->
      <path
        d="M50 85
          C50 85 10 58 10 32
          C10 18 20 10 30 10
          C38 10 45 15 50 22
          C55 15 62 10 70 10
          C80 10 90 18 90 32
          C90 58 50 85 50 85Z"
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<style scoped>
.heart-wrapper {
  display: inline-block;
}

.heart-svg {
  height: 100%;
  max-width: 250px;
  width: 100%;
  filter: drop-shadow(0 0 8px rgba(232, 201, 122, 0.5));
  transition: transform 0.2s ease;
}

.heart-svg:hover {
  transform: scale(1.05);
}
</style>
