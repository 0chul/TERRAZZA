
import { openDB, DBSchema } from 'idb';
import { Scenario, InteriorCost } from './types';

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
}

const DB_NAME = 'terrazza-business-planner-db';
const PLANS_STORE = 'plans';
const INTERIOR_STORE = 'interiorCosts';

// Initialize DB
export const initDB = async () => {
  return openDB<TerrazzaDB>(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(PLANS_STORE, { keyPath: 'id' });
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(INTERIOR_STORE)) {
          db.createObjectStore(INTERIOR_STORE, { keyPath: 'id' });
        }
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
  }
};
