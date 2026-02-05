import { useState, useEffect } from "react";
import { useCards } from "@/hooks/use-cards";
import { IDCard } from "@/components/IDCard";
import { Printer, Search, LayoutGrid, Square, CheckSquare, Settings, ChevronDown, Ruler, Play, Pause, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

const CARD_SIZES = [
  { id: "cr80", name: "CR80 Standard", width: 85.6, height: 53.98, description: "بطاقة قياسية" },
  { id: "cr79", name: "CR79", width: 83.9, height: 51.0, description: "بطاقة صغيرة" },
  { id: "cr100", name: "CR100", width: 97.0, height: 67.0, description: "بطاقة كبيرة" },
  { id: "custom", name: "Custom Size", width: 85.6, height: 53.98, description: "أبعاد مخصصة" },
];

const ID_CARD_PRINTERS = [
  { id: "dascom-dc2300", name: "DASCOM DC 2300", type: "Direct-to-Card", recommended: true },
  { id: "dascom-dc7600", name: "DASCOM DC 7600", type: "Retransfer" },
  { id: "zebra-zc300", name: "Zebra ZC300", type: "Direct-to-Card" },
  { id: "zebra-zc350", name: "Zebra ZC350", type: "Direct-to-Card" },
  { id: "evolis-primacy2", name: "Evolis Primacy 2", type: "Direct-to-Card" },
  { id: "evolis-avansia", name: "Evolis Avansia", type: "Retransfer" },
  { id: "fargo-dtc1250e", name: "Fargo DTC1250e", type: "Direct-to-Card" },
  { id: "fargo-dtc4500e", name: "Fargo DTC4500e", type: "Direct-to-Card" },
  { id: "fargo-hdp5000", name: "Fargo HDP5000", type: "Retransfer" },
  { id: "magicard-rio", name: "Magicard Rio Pro 360", type: "Direct-to-Card" },
  { id: "magicard-600", name: "Magicard 600", type: "Direct-to-Card" },
  { id: "entrust-sigma", name: "Entrust Sigma DS2", type: "Direct-to-Card" },
  { id: "hiti-cs200e", name: "HiTi CS-200e", type: "Direct-to-Card" },
  { id: "idp-smart51", name: "IDP SMART-51", type: "Direct-to-Card" },
  { id: "system", name: "System Default Printer", type: "Any" },
];

const PRINT_QUALITY = [
  { id: "draft", name: "Draft", dpi: "150 DPI" },
  { id: "normal", name: "Normal", dpi: "300 DPI" },
  { id: "high", name: "High Quality", dpi: "300 DPI Enhanced" },
  { id: "photo", name: "Photo Quality", dpi: "600 DPI" },
];

const COLOR_MODES = [
  { id: "color", name: "Full Color (YMCKO)" },
  { id: "mono", name: "Monochrome (K)" },
  { id: "overlay", name: "Color + Overlay (YMCKO-K)" },
];

export default function PrintStation() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState("dascom-dc2300");
  const [printQuality, setPrintQuality] = useState("high");
  const [colorMode, setColorMode] = useState("color");
  const [copies, setCopies] = useState(1);
  const [duplex, setDuplex] = useState(true);
  const [cardSize, setCardSize] = useState("cr80");
  const [customWidth, setCustomWidth] = useState(85.6);
  const [customHeight, setCustomHeight] = useState(53.98);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printedCount, setPrintedCount] = useState(0);
  const [printPaused, setPrintPaused] = useState(false);
  const { data: cards, isLoading } = useCards();

  const currentSize = CARD_SIZES.find(s => s.id === cardSize) || CARD_SIZES[0];
  const cardWidth = cardSize === "custom" ? customWidth : currentSize.width;
  const cardHeight = cardSize === "custom" ? customHeight : currentSize.height;

  const filteredCards = cards?.filter(card => 
    card.name.toLowerCase().includes(search.toLowerCase()) || 
    card.idNumber.includes(search)
  ) || [];

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCards.map(c => c.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBatchPrint = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBatchPrinting(true);
    setPrintProgress(0);
    setPrintedCount(0);
    setPrintPaused(false);
    
    const totalCards = selectedIds.length * copies;
    
    for (let i = 0; i < totalCards; i++) {
      if (printPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!printPaused) {
              clearInterval(checkPause);
              resolve(true);
            }
          }, 100);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      setPrintedCount(i + 1);
      setPrintProgress(((i + 1) / totalCards) * 100);
    }
    
    setTimeout(() => {
      setIsBatchPrinting(false);
      window.print();
    }, 500);
  };

  const cancelBatchPrint = () => {
    setIsBatchPrinting(false);
    setPrintProgress(0);
    setPrintedCount(0);
    setPrintPaused(false);
  };

  const selectedCards = cards?.filter(c => selectedIds.includes(c.id)) || [];
  const currentPrinter = ID_CARD_PRINTERS.find(p => p.id === selectedPrinter);
  const totalPrintCount = selectedIds.length * copies;

  return (
    <div className="space-y-8">
      {/* Controls - Hidden during print */}
      <div className="no-print space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Print Station</h1>
            <p className="text-sm font-arabic text-muted-foreground">محطة الطباعة</p>
            <p className="text-muted-foreground mt-1">Select cards to print in batch grid layout.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-3 rounded-xl border border-border hover:bg-muted font-medium transition-colors flex items-center gap-2"
              data-testid="button-print-settings"
            >
              <Settings className="w-5 h-5" />
              Print Settings
            </button>
            <button 
              onClick={handleBatchPrint}
              disabled={selectedIds.length === 0 || isBatchPrinting}
              data-testid="button-batch-print"
              className="px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: SEU_GREY }}
            >
              <LayoutGrid className="w-5 h-5" />
              Batch Print
            </button>
            <button 
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              data-testid="button-print"
              className="px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: SEU_RED }}
            >
              <Printer className="w-5 h-5" />
              Print {selectedIds.length} Cards
            </button>
          </div>
        </div>

        {/* Batch Print Progress */}
        {isBatchPrinting && (
          <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl animate-pulse"
                  style={{ backgroundColor: `${SEU_RED}15` }}
                >
                  <Printer className="w-6 h-6" style={{ color: SEU_RED }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Batch Printing in Progress</h2>
                  <p className="text-sm font-arabic text-muted-foreground">جاري الطباعة الجماعية</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintPaused(!printPaused)}
                  className="p-3 rounded-xl border border-border hover:bg-muted transition-colors"
                  data-testid="button-pause-print"
                >
                  {printPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={cancelBatchPrint}
                  className="p-3 rounded-xl border border-border hover:bg-destructive/10 transition-colors text-destructive"
                  data-testid="button-cancel-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{printedCount} / {totalPrintCount} cards</span>
              </div>
              <Progress value={printProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {printPaused ? "Paused - Click play to continue" : "Processing cards for printing..."}
              </p>
            </div>
          </div>
        )}

        {/* Print Settings Panel */}
        {showSettings && (
          <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-6 animate-in slide-in-from-top-2 duration-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Print Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Printer Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ID Card Printer</label>
                <div className="relative">
                  <select 
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    data-testid="select-printer"
                  >
                    {ID_CARD_PRINTERS.map(printer => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name} {printer.recommended ? '(Recommended)' : ''} - {printer.type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
                {currentPrinter?.recommended && (
                  <p className="text-xs font-medium" style={{ color: SEU_RED }}>
                    DASCOM DC 2300 - Best for college ID cards
                  </p>
                )}
              </div>

              {/* Print Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Print Quality</label>
                <div className="relative">
                  <select 
                    value={printQuality}
                    onChange={(e) => setPrintQuality(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    data-testid="select-quality"
                  >
                    {PRINT_QUALITY.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.name} ({q.dpi})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Color Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color Mode</label>
                <div className="relative">
                  <select 
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    data-testid="select-color-mode"
                  >
                    {COLOR_MODES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Copies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Copies per Card</label>
                <input 
                  type="number"
                  min={1}
                  max={100}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  data-testid="input-copies"
                />
              </div>

              {/* Duplex */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Print Both Sides</label>
                <button
                  onClick={() => setDuplex(!duplex)}
                  className="w-full px-4 py-3 rounded-xl border font-medium transition-all flex items-center justify-between"
                  style={duplex 
                    ? { backgroundColor: `${SEU_RED}15`, borderColor: SEU_RED, color: SEU_RED }
                    : { backgroundColor: 'transparent', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
                  }
                  data-testid="button-duplex"
                >
                  <span>Duplex Printing (Front & Back)</span>
                  {duplex ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
              </div>

              {/* Card Size Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Card Dimensions
                </label>
                <div className="relative">
                  <select 
                    value={cardSize}
                    onChange={(e) => setCardSize(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    data-testid="select-card-size"
                  >
                    {CARD_SIZES.map(size => (
                      <option key={size.id} value={size.id}>
                        {size.name} ({size.width}×{size.height}mm)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Custom Dimensions */}
            {cardSize === "custom" && (
              <div className="mt-6 p-4 rounded-xl border border-dashed border-border bg-muted/50">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Custom Card Dimensions
                  <span className="text-xs font-arabic text-muted-foreground">أبعاد مخصصة</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Width (mm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min={30}
                      max={150}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 85.6)}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                      data-testid="input-custom-width"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Height (mm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min={20}
                      max={100}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 53.98)}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                      data-testid="input-custom-height"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Standard CR80: 85.6 × 53.98mm | Standard CR79: 83.9 × 51.0mm
                </p>
              </div>
            )}

            {/* Current Dimensions Display */}
            <div 
              className="mt-6 px-4 py-3 rounded-xl border font-medium text-sm inline-flex items-center gap-2"
              style={{ backgroundColor: `${SEU_GOLD}15`, borderColor: SEU_GOLD, color: '#5a4a1a' }}
            >
              <Ruler className="w-4 h-4" />
              Current: {cardWidth.toFixed(2)}mm × {cardHeight.toFixed(2)}mm
            </div>

            {/* Printer Info Box */}
            <div 
              className="mt-6 p-4 rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${SEU_GREY} 0%, #2a292e 100%)` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentPrinter?.name}</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Type: {currentPrinter?.type} | 
                    Quality: {PRINT_QUALITY.find(q => q.id === printQuality)?.dpi} | 
                    Mode: {COLOR_MODES.find(c => c.id === colorMode)?.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Total cards to print: {selectedIds.length} x {copies} = {selectedIds.length * copies} prints
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search to select..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-transparent focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                data-testid="input-search-cards"
              />
            </div>
            <button 
              onClick={selectAll}
              className="px-4 py-3 rounded-xl border border-border hover:bg-muted font-medium transition-colors flex items-center gap-2"
              data-testid="button-select-all"
            >
              {selectedIds.length === filteredCards.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              Select All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredCards.map(card => (
              <div 
                key={card.id}
                onClick={() => toggleSelection(card.id)}
                className="relative group cursor-pointer rounded-xl border-2 transition-all overflow-hidden"
                style={selectedIds.includes(card.id) 
                  ? { borderColor: SEU_RED, backgroundColor: `${SEU_RED}08` }
                  : { borderColor: 'transparent', backgroundColor: 'hsl(var(--muted) / 0.5)' }
                }
                data-testid={`card-select-${card.id}`}
              >
                <div className="aspect-[1.58/1] relative">
                  <img 
                    src={card.photoUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop"} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt={card.name}
                  />
                  {selectedIds.includes(card.id) && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: `${SEU_RED}30` }}
                    >
                      <div className="bg-white rounded-full p-1 shadow-sm" style={{ color: SEU_RED }}>
                        <CheckSquare className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs truncate text-foreground">{card.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{card.idNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Preview Area - Visible only on screen, styled for print via CSS */}
      <div className="print-only hidden">
        <div className="grid grid-cols-2 gap-4 p-0 m-0 w-full">
          {selectedCards.map(card => (
            <div key={card.id} className="break-inside-avoid mb-4">
              <IDCard card={card} scale={1} interactive={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="no-print max-w-7xl mx-auto bg-muted/50 rounded-xl p-8 border border-dashed border-border text-center">
        <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-foreground">Print Preview Area</h3>
        <p className="text-sm font-arabic text-muted-foreground mb-2">منطقة معاينة الطباعة</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cards selected above will be formatted for printing here. 
          Use the Print button to open the browser print dialog. 
          Ensure "Background Graphics" is enabled in print settings.
        </p>
        {currentPrinter && (
          <p className="text-xs text-muted-foreground mt-4">
            Selected Printer: <span className="font-medium">{currentPrinter.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
