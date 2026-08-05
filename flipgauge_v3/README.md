# FlipGauge Phase 1

Production frontend foundation for FlipGauge, rebuilt with React, TypeScript, Vite, Tailwind CSS, and a responsive mobile-first interface.

## Included

- UPC / EAN / ASIN lookup against a safe demo catalog
- Camera barcode scanner using the browser BarcodeDetector API when supported
- Profit, ROI, margin, fee, and maximum-buy calculations
- Buy / Maybe / Pass recommendation score
- 90-day price-history visualization
- Listing-health and competition signals
- Local saved-scan history
- Responsive desktop and mobile layouts
- Vercel-ready Vite build

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo codes

- `012345678905`
- `036000291452`
- `B0DEMO1234`
- `B0RISK9999`

## Deploy to Vercel

Import the repository, keep the framework preset as **Vite**, and click Deploy. Vercel will use `npm run build` and publish the `dist` folder.

## Important

Product records are fictional. Amazon credentials must never be put into browser code. Live SP-API and Keepa connections belong in a secure backend planned for later phases.
