// https://css-tricks.com/introduction-web-audio-api/

class Sound {

  constructor(context, buffer) {
    this.context = context;
    this.buffer = buffer;
    this.source = null;
    this.createSound();
  }

  createSound() {
    this.gainNode = this.context.createGain();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    // this.gainNode.connect(this.context.destination);
  }

  connectToNode(node) {
    this.source.connect(node);
  }

  play() {
    if (!this.source) this.createSound();
    this.source.start(this.context.currentTime);
  }  

  stop() {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    this.source.stop(this.context.currentTime + 0.5);
  }

}

export default Sound;
