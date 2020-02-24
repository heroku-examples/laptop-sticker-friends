import { TimelineLite, gsap, Power2, Power4, Linear} from "gsap/all";

const ANIMATION_FPS = 24

const animationConfigSet = {
  getEyeCofnig: (delay, initialDelay = 0) => {
    return {
      originalState: {scaleX: 1, scaleY: 1, y: 0},
      initialDelay,
      timeline: [
        {duration: .1, scaleX: 1.2, scaleY: 0.1, y: 0, delay},
        {duration: .1, scaleX: 1, scaleY: 1, y: 0},
      ]
    }
  },
  fire: {
    originalState: {autoAlpha: 0},
    timeline: [
      {duration: 0.7, autoAlpha: 1, delay: 2},
      {duration: 0.7, autoAlpha: 0}
    ]
  }
}

const animationConfig = {
  '#shooting-star-left': {
    originalState: {autoAlpha: 0},
    timeline: [
      {duration: 0.3, autoAlpha: 1, delay: 7, ease: Power2.easeInOut},
      {duration: 1.5, x: "-600%", y:"470%", autoAlpha: 0}
    ]
  },
  '#shooting-star-right': {
    originalState: {autoAlpha: 0},
    initialDelay: 3,
    timeline: [
      {duration: 0.3, autoAlpha: 1, delay: 8, ease: Power4.easeInOut},
      {duration: 1.5, x: "330%", y:"490%", autoAlpha: 0}
    ]
  },
  '#right-eye-3': animationConfigSet.getEyeCofnig(6),
  '#left-eye-3': animationConfigSet.getEyeCofnig(6),
  '#right-eye':animationConfigSet.getEyeCofnig(5, 1),
  '#left-eye': animationConfigSet.getEyeCofnig(5, 1),
  '#left-eye-2': animationConfigSet.getEyeCofnig(6.5, 3),
  '#right-eye-2': animationConfigSet.getEyeCofnig(6.5, 3),
  '#eye-2': animationConfigSet.getEyeCofnig(4.5, 1),
  '#astro-head': {
    timeline: [
      {duration: 1, rotation: 3, delay: 5},
      {duration: 1, rotation: 0, delay: 0.5}
    ]
  },
  '#astro-stick': {
    originalState: {transformOrigin: 'right bottom'},
    timeline: [
      {duration: 0.5, rotation: -18, x: '0.4%', y: '-5%', delay: 4.5},
      {duration: 0.5, rotation: -25, x: '-0.3%', y: '-5%', delay: 0.1},
      {duration: 0.5, rotation: -18, x: '0.4%', y: '-5%', delay: 2},
      {duration: 1, rotation: 0, x: 0, y: 0}
    ]
  },
  '#cloudy-stick': {
    originalState: {transformOrigin: '80% 80%'},
    timeline: [
      {duration: 1, rotation: 7, delay: 2},
      {duration: 1, rotation: 7},
      {duration: 2, rotation: 0}
    ]
  },
  '#max-head': {
    timeline: [
      {duration: 1, rotation: -3, x:'-0.5%', y: '1.5%', delay: 5.5},
      {duration: 1, rotation: 0, x: 0, y: 0, delay: 1}
    ]
  },
  '#appy-head': {
    originalState: {transformOrigin: '-10% -10%'},
    timeline: [
      {duration: 1, rotation: 4, x:'0.5%', y: '-0.5%', delay: 3, ease: Power4.easeInOut},
      {duration: 1, rotation: 0, x: 0, y: 0, delay: 1}
    ]
  },
  '#appy-stick': {
    originalState: {transformOrigin: '-10% -40%'},
    timeline: [
      {duration: 1, rotation: 5, x: '0.3%', y: '-0.5%', delay: 2},
      {duration: 2, rotation: 0, x: 0, y: 0, delay: 2}
    ]
  },
  '#codey-stick': {
    originalState: {transformOrigin: '-80% -40%'},
    timeline: [
      {duration: 3, rotation: -5, x: '0.3%', y: '-0.5%', delay: 2},
      {duration: 3, rotation: 0, x: 0, y: 0, delay: 2}
    ]
  },
  '#codey-arm': {
    originalState: {transformOrigin: '-40% 0%'},
    timeline: [
      {duration: 3, rotation: -6, x: '0.3%', y: '-0.5%', delay: 2},
      {duration: 3, rotation: 0, x: 0, y: 0, delay: 2}
    ]
  },
  '#blaze-head': {
    originalState: {transformOrigin: 'center center'},
    timeline: [
      {duration: 2, rotation: 9, x:'0.8%', y: '0.2%', delay: 3},
      {duration: 4, rotation: 0, x: 0, y: 0, delay: 2}
    ]
  },
  '#fire-glow': {
    originalState: {autoAlpha: 1},
    timeline: [
      {duration: 1, autoAlpha: 0.75, delay: 1},
      {duration: 1, autoAlpha: 1}
    ]
  },
  '#fire-embers1': {
    originalState: {autoAlpha: 0.1, y: '2%', x: '-65%'},
    timeline: [
      {duration: 2, autoAlpha: 0.6, y: '-2%', ease: Linear.easeNone},
      {duration: 2, autoAlpha: 0.1, y: '-4%', ease: Linear.easeNone}
    ]
  },
  '#fire-embers2': {
    initialDelay: 2,
    originalState: {autoAlpha: 0.1, y: '2%',  x: '-63%'},
    timeline: [
      {duration: 2, autoAlpha: 0.6, y: '-2%', ease: Linear.easeNone},
      {duration: 2, autoAlpha: 0.1, y: '-4%', ease: Linear.easeNone}
    ]
  }
}

const initAnimation = () => {
  
  gsap.ticker.fps(ANIMATION_FPS)

  Object.entries(animationConfig).forEach( entry => {
    const key = entry[0]
    const config = entry[1]
    const elList = document.querySelectorAll(key)
    if (config && elList.length > 0) {
      _.forEach(elList, (el) => {
        setTimeout(() => {
          initSingleAnimation(el, config)
        }, config.initialDelay? config.initialDelay * 1000 : 0)
      })
    }
  })

}

const initSingleAnimation = (el, config) => {

  if (!config.timeline) {
    return
  }

  const tl = new TimelineLite({repeat: -1, paused: true})
  const originalState =  _.assign({force3D:true}, config.originalState || {})

  tl.set(el, originalState)
  config.timeline.forEach(cfg => {
    tl.to(el, _.assign({},cfg))
  })

  tl.play()
}


export default {
  initAnimation
}