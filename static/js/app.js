{
  const state = {
    photos: undefined,
    text: '',
    background: '',
    fontFamily: ''
  }

  main()

  /**
   * generate some random color image
   */
  function getMonoColorImage(count) {
    const canvas  = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const baseColor = _ => Math.floor(Math.random() * 256)
    const randomColor = _ => `rgb(${baseColor()}, ${baseColor()}, ${baseColor()})`
    canvas.width  = 1
    canvas.height = 1
    return new Array(count).fill(1).map(_ => {
      context.fillStyle = randomColor()
      context.rect(0, 0, 1, 1)
      context.fill()
      return canvas.toDataURL()
    })
  }

  /**
   * prevent default for drag events
   */
  function prevent(e) {
    e.stopPropagation()
    e.preventDefault()
  }

  /**
   * read file as data url and return promise
   */
  function getDataURL(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(file)
      reader.addEventListener('load', _ => resolve(reader.result))
    })
  }

  /**
   * update photo count after drop
   */
  function updatePhotoCount(photos) {
    document.querySelector('form p').innerHTML =
      `Loaded ${photos.length} photos`
  }

  /**
   * after file dropped
   */
  function onFilesDrop(files) {
    photos = Array.from(files)
        .filter(file => /^image/.test(file.type))
        .map(file => URL.createObjectURL(file))
    state.photos = photos
    updatePhotoCount(photos)
  }

  /**
   * submit
   */
  function submit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    for (let [k, v] of formData.entries()) {
      state[k] = v
    }
    generate()
  }

  /**
   * generate photos
   */
  function generate() {
    const photos = state.photos || getMonoColorImage(100)
    const text = state.text || 'hi'
    const background = state.background || '#000'
    const fontFamily = state.fontFamily || 'sans-serif'
    const glyphoto = new Glyphoto(photos, text, { background, fontFamily })
    glyphoto.renderTo('#app')
    document.querySelector('form').hidden = true
  }

  /**
   * bind events
   */
  function bindEvents() {
    // bind multiple events
    const bind = (target, types, callback) => {
      types.split(/\s+/).forEach(type => {
        target.addEventListener(type, callback)
      })
    }
    const body = document.body
    const form = document.querySelector('form')
    const activeClass = 'drag-active'
    bind(body, 'dragover dragenter drop', prevent)
    bind(body, 'dragenter', e => body.classList.add(activeClass))
    bind(body, 'dragleave', e => body.classList.remove(activeClass))
    bind(body, 'drop', e => body.classList.remove(activeClass))
    bind(body, 'drop', e => onFilesDrop(e.dataTransfer.files))
    bind(form, 'submit', submit)
  }

  /**
   * entry function
   */
  function main() {
    bindEvents()
  }

}
