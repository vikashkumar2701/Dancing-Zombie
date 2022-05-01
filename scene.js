import Music from './music.js'
import Derrick from './vikash_model.js'

export const newmodel = () => {
  let tap = null
  let dance = null

  let ground = null
  let loaded = false

  let zoomEnd = 0.0
  let zoomStart = 0.0

  let dancing = false
  let canDance = false

  let fullscreen = null
  let placeTimeout = null

  const music = new Music()
  const coords = new THREE.Vector2()
  const raycaster = new THREE.raycaster()

  const derrick = new Derrick(() => {
    if (!tap) tap = document.getElementById('tap')
    derrick.character.add(music.audio)

    tap.classList.add('visible')
    loaded = true
  })

  const xcor = () => {
    const directional = new THREE.DirectionalLight(0xffffff, 1)
    const {scene, camera, renderer} = XR8.Threejs.xrScene()
    const ambient = new THREE.AmbientLight(0xffffff)

    directional.shadow.mapSize.height = 1024
    directional.shadow.mapSize.width = 1024
    directional.position.set(1.0, 5.0, 2.5)

    directional.shadow.camera.near = 0.1
    directional.shadow.camera.far = 500
    directional.castShadow = true

    ground = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 250, 1, 1),
      new THREE.ShadowMaterial({
        opacity: 0.5,
      })
    )

    ground.rotateX(-Math.PI / 2.0)
    ground.position.setScalar(0.0)
    ground.receiveShadow = true

    scene.add(ground)
    scene.add(ambient)
    scene.add(directional)

    camera.add(music.listener)
    camera.position.set(0, 2, 0)

    renderer.shadowMap.enabled = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  const resetDancing = () => {
    music.togggle(false)
    canDance = false

    dancing = false
    derrick.idle()
  }

  const startDancing = () => {
    if (canDance) {
      dance.classList.remove('visible')
      derrick.dance(resetDancing)

      music.togggle(true)
      dancing = true
    }
  }

  const toggleFullscreen = () => {
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.body.requestFullscreen()
  }

  const getZoomDistance = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX
    const dy = touches[0].pageY - touches[1].pageY

    return Math.sqrt(dx ** 2 + dy ** 2)
  }

  const placeCharacter = (touches) => {
    const {scene, camera} = XR8.Threejs.xrScene()

    coords.x = (touches[0].clientX / window.innerWidth) * 2 - 1
    coords.y = -(touches[0].clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(coords, camera)
    const intersects = raycaster.intersectObject(ground)

    if (intersects.length && intersects[0].object === ground) {
      const {x: lx, z: lz} = camera.position.clone()
      const {x: px, z: pz} = intersects[0].point

      let {y} = camera.rotation
      y -= Math.PI / 2.0

      derrick.character.position.set(px, 0.0, pz)
      derrick.character.rotation.set(0.0, y, 0.0)
      derrick.character.lookAt(lx, 0.0, lz)

      tap.classList.remove('visible')
      dance.classList.add('visible')

      scene.add(derrick.character)
      derrick.fade(true)

      setTimeout(() => {
        canDance = true
      }, 1000)
    }
  }

  return {
    name: 'scene',

    onStart: ({canvas}) => {
      let raf

      const update = () => {
        loaded && derrick.update()
        raf = requestAnimationFrame(update)
      }

      const onResize = () => {
        const {camera} = XR8.Threejs.xrScene()
        camera.aspect = window.innerWidth / window.innerHeight

        XR8.XrController.updateCameraProjectionMatrix({
          facing: camera.quaternion,
          origin: camera.position,
        })
      }

      const onTouchStart = (event) => {
        if (!loaded) return
        const {touches} = event

        if (touches.length > 2) return

        if (touches.length === 2) {
          const distance = getZoomDistance(touches)

          zoomStart = distance
          zoomEnd = distance
        }

        else if (!dancing) {
          placeTimeout = setTimeout(() => placeCharacter(touches), 100)
        }
      }

      const onTouchMove = (event) => {
        event.preventDefault()
        const {touches} = event

        if (!loaded || dancing) return

        if (touches.length === 2) {
          clearTimeout(placeTimeout)
          zoomEnd = getZoomDistance(touches)

          const factor = zoomEnd - zoomStart
          derrick.scale(factor / 100.0)
          zoomStart = zoomEnd
        }
      }

      const onTouchEnd = (event) => {
        event.preventDefault()
        zoomStart = 0.0
        zoomEnd = 0.0
      }

      const onBeforeUnload = () => {
        const {scene, renderer} = XR8.Threejs.xrScene()

        window.removeEventListener('beforeunload', onBeforeUnload, false)
        fullscreen.removeEventListener('click', toggleFullscreen, true)

        canvas.removeEventListener('touchstart', onTouchStart, true)
        canvas.removeEventListener('touchmove', onTouchMove, true)
        canvas.removeEventListener('touchend', onTouchEnd, true)

        dance.removeEventListener('click', startDancing, true)
        window.removeEventListener('resize', onResize, false)

        cancelAnimationFrame(raf)
        renderer.dispose()
        scene.clear()
      }

      tap = document.getElementById('tap')
      dance = document.getElementById('dance')
      fullscreen = document.getElementById('fullscreen')

      window.addEventListener('beforeunload', onBeforeUnload, false)
      fullscreen.addEventListener('click', toggleFullscreen, true)

      canvas.addEventListener('touchstart', onTouchStart, true)
      canvas.addEventListener('touchmove', onTouchMove, true)
      canvas.addEventListener('touchend', onTouchEnd, true)

      dance.addEventListener('click', startDancing, true)
      window.addEventListener('resize', onResize, false)

      onResize()
      initXrScene()

      raf = requestAnimationFrame(update)
    },
  }
}