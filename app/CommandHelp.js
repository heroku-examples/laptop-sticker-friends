import React from 'react'

const CommandHelp = () => {
  return (
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
  )
}

export default CommandHelp