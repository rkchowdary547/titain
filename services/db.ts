
import { ClientProfile, FoodLog, WeightLog, Workout, MeasurementLog, User, UserRole } from '../types';
import { SEED_CLIENTS, SEED_FOOD_LOGS, SEED_MEASUREMENTS, SEED_WEIGHT_LOGS, SEED_WORKOUTS } from '../constants';

const DB_KEY = 'titanfit_db_v1';

export interface DatabaseSchema {
  users: User[];
  clients: ClientProfile[];
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  workouts: Workout[];
  measurements: MeasurementLog[];
  credentials: Record<string, string>; // username -> hash(password)
}

// Simple hash function for client-side demo persistence (In production, use bcrypt on backend)
const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const INITIAL_DB: DatabaseSchema = {
  users: [],
  clients: [],
  foodLogs: [],
  weightLogs: [],
  workouts: [],
  measurements: [],
  credentials: {}
};

class DBService {
  private data: DatabaseSchema;

  constructor() {
    const stored = localStorage.getItem(DB_KEY);
    this.data = stored ? JSON.parse(stored) : INITIAL_DB;
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
  }

  async initialize() {
    // If no credentials exist, seed the database
    if (Object.keys(this.data.credentials).length === 0) {
      console.log("Seeding Database...");
      
      const coachPassHash = await hashPassword('rushi9001');
      
      this.data.credentials = {
        'rushi': coachPassHash
      };

      this.data.users = [
        {
          id: 'coach_rushi',
          name: 'Coach Rushi',
          email: 'rushi@titanfit.com',
          username: 'rushi',
          role: UserRole.COACH,
          avatarUrl: 'https://ui-avatars.com/api/?name=Coach+Rushi&background=0D8ABC&color=fff'
        }
      ];

      this.data.clients = SEED_CLIENTS;
      this.data.foodLogs = SEED_FOOD_LOGS;
      this.data.weightLogs = SEED_WEIGHT_LOGS;
      this.data.workouts = SEED_WORKOUTS;
      this.data.measurements = SEED_MEASUREMENTS;
      
      this.save();
    }
  }

  async authenticate(identifier: string, secret: string, role: UserRole): Promise<User | null> {
    if (role === UserRole.COACH) {
      const storedHash = this.data.credentials[identifier];
      if (!storedHash) return null;
      
      const inputHash = await hashPassword(secret);
      if (inputHash === storedHash) {
        return this.data.users.find(u => u.username === identifier && u.role === UserRole.COACH) || null;
      }
    } else {
      // Client Auth (Username + Passport Code)
      const client = this.data.clients.find(c => c.username === identifier && c.passportCode === secret);
      if (client) {
        return {
          id: client.id,
          name: client.name,
          username: client.username,
          role: UserRole.CLIENT,
          avatarUrl: client.avatarUrl
        };
      }
    }
    return null;
  }

  // --- GETTERS ---
  getClients() { return this.data.clients; }
  getFoodLogs() { return this.data.foodLogs; }
  getWeightLogs() { return this.data.weightLogs; }
  getWorkouts() { return this.data.workouts; }
  getMeasurements() { return this.data.measurements; }

  // --- SETTERS ---
  addClient(client: ClientProfile) {
    this.data.clients.push(client);
    this.save();
  }

  updateClient(updatedClient: ClientProfile) {
    this.data.clients = this.data.clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    this.save();
  }

  addFoodLog(log: FoodLog) {
    this.data.foodLogs.unshift(log); // Add to top
    this.save();
  }

  deleteFoodLog(id: string) {
    this.data.foodLogs = this.data.foodLogs.filter(l => l.id !== id);
    this.save();
  }

  addWeightLog(log: WeightLog) {
    this.data.weightLogs.push(log);
    // Also update client current weight
    const client = this.data.clients.find(c => c.id === log.clientId);
    if (client) {
        client.currentWeightKg = log.weightKg;
    }
    this.save();
  }

  addMeasurement(log: MeasurementLog) {
    this.data.measurements.push(log);
    this.save();
  }

  addWorkout(workout: Workout) {
    this.data.workouts.push(workout);
    this.save();
  }

  updateWorkout(workout: Workout) {
    this.data.workouts = this.data.workouts.map(w => w.id === workout.id ? workout : w);
    this.save();
  }
}

export const db = new DBService();
