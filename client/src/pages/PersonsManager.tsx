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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, UserCircle, GraduationCap, Briefcase, Users, AlertCircle, CheckCircle } from "lucide-react";
import type { Person, College, Department, Level } from "@shared/schema";

const SEU_RED = '#b11b1d';
const SEU_GOLD = '#ebc03f';
const SEU_GREY = '#39383e';

export default function PersonsManager() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { data: persons = [], isLoading } = useQuery<Person[]>({
    queryKey: ['/api/persons', { search, type: filterType, status: filterStatus }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      const url = `/api/persons${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch persons');
      return res.json();
    },
  });

  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ['/api/colleges'],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['/api/levels'],
  });

  const generateIdMutation = useMutation({
    mutationFn: (data: { type: string; collegeCode?: string }) =>
      apiRequest('POST', '/api/generate-id', data),
  });

  const createPersonMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/persons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      setIsAddDialogOpen(false);
      toast({ title: "Person added successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PUT', `/api/persons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      setSelectedPerson(null);
      toast({ title: "Person updated successfully" });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/persons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      toast({ title: "Person deleted" });
    },
  });

  const handleAddPerson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const collegeId = formData.get('collegeId');
    
    let universityId = formData.get('universityId') as string;
    if (!universityId || universityId.trim() === '') {
      try {
        const college = colleges.find(c => c.id === Number(collegeId));
        const response = await generateIdMutation.mutateAsync({ type, collegeCode: college?.code });
        const result = await response.json();
        universityId = result.universityId;
      } catch (err) {
        toast({ title: "Error generating ID", variant: "destructive" });
        return;
      }
    }

    createPersonMutation.mutate({
      type,
      universityId,
      fullNameEn: formData.get('fullNameEn'),
      fullNameAr: formData.get('fullNameAr') || null,
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      nationalId: formData.get('nationalId') || null,
      collegeId: collegeId ? Number(collegeId) : null,
      departmentId: formData.get('departmentId') ? Number(formData.get('departmentId')) : null,
      levelId: formData.get('levelId') ? Number(formData.get('levelId')) : null,
      position: formData.get('position') || null,
      status: 'active',
    });
  };

  const filteredPersons = persons.filter(p => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.fullNameEn.toLowerCase().includes(searchLower) ||
        p.universityId.toLowerCase().includes(searchLower) ||
        (p.email && p.email.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700';
      case 'suspended': return 'bg-yellow-500/10 text-yellow-700';
      case 'expired': return 'bg-red-500/10 text-red-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'staff': return <Briefcase className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: SEU_GREY }}>
            Persons Management
          </h1>
          <p className="text-sm text-muted-foreground font-arabic">إدارة الطلاب والموظفين والزوار</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: SEU_RED }} data-testid="button-add-person">
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger data-testid="select-person-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="universityId">University ID (auto-generated if empty)</Label>
                  <Input id="universityId" name="universityId" placeholder="Leave empty for auto-generation" data-testid="input-university-id" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullNameEn">Full Name (English) *</Label>
                  <Input id="fullNameEn" name="fullNameEn" required data-testid="input-name-en" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullNameAr">Full Name (Arabic)</Label>
                  <Input id="fullNameAr" name="fullNameAr" className="font-arabic text-right" data-testid="input-name-ar" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" data-testid="input-phone" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input id="nationalId" name="nationalId" data-testid="input-national-id" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position (for staff)</Label>
                  <Input id="position" name="position" data-testid="input-position" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeId">College</Label>
                  <Select name="collegeId">
                    <SelectTrigger data-testid="select-college">
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select name="departmentId">
                    <SelectTrigger data-testid="select-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="levelId">Level</Label>
                  <Select name="levelId">
                    <SelectTrigger data-testid="select-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" style={{ backgroundColor: SEU_RED }} disabled={createPersonMutation.isPending} data-testid="button-submit-person">
                {createPersonMutation.isPending ? 'Creating...' : 'Create Person'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-persons"
                />
              </div>
            </div>
            <Tabs value={filterType} onValueChange={setFilterType}>
              <TabsList>
                <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
                <TabsTrigger value="student" data-testid="filter-students">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="staff" data-testid="filter-staff">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Staff
                </TabsTrigger>
                <TabsTrigger value="visitor" data-testid="filter-visitors">
                  <Users className="w-4 h-4 mr-1" />
                  Visitors
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${SEU_GREY}15` }}>
                <UserCircle className="w-5 h-5" style={{ color: SEU_GREY }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{persons.length}</p>
                <p className="text-xs text-muted-foreground">Total Persons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${SEU_RED}15` }}>
                <GraduationCap className="w-5 h-5" style={{ color: SEU_RED }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{persons.filter(p => p.type === 'student').length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${SEU_GOLD}30` }}>
                <Briefcase className="w-5 h-5" style={{ color: '#8b6914' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{persons.filter(p => p.type === 'staff').length}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{persons.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Person</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">University ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No persons found
                    </td>
                  </tr>
                ) : (
                  filteredPersons.map((person) => {
                    const dept = departments.find(d => d.id === person.departmentId);
                    return (
                      <tr key={person.id} className="border-b hover:bg-muted/30" data-testid={`person-row-${person.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              {person.photoUrl ? (
                                <img src={person.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <UserCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{person.fullNameEn}</div>
                              {person.fullNameAr && (
                                <div className="text-xs text-muted-foreground font-arabic">{person.fullNameAr}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{person.universityId}</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="gap-1 capitalize">
                            {getTypeIcon(person.type)}
                            {person.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {dept?.nameEn || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(person.status)}>
                            {person.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setSelectedPerson(person)}
                              data-testid={`edit-person-${person.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deletePersonMutation.mutate(person.id)}
                              data-testid={`delete-person-${person.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
