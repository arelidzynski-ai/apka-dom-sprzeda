# Generator strony ogłoszeniowej — dom na sprzedaż

Aplikacja webowa (React + Vite + TypeScript) do tworzenia gotowej strony
internetowej reklamującej nieruchomość na sprzedaż. Po lewej stronie
wypełniasz formularz z danymi (tytuł, cena, adres, parametry, opis,
udogodnienia, zdjęcia, dane kontaktowe), a po prawej stronie widzisz na
żywo podgląd wygenerowanej strony. Gotową stronę można pobrać jako
samodzielny plik `.html` (ze zdjęciami osadzonymi w pliku) lub skopiować
jej kod.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja uruchomi się pod adresem podanym w terminalu (domyślnie
`http://localhost:5173`).

## Build produkcyjny

```bash
npm run build
npm run preview
```

## Funkcje

- Formularz z danymi nieruchomości (cena, metraż, liczba pokoi, rok
  budowy, ogrzewanie itd.)
- Wybór udogodnień (garaż, ogród, basen, klimatyzacja...)
- Dodawanie wielu zdjęć z podpisami i zmianą kolejności (pierwsze zdjęcie
  jest tłem nagłówka)
- Trzy szablony graficzne: elegancki, nowoczesny, rustykalny
- Podgląd na żywo w oknie iframe
- Eksport gotowej, samodzielnej strony HTML (jeden plik, bez zależności
  zewnętrznych) — gotowej do wysłania klientowi, wgrania na hosting albo
  dołączenia do maila
