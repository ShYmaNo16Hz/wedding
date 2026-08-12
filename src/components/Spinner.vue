<template>
  <span class="loader"></span>
</template>
<style scoped>
.loader {
  --color-1: rgba(232, 201, 122, 0.5);
  --color-2: #23233d;
  --size: 1px;

  width: calc(48 * var(--size));
  height: calc(48 * var(--size));
  border: calc(5 * var(--size)) solid var(--color-1);
  border-bottom-color: var(--color-2);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
