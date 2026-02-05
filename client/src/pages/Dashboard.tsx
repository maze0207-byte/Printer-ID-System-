import { useCards } from "@/hooks/use-cards";
import { Users, GraduationCap, Briefcase, Printer, CreditCard, UploadCloud } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Link } from "wouter";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

export default function Dashboard() {
  const { data: cards, isLoading } = useCards();

  if (isLoading) {
    return (
      <div className="p-8 md:p-12 animate-pulse space-y-8">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const allCards = cards || [];
  const students = allCards.filter(c => c.type === 'student');
  const staff = allCards.filter(c => c.type === 'staff');
  
  const stats = [
    { label: "Total Cards", labelAr: "إجمالي البطاقات", value: allCards.length, icon: Users, color: SEU_GREY },
    { label: "Students", labelAr: "الطلاب", value: students.length, icon: GraduationCap, color: SEU_RED },
    { label: "Staff", labelAr: "الموظفين", value: staff.length, icon: Briefcase, color: '#8b6914' },
    { label: "Active", labelAr: "نشط", value: allCards.filter(c => c.status === 'active').length, icon: Printer, color: '#184264' },
  ];

  const chartData = [
    { name: 'Student', value: students.length, color: SEU_RED },
    { name: 'Staff', value: staff.length, color: SEU_GOLD },
  ];

  const deptDataMap = allCards.reduce((acc, card) => {
    acc[card.department] = (acc[card.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const deptData = Object.entries(deptDataMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with SEU branding */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{ backgroundColor: SEU_RED, borderColor: SEU_GOLD }}
            >
              <span className="text-white text-xs font-bold">SEU</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-arabic">لوحة التحكم</p>
            </div>
          </div>
          <p className="text-muted-foreground">Overview of ID card issuance and distribution at Saxony Egypt University.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: SEU_GOLD }}></div>
          <span>System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-card-border hover:-translate-y-1 transition-transform duration-300"
            data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground/70 font-arabic">{stat.labelAr}</p>
                <h3 className="text-3xl font-bold font-display mt-2 text-foreground">{stat.value}</h3>
              </div>
              <div 
                className="p-3 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-card-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold font-display">Distribution by Department</h3>
              <p className="text-xs text-muted-foreground font-arabic">التوزيع حسب القسم</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: SEU_GREY }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white'
                  }} 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="count" fill={SEU_RED} radius={[0, 6, 6, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-card-border">
          <div className="mb-6">
            <h3 className="text-lg font-bold font-display">Card Types</h3>
            <p className="text-xs text-muted-foreground font-arabic">أنواع البطاقات</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEU_RED }} />
              <span className="text-muted-foreground">Student</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEU_GOLD }} />
              <span className="text-muted-foreground">Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/design" className="group" data-testid="link-create-card">
          <div 
            className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden h-full transition-transform hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${SEU_RED} 0%, #8a1518 100%)` }}
          >
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
              style={{ backgroundColor: SEU_GOLD }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-display mb-1">Create New Card</h3>
              <p className="text-sm font-arabic opacity-80 mb-3">إنشاء بطاقة جديدة</p>
              <p className="opacity-90 mb-6">Design and issue a new ID card for a student or staff member.</p>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                Open Designer <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <CreditCard className="absolute -bottom-4 -right-4 w-40 h-40 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </Link>
        
        <Link href="/batch" className="group" data-testid="link-batch-import">
          <div className="bg-card rounded-2xl p-8 border border-card-border shadow-lg shadow-black/5 hover:border-primary/50 transition-all h-full relative overflow-hidden hover:-translate-y-1">
            <div 
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ backgroundColor: SEU_GOLD }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-display mb-1 text-foreground">Batch Import</h3>
              <p className="text-sm font-arabic text-muted-foreground mb-3">استيراد دفعة</p>
              <p className="text-muted-foreground mb-6">Upload CSV data to generate multiple cards at once.</p>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-foreground transition-colors"
                style={{ backgroundColor: `${SEU_GOLD}20` }}
              >
                Upload CSV <UploadCloud className="w-4 h-4" />
              </div>
            </div>
            <Briefcase className="absolute -bottom-4 -right-4 w-40 h-40 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </Link>
      </div>
    </div>
  );
}
