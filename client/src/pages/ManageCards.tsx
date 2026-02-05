import { useState } from "react";
import { useCards, useDeleteCard } from "@/hooks/use-cards";
import { Search, Trash2, Edit, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

export default function ManageCards() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'student' | 'staff'>('all');
  const { data: cards, isLoading } = useCards();
  const deleteMutation = useDeleteCard();
  const { toast } = useToast();

  const filteredCards = cards?.filter(card => {
    const matchesSearch = 
      card.name.toLowerCase().includes(search.toLowerCase()) || 
      card.idNumber.includes(search) || 
      card.department.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'all' || card.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: "Card deleted", description: "The ID card has been removed." });
        }
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Manage Cards</h1>
          <p className="text-sm font-arabic text-muted-foreground">إدارة البطاقات</p>
          <p className="text-muted-foreground mt-1">Search, edit, and print issued ID cards.</p>
        </div>
        <Link href="/design" data-testid="button-new-card">
          <button 
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            style={{ backgroundColor: SEU_RED }}
          >
            <Plus className="w-4 h-4" /> New Card
          </button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or department..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-transparent focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('all')}
              data-testid="filter-all"
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${filterType === 'all' ? 'text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              style={filterType === 'all' ? { backgroundColor: `${SEU_GOLD}30` } : {}}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('student')}
              data-testid="filter-student"
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${filterType === 'student' ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`}
              style={filterType === 'student' ? { backgroundColor: SEU_RED } : {}}
            >
              Students
            </button>
            <button 
              onClick={() => setFilterType('staff')}
              data-testid="filter-staff"
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${filterType === 'staff' ? 'text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              style={filterType === 'staff' ? { backgroundColor: SEU_GOLD, color: '#3d3200' } : {}}
            >
              Staff
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading cards...</div>
        ) : filteredCards?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No cards found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Card Holder</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">ID Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCards?.map((card) => (
                  <tr key={card.id} className="hover:bg-muted/30 transition-colors group" data-testid={`card-row-${card.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full overflow-hidden border-2"
                          style={{ borderColor: card.type === 'student' ? SEU_RED : SEU_GOLD }}
                        >
                          <img src={card.photoUrl || ""} alt={card.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{card.name}</p>
                          <p className="text-xs text-muted-foreground">{card.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-foreground">{card.idNumber}</td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={
                          card.type === 'student' 
                            ? { backgroundColor: `${SEU_RED}15`, color: SEU_RED } 
                            : { backgroundColor: `${SEU_GOLD}40`, color: '#5a4a1a' }
                        }
                      >
                        {card.type === 'student' ? 'Student' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{card.department}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/design?edit=${card.id}`}>
                          <button 
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                            style={{ backgroundColor: `${SEU_RED}10` }}
                            data-testid={`button-edit-${card.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(card.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          data-testid={`button-delete-${card.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
