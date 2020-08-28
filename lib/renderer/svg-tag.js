const Utils = require('./utils')

function getColorAttrib (color, attrib) {
  const alpha = color.a / 255
  const str = attrib + '="' + color.hex + '"'

  return alpha < 1
    ? str + ' ' + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"'
    : str
}

function svgCmd (cmd, x, y) {
  let str = cmd + x
  if (typeof y !== 'undefined') str += ' ' + y

  return str
}

const secondaryColor = '#172E44'
const primaryColor = '#1880DE'

function logo(size, margin) {
  const totalsize = size + margin*2

  let scale = size / 40
  if (scale > 1.5) scale = 1.5

  const xoffs = (totalsize/2 - (13.03*scale)/2)
  const yoffs = (totalsize/2 - (12.01*scale)/2)

  return `
    <path d="M5.07133 0.7H5.21631L5.30639 0.813605L10.0529 6.7996L10.2008 6.98606L10.0529 7.17247L5.30634 13.1547L5.21626 13.2682H5.07133H1.54897H0.927979L1.31396 12.7817L5.9126 6.98594L1.31391 1.18639L0.928225 0.7H1.54897H5.07133Z"
      fill="${secondaryColor}"
      stroke="white"
      stroke-width="0.6"
      transform="translate(${xoffs}, ${yoffs}),
      scale(${scale}, ${scale})"
      shape-rendering="geometricPrecision"
    />

    <path
      d="M11.0571 0.743518H10.9121L10.822 0.857123L6.07548 6.84312L5.92763 7.02957L6.07554 7.21598L10.8221 13.1982L10.9122 13.3117H11.0571H14.5794H15.2004L14.8145 12.8252L10.2158 7.02946L14.8145 1.22991L15.2002 0.743518H14.5794H11.0571Z"
      fill="${primaryColor}"
      stroke="white"
      stroke-width="0.6"
      transform="translate(${xoffs}, ${yoffs}),
      scale(${scale}, ${scale})"
      shape-rendering="geometricPrecision"
    />
  `
}

function corners(size, margin) {
  return `
    <rect
      x="${margin+2}" y="${margin+2}"
      width="3" height="3"
      fill="${secondaryColor}"
    />
    <rect
      x="${margin+2}" y="${margin+size-3-2}"
      width="3" height="3"
      fill="${secondaryColor}"
    />

    <rect
      x="${margin+size-3-2}" y="${margin+2}"
      width="3" height="3"
      fill="${primaryColor}"
    />
  `
}

function qrToPath (data, size, margin) {
  let path = ''
  let moveBy = 0
  let newRow = false
  let lineLength = 0

  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size)
    const row = Math.floor(i / size)

    if (!col && !newRow) newRow = true

    if (data[i]) {
      lineLength++

      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow
          ? svgCmd('M', col + margin, 0.5 + row + margin)
          : svgCmd('m', moveBy, 0)

        moveBy = 0
        newRow = false
      }

      if (!(col + 1 < size && data[i + 1])) {
        path += svgCmd('h', lineLength)
        lineLength = 0
      }
    } else {
      moveBy++
    }
  }

  return path
}

exports.render = function render (qrData, options, cb) {
  const opts = Utils.getOptions(options)
  const size = qrData.modules.size
  const data = qrData.modules.data
  const qrcodesize = size + opts.margin * 2

  const bg = !opts.color.light.a
    ? ''
    : '<path ' + getColorAttrib(opts.color.light, 'fill') +
      ' d="M0 0h' + qrcodesize + 'v' + qrcodesize + 'H0z"/>'

  const path =
    '<path ' + getColorAttrib(opts.color.dark, 'stroke') +
    ' d="' + qrToPath(data, size, opts.margin) + '"/>'

  const viewBox = 'viewBox="' + '0 0 ' + qrcodesize + ' ' + qrcodesize + '"'

  const width = !opts.width ? '' : 'width="' + opts.width + '" height="' + opts.width + '" '

  const svgTag =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    width + viewBox +
    ' shape-rendering="crispEdges">' +
    bg + path +
    logo(size, opts.margin) +
    corners(size, opts.margin) +
    '</svg>\n'

  if (typeof cb === 'function') {
    cb(null, svgTag)
  }

  return svgTag
}
