import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCardSchema, type InsertCard } from "@shared/schema";
import { useCreateCard, useUpdateCard, useCard } from "@/hooks/use-cards";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { IDCard } from "@/components/IDCard";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

export default function CardDesigner() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const searchParams = new URLSearchParams(searchStr);
  const editId = searchParams.get("edit");
  const { toast } = useToast();

  const { data: existingCard, isLoading: isLoadingCard } = useCard(editId ? parseInt(editId) : 0);
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();

  const form = useForm<InsertCard>({
    resolver: zodResolver(insertCardSchema),
    defaultValues: {
      name: "",
      idNumber: "",
      type: "student",
      department: "",
      program: "",
      year: new Date().getFullYear().toString(),
      photoUrl: "",
      email: "",
      status: "active"
    }
  });

  const previewValues = form.watch();

  useEffect(() => {
    if (existingCard) {
      form.reset({
        name: existingCard.name,
        idNumber: existingCard.idNumber,
        type: existingCard.type as "student" | "staff",
        department: existingCard.department,
        program: existingCard.program || "",
        year: existingCard.year || new Date().getFullYear().toString(),
        photoUrl: existingCard.photoUrl || "",
        email: existingCard.email || "",
        status: existingCard.status || "active"
      });
    }
  }, [existingCard, form]);

  const onSubmit = (data: InsertCard) => {
    if (editId) {
      updateMutation.mutate({ id: parseInt(editId), ...data }, {
        onSuccess: () => {
          toast({ title: "Card Updated", description: "Changes saved successfully." });
          setLocation("/cards");
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({ title: "Card Created", description: "New ID card has been issued." });
          setLocation("/cards");
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (editId && isLoadingCard) return (
    <div className="p-12 flex justify-center">
      <Loader2 className="animate-spin w-8 h-8" style={{ color: SEU_RED }} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)]">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setLocation("/cards")} 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{editId ? "Edit Card" : "New Card"}</h1>
            <p className="text-sm text-muted-foreground font-arabic">
              {editId ? "تعديل البطاقة" : "بطاقة جديدة"}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-card-border p-6 flex-1 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <div className="flex p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => form.setValue('type', 'student')}
                    data-testid="button-type-student"
                    className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
                    style={previewValues.type === 'student' 
                      ? { backgroundColor: SEU_RED, color: 'white' } 
                      : { color: SEU_GREY }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue('type', 'staff')}
                    data-testid="button-type-staff"
                    className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
                    style={previewValues.type === 'staff' 
                      ? { backgroundColor: SEU_GOLD, color: '#3d3200' } 
                      : { color: SEU_GREY }}
                  >
                    Staff
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ID Number</label>
                <input 
                  {...form.register("idNumber")} 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="12345678"
                  data-testid="input-id-number"
                />
                {form.formState.errors.idNumber && <p className="text-xs text-red-500">{form.formState.errors.idNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input 
                {...form.register("name")} 
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="Ahmed Mohamed"
                data-testid="input-name"
              />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Photo URL</label>
              <input 
                {...form.register("photoUrl")} 
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="https://..."
                data-testid="input-photo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department</label>
              <input 
                {...form.register("department")} 
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="Faculty of Engineering"
                data-testid="input-department"
              />
            </div>

            {previewValues.type === 'student' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Program / Major</label>
                <input 
                  {...form.register("program")} 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="B.Sc. Mechanical Engineering"
                  data-testid="input-program"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year Issued</label>
                <input 
                  {...form.register("year")} 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="2024"
                  data-testid="input-year"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email (Optional)</label>
                <input 
                  {...form.register("email")} 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="ahmed@seu.edu.eg"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isPending}
                data-testid="button-submit"
                className="w-full py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: SEU_RED }}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editId ? "Update Card" : "Issue Card"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-7 flex flex-col h-full bg-muted/30 rounded-3xl border-2 border-dashed border-border p-8 items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-display font-bold text-foreground">Live Preview</h2>
            <p className="text-sm text-muted-foreground font-arabic">معاينة مباشرة</p>
            <p className="text-xs text-muted-foreground">Click card to flip</p>
          </div>

          <div className="transform scale-110 md:scale-125 transition-transform duration-500">
            <IDCard card={previewValues} />
          </div>

          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEU_RED }}></div> Student
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEU_GOLD }}></div> Staff
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
