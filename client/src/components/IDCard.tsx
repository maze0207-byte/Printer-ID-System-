import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@shared/schema";
import { cn } from "@/lib/utils";
import seuLogo from "@assets/Logo_-SEU_1770297195752.png";

interface IDCardProps {
  card: Partial<Card>;
  scale?: number;
  interactive?: boolean;
}

export function IDCard({ card, scale = 1, interactive = true }: IDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const data = {
    name: card.name || "FIRSTNAME LASTNAME",
    idNumber: card.idNumber || "00000000",
    type: card.type || "student",
    department: card.department || "Department Name",
    program: card.program || "Program Name",
    year: card.year || new Date().getFullYear().toString(),
    photoUrl: card.photoUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop",
  };

  const isStudent = data.type === 'student';
  
  /* SEU Brand Colors */
  const seuRed = '#b11b1d';
  const seuGold = '#ebc03f';
  const seuGrey = '#39383e';

  const CardFront = () => (
    <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
      {/* SEU Header with Red and Gold accent */}
      <div className="h-16 w-full relative z-10 bg-gradient-to-r from-[#39383e] to-[#4a494f]">
        {/* Gold accent stripe */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#ebc03f]" />
        
        {/* University branding */}
        <div className="absolute top-2 left-3 flex items-center gap-2">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5">
            <img src={seuLogo} alt="SEU" className="w-full h-full object-contain" />
          </div>
          <div className="text-white">
            <div className="text-[9px] font-bold tracking-wider leading-tight">SAXONY EGYPT</div>
            <div className="text-[7px] tracking-widest opacity-80">UNIVERSITY</div>
          </div>
        </div>
        
        {/* Card type badge */}
        <div 
          className="absolute top-2 right-3 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider"
          style={{ 
            backgroundColor: isStudent ? seuRed : seuGold,
            color: isStudent ? 'white' : seuGrey
          }}
        >
          {isStudent ? 'STUDENT' : 'STAFF'}
        </div>
        
        {/* Arabic text */}
        <div className="absolute bottom-3 right-3 text-[8px] text-white/70 font-arabic">
          جامعة ساكسوني مصر
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-row gap-3">
        {/* Photo Area */}
        <div className="w-20 h-26 flex-shrink-0 relative z-10 -mt-6">
          <div 
            className="w-full h-full rounded-md overflow-hidden bg-gray-100 shadow-lg"
            style={{ borderColor: seuGold, borderWidth: '2px' }}
          >
            <img 
              src={data.photoUrl} 
              alt={data.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop";
              }}
            />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col justify-center relative z-10 pt-2">
          <h1 
            className="font-display font-bold text-base leading-tight uppercase mb-2"
            style={{ color: seuGrey }}
          >
            {data.name}
          </h1>
          
          <div className="space-y-1.5">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: seuRed }}>
                ID Number
              </span>
              <span className="font-mono text-sm font-bold tracking-wide" style={{ color: seuGrey }}>
                {data.idNumber}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: seuRed }}>
                Department
              </span>
              <span className="text-xs font-medium text-gray-700 leading-tight">
                {data.department}
              </span>
            </div>

            {data.program && (
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: seuRed }}>
                  Program
                </span>
                <span className="text-xs font-medium text-gray-700 leading-tight">
                  {data.program}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with QR */}
      <div className="relative h-12 border-t border-gray-100 flex items-center justify-between px-3" style={{ backgroundColor: '#fafafa' }}>
        <div className="flex flex-col">
          <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: seuRed }}>
            Valid Through
          </span>
          <span className="text-xs font-bold" style={{ color: seuGrey }}>
            DEC {parseInt(data.year) + 4}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded border shadow-sm" style={{ borderColor: seuGold }}>
            <QRCodeSVG 
              value={JSON.stringify({ id: data.idNumber, name: data.name })} 
              size={36} 
              level="M"
              fgColor={seuGrey}
            />
          </div>
        </div>
      </div>
      
      {/* Decorative SEU logo watermark */}
      <img 
        src={seuLogo} 
        alt="" 
        className="absolute bottom-8 right-2 w-20 h-20 opacity-[0.03] pointer-events-none" 
      />
    </div>
  );

  const CardBack = () => (
    <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header stripe */}
      <div className="h-3 w-full" style={{ backgroundColor: seuGrey }}>
        <div className="h-0.5 w-full" style={{ backgroundColor: seuGold }} />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3">
        {/* SEU Logo */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm">
            <img src={seuLogo} alt="SEU" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <div className="text-[8px] font-bold tracking-wider" style={{ color: seuGrey }}>
              SAXONY EGYPT UNIVERSITY
            </div>
            <div className="text-[7px] font-arabic" style={{ color: seuGrey }}>
              جامعة ساكسوني مصر
            </div>
          </div>
        </div>

        <div className="space-y-1 max-w-[220px]">
          <h3 className="font-display font-bold text-[9px] uppercase tracking-wider" style={{ color: seuRed }}>
            Terms of Use
          </h3>
          <p className="text-[7px] text-gray-500 leading-tight">
            This card is the property of Saxony Egypt University. 
            If found, please return to the Security Office.
            Unauthorized use is strictly prohibited.
          </p>
        </div>

        {/* ID Barcode strip */}
        <div 
          className="w-full h-7 rounded flex items-center justify-center"
          style={{ backgroundColor: seuGrey }}
        >
          <span className="font-mono text-white text-[10px] tracking-[0.25em]">
            {data.idNumber}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100 w-full">
          <p className="text-[7px] uppercase font-bold tracking-wider mb-0.5" style={{ color: seuRed }}>
            Emergency Contact
          </p>
          <p className="text-[9px] font-bold" style={{ color: seuGrey }}>
            +20 2 123 456 789
          </p>
          <p className="text-[7px] text-gray-500">security@seu.edu.eg</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-2 w-full" style={{ backgroundColor: seuGold }} />
    </div>
  );

  return (
    <div 
      className="relative"
      style={{ 
        width: `${340 * scale}px`, 
        height: `${214 * scale}px`,
      }}
      onClick={() => interactive && setIsFlipped(!isFlipped)}
      data-testid="id-card"
    >
      <div 
        className={cn(
          "w-full h-full relative transition-transform duration-500 transform-style-3d shadow-xl rounded-xl",
          interactive && "cursor-pointer hover:shadow-2xl",
          isFlipped && "rotate-y-180"
        )}
      >
        <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden bg-white border border-gray-200/50">
          <CardFront />
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-white border border-gray-200/50">
          <CardBack />
        </div>
      </div>
    </div>
  );
}
