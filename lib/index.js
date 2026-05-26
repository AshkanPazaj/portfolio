import DinoGame, { GAME_WIDTH, GAME_HEIGHT } from './game/DinoGame.js'

function getDisplaySize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scale = vw / GAME_WIDTH
  return {
    width: vw,
    height: Math.min(Math.round(GAME_HEIGHT * scale), vh),
  }
}

const display = getDisplaySize()
const game = new DinoGame(display.width, display.height)

let resizeTimer = null
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const size = getDisplaySize()
    game.resize(size.width, size.height)
  }, 100)
})

function bindInput() {
  const jumpKeys = { 38: 1, 32: 1, 87: 1 } // up, space, w
  const duckKeys = { 40: 1, 83: 1 } // down, s

  document.addEventListener('keydown', (e) => {
    if (jumpKeys[e.keyCode] || duckKeys[e.keyCode]) {
      e.preventDefault()
    }
    if (jumpKeys[e.keyCode]) {
      game.onInput('jump')
    } else if (duckKeys[e.keyCode]) {
      game.onInput('duck')
    }
  })

  document.addEventListener('keyup', (e) => {
    if (duckKeys[e.keyCode]) {
      e.preventDefault()
      game.onInput('stop-duck')
    }
  })

  const mount = document.getElementById('game-mount')
  const isTouch = 'ontouchstart' in window

  if (mount && isTouch) {
    mount.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault()
        if (e.touches.length === 1) {
          game.onInput('jump')
        } else if (e.touches.length === 2) {
          game.onInput('duck')
        }
      },
      { passive: false }
    )

    mount.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault()
        game.onInput('stop-duck')
      },
      { passive: false }
    )
  } else if (mount) {
    mount.addEventListener('click', () => {
      game.onInput('jump')
    })
  }
}

bindInput()
game.start().catch(console.error)
