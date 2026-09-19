import { ChangeEvent, useState } from 'react'
import { extractProjectFiles } from '../pdfExtract'
import { FEATURE_OPTIONS, PropertyData, PropertyPhoto, TemplateStyle } from '../types'

interface Props {
  data: PropertyData
  onChange: (data: PropertyData) => void
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

export function PropertyForm({ data, onChange }: Props) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzedFiles, setAnalyzedFiles] = useState<string[]>([])

  const set = <K extends keyof PropertyData>(key: K, value: PropertyData[K]) =>
    onChange({ ...data, [key]: value })

  const toggleFeature = (feature: string) => {
    const has = data.features.includes(feature)
    set('features', has ? data.features.filter((f) => f !== feature) : [...data.features, feature])
  }

  const handleProjectUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setAnalyzing(true)
    try {
      const { images, guesses } = await extractProjectFiles(files)
      const newPhotos: PropertyPhoto[] = images.map((img) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        dataUrl: img.dataUrl,
        caption: img.caption,
      }))
      onChange({
        ...data,
        photos: [...data.photos, ...newPhotos],
        area: data.area || guesses.area || '',
        plotArea: data.plotArea || guesses.plotArea || '',
        rooms: data.rooms || guesses.rooms || '',
        city: data.city || guesses.city || '',
        address: data.address || guesses.address || '',
      })
      setAnalyzedFiles(files.map((f) => f.name))
    } finally {
      setAnalyzing(false)
      e.target.value = ''
    }
  }

  const handlePhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newPhotos: PropertyPhoto[] = await Promise.all(
      files.map(async (file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        dataUrl: await fileToDataUrl(file),
        caption: '',
      }))
    )
    set('photos', [...data.photos, ...newPhotos])
    e.target.value = ''
  }

  const removePhoto = (id: string) => set('photos', data.photos.filter((p) => p.id !== id))
  const setCaption = (id: string, caption: string) =>
    set('photos', data.photos.map((p) => (p.id === id ? { ...p, caption } : p)))
  const movePhoto = (id: string, dir: -1 | 1) => {
    const idx = data.photos.findIndex((p) => p.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= data.photos.length) return
    const photos = [...data.photos]
    ;[photos[idx], photos[newIdx]] = [photos[newIdx], photos[idx]]
    set('photos', photos)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">1. Wrzuć projekt</h3>
        <p className="text-sm text-slate-600 mb-3">
          Projekt architektoniczny i/lub plan zagospodarowania terenu (PDF lub zdjęcia). Strony PDF trafią
          automatycznie do galerii jako rzuty/elewacje, a metraż, liczbę pokoi i adres spróbuję wyciągnąć sam.
        </p>
        <input
          type="file"
          accept="application/pdf,image/*"
          multiple
          onChange={handleProjectUpload}
          className="text-sm"
          disabled={analyzing}
        />
        {analyzing && <p className="mt-2 text-sm font-medium text-blue-700">Analizuję projekt…</p>}
        {!analyzing && analyzedFiles.length > 0 && (
          <p className="mt-2 text-sm text-green-700">
            Wczytano: {analyzedFiles.join(', ')}. Sprawdź poniżej (sekcja „Szczegóły") czy metraż/adres się zgadzają.
          </p>
        )}
      </section>

      <section className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">2. Podaj cenę</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClass}>Cena (zł)</label>
            <input
              className={inputClass}
              placeholder="np. 850000"
              value={data.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>
          <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={data.priceNegotiable}
              onChange={(e) => set('priceNegotiable', e.target.checked)}
            />
            Cena do negocjacji
          </label>
        </div>
      </section>

      <details className="rounded-xl border border-slate-200">
        <summary className="cursor-pointer select-none rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          Szczegóły ogłoszenia (opcjonalnie — dopracuj jeśli chcesz)
        </summary>
        <div className="space-y-6 p-4">
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Podstawowe informacje</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Tytuł ogłoszenia</label>
                <input
                  className={inputClass}
                  placeholder="np. Przestronny dom jednorodzinny z ogrodem"
                  value={data.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Szablon graficzny</label>
                <select
                  className={inputClass}
                  value={data.template}
                  onChange={(e) => set('template', e.target.value as TemplateStyle)}
                >
                  <option value="elegancki">Elegancki</option>
                  <option value="nowoczesny">Nowoczesny</option>
                  <option value="rustykalny">Rustykalny</option>
                  <option value="wlasny">Własny kolor marki</option>
                </select>
              </div>
              {data.template === 'wlasny' && (
                <div className="flex gap-4">
                  <div>
                    <label className={labelClass}>Kolor marki</label>
                    <input
                      type="color"
                      className="h-10 w-16 rounded border border-slate-300"
                      value={data.brandAccent}
                      onChange={(e) => set('brandAccent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Kolor marki (ciemniejszy)</label>
                    <input
                      type="color"
                      className="h-10 w-16 rounded border border-slate-300"
                      value={data.brandAccentDark}
                      onChange={(e) => set('brandAccentDark', e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className={labelClass}>Miasto</label>
                <input className={inputClass} value={data.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Adres / dzielnica</label>
                <input className={inputClass} value={data.address} onChange={(e) => set('address', e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Parametry nieruchomości</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Powierzchnia (m²)</label>
                <input className={inputClass} value={data.area} onChange={(e) => set('area', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Działka (m²)</label>
                <input className={inputClass} value={data.plotArea} onChange={(e) => set('plotArea', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Liczba pokoi</label>
                <input className={inputClass} value={data.rooms} onChange={(e) => set('rooms', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Łazienki</label>
                <input className={inputClass} value={data.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Piętro / liczba kondygnacji</label>
                <input className={inputClass} value={data.floor} onChange={(e) => set('floor', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Rok budowy</label>
                <input className={inputClass} value={data.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <label className={labelClass}>Ogrzewanie</label>
                <input className={inputClass} value={data.heating} onChange={(e) => set('heating', e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Opis</h3>
            <textarea
              className={`${inputClass} min-h-[120px]`}
              placeholder="Opisz nieruchomość — atuty, okolicę, stan techniczny..."
              value={data.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Udogodnienia</h3>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    data.features.includes(feature)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Galeria (rzuty z projektu + dodatkowe zdjęcia)</h3>
            <input type="file" accept="image/*" multiple onChange={handlePhotos} className="text-sm" />
            {data.photos.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">Pierwsze zdjęcie zostanie użyte jako główne (tło nagłówka).</p>
            )}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.photos.map((photo, idx) => (
                <div key={photo.id} className="rounded-lg border border-slate-200 p-2">
                  <img src={photo.dataUrl} alt="" className="h-24 w-full rounded object-cover" />
                  <input
                    className="mt-2 w-full rounded border border-slate-200 px-1.5 py-1 text-xs"
                    placeholder="Podpis (opcjonalnie)"
                    value={photo.caption}
                    onChange={(e) => setCaption(photo.id, e.target.value)}
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <div className="space-x-1">
                      <button type="button" className="text-slate-500 hover:text-slate-800" onClick={() => movePhoto(photo.id, -1)} disabled={idx === 0}>
                        ↑
                      </button>
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-800"
                        onClick={() => movePhoto(photo.id, 1)}
                        disabled={idx === data.photos.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removePhoto(photo.id)}>
                      Usuń
                    </button>
                  </div>
                  {idx === 0 && <p className="mt-1 text-center text-[10px] font-medium text-blue-600">Zdjęcie główne</p>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Kontakt</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Imię i nazwisko</label>
                <input className={inputClass} value={data.contactName} onChange={(e) => set('contactName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Telefon</label>
                <input className={inputClass} value={data.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input className={inputClass} value={data.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
              </div>
            </div>
          </section>
        </div>
      </details>
    </div>
  )
}
