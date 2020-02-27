import lottie  from 'lottie-web'
import * as rubyAnimationData from './lottie/ruby.json'

const initAnimation = () => {

  lottie.loadAnimation({
    container: document.getElementById('ruby'), // the dom element that will contain the animation
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: rubyAnimationData.default // the path to the animation json
  });
}

export default {
  initAnimation
}