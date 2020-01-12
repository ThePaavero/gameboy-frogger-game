import state from './state'
import imagesArray from './images'
import config from './config'
import DebugView from './lib/DebugView'
import _ from 'lodash'

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
    startGame()
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

  const removeCar = (car) => {
    state.cars = state.cars.filter(c => c !== car)
  }

  const updateCars = () => {
    state.cars.forEach(car => {
      car.x += car.direction === 'FROM_LEFT' ? car.speed : car.speed * -1
      switch (car.direction) {
        case 'FROM_LEFT':
          if (car.x > config.width) {
            removeCar(car)
          }
          break
        case 'FROM_RIGHT':
          if (car.x < car.width * -1) {
            removeCar(car)
          }
          break
      }
    })
  }

  const doCollisionDetections = () => {
    state.cars.forEach(car => {
      if (objectsOverlap(state.player, car)) {
        console.log('OUCH!')
      }
    })
  }

  const updateState = () => {
    updatePlayer()
    updateCars()
    updateDebugView()
    if (state.cars.length > 0) {
      doCollisionDetections()
    }
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

  const drawCars = () => {
    state.cars.forEach(car => {
      const imageSlug = `car-${car.type.slug}${car.direction === 'FROM_LEFT' ? '-FROM_LEFT' : ''}`
      playground.layer.drawImage(playground.images[imageSlug], car.x, car.y, car.width, car.height)
    })
  }

  const draw = () => {
    // Clear frame.
    playground.layer.clear('#0f380f')
    drawBackground()
    drawPlayer()
    drawCars()
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

  const getRandomCarType = () => {
    return state.carTypes[_.random(0, state.carTypes.length - 1)]
  }

  const getYforCarByLane = (laneNumber) => {
    const lazyMap = {
      1: 34,
      2: 60,
      3: 86,
      4: 111,
    }
    return lazyMap[laneNumber]
  }

  const spawnCar = () => {
    const lane = _.random(1, 4)
    const direction = lane > 2 ? 'FROM_LEFT' : 'FROM_RIGHT'

    // Make sure we can fit here.
    const previousCarInThisLane = state.cars.filter(c => c.lane === lane)[0]
    // @todo.

    const type = getRandomCarType()
    const car = {
      lane: _.random(1, 4),
      type,
      speed: 1,
      direction,
      x: direction === 'FROM_LEFT' ? type.width * -1 : config.width + type.width,
      y: getYforCarByLane(lane) - type.height / 2,
      width: type.width,
      height: type.height,
    }
    state.cars.push(car)
    setTimeout(spawnCar, _.random(500, 600))
  }

  const objectsOverlap = (a, b) => {
    return !(
      ((a.y + a.height) < (b.y)) ||
      (a.y > (b.y + b.height)) ||
      ((a.x + a.width) < b.x) ||
      (a.x > (b.x + b.width))
    )
  }

  const onStartGame = () => {
    spawnCar()
  }

  const startGame = () => {
    onStartGame()
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
