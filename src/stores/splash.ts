import { reactive } from 'vue';

const hasShown = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('splash-shown');

export const splashState = reactive({
  isSplashVisible: !hasShown,
  isAnimationDone: hasShown,
});
