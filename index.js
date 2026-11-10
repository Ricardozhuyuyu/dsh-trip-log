import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import os from 'node:os'

export const inject = ['webServer']

const run = promisify(execFile)

async function gitSave(file, label) {
  const cwd = path.dirname(file)
  const git = (args) => run('git', args, { cwd, timeout: 20000, maxBuffer: 1 << 20 })
  try {
    const top = (await git(['rev-parse', '--show-toplevel'])).stdout.trim()
    const rel = path.relative(top, file)
    await run('git', ['add', '--', rel], { cwd: top, timeout: 20000 })
    const st = await run('git', ['status', '--porcelain', '--', rel], { cwd: top, timeout: 20000 })
    if (!st.stdout.trim()) return { committed: false, pushed: false, note: '内容没变' }
    await run('git', ['commit', '-q', '-m', `行程记录：更新 ${label} 的介绍段`], { cwd: top, timeout: 20000 })
    const sha = (await run('git', ['rev-parse', '--short', 'HEAD'], { cwd: top, timeout: 20000 })).stdout.trim()
    try {
      let remote = 'origin'
      let branch = ''
      try {
        const up = (await run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { cwd: top, timeout: 8000 })).stdout.trim()
        const cut = up.indexOf('/')
        if (cut > 0) {
          remote = up.slice(0, cut)
          branch = up.slice(cut + 1)
        }
      } catch (err) {
        branch = 'HEAD'
      }
      await run('git', ['push', '-q', remote, branch ? `HEAD:${branch}` : 'HEAD'], { cwd: top, timeout: 30000 })
      return { committed: true, pushed: true, sha }
    } catch (err) {
      const msg = String((err && (err.stderr || err.message)) || err).split('\n').filter(Boolean).pop() || '未知原因'
      return { committed: true, pushed: false, sha, note: msg.slice(0, 120) }
    }
  } catch (err) {
    return { committed: false, pushed: false, note: String((err && err.message) || err).slice(0, 200) }
  }
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

// 这些节不进正文：图走相册页，空清单没意思
const SKIP_SECTIONS = new Set(['图', '记录里没有的'])

// 一行一个点：`- 名字 31.1443 121.8083`（或逗号分隔）
const COORD_LINE = /^(.+?)\s+(-?\d{1,3}(?:\.\d+)?)\s*[,，]?\s+(-?\d{1,3}(?:\.\d+)?)\s*$/

// 词云不要的词：虚词、代词、对话里的高频壳。
// 人名也在里面——自己和对方的名字每句都出现，留在词云里只会盖住别的词。把那两个名字加到下面这行。
const STOP = new Set(
  `的 了 是 在 有 和 就 都 也 不 我 你 他 她 它 这 那 一个 什么 自己 没有 我们 你们 他们 这个 那个 就是
   还是 但是 而且 如果 因为 所以 然后 现在 已经 可以 可能 应该 觉得 知道 看到 看见 出来 进去 过来 起来
   下来 上去 一下 有点 真的 其实 不是 这样 那样 一样 一点 很多 非常 特别 一直 总是 好像 感觉 时候 东西
   地方 事 事情 时候 那边 这边 这里 那里 怎么 为什么 多少 几个 一次 两个 三个 之 后 前 里 上 下 中 又 再
   还 才 只 让 把 被 给 跟 对 从 到 向 用 说 想 要 会 能 得 地 着 过 吗 呢 吧 啊 呀 哦 嗯 哈 啦 嘛 呗
   一声 一下 一起 一点 一直 一块 一半 一般 一边 不过 不少 不错 不用 不能 不会 不要
   说了 来了 去了 完了 好了 对了 是啊 不是 就是 然后 还有 所以 可是 但是 于是 接着 后来 最后
   今天 明天 昨天 早上 上午 中午 下午 晚上 夜里 时候 一会儿 刚刚 现在 当时 之前 之后 之后 这次 那次
   小时 分钟 十几 几十 几 两 三 四 五 六 七 八 九 十 百 千 万 个 只 条 张 份 杯 盘 碗 件 双 次 点 分 秒
   哈哈 呵呵 嘿嘿 嗯嗯 啊啊 对对 好好 行行
   外面 里面 后面 旁边 前面 上面 下面 对面 中间 周围 附近 之后 之前 当时 本来 反正 大概 差不多
   看着 听着 想着 站着 坐着 躺着 走着 拿着 放着 来了 去了 走了 到了 好了 对了 是啊
   东西 样子 感觉 意思 情况 一会儿 一直 已经 还是 就是 现在 左右 上下 前后 里面 外面
   yuyu png jpg jpeg webp md ctx dsh 文件 图片 截图 图库`.split(/\s+/).filter(Boolean)
)

const SEG = new Intl.Segmenter('zh', { granularity: 'word' })

function resolveRoot(config) {
  const raw = typeof config?.root === 'string' ? config.root.trim() : ''
  if (raw) {
    return raw.startsWith('~')
      ? path.join(os.homedir(), raw.slice(1).replace(/^[/\\]/, ''))
      : raw
  }
  return path.join(os.homedir(), 'Documents', 'deepseek-harness', 'default-workspace', 'ctx', '旅行')
}

function safeId(id) {
  return typeof id === 'string' && id.length > 0 && !id.includes('/') && !id.includes('\\') && !id.startsWith('.')
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res, code, body) {
  const text = JSON.stringify(body)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  })
  res.end(text)
}

function sendText(res, code, text) {
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(text)
}

/** 一行里可能塞好几个时刻：拆开，每段挂在自己的时刻上 */
function splitTimes(line) {
  const marks = []
  const re = /(\d{1,2}:\d{2})/g
  let m
  while ((m = re.exec(line))) marks.push({ t: m[1], start: m.index, end: m.index + m[0].length })
  if (!marks.length) return null
  const out = []
  for (let k = 0; k < marks.length; k += 1) {
    const stop = k + 1 < marks.length ? marks[k + 1].start : line.length
    const text = line.slice(marks[k].end, stop).replace(/^[\s，、,。；;]+/, '').replace(/[\s，、,；;]+$/, '').trim()
    if (text) out.push({ t: marks[k].t, text })
  }
  return out.length ? out : null
}

function parseArchive(md) {
  const lines = md.split('\n')
  let title = ''
  const intro = []
  const groups = []
  let current = null
  let inIntro = true
  let sawRule = false
  let day = ''

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!title && /^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, '').trim()
      continue
    }
    if (line.trim() === '---') {
      sawRule = true
      inIntro = false
      continue
    }
    if (/^##\s+/.test(line)) {
      inIntro = false
      day = ''
      const label = line.replace(/^#+\s+/, '').trim()
      if (SKIP_SECTIONS.has(label)) {
        current = { label, kind: 'skip', items: [] }
        continue
      }
      if (label === '基地') {
        current = { label, kind: 'base', items: [] }
        groups.push(current)
        continue
      }
      if (label === '坐标') {
        current = { label, kind: 'coords', items: [] }
        groups.push(current)
        continue
      }
      if (label === '状态') {
        current = { label, kind: 'state', items: [] }
        groups.push(current)
        continue
      }
      current = { label, kind: 'section', items: [] }
      groups.push(current)
      continue
    }
    if (/^###\s+/.test(line)) {
      inIntro = false
      const dayLabel = line.replace(/^#+\s+/, '').trim()
      const dm = dayLabel.match(/(\d{1,2}-\d{2})/)
      if (dm) day = dm[1]
      current = { label: dayLabel, kind: 'day', items: [] }
      groups.push(current)
      continue
    }
    if (!line.trim()) continue

    // 「**10-31 周六**」这种小标题：只更新日期，不当作一条记录
    const dayMark = line.match(/^\*\*(\d{1,2}-\d{2})[^*]*\*\*$/)
    if (dayMark) {
      day = dayMark[1]
      continue
    }

    if (inIntro && !sawRule) {
      intro.push(line.trim())
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (!bullet) {
      if (!current) {
        current = { label: '前言', kind: 'section', items: [] }
        groups.push(current)
      }
      if (current) current.items.push({ t: null, d: day, text: line.trim() })
      continue
    }
    const body = bullet[1]
    const parts = splitTimes(body)
    if (!current) {
      current = { label: '记录', kind: 'section', items: [] }
      groups.push(current)
    }
    if (!current) {
      current = { label: '记录', kind: 'section', items: [] }
      groups.push(current)
    }
    if (parts) {
      for (const p of parts) current.items.push({ ...p, d: day })
    } else {
      current.items.push({ t: null, d: day, text: body.trim() })
    }
  }

  let base = ''
  for (const g of groups) {
    if (g.kind !== 'base') continue
    base = g.items.map((it) => it.text).join(' ').trim()
  }

  const route = []
  for (const g of groups) {
    if (g.kind !== 'coords') continue
    for (const it of g.items) {
      const m = (it.text || '').match(COORD_LINE)
      if (!m) continue
      route.push({ name: m[1].trim(), lat: Number(m[2]), lng: Number(m[3]) })
    }
  }

  let state = ''
  for (const g of groups) {
    if (g.kind !== 'state') continue
    state = g.items.map((it) => it.text).join(' ').trim()
  }
  // 「在计划」「想去」「待定」这类词都算还没走完
  const planned = /计划|想去|打算|待定|规划|准备中/.test(state)

  return {
    title,
    intro: intro.join(' ').trim(),
    groups: groups.filter(
      (g) => g.kind !== 'coords' && g.kind !== 'base' && g.kind !== 'state' && g.items.length > 0
    ),
    route,
    base,
    state,
    planned,
  }
}

function wordCount(text, limit = 60) {
  const counts = new Map()
  for (const seg of SEG.segment(text)) {
    if (!seg.isWordLike) continue
    const w = seg.segment.trim()
    if (w.length < 2) continue
    if (/^[\d.\s]+$/.test(w)) continue
    if (STOP.has(w)) continue
    counts.set(w, (counts.get(w) || 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}

function clock(name) {
  const m = name.match(/-(\d{2})(\d{2})\.(png|jpe?g|webp|gif)$/i)
  return m ? `${m[1]}:${m[2]}` : null
}

async function listImages(dir) {
  const out = []
  const sub = path.join(dir, '图')
  let names = []
  try {
    names = await readdir(sub)
  } catch {
    try {
      names = await readdir(dir)
    } catch {
      return out
    }
  }
  const prefix = path.basename(sub) === '图' ? '图/' : ''
  for (const name of names) {
    if (!IMG_EXT.has(path.extname(name).toLowerCase())) continue
    let size = 0
    try {
      size = (await stat(path.join(dir, prefix + name))).size
    } catch {
      continue
    }
    out.push({ name, at: clock(name), size })
  }
  out.sort((a, b) => (a.at || '').localeCompare(b.at || '') || a.name.localeCompare(b.name))
  return out
}

/** 事件清单：扫 root 下每个目录，读 档案.md 的头几行 */
async function listEvents(root) {
  let entries = []
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return { root, events: [], error: `读不到 ${root}` }
  }
  const events = []
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue
    const dir = path.join(root, e.name)
    let md
    try {
      md = await readFile(path.join(dir, '档案.md'), 'utf8')
    } catch {
      continue
    }
    const parsed = parseArchive(md)
    const named = e.name.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/)
    const city = named ? named[1] : e.name
    const date = named ? named[2] : ''
    let bullets = 0
    for (const g of parsed.groups) bullets += g.items.length
    const images = await listImages(dir)
    let stamp = 0
    try {
      stamp = (await stat(path.join(dir, '档案.md'))).mtimeMs
    } catch {}
    events.push({
      id: e.name,
      city: city || e.name,
      date: date || '',
      title: parsed.title || e.name,
      intro: parsed.intro,
      bullets,
      images: images.length,
      hasMaterial: await stat(path.join(dir, '素材.md')).then(() => true).catch(() => false),
      mtime: stamp,
    })
  }
  events.sort((a, b) => b.date.localeCompare(a.date))
  return { root, events }
}

async function eventDetail(root, id) {
  const dir = path.join(root, id)
  const md = await readFile(path.join(dir, '档案.md'), 'utf8')
  const parsed = parseArchive(md)

  const source = md.replace(/^##\s+图\s*$[\s\S]*?(?=^##\s+|\Z)/m, '')

  return {
    id,
    title: parsed.title || id,
    intro: parsed.intro,
    groups: parsed.groups,
    route: parsed.route,
    base: parsed.base,
    state: parsed.state,
    planned: parsed.planned,
    words: wordCount(source),
    wordsSource: '档案',
    images: await listImages(dir),
  }
}

async function imageBytes(root, id, file) {
  if (!safeId(id) || !file || file.includes('/') || file.includes('\\') || file.includes('..')) return null
  for (const cand of [path.join(root, id, '图', file), path.join(root, id, file)]) {
    try {
      const buf = await readFile(cand)
      return { buf, mime: MIME[path.extname(cand).toLowerCase()] || 'application/octet-stream' }
    } catch {}
  }
  return null
}

export const __test = { parseArchive, wordCount, listEvents, eventDetail, resolveRoot }

export function apply(ctx, config) {
  const handler = async (req, res) => {
    try {
      const hostHeader = String(req.headers.host || '')
      if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(hostHeader)) {
        return sendText(res, 403, 'local only')
      }
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const action = url.searchParams.get('action') || 'list'
      const root = resolveRoot(config)

      if (action === 'list') {
        return sendJson(res, 200, await listEvents(root))
      }
      if (action === 'event') {
        const id = url.searchParams.get('id') || ''
        if (!safeId(id)) return sendJson(res, 400, { error: 'bad id' })
        try {
          return sendJson(res, 200, await eventDetail(root, id))
        } catch (err) {
          return sendJson(res, 404, { error: `没有这一趟：${id}` })
        }
      }
      if (action === 'saveIntro') {
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' })
        const id = url.searchParams.get('id') || ''
        if (!safeId(id)) return sendJson(res, 400, { error: 'bad id' })
        let intro = ''
        try {
          intro = String(JSON.parse(await readBody(req)).intro || '')
        } catch (err) {
          return sendJson(res, 400, { error: 'bad body' })
        }
        if (intro.length > 400) return sendJson(res, 400, { error: '太长，400 字以内' })
        if (/\n\s*---/.test(intro) || /^\s*#/.test(intro)) return sendJson(res, 400, { error: '别写 --- 或 # 开头' })
        const file = path.join(root, id, '档案.md')
        let md
        try {
          md = await readFile(file, 'utf8')
        } catch (err) {
          return sendJson(res, 404, { error: '档案不在' })
        }
        const nl = md.indexOf('\n')
        if (nl < 0) return sendJson(res, 400, { error: '文件格式不对' })
        const titleLine = md.slice(0, nl)
        const body = md.slice(nl + 1)
        const hm = body.search(/^##\s/m)
        const head = hm >= 0 ? body.slice(0, hm) : body
        const tail = hm >= 0 ? body.slice(hm) : ''
        const clean = intro.trim().replace(/\r/g, '')
        const hadRule = /^---\s*$/m.test(head)
        const rule = hadRule ? '\n---\n' : ''
        const next = clean
          ? `${titleLine}\n\n${clean}\n${rule}\n${tail}`.replace(/\n{3,}/g, '\n\n')
          : `${titleLine}\n${rule}\n${tail}`.replace(/\n{3,}/g, '\n\n')
        await writeFile(file, next, 'utf8')
        const git = await gitSave(file, id)
        return sendJson(res, 200, { ok: true, git })
      }
      if (action === 'asset') {
        const f = url.searchParams.get('f') || ''
        if (f !== 'leaflet.js' && f !== 'leaflet.css') return sendJson(res, 400, { error: 'bad asset' })
        const buf = await readFile(new URL(`./vendor/${f}`, import.meta.url))
        const isCss = f.endsWith('.css')
        res.writeHead(200, {
          'content-type': isCss ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8',
          'cache-control': 'private, max-age=86400',
          'content-length': buf.length,
        })
        return res.end(buf)
      }
      if (action === 'img') {
        const id = url.searchParams.get('id') || ''
        const file = url.searchParams.get('f') || ''
        const got = await imageBytes(root, id, file)
        if (!got) return sendText(res, 404, 'no such image')
        res.writeHead(200, {
          'content-type': got.mime,
          'cache-control': 'private, max-age=86400',
          'content-length': got.buf.length,
        })
        return res.end(got.buf)
      }
      return sendJson(res, 404, { error: 'unknown action' })
    } catch (err) {
      return sendJson(res, 500, { error: String(err && err.message ? err.message : err) })
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/trip-log', handler }))
}
