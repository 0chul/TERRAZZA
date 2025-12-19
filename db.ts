
import { openDB, DBSchema } from 'idb';
import { Scenario } from './types';

// Define the DB Schema
interface TerrazzaDB extends DBSchema {
  plans: {
    key: string;
    value: Scenario;
  };
}

const DB_NAME = 'terrazza-business-planner-db';
const STORE_NAME = 'plans';

// Initialize DB
export const initDB = async () => {
  return openDB<TerrazzaDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// DB Service Wrapper
export const dbService = {
  // Load all plans
  async getAllPlans(): Promise<Scenario[]> {
    try {
      const db = await initDB();
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error('Failed to load plans from DB:', error);
      return [];
    }
  },

  // Save a plan (Insert or Update)
  async savePlan(plan: Scenario): Promise<string> {
    try {
      const db = await initDB();
      await db.put(STORE_NAME, plan);
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
      await db.delete(STORE_NAME, id);
    } catch (error) {
      console.error('Failed to delete plan from DB:', error);
      throw error;
    }
  }
};
