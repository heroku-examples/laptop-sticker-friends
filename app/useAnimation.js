import { useState, useRef, useEffect } from 'react'
import lottie  from 'lottie-web'
import * as rubyAnimationData from './lottie/ruby.json'
import * as steamAnimationData from './lottie/steam.json'
import * as musicAnimationData from './lottie/music.json'


export default  () => {

  const [animations, setAnimations] = useState(null)
  const [elementsReady, setElementsReady] = useState(false)

  const initRuby = () => {
    return lottie.loadAnimation({
      container: document.querySelectorAll('.sticker-ruby.lottie')[0], 
      renderer: 'svg',
      loop: true,
      autoplay: false,
      animationData: rubyAnimationData.default 
    })
  }

  const initSteam = () => {
    const steam = lottie.loadAnimation({
      container: document.querySelectorAll('.steam.lottie')[0], 
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: steamAnimationData.default 
    })
    steam.addEventListener('complete', () => {
      setTimeout(() => {
        steam.goToAndPlay(0);
      }, Math.floor(Math.random() * 3000) + 2000)
    })
    return steam
  }

  const initMusic = () => {
    const music = lottie.loadAnimation({
      container: document.querySelectorAll('.music.lottie')[0],
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: musicAnimationData.default 
    })

    const play = () => {
      setTimeout(() => {
        music.goToAndPlay(0);
      }, Math.floor(Math.random() * 3000) + 2000)
    }

    music.addEventListener('complete', play)
    play()

    return music
  }

  useEffect(() => {
    if (!animations && elementsReady) {
      setAnimations({
        ruby: initRuby(),
        steam: initSteam(),
        music: initMusic()
      })
    }
  }, [elementsReady])

  const initAnimation = () => {
    setElementsReady(true)
  }

  return [
    animations,
    initAnimation
  ]
}