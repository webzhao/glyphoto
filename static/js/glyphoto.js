/**
 * draw text with photos
 */
class Glyphoto {

  /**
   * init
   * @param photos {Array} an list of photo urls
   * @param text {String} text to draw
   */
  constructor(photos, text, {
    fontFamily = 'sans-serif',
    background = '#000'
  } = {}) {
    Object.assign(this, { photos, text, fontFamily, background })
  }

  /**
   * get text matrix
   */
  _getTextMatrix(fontSize) {
    const canvas  = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width  = fontSize * this.text.length
    canvas.height = fontSize
    context.font  = `${fontSize}px ${this.fontFamily}`
    const width   = Math.ceil(context.measureText(this.text).width)
    const height  = fontSize
    const baselinePos = 0.8
    context.fillText(this.text, 0, fontSize * baselinePos)
    const imageData = context.getImageData(0, 0, width, height).data
    const threshold = 128
    const pixels = imageData.filter((_, i) => i % 4 === 3).map(alpha => alpha > threshold)
    return { width, height, pixels }
  }

  /**
   * render in an container
   */
  renderTo(container) {
    this.container = document.querySelector(container)
    const width = this.container.scrollWidth
    const height = this.container.scrollHeight || window.innerHeight
    const layout = this.getLayout(width, height)
    const fragment = this._generateNodes(this.photos.length)
    const nodes = fragment.childNodes
    layout.forEach((dot, i) => {
      if (!nodes[i]) return
      nodes[i].style.cssText = `
        position: absolute;
        width: ${dot.size}px;
        height: ${dot.size}px;
        left: ${dot.x}px;
        top: ${dot.y}px;
        background: url(${this.photos[i]}) no-repeat 0 0/cover;
      `
    })
    this.container.style.background = this.background
    this.container.appendChild(fragment)
  }

  /**
   * generate nodes
   */
  _generateNodes(count) {
    const fragment = new DocumentFragment()
    for (let i = 0; i < count; i++) {
      fragment.appendChild(document.createElement('div'))
    }
    return fragment
  }

  /**
   * get size and position of each photo
   */
  getLayout(canvasWidth, canvasHeight) {
    const probeFontSize = 50
    const probeMatrix = this._getTextMatrix(probeFontSize)
    const probeDotCount = probeMatrix.pixels.filter(hasColor => hasColor).length
    const fontSize = Math.round(Math.sqrt(this.photos.length / probeDotCount) * probeFontSize)
    const { width, height, pixels } = this._getTextMatrix(fontSize)
    const dotSize = Math.floor(Math.min(canvasWidth / width, canvasHeight / height))
    // pixels to dot position
    return pixels.reduce((dots, hasColor, index) => {
      if (!hasColor) return dots
      const row = Math.floor(index / width)
      const col = index % width
      dots.push({
        x: col * dotSize,
        y: row * dotSize,
        size: dotSize
      })
      return dots
    }, [])
  }

}
