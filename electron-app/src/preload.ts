import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Colleges
  getColleges: () => ipcRenderer.invoke('colleges:list'),
  createCollege: (data: any) => ipcRenderer.invoke('colleges:create', data),
  deleteCollege: (id: number) => ipcRenderer.invoke('colleges:delete', id),

  // Departments
  getDepartments: (collegeId?: number) => ipcRenderer.invoke('departments:list', collegeId),
  createDepartment: (data: any) => ipcRenderer.invoke('departments:create', data),
  deleteDepartment: (id: number) => ipcRenderer.invoke('departments:delete', id),

  // Programs
  getPrograms: (departmentId?: number) => ipcRenderer.invoke('programs:list', departmentId),
  createProgram: (data: any) => ipcRenderer.invoke('programs:create', data),
  deleteProgram: (id: number) => ipcRenderer.invoke('programs:delete', id),

  // Levels
  getLevels: () => ipcRenderer.invoke('levels:list'),

  // Persons
  getPersons: (filters?: any) => ipcRenderer.invoke('persons:list', filters),
  createPerson: (data: any) => ipcRenderer.invoke('persons:create', data),
  updatePerson: (id: number, data: any) => ipcRenderer.invoke('persons:update', id, data),
  deletePerson: (id: number) => ipcRenderer.invoke('persons:delete', id),

  // ID Generation
  generateId: (type: string, collegeCode?: string) => ipcRenderer.invoke('generate-id', type, collegeCode),

  // Cards
  getCards: (filters?: any) => ipcRenderer.invoke('cards:list', filters),
  createCard: (data: any) => ipcRenderer.invoke('cards:create', data),
  bulkCreateCards: (cards: any[]) => ipcRenderer.invoke('cards:bulk-create', cards),

  // Templates
  getTemplates: () => ipcRenderer.invoke('templates:list'),
  createTemplate: (data: any) => ipcRenderer.invoke('templates:create', data),

  // Statistics
  getDashboardStats: () => ipcRenderer.invoke('stats:dashboard'),

  // Backup
  exportBackup: () => ipcRenderer.invoke('backup:export'),
  importBackup: () => ipcRenderer.invoke('backup:import'),

  // Print
  printCards: (options: any) => ipcRenderer.invoke('print:cards', options),

  // Audit
  logAction: (data: any) => ipcRenderer.invoke('audit:log', data),
  getAuditLogs: (limit?: number) => ipcRenderer.invoke('audit:list', limit),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
