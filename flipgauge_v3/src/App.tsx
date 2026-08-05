import { useMemo, useState } from 'react';
import { AlertTriangle, Barcode, Bell, Box, Calculator, CheckCircle2, ChevronRight, CircleDollarSign, Gauge, History, Home, Menu, PackageSearch, Save, Search, Settings, ShieldCheck, ShoppingCart, Sparkles, TrendingUp, Users, XCircle } from 'lucide-react';
import { products, type Product } from './data/demo';
import { HistoryChart } from './components/HistoryChart';
import { ScannerModal } from './components/ScannerModal';

type SavedScan = { asin: string; title: string; cost: number; profit: number; roi: number; verdict: string; date: string };

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const number = (value: number) => new Intl.NumberFormat('en-US').format(value);

export default function App() {
  const [query, setQuery] = useState('012345678905');
  const [product, setProduct] = useState<Product>(products[0]);
  const [cost, setCost] = useState(11.5);
  const [prep, setPrep] = useState(0.75);
  const [inbound, setInbound] = useState(0.65);
  const [taxRate, setTaxRate] = useState(7);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<SavedScan[]>(() => JSON.parse(localStorage.getItem('flipgauge-phase1-scans') || '[]'));

  const analysis = useMemo(() => {
    const referral = product.buyBox * product.referralRate;
    const tax = cost * taxRate / 100;
    const totalCost = cost + tax + prep + inbound;
    const totalFees = referral + product.fulfillmentFee;
    const profit = product.buyBox - totalCost - totalFees;
    const roi = totalCost ? profit / totalCost * 100 : 0;
    const margin = product.buyBox ? profit / product.buyBox * 100 : 0;
    const maxBuy = (product.buyBox - totalFees - prep - inbound) / 1.35;
    let score = 100;
    score -= product.amazonOnListing ? 18 : 0;
    score -= product.hazmat ? 20 : 0;
    score -= !product.eligible ? 35 : 0;
    score -= product.sellers > 15 ? 12 : product.sellers > 8 ? 6 : 0;
    score -= roi < 20 ? 25 : roi < 35 ? 10 : 0;
    score += product.monthlySales > 150 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));
    const verdict = !product.eligible || product.hazmat || profit < 3 || roi < 20 ? 'PASS' : roi >= 40 && score >= 75 ? 'BUY' : 'MAYBE';
    return { referral, tax, totalCost, totalFees, profit, roi, margin, maxBuy, score, verdict };
  }, [product, cost, prep, inbound, taxRate]);

  const lookup = (value = query) => {
    const clean = value.trim().toUpperCase();
    const found = products.find((item) => item.asin === clean || item.upc === clean);
    if (found) { setProduct(found); setQuery(value); setNotice('Product loaded from the Phase 1 demo catalog.'); }
    else setNotice('No demo match. Try 012345678905, 036000291452, or B0RISK9999.');
  };

  const saveScan = () => {
    const scan: SavedScan = { asin: product.asin, title: product.title, cost, profit: analysis.profit, roi: analysis.roi, verdict: analysis.verdict, date: new Date().toLocaleString() };
    const next = [scan, ...saved].slice(0, 20);
    setSaved(next);
    localStorage.setItem('flipgauge-phase1-scans', JSON.stringify(next));
    setNotice('Analysis saved on this device.');
  };

  const verdictIcon = analysis.verdict === 'BUY' ? <CheckCircle2/> : analysis.verdict === 'PASS' ? <XCircle/> : <AlertTriangle/>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Gauge/></div><div><strong>FlipGauge</strong><span>Source smarter</span></div></div>
        <nav>
          <a className="active"><Home/>Dashboard</a><a><PackageSearch/>Product lookup</a><a><History/>Scan history</a><a><Bell/>Alerts</a><a><Calculator/>Calculator</a>
        </nav>
        <div className="sidebar-bottom"><a><Settings/>Settings</a><div className="plan-card"><Sparkles/><strong>Phase 1 build</strong><span>Production frontend foundation</span></div></div>
      </aside>

      <main>
        <header className="topbar"><button className="icon-button mobile-menu"><Menu/></button><div><h1>Sourcing dashboard</h1><p>Fast product decisions without spreadsheet gymnastics.</p></div><div className="top-actions"><button className="secondary"><Bell size={18}/>Alerts</button><button className="avatar">JS</button></div></header>

        <section className="search-panel card">
          <div className="search-copy"><span className="eyebrow">PRODUCT LOOKUP</span><h2>Scan or search an item</h2><p>Enter a UPC, EAN, or ASIN. Live Amazon data connects in Phase 3.</p></div>
          <div className="lookup-row"><div className="search-box"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&lookup()} placeholder="UPC, EAN, or ASIN"/><button className="scan-button" onClick={()=>setScannerOpen(true)} aria-label="Scan barcode"><Barcode/></button></div><button className="primary" onClick={()=>lookup()}>Analyze <ChevronRight size={18}/></button></div>
          {notice && <div className="notice">{notice}</div>}
        </section>

        <section className="product-grid">
          <article className="card product-card">
            <div className="product-image">{product.image}</div><div className="product-details"><div className="badges"><span>{product.category}</span><span>ASIN {product.asin}</span></div><h2>{product.title}</h2><div className="product-meta"><span><ShoppingCart/>Buy Box <strong>{money(product.buyBox)}</strong></span><span><Box/>Lowest FBA <strong>{money(product.lowestFba)}</strong></span></div></div>
            <div className={`verdict ${analysis.verdict.toLowerCase()}`}>{verdictIcon}<div><span>Recommendation</span><strong>{analysis.verdict}</strong></div><b>{analysis.score}</b></div>
          </article>

          <article className="card inputs-card"><div className="section-heading"><div><span className="eyebrow">YOUR NUMBERS</span><h3>Purchase details</h3></div><button className="icon-button" onClick={saveScan} title="Save analysis"><Save/></button></div><div className="input-grid">
            <label>Store cost<div className="money-input"><span>$</span><input type="number" value={cost} min="0" step="0.01" onChange={(e)=>setCost(Number(e.target.value))}/></div></label>
            <label>Sales tax<div className="money-input suffix"><input type="number" value={taxRate} min="0" step="0.1" onChange={(e)=>setTaxRate(Number(e.target.value))}/><span>%</span></div></label>
            <label>Prep cost<div className="money-input"><span>$</span><input type="number" value={prep} min="0" step="0.01" onChange={(e)=>setPrep(Number(e.target.value))}/></div></label>
            <label>Inbound shipping<div className="money-input"><span>$</span><input type="number" value={inbound} min="0" step="0.01" onChange={(e)=>setInbound(Number(e.target.value))}/></div></label>
          </div></article>
        </section>

        <section className="metric-grid">
          <article className="metric card"><div className="metric-icon"><CircleDollarSign/></div><span>Net profit</span><strong className={analysis.profit < 0 ? 'negative' : ''}>{money(analysis.profit)}</strong><small>After estimated fees and costs</small></article>
          <article className="metric card"><div className="metric-icon"><TrendingUp/></div><span>ROI</span><strong>{analysis.roi.toFixed(1)}%</strong><small>{analysis.roi >= 35 ? 'Above your 35% target' : 'Below your 35% target'}</small></article>
          <article className="metric card"><div className="metric-icon"><Gauge/></div><span>Margin</span><strong>{analysis.margin.toFixed(1)}%</strong><small>Profit ÷ sale price</small></article>
          <article className="metric card"><div className="metric-icon"><ShoppingCart/></div><span>Max buy cost</span><strong>{money(analysis.maxBuy)}</strong><small>Targets roughly 35% ROI</small></article>
        </section>

        <section className="analysis-grid">
          <article className="card chart-card"><div className="section-heading"><div><span className="eyebrow">PRICE SIGNAL</span><h3>90-day Buy Box history</h3></div><strong>{money(product.buyBox)}</strong></div><HistoryChart values={product.history}/><div className="chart-stats"><div><span>90-day low</span><strong>{money(Math.min(...product.history))}</strong></div><div><span>90-day average</span><strong>{money(product.history.reduce((a,b)=>a+b,0)/product.history.length)}</strong></div><div><span>90-day high</span><strong>{money(Math.max(...product.history))}</strong></div></div></article>
          <article className="card signal-card"><div className="section-heading"><div><span className="eyebrow">MARKET SIGNALS</span><h3>Listing health</h3></div><ShieldCheck/></div><div className="signal-list">
            <div><span><Users/>Estimated monthly sales</span><strong>{number(product.monthlySales)}</strong></div><div><span><ShoppingCart/>FBA sellers</span><strong>{product.sellers}</strong></div><div><span><TrendingUp/>Sales rank</span><strong>#{number(product.rank)}</strong></div><div><span><ShieldCheck/>Eligible to sell</span><strong className={product.eligible?'good':'bad'}>{product.eligible?'Yes':'No'}</strong></div><div><span><AlertTriangle/>Amazon on listing</span><strong className={!product.amazonOnListing?'good':'warn'}>{product.amazonOnListing?'Yes':'No'}</strong></div><div><span><AlertTriangle/>Hazmat</span><strong className={!product.hazmat?'good':'bad'}>{product.hazmat?'Yes':'No'}</strong></div>
          </div></article>
        </section>

        <section className="bottom-grid">
          <article className="card fee-card"><div className="section-heading"><div><span className="eyebrow">PROFIT BREAKDOWN</span><h3>Where the money goes</h3></div></div><div className="fee-table"><div><span>Sale price</span><strong>{money(product.buyBox)}</strong></div><div><span>Product + tax + prep + inbound</span><strong>-{money(analysis.totalCost)}</strong></div><div><span>Referral fee</span><strong>-{money(analysis.referral)}</strong></div><div><span>FBA fulfillment fee</span><strong>-{money(product.fulfillmentFee)}</strong></div><div className="total"><span>Estimated net profit</span><strong>{money(analysis.profit)}</strong></div></div></article>
          <article className="card history-card"><div className="section-heading"><div><span className="eyebrow">RECENT</span><h3>Saved scans</h3></div><span>{saved.length} saved</span></div>{saved.length===0?<div className="empty-state"><Save/><strong>No saved scans yet</strong><span>Save an analysis to keep it on this device.</span></div>:<div className="saved-list">{saved.slice(0,4).map((scan,index)=><div key={`${scan.asin}-${index}`}><div><strong>{scan.title}</strong><span>{scan.asin} · {scan.date}</span></div><b className={scan.verdict.toLowerCase()}>{scan.verdict}</b><span>{money(scan.profit)} · {scan.roi.toFixed(0)}%</span></div>)}</div>}</article>
        </section>
      </main>
      {scannerOpen && <ScannerModal onClose={()=>setScannerOpen(false)} onScan={(code)=>{setScannerOpen(false);setQuery(code);lookup(code);}}/>}
    </div>
  );
}
