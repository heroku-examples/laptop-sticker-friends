import React, { useState, useEffect, useRef} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { random } from 'lodash'
import useInterval from '@use-it/interval'
import {usePrevious} from 'react-use'
import QRCode from 'qrcode.react'
import api from './api'
import useDisappearingState from './useDisappearingState'
import config from './config'
import constants from '../src/constants'
import CommandHelp from './CommandHelp'
import laptopBackSvg from './images/laptop-back.svg'
import laptopFrontSvg from './images/laptop-front.svg'

import useAnimation from './useAnimation';
import stickerGo from './images/stickers/languages/go.svg';
import stickerClojure from './images/stickers/languages/clojure.svg';
import stickerJava from './images/stickers/languages/java.svg';
import stickerPhp from './images/stickers/languages/php.svg';
import stickerNode from './images/stickers/languages/node.svg';
import stickerPython from './images/stickers/languages/python.svg';
import stickerRuby from './images/stickers/languages/ruby.svg';
import stickerScala from './images/stickers/languages/scala.svg';

import stickerGoColor from './images/stickers/languages/color/go.svg';
import stickerClojureColor from './images/stickers/languages/color/clojure.svg';
import stickerJavaColor from './images/stickers/languages/color/java.svg';
import stickerPhpColor from './images/stickers/languages/color/php.svg';
import stickerNodeColor from './images/stickers/languages/color/node.svg';
import stickerPythonColor from './images/stickers/languages/color/python.svg';
import stickerScalaColor from './images/stickers/languages/color/scala.svg';

import logos from './images/logos.svg'
import architectureDiagram from './images/architecture-diagram.svg'
import architectureDiagramZoom from './images/zoomed-diagram.png'

import flagHeroku from './images/stickers/flags/heroku.svg'
import flagOregon from './images/stickers/flags/oregon.svg'
import flagVirginia from './images/stickers/flags/virginia.svg'
import flagUS from './images/stickers/flags/usa.svg'
import flagIreland from './images/stickers/flags/ireland.svg'
import flagJapan from './images/stickers/flags/japan.svg'
import flagAustralia from './images/stickers/flags/australia.svg'
import flagGermany from './images/stickers/flags/germany.svg'

import treeSticker from './images/stickers/tree.svg'
import iLoveCodeSticker from './images/stickers/i-love-code.svg'
import cloudSticker from './images/stickers/cloud.svg'
import herokuLogo from './images/heroku-logo.svg'

// The initial step is 0 which hides everything
const INITIAL_STEP = 0
const STEP_COUNT = 10

// In auto mode the initial step is 1 so something is always on the screen
const INITIAL_AUTO_STEP = 1
const STEP_COUNT_AUTO = 9
const INITIAL_AUTO = false

const STICKER_ANIMATION_TIME_BETWEEN = 7000
const STICKER_ANIMATION_STOP_AFTER = 4000 // This is how long a sticker stays active
const STICKER_ANIMATION_LIST = _.shuffle(['node', 'scala', 'clojure', 'ruby'])

const STEP_BEFORE_CHANGE_DURATION = 50
const STEP_CHANGING_DURATION = 500

const LAPTOP_DESK_FROM_CENTER = 0.145 
// The distance from the center of the laptop image to the part desk starts is 14.5% of the image height.
// This is used to calculate where the bottom grandient should start
const BG_COUNT = 3

const Flag = ({ region }) => {
  const REGIONS = {
    dublin: flagIreland,
    frankfurt: flagGermany,
    oregon: flagOregon,
    sydney: flagAustralia,
    tokyo: flagJapan,
    virginia: flagVirginia
  }

  let flags = [REGIONS[region] || flagHeroku]

  if (region === 'oregon' || region === 'virginia') {
    flags.unshift(flagUS)
  }

  return (
    <>
      {flags.map((flag) => (
        <img className="flag" key={flag} src={flag} />
      ))}
    </>
  )
}

const App = ({ ws }) => {
  const [background, setBackground] = useState(random(1, BG_COUNT))
  const [
    submissions,
    { add: addSubmission, removeAll: removeAllSubmissions }
  ] = useDisappearingState(
    [],
    config.characters.hideAfter,
    config.characters.max
  )
  const [animations, initAnimation] = useAnimation()
  const [attendeeAppName, setAttendeeAppName] = useState(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showZoomedDiagram, setShowZoomedDiagram] = useState(false)
  const [characters, setCharacters] = useState(null)
  const [step, setStep] = useState(INITIAL_STEP)
  const [auto, setAuto] = useState(INITIAL_AUTO)
  const [status, setStatus] = useState()
  const [region] = useState(config.region)
  const [attendeeAppUrl, setAttendeeAppUrl] = useState(null)
  const [containerSize, setContainerSize] = useState(null)
  const [fitWidth, setFitWidth] = useState(false)
  const [stickerAnimation, setStickerAnimation] = useState(null)
  const [nextStickerAnimation, setNextStickerAnimation] = useState(null)
  const [enterLeaveClasses, setEnterLeaveClasses] = useState('')
  const [stepStatus, setStepStatus] = useState(null)

  const prevStep = usePrevious(step)

  // Hot keys to change steps and modes
  useHotkeys(
    config.keys.prev,
    () => !auto && setStep((prev) => Math.max(INITIAL_STEP, prev - 1)),
    [auto]
  )
  useHotkeys(
    config.keys.next,
    () =>
      // Add 1 to step count to allow everything to be hidden at the end
      !auto && setStep((prev) => Math.min(STEP_COUNT + 1, prev + 1)),
    [auto]
  )
  useHotkeys(
    config.keys.reset,
    () => setStep(auto ? INITIAL_AUTO_STEP : INITIAL_STEP),
    [auto]
  )
  useHotkeys(config.keys.autoToggle, () => setAuto((prev) => !prev))
  useHotkeys(config.keys.clear, () => removeAllSubmissions())
  useHotkeys(config.keys.qr, () => setShowQRCode((prev) => !prev))
  // It doesn't toggle the diagram. It just takes user to the step. Should it toggle?
  useHotkeys(config.keys.diagram, () => !auto && setStep(11)) 
  useHotkeys(config.keys.help, () => {
    return !auto && setShowHelp((prev) => !prev)
  })

  useEffect(() => {
    api('/characters')
      .then((r) => r.json())
      .then(setCharacters)
  }, [])

  useEffect(() => {
    api('/attendee-app')
      .then((r) => r.json())
      .then((data) => setAttendeeAppName(data.name))
  }, [])

  useEffect(() => {
    if (!attendeeAppName) return
    if (attendeeAppName.startsWith('http')) {
      setAttendeeAppUrl(attendeeAppName)
    } else {
      setAttendeeAppUrl(`https://${attendeeAppName}.herokuapp.com`)
    }
  }, [attendeeAppName])

  useEffect(() => {

    let time = null

    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data)
      if (type === constants.CHARACTER_CHANGE) {
        setCharacters((prev) => ({ ...prev, [data.name]: data.visible }))
      } else if (type === constants.SUBMISSION) {
        addSubmission([data.user.id, data.character])
      } else if (type === constants.BACKGROUND_CHANGE) {
        setBackground((prev) => (prev === BG_COUNT ? 1 : prev + 1))
      } else if (type === constants.STATUS_UPDATE) {
        setStatus(data.type)
      } else if (type === constants.ATTENDEE_APP) {
        setAttendeeAppName(data.name)
      } else if (type === 'pong') {
        console.log(`pong ${Date.now() - time}ms`)
        time = null
      }
    }

    //Heroku closes the connection if there is no interaction for 30 seconds so this ping will keep it alive
    let pingInterval = setInterval(() => {
      console.log('sending ping')
      time = Date.now()
      ws.send('ping')
    }, config.wsCheck.interval)

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }

  }, [ws])

  useInterval(
    () =>
      // When auto advancing, go from the last step to the first auto step
      setStep((prev) =>
        prev === STEP_COUNT_AUTO ? INITIAL_AUTO_STEP : prev + 1
      ),
    auto ? config.auto.interval : null
  )

  useInterval(
    () => {
      // Making sure the selfie app is available
      fetch(`${attendeeAppUrl}/health`).then(() => {
        setShowQRCode(true)
      }).catch((e) => {
        setShowQRCode(false)
      })
    }, attendeeAppUrl? config.appCheck.interval : null
  )

  // When auto mode is changed, reset to the first step for the new mode
  useEffect(() => setStep(auto ? INITIAL_AUTO_STEP : INITIAL_STEP), [auto])

  const resizeHandler = (ratio) => {
    let _fitWidth = ratio*window.innerHeight > window.innerWidth
    let size = {}
    if (_fitWidth) {
      size.widthPx = window.innerWidth
      size.heightPx = window.innerWidth/ratio
      size.width = '100vw'
      size.height = size.heightPx/window.innerHeight*100 + 'vh'
    } else {
      size.heightPx = window.innerHeight
      size.widthPx = window.innerHeight*ratio
      size.height = '100vh'
      size.width =  size.widthPx/window.innerWidth*100 + 'vw'
    }
    setFitWidth(_fitWidth)
    setContainerSize(size)
  }


  /**
   * Using the laptop image as the base size ratio of the container
   */
  useEffect(() => {
    let handler
    const img = new Image()
    img.onload = () => {
      const ratio = img.width/img.height
      resizeHandler(ratio)
      handler = _.debounce(resizeHandler.bind(null, ratio), 500)
      window.addEventListener('resize', handler)
    }
    img.src = laptopBackSvg
    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [])

  // useEffect(() => {
  //   if (!characters) return
  //   // animate.initAnimation()
  //   const nodes = Object.keys(characters).map((c) => document.getElementById(c))
  //   nodes.forEach(
  //     (node) => (node.style.display = characters[node.id] ? 'block' : 'none')
  //   )
  //   return () => nodes.forEach((node) => (node.style.display = 'block'))
  // }, [characters])

  useEffect(() => {
    const className = `background-${background}`
    document.body.classList.add(className)
    return () => document.body.classList.remove(className)
  }, [background])

  useEffect(() => {
    //resetting the diagram
    setShowZoomedDiagram(false)

    if (step === 0) {
      let next = nextStickerAnimation || STICKER_ANIMATION_LIST[0];
      setNextStickerAnimation(next)
    }

    setStepStatus('before-change');
    //Transitioning to the next step so adding classes
    setEnterLeaveClasses(`${!_.isNil(prevStep)? 'prev-step-' + prevStep : ''} step-before-change  step-${step}`)
    
  }, [step])


  /**
   * When the view goes to the next step, 
   * 1. "before-change", "prev-step-{prevStep}" and "step-{step}" class is added to the main container
   * 2. After 50ms, "step-chainging" is added to the main container and "before-change" gets removed
   * 3. Finally, after 500ms, "step-changed" gets added to the main conainter and "step-changing" gets removed.
   * 
   * These classes are mainy for animations
   */
  useInterval(
    () => {
      if (stepStatus==='before-change') {
        
        setEnterLeaveClasses((prev) => {
          return prev.replace('before-change', 'changing')
        })
        setStepStatus('changing')

      } else if(stepStatus==='changing') {

        setEnterLeaveClasses((prev) => {
          return prev.replace('changing', 'changed')
        })
        setStepStatus('changed')

      }
    },
    stepStatus==='before-change'? 
      STEP_BEFORE_CHANGE_DURATION : (stepStatus==='changing'? STEP_CHANGING_DURATION : null)
  )

  useEffect(()=>{
    if (characters && !animations) {
      initAnimation()
    }
  }, [characters])

  //Setting sticker animations
  useInterval(
    () => {
      const nextIndex = getNextAnimationIndex(nextStickerAnimation)
      const nextAnimation = STICKER_ANIMATION_LIST[nextIndex]
      
      setNextStickerAnimation(nextAnimation)
      setStickerAnimation(nextAnimation)

      if (animations && nextAnimation === 'ruby') {
        animations.ruby.play()
      } else if (animations) {
        animations.ruby.pause()
      }
    },
    step===0? STICKER_ANIMATION_TIME_BETWEEN : null
  )

  //Animation stops after some time
  useInterval(
    () => {
      setStickerAnimation(null)
    },
    stickerAnimation? STICKER_ANIMATION_STOP_AFTER : null
  )

  const getNextAnimationIndex = (animationKey) => {
    const currentIndex = STICKER_ANIMATION_LIST.indexOf(animationKey)
    return currentIndex + 1 >= STICKER_ANIMATION_LIST.length? 0 : currentIndex + 1
  }

  const toggleZoom = () => {
    setShowZoomedDiagram((prev) => !prev)
  }

  /**
   * This method returns the correct classes based on the current step
   */
  const getSequenceClasses = ({showOn = [], hideOn = []}) => {
    let classNames = ['step-item']
    if (showOn[0] === 'all' || showOn.indexOf(step) > -1) {
      if (!(hideOn.indexOf(step) > -1)) {
        classNames.push('active')
      }
    }
    return classNames.join(' ')
  }

  let baseStye = containerSize ? {
    width: containerSize.widthPx + 'px',
    height: containerSize.heightPx + 'px',
    //The main container's font-size is set to 1% of the container width
    fontSize: containerSize.widthPx * 0.01 + 'px'
  } : {}

  let bottomGradientStyle = {
    top: containerSize? (window.innerHeight/2 + containerSize.heightPx * LAPTOP_DESK_FROM_CENTER) /window.innerHeight *100 + 'vh' : 'auto'
  }

  return (<div className={`${(auto ? 10===step : 11===step)? 'step-diagram' : ''} ${enterLeaveClasses} main-container`}>
    <div className='background-gradient-top'></div>
    <div className='background-gradient-bottom' style={bottomGradientStyle}></div>
    <div className={`${auto? 'auto' : ''} laptop-container ${fitWidth? 'fit-width' : 'fit-height'}`} 
      style={baseStye} >      
      <img src={laptopBackSvg} className='laptop laptop-back' />
      <img src={laptopFrontSvg} className='laptop laptop-front' />

      <div id="laptop-base-stickers">
        <img src={herokuLogo} className='heroku-logo' />
        <img src={treeSticker} className='tree-sticker' />
        <img src={cloudSticker} className='cloud-sticker' />
        <img src={iLoveCodeSticker} className='i-love-code-sticker' />
      </div>

      {config.confLogoUrl && (
         <img src={config.confLogoUrl} className="conf-logo" />
      )}
      <div className="steam lottie"></div>
      <div className="music lottie"></div>

      <div id="submissions">
        {submissions.map(([k, v]) => (
          <img key={k} src={v} />
        ))}
      </div>
      {auto && (
        <h1 className={`auto-title ${getSequenceClasses({showOn: ['all'], hideOn:[3]})}`}>
          What is Heroku?
        </h1>
      )}
      <div id="architecture-diagram" 
           className={`${showZoomedDiagram?'zoomed-in':''}`}
           onClick={() => showZoomedDiagram && toggleZoom()}>
          <div className="diagram-zoomedin-background"></div>
          <img src={architectureDiagramZoom} className="zoomed-architecture-diagram" />
          <div className="diagram-background"></div>
          <img className="diagram-image" src={architectureDiagram} />
      </div>
      <div className="diagram-clickable-area" onClick={toggleZoom}></div>

      <div id="regional-flags">
        <Flag region={region} />
      </div>

      {characters && (
        <div id="characters">
          <div className='sticker sticker-python'>
            <img src={stickerPython} className='sticker-resting' />
            <img src={stickerPythonColor} className='sticker-color' />
          </div>

          <div className='sticker sticker-go'>
            <img src={stickerGo} className='sticker-resting' />
            <img src={stickerGoColor} className='sticker-color' />
          </div>

          <div className='sticker sticker-java'>
            <img src={stickerJava} className='sticker-resting' />
            <img src={stickerJavaColor} className='sticker-color' />
          </div>

          <div className='sticker sticker-php'>
            <img src={stickerPhp} className='sticker-resting' />
            <img src={stickerPhpColor} className='sticker-color' />
          </div>

          <div id="talk-sequence">
          
            <div className={`talk-bubble char-1 ${getSequenceClasses({showOn:[1]})}`} >
              What is Heroku?
            </div>
            <div className={`talk-bubble char-2 ${getSequenceClasses({showOn:[2]})}`}>
              Heroku helps programmers using Node.js, Python, Java and many
              other programming languages build anything they want and make it
              available to any internet user in minutes instead of hours or
              days.
            </div>
            <div className={`talk-bubble char-3 ${getSequenceClasses({showOn:[4]})}`}>
              But how would I use it with Sales Cloud or Service Cloud or
              Marketing Cloud?
            </div>
            <div className={`talk-bubble char-4 ${getSequenceClasses({showOn:[5]})}`}>
              Good question! Data integration is the key here. There’s so much
              of your business’s useful data in those clouds that could also be
              used for your customer-facing website or your mobile app.
            </div>
            <div className={`talk-bubble char-4 ${getSequenceClasses({showOn:[6]})}`}>
              Or used across these three together! Heroku makes it easy to use
              that data in apps built with all those programming languages Gopher
              mentioned before.
            </div>
            <div className={`talk-bubble char-2 ${getSequenceClasses({showOn:[7]})}`}>
              In fact, we’re in a web app hosted on Heroku right now!
            </div>
            <div className={`talk-bubble char-4 ${getSequenceClasses({showOn:[auto ? 8 : 9]})}`}>
              Why don’t we deploy an app now to show what it’s like to use
              Heroku as a developer? Maybe you want to create a mobile web app
              for a special promotion that allows your customers to share
              something they love about your company.
            </div>
          </div>
        </div>
      )}

      <div id="animated-stickers">
        <div className={`sticker sticker-node ${stickerAnimation === 'node'? 'active-animate' : ''}`}>
          <img src={stickerNode} className='sticker-resting' />
          <img src={stickerNodeColor} className='sticker-color' />
        </div>

        <div className={`sticker sticker-scala ${stickerAnimation === 'scala'? 'active-animate' : ''}`}>
          <img src={stickerScala} className='sticker-resting' />
          <img src={stickerScalaColor} className='sticker-color' />
        </div>

        <div className={`sticker sticker-clojure ${stickerAnimation === 'clojure'? 'active-animate' : ''}`}>
          <img src={stickerClojure} className='sticker-resting' />
          <img src={stickerClojureColor} className='sticker-color' />
        </div>
        
        <div className={`sticker sticker-ruby ${stickerAnimation === 'ruby'? 'active-animate' : ''}`}>
          <img src={stickerRuby} className='sticker-resting' />
          <div className='lottie sticker-color' ></div>
        </div>
      </div>

      <div className={`brand-list-background ${getSequenceClasses({showOn:[3]})}`}></div>
      <img src={logos} className={`brand-list ${getSequenceClasses({showOn:[3]})}`}/>

      {showQRCode && attendeeAppUrl && !showZoomedDiagram && (
        <>
          <div id="QR-code">
            <QRCode
              renderAs="svg"
              value={attendeeAppUrl}
              width="100%"
              height="100%"
            />
          </div>
          <p id="QR-code-url">{attendeeAppUrl}</p>
        </>
      )}

      {showHelp && (
        <CommandHelp />
      )}

      <a
        href={config.herokuUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden-link heroku"
      />
      <a
        href={config.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden-link github"
      />
    </div>
  </div>)
}

export default App
