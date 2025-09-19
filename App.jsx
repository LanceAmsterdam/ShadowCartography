
import React, { useMemo, useState } from 'react'
import dataJson from './data_seed.json'

const ALL_TYPES = ["UFO","Government","Science","Folklore","Hoax","Media","Other"]

function yearFromDates(dates) {
  if (!dates) return undefined
  const tryGet = (s) => (s ? Number(String(s).slice(0,4)) : undefined)
  return tryGet(dates.start) ?? tryGet(dates.end)
}

export default function App() {
  const DATA = dataJson
  const years = useMemo(() => {
    const ys = DATA.map(d => yearFromDates(d.dates)).filter(Boolean)
    const min = Math.min(...ys, 1900)
    const max = Math.max(...ys, new Date().getFullYear())
    return { min, max }
  }, [])

  const [query, setQuery] = useState('')
  const [locationQ, setLocationQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [minY, setMinY] = useState(years.min)
  const [maxY, setMaxY] = useState(years.max)
  const [open, setOpen] = useState({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lq = locationQ.trim().toLowerCase()
    return DATA.filter(d => {
      const y = yearFromDates(d.dates) ?? years.min
      if (y < minY || y > maxY) return false
      if (typeFilter !== 'All' && d.type !== typeFilter) return false
      const hay = [d.title, d.summary, (d.tags||[]).join(' '), (d.entities||[]).join(' ')].join(' ').toLowerCase()
      const locs = (d.locations||[]).join(' ').toLowerCase()
      const okQ = q ? hay.includes(q) : true
      const okL = lq ? locs.includes(lq) : true
      return okQ && okL
    }).sort((a,b) => (yearFromDates(b.dates)||0) - (yearFromDates(a.dates)||0))
  }, [query, locationQ, minY, maxY, typeFilter, years.min])

  return (
    <div>
      <header>
        <div className="wrap hstack">
          <div className="logo">SC</div>
          <div>
            <div style={{fontWeight:600}}>Shadow Cartography</div>
            <div className="small">Search. Cross‑link. Notice the patterns.</div>
          </div>
        </div>
      </header>

      <section className="wrap vstack" style={{marginTop:16}}>
        <div className="controls">
          <input placeholder="Keyword: MKUltra, triangle, witness..." value={query} onChange={e=>setQuery(e.target.value)} />
          <input placeholder="Location: Media, PA; Phoenix; UK..." value={locationQ} onChange={e=>setLocationQ(e.target.value)} />
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option>All</option>
            {ALL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="range">
          <label>Year range</label>
          <input type="range" min={years.min} max={years.max} value={minY} onChange={e=>setMinY(Number(e.target.value))} />
          <input type="range" min={years.min} max={years.max} value={maxY} onChange={e=>setMaxY(Number(e.target.value))} />
          <div className="small" style={{marginLeft:'auto'}}>{minY} – {maxY}</div>
        </div>
      </section>

      <main className="wrap vstack" style={{marginBottom:80}}>
        <div className="count">{filtered.length} result{filtered.length===1?'':'s'}</div>
        {filtered.map(d => (
          <div key={d.id} className="card">
            <h3>{d.title}</h3>
            <div className="badges">
              <span className="badge">{d.type}</span>
              <span className="badge">{d.confidence}</span>
              {(d.tags||[]).slice(0,4).map(t => <span key={t} className="badge">{t}</span>)}
            </div>
            <p style={{margin:'6px 0 8px 0'}}>{d.summary}</p>
            <div className="meta">
              {d.locations?.length ? <span>📍 {d.locations.join(' · ')}</span> : null}
              {d.entities?.length ? <span>🧩 {d.entities.slice(0,5).join(' · ')}</span> : null}
              <span>📅 {yearFromDates(d.dates) || '—'}</span>
            </div>
            <div style={{marginTop:8}}>
              <button className="btn" onClick={() => setOpen(o => ({...o, [d.id]: !o[d.id]}))}>
                {open[d.id] ? 'Hide details' : 'Show details'}
              </button>
            </div>
            {open[d.id] ? (
              <div className="details">
                <div className="small" style={{fontWeight:600, marginBottom:4}}>Sources</div>
                <ul style={{margin:0,paddingLeft:16}}>
                  {(d.sources||[]).map((s,i) => <li key={i}><a href={s.url || '#'} target="_blank" rel="noreferrer">{s.label}</a></li>)}
                </ul>
                <div className="small" style={{fontWeight:600, marginTop:8, marginBottom:4}}>Crosslinks</div>
                {d.crosslinks?.length ? (
                  <div className="badges">
                    {d.crosslinks.map(cid => {
                      const target = DATA.find(x => x.id === cid)
                      const label = target ? target.title : cid
                      return <span key={cid} className="badge" style={{cursor:'pointer'}} onClick={() => setQuery(label)}>{label}</span>
                    })}
                  </div>
                ) : <div className="small">No crosslinks yet.</div>}
              </div>
            ) : null}
          </div>
        ))}
      </main>

      <footer className="footer">
        <div className="wrap hstack" style={{justifyContent:'space-between', padding:'12px 16px'}}>
          <div className="small">Seed demo — append to <code>src/data_seed.json</code> to grow the graph.</div>
          <div className="small">© Shadow Cartography</div>
        </div>
      </footer>
    </div>
  )
}
