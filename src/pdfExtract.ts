import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export interface ExtractedImage {
  dataUrl: string
  caption: string
}

export interface FieldGuesses {
  area?: string
  plotArea?: string
  rooms?: string
  city?: string
  address?: string
}

export interface ExtractedProject {
  images: ExtractedImage[]
  guesses: FieldGuesses
}

const POLISH_CITIES = [
  ['Warszawa', 'Warszawa'],
  ['Kraków', 'Krak[oó]w'],
  ['Wrocław', 'Wroc[łl]aw'],
  ['Poznań', 'Pozna[ńn]'],
  ['Gdańsk', 'Gda[ńn]sk'],
  ['Łódź', '[ŁL][oó]d[źz]'],
  ['Katowice', 'Katowice'],
  ['Szczecin', 'Szczecin'],
  ['Lublin', 'Lublin'],
  ['Bydgoszcz', 'Bydgoszcz'],
  ['Białystok', 'Bia[łl]ystok'],
  ['Rzeszów', 'Rzesz[oó]w'],
  ['Toruń', 'Toru[ńn]'],
  ['Kielce', 'Kielce'],
  ['Opole', 'Opole'],
  ['Olsztyn', 'Olsztyn'],
  ['Zielona Góra', 'Zielona G[oó]ra'],
  ['Gorzów Wielkopolski', 'Gorz[oó]w Wielkopolski'],
  ['Gdynia', 'Gdynia'],
  ['Sopot', 'Sopot'],
] as const

function guessFieldsFromText(text: string): FieldGuesses {
  const guesses: FieldGuesses = {}

  const areaMatch =
    text.match(/pow(?:ierzchni\w*)?\s*(?:u[żz]ytkow\w*)?\s*[:\-]?\s*(\d{2,4}[.,]\d{1,2}|\d{2,4})\s*m\s*[²2]/i)
  if (areaMatch) guesses.area = areaMatch[1].replace(',', '.')

  const plotMatch = text.match(/dzia[łl]k\w*\s*[:\-]?\s*(\d{2,6}[.,]\d{1,2}|\d{2,6})\s*m\s*[²2]/i)
  if (plotMatch) guesses.plotArea = plotMatch[1].replace(',', '.')

  const roomsMatch = text.match(/(\d{1,2})\s*poko\w*/i)
  if (roomsMatch) guesses.rooms = roomsMatch[1]

  const addressMatch = text.match(/ul\.?\s*[A-Za-zŁŚŻŹĆŃÓĄĘłśżźćńóąę]+(?:\s[A-Za-zŁŚŻŹĆŃÓĄĘłśżźćńóąę]+){0,2}\s\d{1,4}[a-zA-Z]?/)
  if (addressMatch) guesses.address = addressMatch[0].trim()

  for (const [canonical, pattern] of POLISH_CITIES) {
    if (new RegExp(`\\b${pattern}\\b`, 'i').test(text)) {
      guesses.city = canonical
      break
    }
  }

  return guesses
}

function mergeGuesses(a: FieldGuesses, b: FieldGuesses): FieldGuesses {
  return {
    area: a.area ?? b.area,
    plotArea: a.plotArea ?? b.plotArea,
    rooms: a.rooms ?? b.rooms,
    city: a.city ?? b.city,
    address: a.address ?? b.address,
  }
}

async function extractPdfPages(file: File): Promise<{ images: ExtractedImage[]; text: string }> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const images: ExtractedImage[] = []
  let fullText = ''

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    if (context) {
      await page.render({ canvasContext: context, viewport }).promise
      images.push({
        dataUrl: canvas.toDataURL('image/png'),
        caption: pdf.numPages > 1 ? `${file.name} — str. ${pageNum}` : file.name,
      })
    }

    const textContent = await page.getTextContent()
    fullText += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n'
  }

  return { images, text: fullText }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function extractProjectFiles(files: File[]): Promise<ExtractedProject> {
  let guesses: FieldGuesses = {}
  const images: ExtractedImage[] = []

  for (const file of files) {
    if (file.type === 'application/pdf') {
      const { images: pageImages, text } = await extractPdfPages(file)
      images.push(...pageImages)
      guesses = mergeGuesses(guesses, guessFieldsFromText(text))
    } else if (file.type.startsWith('image/')) {
      images.push({ dataUrl: await fileToDataUrl(file), caption: file.name })
    }
  }

  return { images, guesses }
}
