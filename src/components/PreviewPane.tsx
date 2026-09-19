interface Props {
  html: string
}

export function PreviewPane({ html }: Props) {
  return (
    <iframe
      title="Podgląd strony ogłoszenia"
      srcDoc={html}
      className="h-full w-full rounded-lg border border-slate-200 bg-white"
      sandbox=""
    />
  )
}
