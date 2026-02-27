import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, children, guardians, authorizations, exitLogs, InsertChild, InsertGuardian, InsertAuthorization, InsertExitLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funções de consulta para crianças
export async function getChildren() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(children);
}

export async function getChildById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(children).where(eq(children.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createChild(data: InsertChild) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(children).values(data);
  return result;
}

export async function updateChild(id: number, data: Partial<InsertChild>) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(children).set(data).where(eq(children.id, id));
}

// Funções de consulta para responsáveis
export async function getGuardians() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guardians);
}

export async function getGuardianById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guardians).where(eq(guardians.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGuardianByCPF(cpf: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guardians).where(eq(guardians.cpf, cpf)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGuardian(data: InsertGuardian) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(guardians).values(data);
  return result;
}

export async function updateGuardian(id: number, data: Partial<InsertGuardian>) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(guardians).set(data).where(eq(guardians.id, id));
}

// Funções de consulta para autorizações
export async function getAuthorizations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(authorizations);
}

export async function getAuthorizationsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(authorizations).where(eq(authorizations.childId, childId));
}

export async function getAuthorizationsByGuardian(guardianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(authorizations).where(eq(authorizations.guardianId, guardianId));
}

export async function createAuthorization(data: InsertAuthorization) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(authorizations).values(data);
  return result;
}

export async function updateAuthorization(id: number, data: Partial<InsertAuthorization>) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(authorizations).set(data).where(eq(authorizations.id, id));
}

export async function deleteAuthorization(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(authorizations).where(eq(authorizations.id, id));
}

// Funções de consulta para histórico de saídas
export async function getExitLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exitLogs).orderBy(desc(exitLogs.exitTime)).limit(limit).offset(offset);
}

export async function getExitLogsByChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exitLogs).where(eq(exitLogs.childId, childId)).orderBy(desc(exitLogs.exitTime));
}

export async function createExitLog(data: InsertExitLog) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(exitLogs).values(data);
  return result;
}
