window.__ModuleLoader__.load({
  id: 'dsh-trip-log',
  factory(require) {
    const React = require('react')
    const { useState, useEffect, useCallback, useRef } = React
    const h = React.createElement

    const CSS = `
.be-root { display: flex; height: 100%; min-height: 440px; font-size: 13px; color: inherit; overflow: hidden; }
.be-side { width: 220px; flex: 0 0 220px; overflow-y: auto; padding: 14px 10px; border-right: 1px solid color-mix(in srgb, currentColor 10%, transparent); }
.be-side h2 { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .5; margin: 4px 6px 10px; font-weight: 600; }
.be-card { display: block; width: 100%; text-align: left; padding: 9px 10px; margin-bottom: 4px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.be-card:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
.be-card[data-on="1"] { background: color-mix(in srgb, currentColor 10%, transparent); border-color: color-mix(in srgb, currentColor 18%, transparent); }
.be-card b { font-weight: 600; font-size: 13px; }
.be-card span { display: block; opacity: .55; font-size: 11px; margin-top: 2px; line-height: 1.4; }
.be-main { flex: 1; min-width: 0; overflow-y: auto; padding: 18px 22px 40px; }
.be-head { margin-bottom: 14px; }
.be-head h1 { font-size: 19px; font-weight: 600; margin: 0 0 6px; }
.be-head p { margin: 0; opacity: .6; line-height: 1.6; max-width: 62ch; }
.be-intro { cursor: text; border-radius: 6px; padding: 2px 6px; margin-left: -6px; transition: background .15s ease, opacity .15s ease; }
.be-intro:hover { background: color-mix(in srgb, currentColor 7%, transparent); opacity: .85 !important; }
.be-edit textarea { width: 100%; max-width: 62ch; box-sizing: border-box; font: inherit; line-height: 1.6; padding: 8px 10px; border-radius: 8px; border: 1px solid color-mix(in srgb, currentColor 22%, transparent); background: color-mix(in srgb, currentColor 5%, transparent); color: inherit; resize: vertical; }
.be-edit textarea:focus { outline: 2px solid color-mix(in srgb, currentColor 20%, transparent); outline-offset: 1px; }
.be-editbar { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.be-editbar button { font: inherit; font-size: 12px; padding: 4px 12px; border-radius: 6px; border: 1px solid color-mix(in srgb, currentColor 20%, transparent); background: color-mix(in srgb, currentColor 8%, transparent); color: inherit; cursor: pointer; }
.be-editbar button:hover { background: color-mix(in srgb, currentColor 15%, transparent); }
.be-editbar button:disabled { opacity: .5; cursor: default; }
.be-hint { font-size: 11px; opacity: .45; }
.be-saved { font-size: 11px; opacity: .5; margin-top: 6px; }
.be-sum { max-width: 700px; }
.be-big { display: flex; gap: 26px; flex-wrap: wrap; margin: 4px 0 24px; }
.be-big b { display: block; font-size: 26px; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; }
.be-big span { font-size: 11px; opacity: .45; }
.be-quote { border-left: 2px solid color-mix(in srgb, currentColor 22%, transparent); padding-left: 14px; margin: 8px 0 22px; }
.be-quote em { font-style: normal; font-size: 11px; opacity: .4; letter-spacing: .1em; display: block; margin-bottom: 4px; }
.be-quote p { margin: 0 0 16px; line-height: 1.75; }
.be-quote p:last-child { margin-bottom: 0; }
.be-sum h4 { font-size: 11px; letter-spacing: .1em; opacity: .42; margin: 0 0 10px; font-weight: 600; }
.be-keeps { margin: 0 0 22px; padding-left: 18px; line-height: 1.8; }
.be-keeps li { margin-bottom: 3px; }
.be-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.be-chip { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, currentColor 8%, transparent); }
.be-tabs { display: flex; gap: 4px; margin: 16px 0 18px; border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent); }
.be-tab { padding: 7px 13px; border: 0; background: transparent; color: inherit; opacity: .55; cursor: pointer; font: inherit; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.be-tab:hover { opacity: .85; }
.be-tab[data-on="1"] { opacity: 1; border-bottom-color: currentColor; font-weight: 600; }
.be-group { margin-bottom: 20px; }
.be-group > h3 { font-size: 12px; font-weight: 600; opacity: .55; margin: 0 0 8px; letter-spacing: .04em; }
.be-row { display: grid; grid-template-columns: 52px 1fr; gap: 10px; padding: 4px 0; line-height: 1.65; }
.be-row em { font-style: normal; opacity: .45; font-variant-numeric: tabular-nums; font-size: 12px; padding-top: 2px; }
.be-row p { margin: 0; }
.be-cloud { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; max-width: 760px; line-height: 1.15; }
.be-cloud span { font-weight: 500; }
.be-cloud span:hover { opacity: 1 !important; }
.be-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.be-shot { position: relative; border-radius: 8px; overflow: hidden; cursor: zoom-in; background: color-mix(in srgb, currentColor 8%, transparent); aspect-ratio: 3/4; }
.be-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.be-shot i { position: absolute; left: 6px; bottom: 6px; font-style: normal; font-size: 11px; padding: 1px 6px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff; }
.be-empty { opacity: .45; padding: 30px 4px; }
.be-map { width: 100%; max-width: 880px; margin-top: 4px; }
.be-map svg { width: 100%; height: auto; display: block; }
.be-mapnote { font-size: 11px; opacity: .4; margin-top: 6px; }
.be-zoom { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.82); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
.be-zoom img { max-width: 92vw; max-height: 92vh; border-radius: 8px; }
.be-stat { display: flex; gap: 22px; margin: 10px 0 4px; flex-wrap: wrap; opacity: .7; font-size: 12px; }
.be-stat b { font-size: 16px; font-weight: 600; opacity: 1; display: block; }
.be-card { transition: background .15s ease, border-color .15s ease; }
.be-tl { position: relative; padding-left: 16px; }
.be-tl::before { content: ''; position: absolute; left: 3px; top: 8px; bottom: 8px; width: 1px; background: currentColor; opacity: .09; }
.be-tl .be-row { position: relative; }
.be-tl .be-row::before { content: ''; position: absolute; left: -16px; top: 10px; width: 5px; height: 5px; border-radius: 999px; background: currentColor; opacity: .2; }
.be-tl .be-row:hover::before { opacity: .6; }
.be-shot { box-shadow: 0 1px 3px rgba(0,0,0,.16); transition: transform .18s ease, box-shadow .18s ease; }
.be-shot:hover { transform: translateY(-2px) scale(1.015); box-shadow: 0 10px 26px rgba(0,0,0,.3); }
.be-llbox { position: relative; height: 460px; border-radius: 14px; overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 12%, transparent); }
.be-llmap { position: absolute; inset: 0; background: #0f1218; }
.be-llmap.leaflet-container { background: #0f1218; }
.be-llmsg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; opacity: .7; background: color-mix(in srgb, currentColor 4%, transparent); pointer-events: none; }
.be-tip { background: rgba(12,14,20,.78) !important; color: #fff !important; border: 0 !important; border-radius: 6px !important; box-shadow: 0 2px 8px rgba(0,0,0,.35) !important; font-size: 11px !important; padding: 2px 7px !important; }
.be-tip::before { display: none !important; }
.be-mapbox { border-radius: 14px; padding: 8px; background: color-mix(in srgb, currentColor 3%, transparent); border: 1px solid color-mix(in srgb, currentColor 9%, transparent); }
@keyframes be-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -24; } }
.be-flow { stroke-dasharray: 3 9; animation: be-flow 1.5s linear infinite; }
@media (prefers-reduced-motion: reduce) { .be-flow { animation: none; } }
`

    function PanelIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: 20,
          height: 20,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        h('path', { d: 'M2.8 6.4 8.3 3.9l7.4 3.1 5.5-2.5v13.1l-5.5 2.5-7.4-3.1-5.5 2.5z' }),
        h('path', { d: 'M8.3 3.9v13.1M15.7 7v13.1' }),
        h('circle', { cx: 11.4, cy: 9.6, r: 1.5, fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M11.4 12.6v2.6' })
      )
    }

    function SidebarEntry({ size }) {
      const px = typeof size === 'number' && size > 0 ? size : 20
      return h(
        'svg',
        {
          width: px,
          height: px,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M2.8 6.4 8.3 3.9l7.4 3.1 5.5-2.5v13.1l-5.5 2.5-7.4-3.1-5.5 2.5z' }),
        h('path', { d: 'M8.3 3.9v13.1M15.7 7v13.1' }),
        h('circle', { cx: 11.4, cy: 9.6, r: 1.5, fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M11.4 12.6v2.6' })
      )
    }

    let leafletPromise = null
    function loadLeaflet() {
      if (window.L) return Promise.resolve(window.L)
      if (leafletPromise) return leafletPromise
      leafletPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/trip-log?action=asset&f=leaflet.css'
        document.head.appendChild(link)
        const s = document.createElement('script')
        s.src = '/trip-log?action=asset&f=leaflet.js'
        s.async = true
        s.onload = () => (window.L ? resolve(window.L) : reject(new Error('no L')))
        s.onerror = () => reject(new Error('script load failed'))
        document.head.appendChild(s)
      })
      return leafletPromise
    }

    function MapView({ points, onFail }) {
      const box = useRef(null)
      const [state, setState] = useState('load')
      useEffect(() => {
        let map = null
        let dead = false
        loadLeaflet()
          .then((L) => {
            if (dead || !box.current) return
            map = L.map(box.current, { scrollWheelZoom: true, worldCopyJump: true, preferCanvas: true })
            // Esri 暗色底图：免 key、全球覆盖、海陆轮廓清楚；连不上就换 OSM
            const esri = L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
              { maxNativeZoom: 16, maxZoom: 19, attribution: 'Tiles &copy; Esri' }
            )
            let errs = 0
            let swapped = false
            esri.on('tileerror', () => {
              errs += 1
              if (errs < 3 || swapped) return
              swapped = true
              map.removeLayer(esri)
              L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors',
              }).addTo(map)
            })
            esri.addTo(map)
            const ll = points.map((p) => [p.lat, p.lng])
            L.polyline(ll, { color: '#6f9dff', weight: 2.5, opacity: 0.9, dashArray: '6 8' }).addTo(map)
            const seen = new Set()
            points.forEach((p, i) => {
              const big = i === 0 || i === points.length - 1
              const fresh = !seen.has(p.name)
              if (fresh) seen.add(p.name)
              const m = L.circleMarker([p.lat, p.lng], {
                radius: big ? 7 : 5,
                color: '#6f9dff',
                weight: 2,
                fillColor: '#6f9dff',
                fillOpacity: big ? 1 : 0.72,
              }).addTo(map)
              // 相邻的两个点会挤在一起，标签上下交替错开，不然会叠成一团糊字
              if (fresh) {
                const above = i % 2 === 0
                m.bindTooltip(p.name, {
                  permanent: true,
                  direction: above ? 'top' : 'bottom',
                  offset: above ? [0, -8] : [0, 8],
                  className: 'be-tip',
                })
              }
            })
            map.fitBounds(L.latLngBounds(ll).pad(0.24), { animate: false })
            setState('ok')
          })
          .catch(() => {
            if (dead) return
            setState('fail')
            if (onFail) onFail()
          })
        return () => {
          dead = true
          if (map) map.remove()
        }
      }, [points])
      return h(
        'div',
        { className: 'be-llbox' },
        h('div', { ref: box, className: 'be-llmap' }),
        state === 'load' ? h('div', { className: 'be-llmsg' }, '地图加载中…') : null
      )
    }

    // 「记着」那一节里，一段话常被写成「引导句：」+ 若干条列表项。
    // 直接摊开会把一件事拆成五六条，所以这里把引导句后面的从属项收拢成「（N 项）」。
    const LIST_PREFIX = /^(?:\d+[.、)]|[-·•*])\s*/
    const condense = (items) => {
      const out = []
      let lead = null
      const flush = () => {
        if (lead) out.push(lead)
        lead = null
      }
      for (const raw of items || []) {
        let text = String((raw && raw.text) || '').trim()
        if (!text) continue
        text = text.replace(LIST_PREFIX, '').trim()
        if (!text) continue
        const opensList = /[：:]\s*$/.test(text)
        if (lead) {
          // 下一条自己也是个引导句 → 上一条到此为止，别把它当成从属项吞掉
          if (!opensList) {
            const standalone = /[。！？]$/.test(text) && text.length > 60
            if (!standalone) {
              lead.n += 1
              continue
            }
          }
          flush()
        }
        if (opensList) {
          const head = text.replace(/[：:]\s*$/, '')
          if (head.length < 8) {
            // 「五条具体的：」这种纯过渡句：自己丢掉，但要让上一条引导句就此收尾
            flush()
            continue
          }
          lead = { text: head, n: 0 }
          continue
        }
        out.push({ text })
      }
      flush()
      return out
        .filter((x) => x.text && x.text.trim())
        // 「xx（4 项）」这类引导句信息量低，排到最后，别占掉前面几件真事的位置
        .sort((a, b) => (a.n > 0 ? 1 : 0) - (b.n > 0 ? 1 : 0))
        .map((x) => ({ text: x.n > 0 ? `${x.text}（${x.n} 项）` : x.text }))
    }

    function Timeline({ groups }) {
      if (!groups.length) return h('div', { className: 'be-empty' }, '这趟没有分段记录。')
      return h(
        'div',
        null,
        groups.map((g, i) =>
          h(
            'section',
            { className: 'be-group', key: i },
            h('h3', null, g.label),
            h('div', { className: 'be-tl' }, g.items.map((it, j) =>
              h(
                'div',
                { className: 'be-row', key: j },
                h('em', null, it.t || '·'),
                h('p', null, it.text)
              )
            ))
          )
        )
      )
    }

    function Cloud({ words, source }) {
      if (!words || !words.length) return h('div', { className: 'be-empty' }, '词不够，凑不出词云。')
      const max = words[0].count || 1
      const min = words[words.length - 1].count || 1
      const sizeOf = (n) => {
        const t = max === min ? 1 : (n - min) / (max - min)
        return 12 + Math.round(t * 34)
      }
      const hue = (n) => {
        const t = max === min ? 1 : (n - min) / (max - min)
        return 0.32 + t * 0.62
      }
      return h(
        'div',
        null,
        h('div', { className: 'be-cloud' }, words.map((w, i) =>
          h(
            'span',
            {
              key: i,
              title: `${w.word} × ${w.count}`,
              style: { fontSize: `${sizeOf(w.count)}px`, opacity: hue(w.count) },
            },
            w.word
          )
        )),
        h('div', { className: 'be-stat', style: { marginTop: 26 } }, h('div', null, h('b', null, words.length), '个词'), h('div', null, '数据源：', source || '档案'))
      )
    }

    function Gallery({ images, id, onZoom }) {
      if (!images.length) {
        return h('div', { className: 'be-empty' }, '这趟没留下图。不是弄丢了，是那时候还没有图库。')
      }
      return h(
        'div',
        { className: 'be-grid' },
        images.map((im, i) =>
          h(
            'figure',
            { className: 'be-shot', key: i, onClick: () => onZoom(`/trip-log?action=img&id=${encodeURIComponent(id)}&f=${encodeURIComponent(im.name)}`) },
            h('img', {
              src: `/trip-log?action=img&id=${encodeURIComponent(id)}&f=${encodeURIComponent(im.name)}`,
              alt: im.name,
              loading: 'lazy',
            }),
            im.at ? h('i', null, im.at) : null
          )
        )
      )
    }

    function Route({ points, base }) {
      const [flat, setFlat] = useState(false)
      if (!points || points.length < 2) {
        return h('div', { className: 'be-empty' }, '这趟没记坐标，画不出路线。')
      }
      const W = 820
      const H = 470
      const PAD = 62
      const lats = points.map((p) => p.lat)
      const lngs = points.map((p) => p.lng)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)
      const latMid = (minLat + maxLat) / 2
      const cosLat = Math.cos((latMid * Math.PI) / 180)
      const spanLng = Math.max((maxLng - minLng) * cosLat, 1e-6)
      const spanLat = Math.max(maxLat - minLat, 1e-6)
      const usableW = W - 2 * PAD
      const usableH = H - 2 * PAD
      const kxBase = usableW / spanLng
      const kyBase = usableH / spanLat
      const kx = Math.min(kxBase, kyBase)
      // 一团东西挤在一条线上时，纵向最多补到 3 倍，免得画成一根横线
      const ky = Math.min(kyBase, kx * 3)
      const stretch = kx > 0 ? ky / kx : 1
      const drawW = spanLng * kx
      const drawH = spanLat * ky
      const offX = PAD + (usableW - drawW) / 2
      const offY = PAD + (usableH - drawH) / 2
      const px = (p) => offX + (p.lng - minLng) * cosLat * kx
      const py = (p) => offY + (maxLat - p.lat) * ky
      const pts = points.map((p) => ({ x: px(p), y: py(p), name: p.name }))
      const smooth = (a) => {
        if (a.length < 2) return ''
        let d = `M${a[0].x.toFixed(1)} ${a[0].y.toFixed(1)}`
        for (let i = 0; i < a.length - 1; i += 1) {
          const p0 = a[Math.max(0, i - 1)]
          const p1 = a[i]
          const p2 = a[i + 1]
          const p3 = a[Math.min(a.length - 1, i + 2)]
          const c1x = p1.x + (p2.x - p0.x) / 6
          const c1y = p1.y + (p2.y - p0.y) / 6
          const c2x = p2.x - (p3.x - p1.x) / 6
          const c2y = p2.y - (p3.y - p1.y) / 6
          d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
        }
        return d
      }
      const path = smooth(pts)
      let km = 0
      for (let i = 1; i < points.length; i += 1) {
        const a = points[i - 1]
        const b = points[i]
        const R = 6371
        const dLat = ((b.lat - a.lat) * Math.PI) / 180
        const dLng = ((b.lng - a.lng) * Math.PI) / 180
        const t =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
        km += 2 * R * Math.asin(Math.min(1, Math.sqrt(t)))
      }
      const grid = []
      for (let gx = 18; gx < W; gx += 46) {
        grid.push(h('line', { key: `gx${gx}`, x1: gx, y1: 0, x2: gx, y2: H, stroke: 'currentColor', strokeWidth: 0.5, opacity: 0.045 }))
      }
      for (let gy = 18; gy < H; gy += 46) {
        grid.push(h('line', { key: `gy${gy}`, x1: 0, y1: gy, x2: W, y2: gy, stroke: 'currentColor', strokeWidth: 0.5, opacity: 0.045 }))
      }
      const seen = new Set()
      const dots = pts.map((p, i) => {
        const first = i === 0
        const last = i === pts.length - 1
        const big = first || last
        const fresh = !seen.has(p.name)
        if (fresh) seen.add(p.name)
        const anchor = p.x > W - 150 ? 'end' : 'start'
        const dx = p.x > W - 150 ? -16 : 16
        const tw = p.name.length * 13 + 16
        return h(
          'g',
          { key: i },
          big ? h('circle', { cx: p.x, cy: p.y, r: 18, fill: 'currentColor', opacity: 0.07 }) : null,
          h('circle', { cx: p.x, cy: p.y, r: big ? 10 : 7, fill: 'currentColor', opacity: 0.1 }),
          h('circle', { cx: p.x, cy: p.y, r: big ? 5.4 : 4, fill: 'currentColor', opacity: big ? 1 : 0.7 }),
          fresh
            ? h('rect', {
                x: anchor === 'end' ? p.x + dx - tw + 6 : p.x + dx - 6,
                y: p.y - 11,
                width: tw,
                height: 22,
                rx: 7,
                fill: 'currentColor',
                opacity: 0.07,
              })
            : null,
          fresh
            ? h(
                'text',
                { x: p.x + dx, y: p.y + 4.5, textAnchor: anchor, fontSize: 12.5, fill: 'currentColor', opacity: 0.8 },
                p.name
              )
            : null
        )
      })
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'be-stat', style: { marginBottom: 10 } },
          h('div', null, h('b', null, points.length), '个点'),
          h('div', null, h('b', null, Math.round(km)), '公里'),
          h('div', null, h('b', null, seen.size), '个地方'),
          base ? h('div', null, h('b', null, base), '基地') : null
        ),
        flat
          ? h(
              'div',
              { className: 'be-map' },
              h(
                'div',
                { className: 'be-mapbox' },
                h(
                  'svg',
                  { viewBox: `0 0 ${W} ${H}`, role: 'img' },
                  h('g', null, grid),
                  h('path', { d: path, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.16, strokeLinecap: 'round' }),
                  h('path', { d: path, className: 'be-flow', fill: 'none', stroke: 'currentColor', strokeWidth: 2, opacity: 0.6, strokeLinecap: 'round' }),
                  dots
                )
              )
            )
          : h(MapView, { points, onFail: () => setFlat(true) }),
        h(
          'div',
          { className: 'be-mapnote' },
          flat
            ? '瓦片没连上，这是本地手绘的走向图，纵横向比例不完全一致。'
            : '拖一下、滚轮缩放。底图是 Esri 的暗色画布，免 key；连不上会自动换 OpenStreetMap。断网就是空白。'
        )
      )
    }

    function Overview({ ev }) {
      const items = ev.groups.reduce((a, g) => a.concat(g.items), [])
      const spoken = items.filter((x) => x.text && x.text.trim() && !/^\*\*/.test(x.text.trim()))
      const moments = items.filter((x) => x.t).length
      const chars = items.reduce((m, x) => m + (x.text ? x.text.length : 0), 0)
      const first = spoken[0]
      // 结尾：只从时间线那几组里取最后一条——「吃了什么」「记着」排在后面但不是结尾
      const last = (() => {
        const days = ev.groups.filter((g) => g.kind === 'day')
        const src = days.length ? days[days.length - 1] : ev.groups[0]
        const pool = ((src && src.items) || []).filter((x) => x.t && x.text && x.text.trim())
        if (pool.length) return pool[pool.length - 1]
        return spoken.length > 1 ? spoken[spoken.length - 1] : null
      })()
      const keep = condense((ev.groups.find((g) => /记着/.test(g.label)) || {}).items)
      const words = (ev.words || []).slice(0, 8)
      let km = 0
      if (ev.route && ev.route.length > 1) {
        for (let i = 1; i < ev.route.length; i += 1) {
          const a = ev.route[i - 1]
          const b = ev.route[i]
          const dLat = ((b.lat - a.lat) * Math.PI) / 180
          const dLng = ((b.lng - a.lng) * Math.PI) / 180
          const t =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
          km += 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(t)))
        }
      }
      return h(
        'div',
        { className: 'be-sum' },
        h(
          'div',
          { className: 'be-big' },
          h('div', null, h('b', null, moments), h('span', null, '个时刻')),
          h('div', null, h('b', null, ev.images.length), h('span', null, '张图')),
          h('div', null, h('b', null, ev.groups.length), h('span', null, '段')),
          km ? h('div', null, h('b', null, Math.round(km)), h('span', null, '公里')) : null,
          h('div', null, h('b', null, chars), h('span', null, '字'))
        ),
        first
          ? h(
              'div',
              { className: 'be-quote' },
              h('em', null, '开头'),
              h('p', null, first.text),
              last ? h('em', null, '结尾') : null,
              last ? h('p', null, last.text) : null
            )
          : null,
        keep.length
          ? h(
              'div',
              null,
              h('h4', null, '记着的几件事'),
              h(
                'ul',
                { className: 'be-keeps' },
                keep.slice(0, 5).map((k, i) =>
                  h('li', { key: i }, k.text.length > 70 ? `${k.text.slice(0, 70)}…` : k.text)
                )
              )
            )
          : null,
        words.length
          ? h(
              'div',
              null,
              h('h4', null, '出现最多的'),
              h(
                'div',
                { className: 'be-chips' },
                words.map((w, i) => h('span', { className: 'be-chip', key: i }, `${w.word} × ${w.count}`))
              )
            )
          : null
      )
    }

    function MainPage() {
      const [list, setList] = useState(null)
      const [err, setErr] = useState('')
      const [active, setActive] = useState('')
      const [detail, setDetail] = useState(null)
      const [tab, setTab] = useState('timeline')
      const [zoom, setZoom] = useState('')
      const [editIntro, setEditIntro] = useState(null)
      const [saving, setSaving] = useState(false)
      const [saved, setSaved] = useState('')

      useEffect(() => {
        let dead = false
        fetch('/trip-log?action=list')
          .then((r) => r.json())
          .then((d) => {
            if (dead) return
            setList(d)
            if (d.events && d.events.length && !active) setActive(d.events[0].id)
          })
          .catch((e) => !dead && setErr(String(e)))
        return () => {
          dead = true
        }
      }, [])

      useEffect(() => {
        if (!active) return
        let dead = false
        setDetail(null)
        fetch(`/trip-log?action=event&id=${encodeURIComponent(active)}`)
          .then((r) => r.json())
          .then((d) => !dead && setDetail(d))
          .catch((e) => !dead && setErr(String(e)))
        return () => {
          dead = true
        }
      }, [active])

      const saveIntro = useCallback(() => {
        if (!detail) return
        setSaving(true)
        fetch(`/trip-log?action=saveIntro&id=${encodeURIComponent(active)}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ intro: editIntro }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.ok) {
              setDetail({ ...detail, intro: String(editIntro || '').trim() })
              setEditIntro(null)
              setErr('')
              const g = d.git || {}
              let msg = '已存进档案'
              if (g.committed) msg += ` · 提交 ${g.sha || ''}`
              else if (g.note) msg += ` · ${g.note}`
              if (g.committed && g.pushed) msg += ' · 已推送'
              else if (g.committed && !g.pushed) msg += ' · 没推上去，回家那台拉不到'
              setSaved(msg)
            } else {
              setErr(d.error || '存不下去')
            }
          })
          .catch((e) => setErr(String(e)))
          .finally(() => setSaving(false))
      }, [detail, editIntro, active])

      const events = (list && list.events) || []

      return h(
        'div',
        { className: 'be-root' },
        h('style', null, CSS),
        h(
          'aside',
          { className: 'be-side' },
          h('h2', null, '行程'),
          events.map((ev) =>
            h(
              'button',
              {
                key: ev.id,
                className: 'be-card',
                'data-on': ev.id === active ? '1' : '0',
                onClick: () => setActive(ev.id),
                type: 'button',
              },
              h('b', null, ev.city),
              h('span', null, `${ev.date} · ${ev.bullets} 条 · ${ev.images ? `${ev.images} 张图` : '无图'}`)
            )
          ),
          !events.length && !err ? h('div', { className: 'be-empty' }, '还没放过任何一趟。') : null,
          err ? h('div', { className: 'be-empty' }, err) : null,
          list && list.root ? h('div', { style: { opacity: 0.3, fontSize: 10, padding: '12px 8px', wordBreak: 'break-all' } }, list.root) : null
        ),
        h(
          'main',
          { className: 'be-main' },
          !active
            ? h('div', { className: 'be-empty' }, '左边挑一趟。')
            : !detail
              ? h('div', { className: 'be-empty' }, '翻着……')
              : h(
                  'div',
                  null,
                  h(
                    'header',
                    { className: 'be-head' },
                    h('h1', null, detail.title),
                    editIntro !== null
                      ? h(
                          'div',
                          { className: 'be-edit' },
                          h('textarea', {
                            value: editIntro,
                            rows: 3,
                            maxLength: 400,
                            autoFocus: true,
                            onChange: (e) => setEditIntro(e.target.value),
                          }),
                          h(
                            'div',
                            { className: 'be-editbar' },
                            h('button', { onClick: saveIntro, disabled: saving }, saving ? '存…' : '保存'),
                            h('button', { onClick: () => setEditIntro(null) }, '取消'),
                            h('span', { className: 'be-hint' }, '写回档案.md 的第一段')
                          )
                        )
                      : h(
                          'p',
                          {
                            className: 'be-intro',
                            title: '点一下改',
                            onClick: () => {
                              setSaved('')
                              setEditIntro(detail.intro || '')
                            },
                          },
                          detail.intro || '（还没写介绍，点一下补一句）'
                        ),
                    saved ? h('div', { className: 'be-saved' }, saved) : null
                  ),
                  h(
                    'nav',
                    { className: 'be-tabs' },
                    [
                      ['timeline', '时间线'],
                      ['route', '路线'],
                      ['cloud', '词云'],
                      ['gallery', '相册'],
                      ['about', '总结'],
                    ]
                      .filter(([k]) => k !== 'route' || (detail.route && detail.route.length >= 2))
                      .map(([k, label]) =>
                      h(
                        'button',
                        {
                          key: k,
                          type: 'button',
                          className: 'be-tab',
                          'data-on': tab === k ? '1' : '0',
                          onClick: () => setTab(k),
                        },
                        label
                      )
                    )
                  ),
                  tab === 'timeline' ? h(Timeline, { groups: detail.groups }) : null,
                  tab === 'route' ? h(Route, { points: detail.route, base: detail.base }) : null,
                  tab === 'cloud' ? h(Cloud, { words: detail.words, source: detail.wordsSource }) : null,
                  tab === 'gallery' ? h(Gallery, { images: detail.images, id: detail.id, onZoom: setZoom }) : null,
                  tab === 'about' ? h(Overview, { ev: detail }) : null
                )
        ),
        zoom ? h('div', { className: 'be-zoom', onClick: () => setZoom('') }, h('img', { src: zoom, alt: '' })) : null
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.inject(['layout'], (pageCtx) =>
          pageCtx.slots.inject('main', () => {
            pageCtx.slots.register({ name: 'main', key: 'trip-log' }, MainPage)
            pageCtx.slots.inject('sidebar.panellist', () =>
              pageCtx.slots.register(
                { name: 'sidebar.panellist', id: 'trip-log', order: 40, label: '行程记录' },
                SidebarEntry
              )
            )
          })
        )
      },
    }
  },
})
