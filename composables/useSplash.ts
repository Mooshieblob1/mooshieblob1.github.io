import { ref } from 'vue'

export const useSplash = () => {
  const isSplashVisible = useState('isSplashVisible', () => true)
  const isAnimationDone = useState('isAnimationDone', () => false)

  return {
    isSplashVisible,
    isAnimationDone
  }
}
