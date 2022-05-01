const createMaterial = material => new THREE.MeshStandardMaterial({
  // MaterialParameters:
  alphaTest: material.alphaTest,
  alphaToCoverage: material.alphaToCoverage,
  blendDst: material.blendDst,
  blendEquation: material.blendEquation,
  blending: material.blending,
  blendSrc: material.blendSrc,
  clipIntersection: material.clipIntersection,
  clippingPlanes: material.clippingPlanes,
  clipShadows: material.clipShadows,
  colorWrite: material.colorWrite,
  defines: material.defines,
  depthFunc: material.depthFunc,
  depthTest: material.depthTest,
  depthWrite: material.depthWrite,
  fog: material.fog,
  name: material.name,
  opacity: 0.0,
  polygonOffset: material.polygonOffset,
  polygonOffsetFactor: material.polygonOffsetFactor,
  polygonOffsetUnits: material.polygonOffsetUnits,
  precision: material.precision,
  premultipliedAlpha: material.premultipliedAlpha,
  dithering: material.dithering,
  side: material.side,
  toneMapped: material.toneMapped,
  transparent: true,
  vertexColors: material.vertexColors,
  visible: material.visible,
  stencilWrite: material.stencilWrite,
  stencilFunc: material.stencilFunc,
  stencilRef: material.stencilRef,
  stencilWriteMask: material.stencilWriteMask,
  stencilFuncMask: material.stencilFuncMask,
  stencilFail: material.stencilFail,
  stencilZFail: material.stencilZFail,
  stencilZPass: material.stencilZPass,
  userData: material.userData,

  // MeshStandardMaterialParameters:
  color: material.color,
  roughness: material.roughness,
  metalness: material.metalness,
  map: material.map,
  lightMap: material.lightMap,
  lightMapIntensity: material.lightMapIntensity,
  aoMap: material.aoMap,
  aoMapIntensity: material.aoMapIntensity,
  emissive: material.emissive,
  emissiveIntensity: material.emissiveIntensity,
  emissiveMap: material.emissiveMap,
  bumpMap: material.bumpMap,
  bumpScale: material.bumpScale,
  normalMap: material.normalMap,
  normalMapType: material.normalMapType,
  normalScale: material.normalScale,
  displacementMap: material.displacementMap,
  displacementScale: material.displacementScale,
  displacementBias: material.displacementBias,
  roughnessMap: material.roughnessMap,
  metalnessMap: material.metalnessMap,
  alphaMap: material.alphaMap,
  envMap: material.envMap,
  envMapIntensity: material.envMapIntensity,
  refractionRatio: material.refractionRatio,
  wireframe: material.wireframe,
  wireframeLinewidth: material.wireframeLinewidth,
  flatShading: material.flatShading,
})

export default class Derrick {
  constructor(callback) {
    this.asset = require('./assets/derrick.glb')
    this.loader = new THREE.GLTFLoader()
    this.clock = new THREE.Clock()

    this.animationsDuration = {}
    this.currentAnimation = null
    this.initialScale = 1.5

    this.character = null
    this.animations = {}
    this.load(callback)

    this.mixer = null
    this.model = null
  }

  load(callback) {
    this.loader.load(this.asset, (character) => {
      this.model = character.scene.children[0].children[0]
      character.scene.scale.setScalar(this.initialScale)
      this.character = character.scene

      this.character.children[0].traverse((child) => {
        if (!child.isMesh) return

        child.material = createMaterial(child.material)
        child.castShadow = false
      })

      this.createAnimations(character)
      this.setAnimations()

      callback && callback()
    })
  }

  createAnimations(character) {
    const {animations} = character
    this.mixer = new THREE.AnimationMixer(character.scene)

    for (let a = animations.length; a--;) {
      const clip = animations[a].name
      this.animationsDuration[clip] = animations[a].duration
      this.animations[clip] = this.mixer.clipAction(animations[a])
    }
  }

  setAnimations() {
    this.animations.Part1.clampWhenFinished = true
    this.animations.Part1.setLoop(THREE.LoopOnce, 1)

    this.animations.Part2.clampWhenFinished = true
    this.animations.Part2.setLoop(THREE.LoopOnce, 1)

    this.animations.Part3.clampWhenFinished = true
    this.animations.Part3.setLoop(THREE.LoopOnce, 1)

    this.animations.Part4.clampWhenFinished = true
    this.animations.Part4.setLoop(THREE.LoopOnce, 1)

    this.idle()
  }

  fade(show) {
    this.character.children[0].traverse((child) => {
      child.isMesh && window.anime({
        targets: child.material,

        complete: () => {
          child.castShadow = show
        },

        easing: 'linear',
        duration: 500.0,
        opacity: +show,
        delay: 1000.0,
      })
    })
  }

  scale(factor) {
    let scale = this.character.scale.x + factor
    scale = Math.max(0.5, Math.min(scale, 3))
    this.character.scale.setScalar(scale)
  }

  idle() {
    this.currentAnimation && this.currentAnimation.stop()
    this.currentAnimation = this.animations.Idle
    this.currentAnimation.play()
  }

  dance(callback) {
    const currentPosition = new THREE.Vector3()

    this.currentAnimation.crossFadeTo(this.animations.Part1, 0.1, true)
    this.animations.Part1.play()

    setTimeout(() => {
      this.currentAnimation.stop()
      this.currentAnimation = this.animations.Part1
    }, 100)

    let duration = this.animationsDuration.Part1
    let delay = Math.floor(duration * 1000.0)

    setTimeout(() => {
      this.animations.Part2.play()

      this.model.getWorldPosition(currentPosition)
      this.character.position.copy(currentPosition)
      this.character.position.y = 0.0

      this.currentAnimation.stop()
      this.currentAnimation = this.animations.Part2
    }, delay)

    duration += this.animationsDuration.Part2
    delay = Math.floor(duration * 1000.0)

    setTimeout(() => {
      this.animations.Part3.play()

      this.model.getWorldPosition(currentPosition)
      this.character.position.copy(currentPosition)
      this.character.position.y = 0.0

      this.currentAnimation.stop()
      this.currentAnimation = this.animations.Part3
    }, delay)

    duration += this.animationsDuration.Part3
    delay = Math.floor(duration * 1000.0)

    setTimeout(() => {
      this.animations.Part4.play()

      this.model.getWorldPosition(currentPosition)
      this.character.position.copy(currentPosition)
      this.character.position.y = 0.0

      this.currentAnimation.stop()
      this.currentAnimation = this.animations.Part4
    }, delay)

    duration += this.animationsDuration.Part4
    delay = Math.floor(duration * 1000.0)

    setTimeout(this.fade.bind(this, false), delay)
    callback && setTimeout(callback, delay + 2000.0)
  }

  update() {
    const delta = this.clock.getDelta()
    this.mixer.update(delta)
  }
}