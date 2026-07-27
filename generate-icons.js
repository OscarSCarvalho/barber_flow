const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = crc32(typeAndData)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc)
  return Buffer.concat([len, typeAndData, crcBuf])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB

  const scanline = Buffer.alloc(1 + size * 3)
  scanline[0] = 0
  for (let x = 0; x < size; x++) {
    scanline[1 + x * 3] = r
    scanline[1 + x * 3 + 1] = g
    scanline[1 + x * 3 + 2] = b
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => scanline))
  const idat = zlib.deflateSync(raw)

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = path.join(__dirname, 'apps', 'web', 'public')
// #1a1a1a = 26, 26, 26
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 26, 26, 26))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 26, 26, 26))
console.log('Ícones criados com sucesso!')
