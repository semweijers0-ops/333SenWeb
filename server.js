const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3333
const ROOT = __dirname
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.mp3':'audio/mpeg','.wav':'audio/wav','.flac':'audio/flac','.m4a':'audio/mp4',
  '.aiff':'audio/aiff','.aif':'audio/aiff','.ogg':'audio/ogg','.wma':'audio/x-ms-wma',
  '.psd':'application/octet-stream'
}

const audioExts = new Set(['.mp3','.wav','.flac','.aiff','.aif','.m4a','.ogg','.wma'])

function scanDir(dir) {
  const p = path.join(ROOT, dir)
  if (!fs.existsSync(p)) return []
  return fs.readdirSync(p)
    .filter(f => audioExts.has(path.extname(f).toLowerCase()))
    .map(f => {
      const full = path.join(p, f)
      const stat = fs.statSync(full)
      return {
        file: f,
        name: path.parse(f).name,
        ext:  path.extname(f).slice(1),
        size: stat.size,
        path: dir + '/' + f
      }
    })
    .sort((a, b) => b.size - a.size)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  // API endpoints — live directory scan every request
  if (url.pathname === '/api/tracks') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(scanDir('tracks')))
    return
  }
  if (url.pathname === '/api/sets') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(scanDir('sets')))
    return
  }
  if (url.pathname === '/api/stats') {
    const tracks = scanDir('tracks')
    const sets = scanDir('sets')
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ tracks: tracks.length, sets: sets.length, updated: new Date().toISOString() }))
    return
  }

  // Static files
  let filePath = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname)
  const ext = path.extname(filePath).toLowerCase()

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('<h1>404</h1>')
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log(`  333 SENSATION — http://localhost:${PORT}`)
  console.log(`  API:  /api/tracks  /api/sets  /api/stats`)
})
