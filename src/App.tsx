import { useMemo, useState } from 'react'
import { PropertyForm } from './components/PropertyForm'
import { PreviewPane } from './components/PreviewPane'
import { generatePropertyPage } from './generatePage'
import { emptyProperty, PropertyData } from './types'

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base || 'oferta-nieruchomosci'
}

export default function App() {
  const [data, setData] = useState<PropertyData>(emptyProperty)
  const [copied, setCopied] = useState(false)

  const html = useMemo(() => generatePropertyPage(data), [data])

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(data.title)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Generator strony ogłoszeniowej</h1>
          <p className="text-sm text-slate-500">Stwórz gotową stronę reklamującą dom na sprzedaż</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? 'Skopiowano!' : 'Kopiuj kod HTML'}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Pobierz stronę (.html)
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <div className="overflow-y-auto rounded-lg bg-white p-5 shadow-sm">
          <PropertyForm data={data} onChange={setData} />
        </div>
        <div className="h-full min-h-[400px] overflow-hidden">
          <PreviewPane html={html} />
        </div>
      </div>
    </div>
  )
}
