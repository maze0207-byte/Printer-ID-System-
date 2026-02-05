import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, GraduationCap, BookOpen, Layers, Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import type { College, Department, Program, Level } from "@shared/schema";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

export default function StructureManager() {
  const { toast } = useToast();
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCollegeDialogOpen, setIsCollegeDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);

  const { data: colleges = [], isLoading: loadingColleges } = useQuery<College[]>({
    queryKey: ['/api/colleges'],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments', { collegeId: selectedCollege?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/departments?collegeId=${selectedCollege?.id}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      return res.json();
    },
    enabled: !!selectedCollege,
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ['/api/programs', { departmentId: selectedDepartment?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/programs?departmentId=${selectedDepartment?.id}`);
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    },
    enabled: !!selectedDepartment,
  });

  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['/api/levels'],
  });

  const createCollegeMutation = useMutation({
    mutationFn: (data: { nameEn: string; nameAr: string; code: string }) =>
      apiRequest('POST', '/api/colleges', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colleges'] });
      setIsCollegeDialogOpen(false);
      toast({ title: "College created successfully" });
    },
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (data: { collegeId: number; nameEn: string; nameAr: string; code: string }) =>
      apiRequest('POST', '/api/departments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setIsDepartmentDialogOpen(false);
      toast({ title: "Department created successfully" });
    },
  });

  const createProgramMutation = useMutation({
    mutationFn: (data: { departmentId: number; nameEn: string; nameAr: string; code: string; durationYears?: number }) =>
      apiRequest('POST', '/api/programs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      setIsProgramDialogOpen(false);
      toast({ title: "Program created successfully" });
    },
  });

  const deleteCollegeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/colleges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colleges'] });
      setSelectedCollege(null);
      toast({ title: "College deleted" });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setSelectedDepartment(null);
      toast({ title: "Department deleted" });
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/programs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      toast({ title: "Program deleted" });
    },
  });

  const handleCreateCollege = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCollegeMutation.mutate({
      nameEn: formData.get('nameEn') as string,
      nameAr: formData.get('nameAr') as string,
      code: formData.get('code') as string,
    });
  };

  const handleCreateDepartment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCollege) return;
    const formData = new FormData(e.currentTarget);
    createDepartmentMutation.mutate({
      collegeId: selectedCollege.id,
      nameEn: formData.get('nameEn') as string,
      nameAr: formData.get('nameAr') as string,
      code: formData.get('code') as string,
    });
  };

  const handleCreateProgram = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    const formData = new FormData(e.currentTarget);
    createProgramMutation.mutate({
      departmentId: selectedDepartment.id,
      nameEn: formData.get('nameEn') as string,
      nameAr: formData.get('nameAr') as string,
      code: formData.get('code') as string,
      durationYears: parseInt(formData.get('durationYears') as string) || 4,
    });
  };

  if (loadingColleges) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: SEU_GREY }}>
            University Structure
          </h1>
          <p className="text-sm text-muted-foreground font-arabic">الهيكل التنظيمي للجامعة</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="w-3 h-3" />
            {colleges.length} Colleges
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Layers className="w-3 h-3" />
            {levels.length} Levels
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colleges Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: SEU_RED }} />
              Colleges
              <span className="text-xs font-arabic text-muted-foreground">الكليات</span>
            </CardTitle>
            <Dialog open={isCollegeDialogOpen} onOpenChange={setIsCollegeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-add-college">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New College</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCollege} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English)</Label>
                    <Input id="nameEn" name="nameEn" required data-testid="input-college-name-en" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Name (Arabic)</Label>
                    <Input id="nameAr" name="nameAr" className="font-arabic text-right" required data-testid="input-college-name-ar" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" name="code" placeholder="e.g., ENG" required data-testid="input-college-code" />
                  </div>
                  <Button type="submit" className="w-full" style={{ backgroundColor: SEU_RED }} data-testid="button-submit-college">
                    Create College
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {colleges.map((college) => (
              <div
                key={college.id}
                onClick={() => { setSelectedCollege(college); setSelectedDepartment(null); }}
                data-testid={`college-item-${college.id}`}
                className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group ${
                  selectedCollege?.id === college.id 
                    ? 'bg-primary/10 border border-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{college.nameEn}</div>
                  <div className="text-xs text-muted-foreground font-arabic">{college.nameAr}</div>
                  <Badge variant="secondary" className="mt-1 text-[10px]">{college.code}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); deleteCollegeMutation.mutate(college.id); }}
                    data-testid={`delete-college-${college.id}`}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
            {colleges.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No colleges yet</p>
            )}
          </CardContent>
        </Card>

        {/* Departments Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" style={{ color: SEU_GOLD }} />
              Departments
              <span className="text-xs font-arabic text-muted-foreground">الأقسام</span>
            </CardTitle>
            {selectedCollege && (
              <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-add-department">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Department to {selectedCollege.nameEn}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deptNameEn">Name (English)</Label>
                      <Input id="deptNameEn" name="nameEn" required data-testid="input-dept-name-en" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deptNameAr">Name (Arabic)</Label>
                      <Input id="deptNameAr" name="nameAr" className="font-arabic text-right" required data-testid="input-dept-name-ar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deptCode">Code</Label>
                      <Input id="deptCode" name="code" placeholder="e.g., CS" required data-testid="input-dept-code" />
                    </div>
                    <Button type="submit" className="w-full" style={{ backgroundColor: SEU_RED }} data-testid="button-submit-dept">
                      Create Department
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedCollege ? (
              <p className="text-sm text-muted-foreground text-center py-4">Select a college first</p>
            ) : departments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No departments yet</p>
            ) : (
              departments.filter(d => d.collegeId === selectedCollege.id).map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept)}
                  data-testid={`department-item-${dept.id}`}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group ${
                    selectedDepartment?.id === dept.id 
                      ? 'bg-accent/20 border border-accent' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{dept.nameEn}</div>
                    <div className="text-xs text-muted-foreground font-arabic">{dept.nameAr}</div>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{dept.code}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); deleteDepartmentMutation.mutate(dept.id); }}
                      data-testid={`delete-dept-${dept.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Programs Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: SEU_GREY }} />
              Programs
              <span className="text-xs font-arabic text-muted-foreground">البرامج</span>
            </CardTitle>
            {selectedDepartment && (
              <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-add-program">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Program to {selectedDepartment.nameEn}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProgram} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="progNameEn">Name (English)</Label>
                      <Input id="progNameEn" name="nameEn" required data-testid="input-prog-name-en" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progNameAr">Name (Arabic)</Label>
                      <Input id="progNameAr" name="nameAr" className="font-arabic text-right" required data-testid="input-prog-name-ar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progCode">Code</Label>
                      <Input id="progCode" name="code" placeholder="e.g., BSE" required data-testid="input-prog-code" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="durationYears">Duration (Years)</Label>
                      <Input id="durationYears" name="durationYears" type="number" defaultValue="4" data-testid="input-prog-duration" />
                    </div>
                    <Button type="submit" className="w-full" style={{ backgroundColor: SEU_RED }} data-testid="button-submit-prog">
                      Create Program
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedDepartment ? (
              <p className="text-sm text-muted-foreground text-center py-4">Select a department first</p>
            ) : programs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No programs yet</p>
            ) : (
              programs.filter(p => p.departmentId === selectedDepartment.id).map((prog) => (
                <div
                  key={prog.id}
                  data-testid={`program-item-${prog.id}`}
                  className="p-3 rounded-lg hover:bg-muted transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-sm">{prog.nameEn}</div>
                    <div className="text-xs text-muted-foreground font-arabic">{prog.nameAr}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{prog.code}</Badge>
                      <Badge variant="outline" className="text-[10px]">{prog.durationYears} years</Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteProgramMutation.mutate(prog.id)}
                    data-testid={`delete-prog-${prog.id}`}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Levels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: SEU_RED }} />
            Academic Levels
            <span className="text-xs font-arabic text-muted-foreground">المستويات الدراسية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {levels.map((level) => (
              <div
                key={level.id}
                className="px-4 py-2 rounded-lg border bg-muted/50 flex items-center gap-2"
                data-testid={`level-item-${level.id}`}
              >
                <Badge style={{ backgroundColor: SEU_RED }}>{level.order}</Badge>
                <div>
                  <div className="text-sm font-medium">{level.nameEn}</div>
                  <div className="text-xs text-muted-foreground font-arabic">{level.nameAr}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
