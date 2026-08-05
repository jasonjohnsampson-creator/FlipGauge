import { useMemo, useState } from 'react';
import {
  AlertTriangle, Barcode, Bell, Box, Calculator, CheckCircle2, ChevronRight,
  CircleDollarSign, Download, Gauge, History, Home, Menu, PackageSearch, Save,
  Search, Settings, ShieldCheck, ShoppingCart, Sparkles, TrendingUp, Trash2,
  UserRound, Users, X, XCircle
} from 'lucide-react';
import { products, type Product } from './data/demo';
import { HistoryChart } from './components/HistoryChart';
import { ScannerModal } from './components/ScannerModal';

type Page = 'dashboard' | 'lookup' | 'history' | 'alerts' | 'calculator' | 'settings';
type SavedScan = { asin: string; title: string; cost: number; profit: number; roi: number; verdict: string; date: string };
type AlertRule = { id: number; name: string; detail: string; active: boolean };

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const number = (value: number) => new Intl.NumberFormat('en-US').format(value);

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'lookup', label: 'Product lookup', icon: PackageSearch },
  { id: 'history', label: 'Scan history', icon: History },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'calculator', label: 'Calculator', icon: Calculator },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('012345678905');
  const [product, setProduct] = useState<Product>(products[0]);
  const [cost, setCost] = useState(11.5);
  const [prep, setPrep] = useState(0.75);
  const [inbound, setInbound] = useState(0.65);
  const [taxRate, setTaxRate] = useState(7);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<SavedScan[]>(() => JSON.parse(localStorage.getItem('flipgauge-phase1-scans') || '[]'));
  const [alerts, setAlerts] = useState<AlertRule[]>([
    { id: 1, name: 'Profit floor', detail: 'Notify when profit reaches $8.00', active: true },
    { id: 2, name: 'ROI target', detail: 'Notify when ROI reaches 40%', active: true },
    { id: 3, name: 'Seller competition', detail: 'Notify when FBA sellers fall below 8', active: false },
  ]);

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

  const changePage = (next: Page) => { setPage(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const lookup = (value = query) => {
    const clean = value.trim().toUpperCase();
    const found = products.find((item) => item.asin === clean || item.upc === clean);
    if (found) {
      setProduct(found); setQuery(value); setNotice('Product loaded from the Phase 1 demo catalog.'); setPage('lookup');
    } else setNotice('No demo match. Try 012345678905, 036000291452, B0DEMO1234, or B0RISK9999.');
  };

  const saveScan = () => {
    const scan: SavedScan = { asin: product.asin, title: product.title, cost, profit: analysis.profit, roi: analysis.roi, verdict: analysis.verdict, date: new Date().toLocaleString() };
    const next = [scan, ...saved].slice(0, 50);
    setSaved(next); localStorage.setItem('flipgauge-phase1-scans', JSON.stringify(next)); setNotice('Analysis saved on this device.');
  };

  const clearHistory = () => { setSaved([]); localStorage.removeItem('flipgauge-phase1-scans'); };
  const exportHistory = () => {
    const rows = [['ASIN','Product','Cost','Profit','ROI','Verdict','Date'], ...saved.map(s => [s.asin,s.title,s.cost.toFixed(2),s.profit.toFixed(2),s.roi.toFixed(1),s.verdict,s.date])];
    const blob = new Blob([rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'flipgauge-scan-history.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const verdictIcon = analysis.verdict === 'BUY' ? <CheckCircle2/> : analysis.verdict === 'PASS' ? <XCircle/> : <AlertTriangle/>;

  const Sidebar = () => (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Gauge/></div><div><strong>FlipGauge</strong><span>Source smarter</span></div><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X/></button></div>
      <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={page===item.id?'active':''} onClick={()=>changePage(item.id)}><Icon/>{item.label}</button>; })}</nav>
      <div className="sidebar-bottom"><button className={page==='settings'?'active':''} onClick={()=>changePage('settings')}><Settings/>Settings</button><div className="plan-card"><Sparkles/><strong>Founder build</strong><span>Phase 1 · Milestone 2</span></div></div>
    </aside>
  );

  const SearchPanel = () => (
    <section className="search-panel card">
      <div className="search-copy"><span className="eyebrow">PRODUCT LOOKUP</span><h2>Scan or search an item</h2><p>Enter a UPC, EAN, or ASIN. Live Amazon data connects in a later phase.</p></div>
      <div className="lookup-row"><div className="search-box"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&lookup()} placeholder="UPC, EAN, or ASIN"/><button className="scan-button" onClick={()=>setScannerOpen(true)} aria-label="Scan barcode"><Barcode/></button></div><button className="primary" onClick={()=>lookup()}>Analyze <ChevronRight size={18}/></button></div>
      {notice && <div className="notice">{notice}</div>}
    </section>
  );

  const ProductHero = () => (
    <section className="product-grid">
      <article className="card product-card">
        <div className="product-image">{product.image}</div><div className="product-details"><div className="badges"><span>{product.category}</span><span>ASIN {product.asin}</span></div><h2>{product.title}</h2><div className="product-meta"><span><ShoppingCart/>Buy Box <strong>{money(product.buyBox)}</strong></span><span><Box/>Lowest FBA <strong>{money(product.lowestFba)}</strong></span></div></div>
        <div className={`verdict ${analysis.verdict.toLowerCase()}`}>{verdictIcon}<div><span>Recommendation</span><strong>{analysis.verdict}</strong></div><b>{analysis.score}</b></div>
      </article>
      <PurchaseInputs />
    </section>
  );

  const PurchaseInputs = () => (
    <article className="card inputs-card"><div className="section-heading"><div><span className="eyebrow">YOUR NUMBERS</span><h3>Purchase details</h3></div><button className="icon-button" onClick={saveScan} title="Save analysis"><Save/></button></div><div className="input-grid">
      <label>Store cost<div className="money-input"><span>$</span><input type="number" value={cost} min="0" step="0.01" onChange={(e)=>setCost(Number(e.target.value))}/></div></label>
      <label>Sales tax<div className="money-input suffix"><input type="number" value={taxRate} min="0" step="0.1" onChange={(e)=>setTaxRate(Number(e.target.value))}/><span>%</span></div></label>
      <label>Prep cost<div className="money-input"><span>$</span><input type="number" value={prep} min="0" step="0.01" onChange={(e)=>setPrep(Number(e.target.value))}/></div></label>
      <label>Inbound shipping<div className="money-input"><span>$</span><input type="number" value={inbound} min="0" step="0.01" onChange={(e)=>setInbound(Number(e.target.value))}/></div></label>
    </div></article>
  );

  const Metrics = () => <section className="metric-grid">
    <article className="metric card"><div className="metric-icon"><CircleDollarSign/></div><span>Net profit</span><strong className={analysis.profit < 0 ? 'negative' : ''}>{money(analysis.profit)}</strong><small>After estimated fees and costs</small></article>
    <article className="metric card"><div className="metric-icon"><TrendingUp/></div><span>ROI</span><strong>{analysis.roi.toFixed(1)}%</strong><small>{analysis.roi >= 35 ? 'Above your 35% target' : 'Below your 35% target'}</small></article>
    <article className="metric card"><div className="metric-icon"><Gauge/></div><span>Margin</span><strong>{analysis.margin.toFixed(1)}%</strong><small>Profit ÷ sale price</small></article>
    <article className="metric card"><div className="metric-icon"><ShoppingCart/></div><span>Max buy cost</span><strong>{money(analysis.maxBuy)}</strong><small>Targets roughly 35% ROI</small></article>
  </section>;

  const AnalysisBlocks = () => <>
    <section className="analysis-grid">
      <article className="card chart-card"><div className="section-heading"><div><span className="eyebrow">PRICE SIGNAL</span><h3>90-day Buy Box history</h3></div><strong>{money(product.buyBox)}</strong></div><HistoryChart values={product.history}/><div className="chart-stats"><div><span>90-day low</span><strong>{money(Math.min(...product.history))}</strong></div><div><span>90-day average</span><strong>{money(product.history.reduce((a,b)=>a+b,0)/product.history.length)}</strong></div><div><span>90-day high</span><strong>{money(Math.max(...product.history))}</strong></div></div></article>
      <article className="card signal-card"><div className="section-heading"><div><span className="eyebrow">MARKET SIGNALS</span><h3>Listing health</h3></div><ShieldCheck/></div><div className="signal-list">
        <div><span><Users/>Estimated monthly sales</span><strong>{number(product.monthlySales)}</strong></div><div><span><ShoppingCart/>FBA sellers</span><strong>{product.sellers}</strong></div><div><span><TrendingUp/>Sales rank</span><strong>#{number(product.rank)}</strong></div><div><span><ShieldCheck/>Eligible to sell</span><strong className={product.eligible?'good':'bad'}>{product.eligible?'Yes':'No'}</strong></div><div><span><AlertTriangle/>Amazon on listing</span><strong className={!product.amazonOnListing?'good':'warn'}>{product.amazonOnListing?'Yes':'No'}</strong></div><div><span><AlertTriangle/>Hazmat</span><strong className={!product.hazmat?'good':'bad'}>{product.hazmat?'Yes':'No'}</strong></div>
      </div></article>
    </section>
    <section className="bottom-grid">
      <article className="card fee-card"><div className="section-heading"><div><span className="eyebrow">PROFIT BREAKDOWN</span><h3>Where the money goes</h3></div></div><div className="fee-table"><div><span>Sale price</span><strong>{money(product.buyBox)}</strong></div><div><span>Product + tax + prep + inbound</span><strong>-{money(analysis.totalCost)}</strong></div><div><span>Referral fee</span><strong>-{money(analysis.referral)}</strong></div><div><span>Fulfillment fee</span><strong>-{money(product.fulfillmentFee)}</strong></div><div className="total"><span>Estimated net profit</span><strong>{money(analysis.profit)}</strong></div></div></article>
      <article className="card history-card"><div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Saved scans</h3></div><button className="text-button" onClick={()=>changePage('history')}>View all</button></div>{saved.length ? <div className="saved-list">{saved.slice(0,4).map((item,i)=><div key={`${item.date}-${i}`}><strong>{item.title}</strong><span>{money(item.profit)} · {item.roi.toFixed(1)}% ROI</span><b className={item.verdict.toLowerCase()}>{item.verdict}</b></div>)}</div> : <div className="empty-state"><History/><strong>No saved scans yet</strong><span>Save an analysis and it will appear here.</span></div>}</article>
    </section>
  </>;

  const Dashboard = () => <><section className="welcome-banner card"><div><span className="eyebrow">GOOD SOURCING STARTS HERE</span><h2>Turn shelf prices into confident decisions.</h2><p>FlipGauge pulls your costs, market signals, and risk checks into one clean readout.</p></div><div className="score-orbit"><span>Current score</span><strong>{analysis.score}</strong><small>/100</small></div></section><SearchPanel/><ProductHero/><Metrics/><AnalysisBlocks/></>;
  const LookupPage = () => <><SearchPanel/><ProductHero/><Metrics/><AnalysisBlocks/></>;
  const CalculatorPage = () => <><section className="page-intro"><span className="eyebrow">CALCULATOR</span><h2>Profit laboratory</h2><p>Tune every cost and see the deal change instantly.</p></section><section className="calculator-layout"><PurchaseInputs/><article className="card calculator-result"><div className={`large-verdict ${analysis.verdict.toLowerCase()}`}>{verdictIcon}<span>{analysis.verdict}</span><strong>{analysis.score}/100</strong></div><Metrics/><div className="fee-table"><div><span>Sale price</span><strong>{money(product.buyBox)}</strong></div><div><span>Total acquisition cost</span><strong>-{money(analysis.totalCost)}</strong></div><div><span>Amazon fees</span><strong>-{money(analysis.totalFees)}</strong></div><div className="total"><span>Estimated profit</span><strong>{money(analysis.profit)}</strong></div></div></article></section></>;
  const HistoryPage = () => <><section className="page-intro page-intro-row"><div><span className="eyebrow">SCAN HISTORY</span><h2>Your sourcing trail</h2><p>Saved locally on this device for now.</p></div><div className="page-actions"><button className="secondary" onClick={exportHistory} disabled={!saved.length}><Download/>Export CSV</button><button className="danger-button" onClick={clearHistory} disabled={!saved.length}><Trash2/>Clear</button></div></section><article className="card table-card">{saved.length ? <div className="history-table"><div className="table-head"><span>Product</span><span>Cost</span><span>Profit</span><span>ROI</span><span>Decision</span><span>Date</span></div>{saved.map((item,i)=><div className="table-row" key={`${item.date}-${i}`}><span><strong>{item.title}</strong><small>{item.asin}</small></span><span>{money(item.cost)}</span><span>{money(item.profit)}</span><span>{item.roi.toFixed(1)}%</span><span><b className={`pill ${item.verdict.toLowerCase()}`}>{item.verdict}</b></span><span>{item.date}</span></div>)}</div> : <div className="empty-state large"><History/><strong>No saved scans yet</strong><span>Analyze a product and press the save icon.</span><button className="primary" onClick={()=>changePage('lookup')}>Analyze a product</button></div>}</article></>;
  const AlertsPage = () => <><section className="page-intro"><span className="eyebrow">ALERTS</span><h2>Watch the deal, not the screen</h2><p>These are local prototype rules. Cloud monitoring comes with the backend.</p></section><div className="alert-grid">{alerts.map(a=><article className="card alert-card" key={a.id}><div className="alert-icon"><Bell/></div><div><strong>{a.name}</strong><span>{a.detail}</span></div><button className={`toggle ${a.active?'on':''}`} onClick={()=>setAlerts(list=>list.map(x=>x.id===a.id?{...x,active:!x.active}:x))}><i/></button></article>)}<article className="card alert-add"><Sparkles/><strong>More alert types are coming</strong><span>Buy Box changes, rank drops, seller count, and restock signals.</span></article></div></>;
  const SettingsPage = () => <><section className="page-intro"><span className="eyebrow">SETTINGS</span><h2>Make FlipGauge yours</h2><p>Defaults are stored in your browser during Phase 1.</p></section><section className="settings-grid"><article className="card settings-card"><div className="settings-title"><UserRound/><div><strong>Profile</strong><span>Founder account preview</span></div></div><label>Display name<input defaultValue="Jason Sampson"/></label><label>Business name<input placeholder="Your sourcing business"/></label><label>Home marketplace<select defaultValue="US"><option value="US">Amazon.com (US)</option><option value="CA">Amazon.ca</option><option value="MX">Amazon.com.mx</option></select></label></article><article className="card settings-card"><div className="settings-title"><Gauge/><div><strong>Sourcing rules</strong><span>Used by the recommendation engine</span></div></div><label>Minimum ROI<div className="money-input suffix"><input defaultValue="35" type="number"/><span>%</span></div></label><label>Minimum profit<div className="money-input"><span>$</span><input defaultValue="5.00" type="number"/></div></label><label>Default tax rate<div className="money-input suffix"><input value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} type="number"/><span>%</span></div></label><button className="primary settings-save">Save preferences</button></article><article className="card settings-card full"><div className="settings-title"><ShieldCheck/><div><strong>Data connections</strong><span>No private keys belong in browser code</span></div></div><div className="connection-row"><div><strong>Amazon Selling Partner API</strong><span>Live fees, eligibility, offers, and catalog data</span></div><b>Not connected</b></div><div className="connection-row"><div><strong>Keepa API</strong><span>Historical pricing and rank data</span></div><b>Not connected</b></div></article></section></>;

  const pageTitle = navItems.find(x=>x.id===page)?.label || 'Settings';
  return <div className="app-shell"><Sidebar/>{mobileOpen && <button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close menu"/>}<main><header className="topbar"><button className="icon-button mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button><div><h1>{pageTitle}</h1><p>Fast product decisions without spreadsheet gymnastics.</p></div><div className="top-actions"><button className="secondary" onClick={()=>changePage('alerts')}><Bell size={18}/>Alerts</button><button className="avatar" onClick={()=>changePage('settings')}>JS</button></div></header>{page==='dashboard'&&<Dashboard/>}{page==='lookup'&&<LookupPage/>}{page==='history'&&<HistoryPage/>}{page==='alerts'&&<AlertsPage/>}{page==='calculator'&&<CalculatorPage/>}{page==='settings'&&<SettingsPage/>}</main>{scannerOpen&&<ScannerModal onClose={()=>setScannerOpen(false)} onScan={(value)=>{setScannerOpen(false);setQuery(value);lookup(value);}}/>}</div>;
}
