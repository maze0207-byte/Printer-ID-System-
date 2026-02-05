import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let db: SqlJsDatabase | null = null;
let dbPath: string = '';

const isDev = process.env.NODE_ENV === 'development';

function saveDatabase() {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

async function initDatabase() {
  const userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'id-forge.db');
  
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    -- Colleges
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Departments
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Programs
    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      code TEXT NOT NULL,
      duration_years INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Levels
    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      "order" INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Persons
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      university_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('student', 'staff', 'visitor')),
      full_name_en TEXT NOT NULL,
      full_name_ar TEXT,
      email TEXT,
      phone TEXT,
      national_id TEXT,
      photo_url TEXT,
      college_id INTEGER REFERENCES colleges(id),
      department_id INTEGER REFERENCES departments(id),
      program_id INTEGER REFERENCES programs(id),
      level_id INTEGER REFERENCES levels(id),
      position TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cards
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
      card_number TEXT,
      issue_date DATE DEFAULT (date('now')),
      expiry_date DATE,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'suspended', 'revoked')),
      print_count INTEGER DEFAULT 0,
      last_printed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      name TEXT NOT NULL,
      id_number TEXT NOT NULL,
      type TEXT NOT NULL,
      department TEXT NOT NULL,
      program TEXT,
      year TEXT,
      photo_url TEXT,
      email TEXT
    );

    -- Card Templates
    CREATE TABLE IF NOT EXISTS card_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      width_mm REAL NOT NULL DEFAULT 85.6,
      height_mm REAL NOT NULL DEFAULT 53.98,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Users (for access control)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'operator', 'viewer')),
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    -- Audit Log
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ID Sequences
    CREATE TABLE IF NOT EXISTS id_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefix TEXT NOT NULL,
      year INTEGER NOT NULL,
      next_number INTEGER DEFAULT 1,
      UNIQUE(prefix, year)
    );

    -- Settings
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`INSERT OR IGNORE INTO card_templates (id, name, width_mm, height_mm, is_default) VALUES (1, 'CR80 Standard', 85.6, 53.98, 1)`);
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) VALUES (1, 'admin', '$2b$10$default', 'Administrator', 'admin')`);
  db.run(`INSERT OR IGNORE INTO levels (id, name_en, name_ar, "order") VALUES (1, 'Level 1 - Freshman', 'المستوى الأول', 1)`);
  db.run(`INSERT OR IGNORE INTO levels (id, name_en, name_ar, "order") VALUES (2, 'Level 2 - Sophomore', 'المستوى الثاني', 2)`);
  db.run(`INSERT OR IGNORE INTO levels (id, name_en, name_ar, "order") VALUES (3, 'Level 3 - Junior', 'المستوى الثالث', 3)`);
  db.run(`INSERT OR IGNORE INTO levels (id, name_en, name_ar, "order") VALUES (4, 'Level 4 - Senior', 'المستوى الرابع', 4)`);

  saveDatabase();
  console.log('Database initialized at:', dbPath);
  return db;
}

function queryAll(sql: string, params: any[] = []): any[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql: string, params: any[] = []): any {
  const results = queryAll(sql, params);
  return results[0] || null;
}

function runSql(sql: string, params: any[] = []): { lastId: number; changes: number } {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  const lastId = (db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] as number) || 0;
  const changes = db.getRowsModified();
  saveDatabase();
  return { lastId, changes };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    title: 'ID Forge - SEU ID Card Management',
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      saveDatabase();
      db.close();
    }
    app.quit();
  }
});

// Colleges
ipcMain.handle('colleges:list', () => {
  return queryAll('SELECT * FROM colleges ORDER BY name_en');
});

ipcMain.handle('colleges:create', (event, data: any) => {
  const result = runSql('INSERT INTO colleges (name_en, name_ar, code) VALUES (?, ?, ?)', 
    [data.nameEn, data.nameAr, data.code]);
  return { id: result.lastId, ...data };
});

ipcMain.handle('colleges:delete', (event, id: number) => {
  runSql('DELETE FROM colleges WHERE id = ?', [id]);
  return true;
});

// Departments
ipcMain.handle('departments:list', (event, collegeId?: number) => {
  if (collegeId) {
    return queryAll('SELECT * FROM departments WHERE college_id = ? ORDER BY name_en', [collegeId]);
  }
  return queryAll('SELECT * FROM departments ORDER BY name_en');
});

ipcMain.handle('departments:create', (event, data: any) => {
  const result = runSql('INSERT INTO departments (college_id, name_en, name_ar, code) VALUES (?, ?, ?, ?)',
    [data.collegeId, data.nameEn, data.nameAr, data.code]);
  return { id: result.lastId, ...data };
});

ipcMain.handle('departments:delete', (event, id: number) => {
  runSql('DELETE FROM departments WHERE id = ?', [id]);
  return true;
});

// Programs
ipcMain.handle('programs:list', (event, departmentId?: number) => {
  if (departmentId) {
    return queryAll('SELECT * FROM programs WHERE department_id = ? ORDER BY name_en', [departmentId]);
  }
  return queryAll('SELECT * FROM programs ORDER BY name_en');
});

ipcMain.handle('programs:create', (event, data: any) => {
  const result = runSql('INSERT INTO programs (department_id, name_en, name_ar, code, duration_years) VALUES (?, ?, ?, ?, ?)',
    [data.departmentId, data.nameEn, data.nameAr, data.code, data.durationYears || 4]);
  return { id: result.lastId, ...data };
});

ipcMain.handle('programs:delete', (event, id: number) => {
  runSql('DELETE FROM programs WHERE id = ?', [id]);
  return true;
});

// Levels
ipcMain.handle('levels:list', () => {
  return queryAll('SELECT * FROM levels ORDER BY "order"');
});

// Persons
ipcMain.handle('persons:list', (event, filters?: any) => {
  let sql = 'SELECT * FROM persons WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.search) {
    sql += ' AND (full_name_en LIKE ? OR full_name_ar LIKE ? OR university_id LIKE ? OR email LIKE ?)';
    const search = `%${filters.search}%`;
    params.push(search, search, search, search);
  }
  if (filters?.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  
  sql += ' ORDER BY created_at DESC';
  return queryAll(sql, params);
});

ipcMain.handle('persons:create', (event, data: any) => {
  const result = runSql(`
    INSERT INTO persons (university_id, type, full_name_en, full_name_ar, email, phone, national_id, 
      photo_url, college_id, department_id, program_id, level_id, position, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.universityId, data.type, data.fullNameEn, data.fullNameAr, data.email, data.phone,
    data.nationalId, data.photoUrl, data.collegeId, data.departmentId, data.programId,
    data.levelId, data.position, data.status || 'active'
  ]);
  return { id: result.lastId, ...data };
});

ipcMain.handle('persons:update', (event, id: number, data: any) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  runSql(`UPDATE persons SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), id]);
  return { id, ...data };
});

ipcMain.handle('persons:delete', (event, id: number) => {
  runSql('DELETE FROM persons WHERE id = ?', [id]);
  return true;
});

// ID Generation
ipcMain.handle('generate-id', (event, type: string, collegeCode?: string) => {
  const year = new Date().getFullYear();
  const prefix = type === 'student' ? (collegeCode || 'STU') : (type === 'staff' ? 'EMP' : 'VIS');
  
  const existing = queryOne('SELECT next_number FROM id_sequences WHERE prefix = ? AND year = ?', [prefix, year]);
  
  let nextNumber: number;
  if (existing) {
    nextNumber = existing.next_number;
    runSql('UPDATE id_sequences SET next_number = ? WHERE prefix = ? AND year = ?', [nextNumber + 1, prefix, year]);
  } else {
    nextNumber = 1;
    runSql('INSERT INTO id_sequences (prefix, year, next_number) VALUES (?, ?, 2)', [prefix, year]);
  }
  
  return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
});

// Cards
ipcMain.handle('cards:list', (event, filters?: any) => {
  let sql = 'SELECT * FROM cards WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.search) {
    sql += ' AND (name LIKE ? OR id_number LIKE ? OR department LIKE ?)';
    const search = `%${filters.search}%`;
    params.push(search, search, search);
  }
  if (filters?.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  
  sql += ' ORDER BY created_at DESC';
  return queryAll(sql, params);
});

ipcMain.handle('cards:create', (event, data: any) => {
  const result = runSql(`
    INSERT INTO cards (person_id, card_number, expiry_date, status, name, id_number, type, department, program, year, photo_url, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.personId, data.cardNumber, data.expiryDate, data.status || 'active',
    data.name, data.idNumber, data.type, data.department, data.program, data.year, data.photoUrl, data.email
  ]);
  return { id: result.lastId, ...data };
});

ipcMain.handle('cards:bulk-create', (event, cards: any[]) => {
  const results = cards.map(data => {
    const result = runSql(`
      INSERT INTO cards (person_id, card_number, expiry_date, status, name, id_number, type, department, program, year, photo_url, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.personId, data.cardNumber, data.expiryDate, data.status || 'active',
      data.name, data.idNumber, data.type, data.department, data.program, data.year, data.photoUrl, data.email
    ]);
    return { id: result.lastId, ...data };
  });
  return results;
});

// Card Templates
ipcMain.handle('templates:list', () => {
  return queryAll('SELECT * FROM card_templates ORDER BY name');
});

ipcMain.handle('templates:create', (event, data: any) => {
  const result = runSql('INSERT INTO card_templates (name, width_mm, height_mm, is_default) VALUES (?, ?, ?, ?)',
    [data.name, data.widthMm, data.heightMm, data.isDefault ? 1 : 0]);
  return { id: result.lastId, ...data };
});

// Statistics
ipcMain.handle('stats:dashboard', () => {
  const totalPersons = queryOne('SELECT COUNT(*) as count FROM persons')?.count || 0;
  const totalStudents = queryOne("SELECT COUNT(*) as count FROM persons WHERE type = 'student'")?.count || 0;
  const totalStaff = queryOne("SELECT COUNT(*) as count FROM persons WHERE type = 'staff'")?.count || 0;
  const totalVisitors = queryOne("SELECT COUNT(*) as count FROM persons WHERE type = 'visitor'")?.count || 0;
  const totalCards = queryOne('SELECT COUNT(*) as count FROM cards')?.count || 0;
  const activeCards = queryOne("SELECT COUNT(*) as count FROM cards WHERE status = 'active'")?.count || 0;
  const totalColleges = queryOne('SELECT COUNT(*) as count FROM colleges')?.count || 0;
  const totalDepartments = queryOne('SELECT COUNT(*) as count FROM departments')?.count || 0;
  
  const byCollege = queryAll(`
    SELECT c.name_en as name, COUNT(p.id) as count
    FROM colleges c
    LEFT JOIN persons p ON p.college_id = c.id
    GROUP BY c.id, c.name_en
  `);
  
  return {
    totalPersons, totalStudents, totalStaff, totalVisitors,
    totalCards, activeCards, expiredCards: 0,
    totalColleges, totalDepartments,
    byCollege
  };
});

// Backup
ipcMain.handle('backup:export', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Export Database Backup',
    defaultPath: `id-forge-backup-${new Date().toISOString().split('T')[0]}.db`,
    filters: [{ name: 'SQLite Database', extensions: ['db'] }]
  });
  
  if (result.canceled || !result.filePath) return null;
  
  saveDatabase();
  fs.copyFileSync(dbPath, result.filePath);
  return result.filePath;
});

ipcMain.handle('backup:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Import Database Backup',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile']
  });
  
  if (result.canceled || result.filePaths.length === 0) return null;
  
  if (db) db.close();
  fs.copyFileSync(result.filePaths[0], dbPath);
  await initDatabase();
  
  return true;
});

// Print
ipcMain.handle('print:cards', async (event, options: any) => {
  if (!mainWindow) return;
  
  mainWindow.webContents.print({
    silent: options.silent || false,
    printBackground: true,
    pageSize: {
      width: (options.widthMm || 85.6) * 1000,
      height: (options.heightMm || 53.98) * 1000,
    },
    margins: { marginType: 'none' }
  }, (success, failureReason) => {
    if (!success) console.error('Print failed:', failureReason);
  });
});

// Audit Log
ipcMain.handle('audit:log', (event, data: any) => {
  runSql(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [data.userId || 1, data.action, data.entityType, data.entityId,
    JSON.stringify(data.oldValues), JSON.stringify(data.newValues)]);
});

ipcMain.handle('audit:list', (event, limit = 100) => {
  return queryAll(`
    SELECT al.*, u.full_name as user_name 
    FROM audit_logs al 
    LEFT JOIN users u ON al.user_id = u.id 
    ORDER BY al.created_at DESC 
    LIMIT ?
  `, [limit]);
});
