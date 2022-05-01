export default class Music {
  constructor() {
    this.listener = new THREE.AudioListener()
    this.asset = require('./assets/music.mp3')
    this.audio = new THREE.PositionalAudio(this.listener)

    new THREE.AudioLoader()
      .load(this.asset, (buffer) => {
        this.audio.setRefDistance(10.0)
        this.audio.setBuffer(buffer)
        this.audio.setVolume(1.0)
      })
  }

  togggle(play) {
    play ? this.audio.play() : this.audio.stop()
  }
}