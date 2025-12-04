export enum UserRole {
  COACH = 'COACH',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: UserRole;
  avatarUrl?: string;
}

// Changed to Record to allow dynamic keys like "Meal 5", "Pre-Workout"
export type MealPlan = Record<string, string>;

export interface Habit {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly';
  completed: boolean;
}

export interface MeasurementLog {
  id: string;
  clientId: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  photoUrl?: string;
}

export interface ClientProfile extends User {
  coachId: string;
  passportCode: string;
  dob: string;
  age: number;
  occupation: string;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goal: string;
  subscriptionEndDate: string;
  dailyMacroTargets: Macros;
  mealPlan?: MealPlan;
  habits?: Habit[];
  stepGoal: number;
  weeklyStepGoal?: number;
  status: 'active' | 'flagged' | 'expired';
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface WeightLog {
  id: string;
  clientId: string;
  date: string;
  weightKg: number;
  source: 'manual' | 'photo';
  trendStatus?: 'green' | 'amber' | 'red'; // Based on 3-day slope
  trendMessage?: string;
}

export interface FoodLog {
  id: string;
  clientId: string;
  date: string; // ISO String
  mealType: string; // Changed to string to support dynamic meals
  foodName: string;
  grams: number;
  macros: Macros;
  photoUrl?: string;
  aiConfidence?: number;
  isVerified: boolean;
}

export interface StepLog {
  date: string;
  count: number;
}

export interface Workout {
  id: string;
  clientId: string;
  dayOfWeek: string;
  title: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weightKg?: number;
  completed: boolean;
  videoUrl?: string; 
  notes?: string;
}

// New Types for Libraries
export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  fiberPer100g: number;
  imageUrl: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  gifUrl: string;
  notes: string;
}

export interface AppState {
  currentUser: User | null;
  clients: ClientProfile[];
  selectedClient: ClientProfile | null;
  logs: {
    weight: WeightLog[];
    food: FoodLog[];
  };
  workouts: Workout[];
}