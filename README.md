# Serena

A minimalist personal journal with a feminine, expressive visual identity. Serena keeps the experience small and intentional: write a moment, revisit it, or browse it by date.

## Run locally

```bash
npm install
npm run dev
```

## Included in this foundation

- Today, Journal, Calendar, Entry Detail, and Settings views
- Create, edit, and delete journal entries
- Search by title, text, or tag; filter by tag
- Calendar date selection with entry markers
- Calendar week-start preference and optional entry timestamps
- Export entries as JSON and restore sample content
- Local browser persistence through `localStorage`
- Responsive sidebar and mobile navigation
- Reduced-motion support and visible keyboard focus states

## Data note

This is a frontend demonstration. Entries are stored in this browser using `localStorage`; they are not encrypted, backed up, synchronized across devices, or protected by account authentication. Do not use it as a secure private vault.

## Design direction

Warm cream, plum, rose, peach, lilac, and butter accents; Fraunces display typography paired with DM Sans; compact navigation; tactile entry surfaces; and a focused writing modal.

## Apply to an existing clone

```bash
./apply-to-repo.sh /path/to/your/serena-clone
```

The script copies the app into the supplied Git working directory. Review the changes before committing them.
