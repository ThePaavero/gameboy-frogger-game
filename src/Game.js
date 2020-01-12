import state from './state'
import imagesArray from './images'
import config from './config'
import DebugView from './lib/DebugView'

const Game = (playground) => {

  const centers = {
    x: playground.width / 2,
    y: playground.height / 2,
  }

  let debugTickSkips = 10
  let debugTickCounter = 0

  const onReady = () => {
    window.addEventListener('resize', handleAspectRatio)
    handleAspectRatio()
    resetPlayerPosition()
  }

  const handleAspectRatio = () => {
    const canvas = document.querySelector('canvas')
    if (window.innerHeight < canvas.getBoundingClientRect().height) {
      canvas.style.height = window.innerHeight + 'px'
      canvas.style.width = 'auto'
    } else {
      canvas.style.width = window.innerWidth + 'px'
      if (canvas.getBoundingClientRect().height > window.innerHeight) {
        canvas.style.height = window.innerHeight + 'px'
      } else {
        canvas.style.height = 'auto'
      }
    }
  }

  const preloadAssets = () => {
    imagesArray.forEach(name => {
      playground.loadImage(name)
    })
  }

  const keepWithinArea = (actor) => {
    if (actor.x < 0) {
      actor.x = 0
    } else if (actor.x > playground.width - actor.width) {
      actor.x = playground.width - actor.width
    }

    if (actor.y < 0) {
      actor.y = 0
    } else if (actor.y > playground.height - actor.height) {
      actor.y = playground.height - actor.height
    }
  }

  const updatePlayer = () => {
    state.player.x += state.player.velocities.x
    state.player.y += state.player.velocities.y
    keepWithinArea(state.player)
  }

  const updateState = () => {
    updatePlayer()
    updateDebugView()
  }

  const updateDebugView = () => {
    if (!config.debugState) {
      return
    }
    debugTickCounter++
    if (debugTickCounter === debugTickSkips) {
      DebugView.update(state)
      debugTickCounter = 0
    }
  }

  const resetPlayerPosition = () => {
    state.player.x = centers.x - state.player.width / 2
    state.player.y = config.height - (state.player.height + 2)
  }

  const drawBackground = () => {
    playground.layer.drawImage(playground.images['background'], 0, 0, config.width, config.height)
  }

  const drawPlayer = () => {
    playground.layer.drawImage(playground.images['player-idle'], state.player.x, state.player.y, state.player.width, state.player.height)
  }

  const drawMiniMap = () => {
    playground.layer.drawImage(playground.images['minimap-background'], config.width - 31, config.height - (27 + 2), 29, 27)
  }

  const draw = () => {
    // Clear frame.
    playground.layer.clear('#0f380f')
    drawBackground()
    drawPlayer()
    drawMiniMap()
  }

  const onKeyUp = (data) => {
    switch (data.key) {
      case 'left':
        if (state.player.velocities.x < 0) {
          state.player.velocities.x = 0
        }
        break
      case 'right':
        if (state.player.velocities.x > 0) {
          state.player.velocities.x = 0
        }
        break
      case 'up':
        if (state.player.velocities.y < 0) {
          state.player.velocities.y = 0
        }
        break
      case 'down':
        if (state.player.velocities.y > 0) {
          state.player.velocities.y = 0
        }
        break
    }
  }

  const onKeyDown = (data) => {
    switch (data.key) {
      case 'left':
        state.player.velocities.x = state.player.speed * -1
        break
      case 'right':
        state.player.velocities.x = state.player.speed
        break
      case 'up':
        state.player.velocities.y = state.player.speed * -1
        break
      case 'down':
        state.player.velocities.y = state.player.speed
        break
    }
  }

  const init = () => {
    // Abstract playground methods.
    playground.create = preloadAssets
    playground.ready = onReady
    playground.render = draw
    playground.step = updateState
    playground.keyup = onKeyUp
    playground.keydown = onKeyDown
  }

  return {
    init
  }
}

export default Game
