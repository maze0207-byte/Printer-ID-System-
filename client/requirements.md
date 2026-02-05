## Packages
qrcode.react | Generating QR codes on ID cards
papaparse | Parsing CSV files for batch processing
recharts | Dashboard statistics charts
framer-motion | Page transitions and card flip animations
html2canvas | Exporting card previews as images
jspdf | Generating PDF sheets for printing

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}
Printing requires specific CSS @media print rules to maintain exact dimensions (85.6mm x 53.98mm).
