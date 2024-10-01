import { ref } from 'vue'

export const useRainEffect = () => {
  const showRainEffect = ref(true)

  const toggleRainEffect = (value) => {
    showRainEffect.value = value
  }

  return {
    showRainEffect,
    toggleRainEffect
  }
}