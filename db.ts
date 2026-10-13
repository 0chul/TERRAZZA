
import { openDB, DBSchema } from 'idb';
import { Scenario, InteriorCost } from './types';
import { DEFAULT_INTERIOR_COSTS, LEGACY_INTERIOR_COSTS, FINANCE_IMPORT_VERSION } from './defaultInteriorCosts';

// Define the DB Schema
interface TerrazzaDB extends DBSchema {
  plans: {
    key: string;
    value: Scenario;
  };
  interiorCosts: {
    key: string;
    value: InteriorCost;
  };
  metadata: {
    key: string;
    value: string;
  };
}

const DB_NAME = 'terrazza-business-planner-db';
const PLANS_STORE = 'plans';
const INTERIOR_STORE = 'interiorCosts';

// Initialize DB
export const initDB = async () => {
  return openDB<TerrazzaDB>(DB_NAME, 4, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(PLANS_STORE, { keyPath: 'id' });
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(INTERIOR_STORE)) {
          db.createObjectStore(INTERIOR_STORE, { keyPath: 'id' });
        }
      }
      if (oldVersion < 4) db.createObjectStore('metadata');
    },
  });
};

// DB Service Wrapper
export const dbService = {
  async importFinanceSource(): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(['interiorCosts', 'metadata'], 'readwrite');
    const metadata = tx.objectStore('metadata');
    if (await metadata.get('finance-source') === FINANCE_IMPORT_VERSION) {
      await tx.done;
      return;
    }
    const costs = tx.objectStore(INTERIOR_STORE);
    const existing = await costs.getAll();
    for (const source of DEFAULT_INTERIOR_COSTS) {
      const current = existing.find(row => row.id === source.id);
      const legacy = LEGACY_INTERIOR_COSTS.find(row => row.id === source.id);
      const untouched = current && legacy && current.cost === legacy.cost && current.category === legacy.category && current.item === legacy.item && (current.date === legacy.date || current.date === legacy.date.replace('2025-', '2026-'));
      if (!current || untouched) await costs.put(source);
    }
    await metadata.put(FINANCE_IMPORT_VERSION, 'finance-source');
    await tx.done;
  },
  // Load all plans
  async getAllPlans(): Promise<Scenario[]> {
    try {
      const db = await initDB();
      return await db.getAll(PLANS_STORE);
    } catch (error) {
      console.error('Failed to load plans from DB:', error);
      return [];
    }
  },

  // Save a plan (Insert or Update)
  async savePlan(plan: Scenario): Promise<string> {
    try {
      const db = await initDB();
      await db.put(PLANS_STORE, plan);
      return plan.id;
    } catch (error) {
      console.error('Failed to save plan to DB:', error);
      throw error;
    }
  },

  // Delete a plan
  async deletePlan(id: string): Promise<void> {
    try {
      const db = await initDB();
      await db.delete(PLANS_STORE, id);
    } catch (error) {
      console.error('Failed to delete plan from DB:', error);
      throw error;
    }
  },

  // Load all interior costs
  async getAllInteriorCosts(): Promise<InteriorCost[]> {
    try {
      const db = await initDB();
      return await db.getAll(INTERIOR_STORE);
    } catch (error) {
      console.error('Failed to load interior costs from DB:', error);
      return [];
    }
  },

  // Save an interior cost
  async saveInteriorCost(cost: InteriorCost): Promise<string> {
    try {
      const db = await initDB();
      await db.put(INTERIOR_STORE, cost);
      return cost.id;
    } catch (error) {
      console.error('Failed to save interior cost to DB:', error);
      throw error;
    }
  },

  // Delete an interior cost
  async deleteInteriorCost(id: string): Promise<void> {
    try {
      const db = await initDB();
      await db.delete(INTERIOR_STORE, id);
    } catch (error) {
      console.error('Failed to delete interior cost from DB:', error);
      throw error;
    }
  },

  async clearInteriorCosts(): Promise<void> {
    try {
      const db = await initDB();
      await db.clear(INTERIOR_STORE);
    } catch (error) {
      console.error('Failed to clear interior costs from DB:', error);
      throw error;
    }
  }
};
