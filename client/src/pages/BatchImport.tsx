import { useState } from "react";
import Papa from "papaparse";
import { useBulkCreateCards } from "@/hooks/use-cards";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { type InsertCard } from "@shared/schema";
import { Link, useLocation } from "wouter";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';

export default function BatchImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<InsertCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const bulkCreate = useBulkCreateCards();
  const [, setLocation] = useLocation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFile(file);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const mappedData = results.data.map((row: any) => ({
            name: row.name || row.Name || "",
            idNumber: row.idNumber || row.ID || row.id_number || "",
            type: (row.type?.toLowerCase() === 'staff' ? 'staff' : 'student') as "student" | "staff",
            department: row.department || row.Department || "",
            program: row.program || row.Program || "",
            year: row.year || row.Year || new Date().getFullYear().toString(),
            email: row.email || row.Email || "",
            status: "active"
          }));
          
          if (mappedData.length === 0) {
            setError("CSV file is empty or formatted incorrectly.");
            return;
          }

          setParsedData(mappedData as InsertCard[]);
        } catch (err) {
          setError("Failed to parse CSV. Please check the file format.");
        }
      },
      error: () => setError("Error reading file.")
    });
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;

    bulkCreate.mutate(parsedData, {
      onSuccess: () => {
        toast({ 
          title: "Import Successful", 
          description: `Created ${parsedData.length} new ID cards.` 
        });
        setLocation("/cards");
      },
      onError: (err) => {
        toast({ 
          title: "Import Failed", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Batch Import</h1>
        <p className="text-sm font-arabic text-muted-foreground">استيراد دفعة</p>
        <p className="text-muted-foreground mt-1">Upload a CSV file to generate cards in bulk for Saxony Egypt University.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-8">
        <div 
          className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
          style={{ borderColor: SEU_GOLD }}
        >
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            data-testid="input-file-upload"
          />
          <div 
            className="p-4 rounded-full mb-4"
            style={{ backgroundColor: `${SEU_RED}15`, color: SEU_RED }}
          >
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Click to upload CSV</h3>
          <p className="text-sm text-muted-foreground mt-1">or drag and drop file here</p>
          {file && (
            <div 
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: `${SEU_GOLD}20`, color: '#5a4a1a' }}
            >
              <FileText className="w-4 h-4" />
              {file.name}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {parsedData.length > 0 && !error && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Preview ({parsedData.length} entries)</h3>
              <div 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${SEU_GOLD}20`, color: '#5a4a1a' }}
              >
                Ready to import
              </div>
            </div>
            
            <div className="border border-border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Dept</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedData.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-foreground">{row.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-foreground">{row.idNumber}</td>
                      <td className="px-4 py-2">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={row.type === 'student' 
                            ? { backgroundColor: `${SEU_RED}15`, color: SEU_RED }
                            : { backgroundColor: `${SEU_GOLD}30`, color: '#5a4a1a' }
                          }
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{row.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/cards">
                <button className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                onClick={handleImport}
                disabled={bulkCreate.isPending}
                data-testid="button-import"
                className="px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                style={{ backgroundColor: SEU_RED }}
              >
                {bulkCreate.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Import {parsedData.length} Cards
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <h4 className="text-sm font-bold text-foreground mb-2">CSV Format Requirements</h4>
          <p className="text-xs text-muted-foreground font-mono">
            name, idNumber, type, department, program, year, email
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Required columns: name, idNumber, department. Type defaults to 'student'.
          </p>
        </div>
      </div>
    </div>
  );
}
