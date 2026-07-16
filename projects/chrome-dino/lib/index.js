import DinoGame from './game/DinoGame.js'

const game = new DinoGame(600, 150)

// Touch detection: show on-screen buttons on any touch-capable device
// Uses three checks because no single API is reliable across all phones/browsers.
if (
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0
) {
  document.body.classList.add('touch-device')
}

// ── Keyboard (desktop) ──────────────────────────────────────────────────────
const JUMP_KEYS = new Set([38, 32]) // ArrowUp, Space
const DUCK_KEYS = new Set([40])     // ArrowDown

document.addEventListener('keydown', ({ keyCode }) => {
  if (JUMP_KEYS.has(keyCode)) game.onInput('jump')
  else if (DUCK_KEYS.has(keyCode)) game.onInput('duck')
})
document.addEventListener('keyup', ({ keyCode }) => {
  if (DUCK_KEYS.has(keyCode)) game.onInput('stop-duck')
})

// ── Tap-on-canvas fallback (tap = jump, two-finger = duck) ──────────────────
const stage = document.getElementById('game-mount')
if (stage) {
  stage.addEventListener('touchstart', ({ touches }) => {
    if (touches.length === 1) game.onInput('jump')
    else if (touches.length >= 2) game.onInput('duck')
  }, { passive: true })
  stage.addEventListener('touchend', () => game.onInput('stop-duck'), { passive: true })
}

// ── Draggable on-screen buttons ─────────────────────────────────────────────
//
// Distinguishes a tap from a drag by movement threshold.
// • Tap   → triggers the game action (jump or duck)
// • Drag  → repositions the button; game action is cancelled / not fired
//
// Duck is a "hold" action: duck starts on touchstart, stops on touchend.
// If the user drags instead of tapping, the duck is cancelled immediately
// so the dino doesn't stay crouched while the button is being moved.

const DRAG_THRESHOLD = 12 // px: movement needed before drag mode activates

/**
 * @param {HTMLElement}   btn        The button element
 * @param {Function|null} onPress    Called on touchstart (before we know if it's a drag)
 * @param {Function|null} onRelease  Called on touchend OR when drag begins (cancels hold)
 */
function makeMovable(btn, onPress, onRelease) {
  let startX = 0, startY = 0
  let startLeft = 0, startTop = 0
  let dragging = false

  btn.addEventListener('touchstart', (e) => {
    e.stopPropagation() // don't bubble to canvas/document
    const t = e.touches[0]
    startX = t.clientX
    startY = t.clientY
    const rect = btn.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
    dragging = false
    if (onPress) onPress()
  }, { passive: true })

  btn.addEventListener('touchmove', (e) => {
    e.preventDefault() // block page scroll while dragging button
    const t = e.touches[0]
    const dx = t.clientX - startX
    const dy = t.clientY - startY

    if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragging = true
      if (onRelease) onRelease() // cancel any in-progress hold action
    }

    if (dragging) {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const bw = btn.offsetWidth
      const bh = btn.offsetHeight
      const x = Math.max(8, Math.min(vw - bw - 8, startLeft + dx))
      const y = Math.max(8, Math.min(vh - bh - 8, startTop + dy))
      btn.style.left   = x + 'px'
      btn.style.top    = y + 'px'
      btn.style.right  = 'auto'
      btn.style.bottom = 'auto'
    }
  }, { passive: false })

  btn.addEventListener('touchend', (e) => {
    e.stopPropagation()
    // Only fire release action; for a pure tap onPress already handled the action
    if (onRelease) onRelease()
    dragging = false
  }, { passive: true })
}

const jumpBtn = document.getElementById('ctrl-jump')
const duckBtn = document.getElementById('ctrl-duck')

if (jumpBtn) {
  makeMovable(
    jumpBtn,
    () => game.onInput('jump'), // fire on press
    null                        // no hold to cancel
  )
}

if (duckBtn) {
  makeMovable(
    duckBtn,
    () => game.onInput('duck'),       // start duck on press
    () => game.onInput('stop-duck')   // stop duck on release or drag start
  )
}

game.start().catch(console.error)
