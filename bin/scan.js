const fs = require('fs')
const path = require('path')

const audioExts = new Set(['.mp3', '.wav', '.flac', '.aiff', '.aif', '.m4a', '.ogg', '.wma'])
const ROOT = path.resolve(__dirname, '..')

function byNumber(files) {
  return files.sort((a, b) => {
    const na = parseInt(a.file.match(/\d+/)?.[0] || '0', 10)
    const nb = parseInt(b.file.match(/\d+/)?.[0] || '0', 10)
    return na - nb
  })
}

function scanDir(dir) {
  const p = path.join(ROOT, dir)
  if (!fs.existsSync(p)) return []
  return byNumber(
    fs.readdirSync(p)
      .filter(f => audioExts.has(path.extname(f).toLowerCase()))
      .map(f => {
        const full = path.join(p, f)
        const stat = fs.statSync(full)
        return {
          file: f,
          name: path.parse(f).name,
          ext:  path.extname(f).slice(1),
          size: stat.size,
          path: encodeURI(dir + '/' + f)
        }
      })
  )
}

const tracks = scanDir('tracks')
const sets   = scanDir('sets')

const stats = {
  tracks: tracks.length,
  sets:   sets.length,
  updated: new Date().toISOString()
}

function json(v) { return JSON.stringify(v) }

const dataJs = `window.__TRACKS=${json(tracks)};window.__SETS=${json(sets)};window.__STATS=${json(stats)}`

fs.writeFileSync(path.join(ROOT, 'stats.json'), JSON.stringify(stats, null, 2))
fs.writeFileSync(path.join(ROOT, 'tracks.json'), JSON.stringify(tracks, null, 2))
fs.writeFileSync(path.join(ROOT, 'sets.json'),   JSON.stringify(sets, null, 2))
fs.writeFileSync(path.join(ROOT, 'data.js'),     dataJs)

console.log(`✓ stats.json  — ${stats.tracks} tracks, ${stats.sets} sets`)
console.log(`✓ tracks.json — ${tracks.length} files`)
console.log(`✓ sets.json   — ${sets.length} files`)
console.log(`✓ data.js     — inline data written`)
