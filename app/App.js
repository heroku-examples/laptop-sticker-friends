import React, { useState, useEffect} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { random } from 'lodash'
import useInterval from '@use-it/interval'
import QRCode from 'qrcode.react'
import api from './api'
import animate from './animate'
import useDisappearingState from './useDisappearingState'
import config from './config'
import constants from '../src/constants'

import charactersSvg from '!svg-inline-loader!./images/characters.svg'
import logos from './images/logos.svg'
import architectureDiagram from './images/architecture-diagram.svg'
import architectureDiagramZoom from './images/architecture-diagram-zoom.jpg'

import flagpole from './images/flagpole.svg'
import flagHeroku from './images/flag-heroku.svg'
import flagOregon from './images/flag-oregon.svg'
import flagVirginia from './images/flag-virginia.svg'
import flagUS from './images/flag-us.svg'
import flagIreland from './images/flag-ireland.svg'
import flagJapan from './images/flag-japan.svg'
import flagAustralia from './images/flag-australia.svg'
import flagGermany from './images/flag-germany.svg'
// The initial step is 0 which hides everything
const INITIAL_STEP = 0
const STEP_COUNT = 10

// In auto mode the initial step is 1 so something is always on the screen
const INITIAL_AUTO_STEP = 1
const STEP_COUNT_AUTO = 9
const INITIAL_AUTO = false

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
      <img src={flagpole} id="flagpole" />
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
    
    animate.initAnimation()
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


  useEffect(() => {
    if (!characters) return
    // animate.initAnimation()
    const nodes = Object.keys(characters).map((c) => document.getElementById(c))
    nodes.forEach(
      (node) => (node.style.display = characters[node.id] ? 'block' : 'none')
    )
    return () => nodes.forEach((node) => (node.style.display = 'block'))
  }, [characters])

  useEffect(() => {
    const className = `background-${background}`
    document.body.classList.add(className)
    return () => document.body.classList.remove(className)
  }, [background])

  useEffect(() => {
    const stepNodes = [...document.querySelectorAll('[data-step]')]

    stepNodes.forEach((node) => {
      const hideOrShow = node.getAttribute('data-step-action') || 'show'
      const takeAction = node
        .getAttribute('data-step')
        .split(',')
        .map((v) => Number(v))
        .includes(step)

      if (takeAction) {
        node.style.display = hideOrShow === 'show' ? 'block' : 'none'
      } else {
        node.style.display = hideOrShow === 'show' ? 'none' : 'block'
      }
    })

    //Reseting the diagram
    setShowZoomedDiagram(false)

    return () =>
      [...document.querySelectorAll('[data-step]')].forEach((node) => {
        const hideOrShow = node.getAttribute('data-step-action') || 'show'
        node.style.display = hideOrShow === 'show' ? 'none' : 'block'
      })
  }, [step])

  const toggleZoom = () => {
    setShowZoomedDiagram((prev) => !prev)
  }

  return (
    <>
      <div id="submissions">
        {submissions.map(([k, v]) => (
          <img key={k} src={v} />
        ))}
      </div>
      {auto && (
        <h1 className="auto-title" data-step="3" data-step-action="hide">
          What is Heroku?
        </h1>
      )}
      <div data-step={auto ? 10 : 11} id="architecture-diagram" onClick={() => showZoomedDiagram && toggleZoom()}>
        {showZoomedDiagram? (
          <div>
            <img src={architectureDiagramZoom} className="zoomed-architecture-diagram" />
          </div>
        ):(
          <div>
            <div className="architecture-diagram-wrapper">
              <div className="diagram-clickable-area" onClick={toggleZoom}></div>
              <img src={architectureDiagram} />
            </div>
          </div>
        )}
      </div>
      <div id="regional-flags">
        <Flag region={region} />
      </div>
      <div id="ruby" style={{width:'200px'}}></div>
      {characters && (
        <div id="characters">
          <span
            id="characters-svg"
            dangerouslySetInnerHTML={{ __html: charactersSvg }}
          />
          <div id="talk-sequence">
            <div className="talk-bubble char-1" data-step="1">
              What is Heroku?
            </div>
            <div className="talk-bubble char-2" data-step="2">
              Heroku helps programmers using Node.js, Python, Java and many
              other programming languages build anything they want and make it
              available to any internet user in minutes instead of hours or
              days.
            </div>
            <div className="talk-bubble char-3" data-step="4">
              But how would I use it with Sales Cloud or Service Cloud or
              Marketing Cloud?
            </div>
            <div className="talk-bubble char-4" data-step="5">
              Good question! Data integration is the key here. There’s so much
              of your business’s useful data in those clouds that could also be
              used for your customer-facing website or your mobile app.
            </div>
            <div className="talk-bubble char-4" data-step="6">
              Or used across these three together! Heroku makes it easy to use
              that data in apps built with all those programming languages Appy
              mentioned before.
            </div>
            <div className="talk-bubble char-2" data-step="7">
              In fact, we’re in a web app hosted on Heroku right now!
            </div>
            <div className="talk-bubble char-4" data-step={auto ? 8 : 9}>
              Why don’t we deploy an app now to show what it’s like to use
              Heroku as a developer? Maybe you want to create a mobile web app
              for a special promotion that allows your customers to share
              something they love about your company.
            </div>
          </div>
        </div>
      )}

      <img src={logos} id="logos" data-step="3" />

      {showQRCode && attendeeAppUrl && step!==3 && (
        <div id="attendee-cta" >
          <div className="container">
            <div id="QR-code">
              <p>(zoom in to QR code with your camera app)</p>
              <div id="QR-code-container">
                <QRCode
                  renderAs="svg"
                  value={attendeeAppUrl}
                  width="100%"
                  height="100%"
                />
              </div>
              <p>{attendeeAppUrl}</p>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div id="command-help">
          <div>
            <h2>Keyboard Shortcuts</h2>
            <table className="command-list">
              <tbody>
                <tr>
                  <td>⌥ = option</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>a</span></td>
                  <td>Start auto-advancing of speech bubbles (while you’re not actively giving the demo)</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>a</span></td>
                  <td>Stop auto-advancing of speech bubbles (so you can start a demo)</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>→</span></td>
                  <td>Advance speech bubbles sequence (last step is architecture diagram)</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>←</span></td>
                  <td>Go back in speech bubbles sequence</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>d</span></td>
                  <td>Jump to the architecture diagram</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>r</span></td>
                  <td>Reset speech bubbles / architecture diagram back to beginning state</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>q</span></td>
                  <td>Hide QR code and URL being shown in sky for selfie app</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>c</span></td>
                  <td>Clear the selfie characters (in case someone shares something rude)</td>
                </tr>
                <tr>
                  <td><span>⌥</span> + <span>h</span></td>
                  <td>Toggle this view</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
    </>
  )
}

export default App
