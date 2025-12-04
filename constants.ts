
import { ClientProfile, FoodLog, UserRole, WeightLog, Workout, FoodItem, ExerciseDefinition, MeasurementLog } from './types';

// --- SEED DATA (Used only for first-time DB initialization) ---

export const SEED_CLIENTS: ClientProfile[] = [
  {
    id: 'c1',
    name: 'Jane Doe',
    username: 'janedoe_fit',
    role: UserRole.CLIENT,
    coachId: 'coach_rushi', // Assigned to the new coach
    passportCode: 'JD-2024-X9Y',
    dob: '1995-05-15',
    age: 29,
    occupation: 'Software Engineer',
    heightCm: 168,
    startWeightKg: 70,
    currentWeightKg: 66.5,
    goal: 'Loose 5kg & Build Muscle',
    subscriptionEndDate: '2024-12-31',
    stepGoal: 8000,
    weeklyStepGoal: 56000,
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff',
    dailyMacroTargets: {
      calories: 2100,
      protein: 140,
      carbs: 220,
      fats: 65,
      fiber: 30
    },
    mealPlan: {
      breakfast: '100g Oatmeal, 1 scoop Whey Protein',
      lunch: '200g Chicken Breast (Grilled), 150g White Rice (Cooked)',
      dinner: '150g Salmon (Raw), 100g Asparagus',
      snack: '30g Almonds'
    },
    habits: [
      { id: 'h1', name: 'Drink 3L Water', frequency: 'Daily', completed: false },
      { id: 'h2', name: 'Sleep 8 Hours', frequency: 'Daily', completed: true },
      { id: 'h3', name: 'Morning Stretching', frequency: 'Daily', completed: false }
    ]
  },
  {
    id: 'c2',
    name: 'John Smith',
    username: 'johns_gains',
    role: UserRole.CLIENT,
    coachId: 'coach_rushi',
    passportCode: 'JS-8821-B2A',
    dob: '1990-08-20',
    age: 33,
    occupation: 'Architect',
    heightCm: 182,
    startWeightKg: 95,
    currentWeightKg: 91.2,
    goal: 'Hypertrophy',
    subscriptionEndDate: '2024-06-15',
    stepGoal: 10000,
    weeklyStepGoal: 70000,
    status: 'flagged',
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Smith&background=EB4D4B&color=fff',
    dailyMacroTargets: {
      calories: 2800,
      protein: 200,
      carbs: 300,
      fats: 80,
      fiber: 40
    },
    habits: [
      { id: 'h4', name: 'Creatine Intake', frequency: 'Daily', completed: false }
    ]
  }
];

export const SEED_WEIGHT_LOGS: WeightLog[] = [
  { id: 'w1', clientId: 'c1', date: '2024-05-20', weightKg: 67.5, source: 'manual', trendStatus: 'green' },
  { id: 'w2', clientId: 'c1', date: '2024-05-21', weightKg: 67.2, source: 'manual', trendStatus: 'green' },
  { id: 'w3', clientId: 'c1', date: '2024-05-22', weightKg: 67.0, source: 'manual', trendStatus: 'green' },
  { id: 'w4', clientId: 'c1', date: '2024-05-23', weightKg: 66.8, source: 'manual', trendStatus: 'green' },
  { id: 'w5', clientId: 'c1', date: '2024-05-24', weightKg: 66.5, source: 'photo', trendStatus: 'green' },
  { id: 'w6', clientId: 'c2', date: '2024-05-22', weightKg: 90.0, source: 'manual', trendStatus: 'green' },
  { id: 'w7', clientId: 'c2', date: '2024-05-23', weightKg: 90.5, source: 'manual', trendStatus: 'amber' },
  { id: 'w8', clientId: 'c2', date: '2024-05-24', weightKg: 91.2, source: 'manual', trendStatus: 'red' },
];

export const SEED_FOOD_LOGS: FoodLog[] = [
  {
    id: 'f1',
    clientId: 'c1',
    date: new Date().toISOString(),
    mealType: 'Breakfast',
    foodName: 'Masala Dosa',
    grams: 180,
    macros: { calories: 350, protein: 8, carbs: 65, fats: 12, fiber: 4 },
    isVerified: true
  },
  {
    id: 'f2',
    clientId: 'c1',
    date: new Date().toISOString(),
    mealType: 'Lunch',
    foodName: 'Chicken Biryani',
    grams: 400,
    macros: { calories: 600, protein: 35, carbs: 70, fats: 20, fiber: 5 },
    isVerified: true
  }
];

export const SEED_MEASUREMENTS: MeasurementLog[] = [
  { 
    id: 'm1',
    clientId: 'c1', 
    date: '2024-05-01', 
    chest: 95, 
    waist: 75, 
    hips: 98, 
    arms: 30, 
    thighs: 55, 
    photoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'm2',
    clientId: 'c1', 
    date: '2024-05-08', 
    chest: 94.5, 
    waist: 74, 
    hips: 97.5, 
    arms: 30.2, 
    thighs: 54.5, 
    photoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'm3',
    clientId: 'c1', 
    date: '2024-05-15', 
    chest: 94, 
    waist: 72.5, 
    hips: 97, 
    arms: 30.5, 
    thighs: 54, 
    photoUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=500&q=80' 
  }
];

export const SEED_WORKOUTS: Workout[] = [
  {
    id: 'wk1',
    clientId: 'c1',
    dayOfWeek: 'Monday',
    title: 'Lower Body Power',
    completed: true,
    exercises: [
      { id: 'ex1', name: 'Barbell Squat', sets: 4, reps: '6-8', completed: true },
      { id: 'ex2', name: 'Romanian Deadlift', sets: 3, reps: '8-10', completed: true },
      { id: 'ex3', name: 'Leg Extension', sets: 3, reps: '12-15', completed: true },
    ]
  },
  {
    id: 'wk2',
    clientId: 'c1',
    dayOfWeek: 'Tuesday',
    title: 'Upper Body Push',
    completed: false,
    exercises: [
      { id: 'ex4', name: 'Bench Press', sets: 4, reps: '6-8', completed: false },
      { id: 'ex5', name: 'Overhead Press', sets: 3, reps: '8-10', completed: false },
      { id: 'ex6', name: 'Lateral Raises', sets: 3, reps: '12-15', completed: false },
    ]
  }
];

// --- STATIC LIBRARIES (Always available, not part of mutable DB) ---
export const FOOD_DATABASE: FoodItem[] = [
  // --- PROTEIN (Animal) ---
  { id: 'p1', name: 'Chicken Breast (Raw)', caloriesPer100g: 110, proteinPer100g: 23, carbsPer100g: 0, fatsPer100g: 1.2, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=200&q=80' },
  { id: 'p2', name: 'Chicken Breast (Grilled)', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=200&q=80' },
  { id: 'p3', name: 'Chicken Thigh (Skinless)', caloriesPer100g: 120, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 4, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1608797178974-9a8c0827b927?auto=format&fit=crop&w=200&q=80' },
  { id: 'p4', name: 'Egg (Whole, Large)', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatsPer100g: 11, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=200&q=80' },
  { id: 'p5', name: 'Egg Whites (Liquid)', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatsPer100g: 0.2, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=200&q=80' },
  { id: 'p6', name: 'Salmon (Raw)', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 13, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&w=200&q=80' },
  { id: 'p7', name: 'Tilapia / White Fish', caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 1.7, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1517926126685-618d30e55132?auto=format&fit=crop&w=200&q=80' },
  { id: 'p8', name: 'Lean Ground Beef (95%)', caloriesPer100g: 137, proteinPer100g: 21, carbsPer100g: 0, fatsPer100g: 5, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=200&q=80' },
  { id: 'p9', name: 'Shrimp / Prawns', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatsPer100g: 0.3, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=200&q=80' },
  { id: 'p10', name: 'Tuna (Canned in Water)', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatsPer100g: 1, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=200&q=80' },

  // --- PROTEIN (Veg) ---
  { id: 'v1', name: 'Paneer (Raw)', caloriesPer100g: 296, proteinPer100g: 18, carbsPer100g: 1.2, fatsPer100g: 23, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paneer_%28Indian_cottage_cheese%29.jpg/240px-Paneer_%28Indian_cottage_cheese%29.jpg' },
  { id: 'v2', name: 'Tofu (Firm)', caloriesPer100g: 144, proteinPer100g: 15, carbsPer100g: 3, fatsPer100g: 8, fiberPer100g: 2, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80' },
  { id: 'v3', name: 'Soya Chunks', caloriesPer100g: 345, proteinPer100g: 52, carbsPer100g: 33, fatsPer100g: 0.5, fiberPer100g: 13, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soya_Chunks_Curry.jpg/240px-Soya_Chunks_Curry.jpg' },
  { id: 'v4', name: 'Greek Yogurt (Non-Fat)', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 0.4, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&q=80' },
  { id: 'v5', name: 'Lentils (Cooked)', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatsPer100g: 0.4, fiberPer100g: 8, imageUrl: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&w=200&q=80' },
  { id: 'v6', name: 'Chickpeas (Boiled)', caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatsPer100g: 2.6, fiberPer100g: 8, imageUrl: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=200&q=80' },
  { id: 'v7', name: 'Edamame', caloriesPer100g: 121, proteinPer100g: 12, carbsPer100g: 9, fatsPer100g: 5, fiberPer100g: 5, imageUrl: 'https://images.unsplash.com/photo-1615485499978-844a4e15643a?auto=format&fit=crop&w=200&q=80' },

  // --- SUPPLEMENTS ---
  { id: 'sup1', name: 'Whey Protein Isolate (Scoop)', caloriesPer100g: 370, proteinPer100g: 90, carbsPer100g: 1, fatsPer100g: 1, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=200&q=80' },
  { id: 'sup2', name: 'Creatine Monohydrate', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 0, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=200&q=80' },
  { id: 'sup3', name: 'Casein Protein', caloriesPer100g: 360, proteinPer100g: 85, carbsPer100g: 3, fatsPer100g: 1.5, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=200&q=80' },
  { id: 'sup4', name: 'BCAA Powder', caloriesPer100g: 380, proteinPer100g: 90, carbsPer100g: 0, fatsPer100g: 0, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1579722822506-699772c5b3c4?auto=format&fit=crop&w=200&q=80' },
  { id: 'sup5', name: 'Fish Oil Capsule (1g)', caloriesPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1626078438125-9988712395a1?auto=format&fit=crop&w=200&q=80' },

  // --- NUTS & SEEDS ---
  { id: 'ns1', name: 'Almonds', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatsPer100g: 50, fiberPer100g: 12.5, imageUrl: 'https://images.unsplash.com/photo-1563546056-b09e5306d15a?auto=format&fit=crop&w=200&q=80' },
  { id: 'ns2', name: 'Walnuts', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatsPer100g: 65, fiberPer100g: 7, imageUrl: 'https://images.unsplash.com/photo-1574676450692-04ce7148564a?auto=format&fit=crop&w=200&q=80' },
  { id: 'ns3', name: 'Chia Seeds', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatsPer100g: 31, fiberPer100g: 34, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80' },
  { id: 'ns4', name: 'Flax Seeds', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatsPer100g: 42, fiberPer100g: 27, imageUrl: 'https://images.unsplash.com/photo-1616492978583-05b1c518b2c2?auto=format&fit=crop&w=200&q=80' },
  { id: 'ns5', name: 'Pumpkin Seeds', caloriesPer100g: 559, proteinPer100g: 30, carbsPer100g: 10, fatsPer100g: 49, fiberPer100g: 6, imageUrl: 'https://images.unsplash.com/photo-1605307513364-754f24823d06?auto=format&fit=crop&w=200&q=80' },
  { id: 'ns6', name: 'Peanut Butter (Natural)', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatsPer100g: 50, fiberPer100g: 6, imageUrl: 'https://images.unsplash.com/photo-1563729768-6af784667808?auto=format&fit=crop&w=200&q=80' },

  // --- CARBOHYDRATES (Complex) ---
  { id: 'c1', name: 'White Rice (Cooked)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatsPer100g: 0.3, fiberPer100g: 0.4, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 'c2', name: 'Brown Rice (Cooked)', caloriesPer100g: 112, proteinPer100g: 2.3, carbsPer100g: 23, fatsPer100g: 0.8, fiberPer100g: 1.8, imageUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=200&q=80' },
  { id: 'c3', name: 'Oats / Oatmeal (Raw)', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatsPer100g: 6.9, fiberPer100g: 10.6, imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=200&q=80' },
  { id: 'c4', name: 'Sweet Potato (Boiled)', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatsPer100g: 0.1, fiberPer100g: 3, imageUrl: 'https://images.unsplash.com/photo-1596097635121-14b63b845319?auto=format&fit=crop&w=200&q=80' },
  { id: 'c5', name: 'Quinoa (Cooked)', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatsPer100g: 1.9, fiberPer100g: 2.8, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' }, // Placeholder
  { id: 'c6', name: 'Potato (Boiled)', caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatsPer100g: 0.1, fiberPer100g: 1.8, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80' },

  // --- HEALTHY FATS ---
  { id: 'f1', name: 'Avocado', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatsPer100g: 14.7, fiberPer100g: 6.7, imageUrl: 'https://images.unsplash.com/photo-1523049673856-38866f8c6795?auto=format&fit=crop&w=200&q=80' },
  { id: 'f2', name: 'Olive Oil', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80' },
  { id: 'f3', name: 'Coconut Oil', caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1596118337777-622f9801264c?auto=format&fit=crop&w=200&q=80' },
  { id: 'f4', name: 'Butter', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatsPer100g: 81, fiberPer100g: 0, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80' },

  // --- FRUITS & VEG ---
  { id: 'fv1', name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatsPer100g: 0.3, fiberPer100g: 2.6, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&q=80' },
  { id: 'fv2', name: 'Apple', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatsPer100g: 0.2, fiberPer100g: 2.4, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80' },
  { id: 'fv3', name: 'Blueberries', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatsPer100g: 0.3, fiberPer100g: 2.4, imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=200&q=80' },
  { id: 'fv4', name: 'Broccoli (Steamed)', caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7.2, fatsPer100g: 0.4, fiberPer100g: 3.3, imageUrl: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=200&q=80' },
  { id: 'fv5', name: 'Spinach (Raw)', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatsPer100g: 0.4, fiberPer100g: 2.2, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80' },

  // --- INDIAN CUISINE (Expanded) ---
  { id: 'ind1', name: 'Roti / Chapati (Whole Wheat)', caloriesPer100g: 297, proteinPer100g: 10, carbsPer100g: 56, fatsPer100g: 3, fiberPer100g: 9, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roti_1.jpg/240px-Roti_1.jpg' },
  { id: 'ind2', name: 'Dal Tadka (Yellow Lentil)', caloriesPer100g: 115, proteinPer100g: 6, carbsPer100g: 14, fatsPer100g: 4, fiberPer100g: 5, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dal_Tadka.jpg/240px-Dal_Tadka.jpg' },
  { id: 'ind3', name: 'Chicken Biryani', caloriesPer100g: 170, proteinPer100g: 12, carbsPer100g: 22, fatsPer100g: 6, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Biryani_of_Lahore.jpg/240px-Biryani_of_Lahore.jpg' },
  { id: 'ind4', name: 'Paneer Butter Masala', caloriesPer100g: 320, proteinPer100g: 11, carbsPer100g: 12, fatsPer100g: 24, fiberPer100g: 2, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Paneer_Butter_Masala.jpg/240px-Paneer_Butter_Masala.jpg' },
  { id: 'ind5', name: 'Idli', caloriesPer100g: 58, proteinPer100g: 2, carbsPer100g: 12, fatsPer100g: 0.1, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.JPG/240px-Idli_Sambar.JPG' },
  { id: 'ind6', name: 'Dosa (Plain)', caloriesPer100g: 168, proteinPer100g: 3.9, carbsPer100g: 29, fatsPer100g: 3.7, fiberPer100g: 0.9, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Dosa_at_Sri_Ganesha_Restauran%2C_Bangkok_%284487048004%29.jpg/240px-Dosa_at_Sri_Ganesha_Restauran%2C_Bangkok_%284487048004%29.jpg' },
  { id: 'ind7', name: 'Chole (Chickpea Curry)', caloriesPer100g: 130, proteinPer100g: 7, carbsPer100g: 20, fatsPer100g: 3, fiberPer100g: 6, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Chola_bhatura.jpg/240px-Chola_bhatura.jpg' },
  { id: 'ind8', name: 'Rajma (Kidney Beans Curry)', caloriesPer100g: 120, proteinPer100g: 6, carbsPer100g: 18, fatsPer100g: 3, fiberPer100g: 6, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rajma.jpg/240px-Rajma.jpg' },
  { id: 'ind9', name: 'Poha', caloriesPer100g: 180, proteinPer100g: 3, carbsPer100g: 35, fatsPer100g: 3, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Kanda_Poha.jpg/240px-Kanda_Poha.jpg' },
  { id: 'ind10', name: 'Upma', caloriesPer100g: 190, proteinPer100g: 4, carbsPer100g: 30, fatsPer100g: 6, fiberPer100g: 2, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Upma%2C_Uppumavu.jpg/240px-Upma%2C_Uppumavu.jpg' },
  { id: 'ind11', name: 'Moong Dal Chilla', caloriesPer100g: 150, proteinPer100g: 8, carbsPer100g: 22, fatsPer100g: 4, fiberPer100g: 4, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Moong_Dal_Chilla.jpg/240px-Moong_Dal_Chilla.jpg' },
  { id: 'ind12', name: 'Sprouts Salad', caloriesPer100g: 80, proteinPer100g: 8, carbsPer100g: 15, fatsPer100g: 1, fiberPer100g: 6, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sprouts_Salad.jpg/240px-Sprouts_Salad.jpg' },
  { id: 'ind13', name: 'Ragi Roti', caloriesPer100g: 140, proteinPer100g: 4, carbsPer100g: 30, fatsPer100g: 1, fiberPer100g: 5, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ragi_Roti.jpg/240px-Ragi_Roti.jpg' },
  { id: 'ind14', name: 'Khichdi', caloriesPer100g: 120, proteinPer100g: 4, carbsPer100g: 20, fatsPer100g: 2, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Khichdi_01.jpg/240px-Khichdi_01.jpg' },
  { id: 'ind15', name: 'Tandoori Chicken', caloriesPer100g: 195, proteinPer100g: 28, carbsPer100g: 2, fatsPer100g: 8, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Tandoori_chicken_laccha_pyaz1_%2836886283595%29.jpg/240px-Tandoori_chicken_laccha_pyaz1_%2836886283595%29.jpg' },
  { id: 'ind16', name: 'Butter Chicken', caloriesPer100g: 250, proteinPer100g: 14, carbsPer100g: 8, fatsPer100g: 18, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Chicken_makhani.jpg/240px-Chicken_makhani.jpg' },
  { id: 'ind17', name: 'Fish Curry', caloriesPer100g: 140, proteinPer100g: 16, carbsPer100g: 4, fatsPer100g: 7, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Fish_Curry.JPG/240px-Fish_Curry.JPG' },
  { id: 'ind18', name: 'Palak Paneer', caloriesPer100g: 180, proteinPer100g: 9, carbsPer100g: 6, fatsPer100g: 14, fiberPer100g: 3, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Palak_Paneer_01.jpg/240px-Palak_Paneer_01.jpg' },
  { id: 'ind19', name: 'Mutton Biryani', caloriesPer100g: 200, proteinPer100g: 14, carbsPer100g: 20, fatsPer100g: 9, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hyderabadi_Dum_Biryani.jpg/240px-Hyderabadi_Dum_Biryani.jpg' },
  { id: 'ind20', name: 'Samosa', caloriesPer100g: 260, proteinPer100g: 3, carbsPer100g: 24, fatsPer100g: 17, fiberPer100g: 2, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Samosachutney.jpg/240px-Samosachutney.jpg' },
  { id: 'ind21', name: 'Gulab Jamun', caloriesPer100g: 350, proteinPer100g: 4, carbsPer100g: 50, fatsPer100g: 15, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Gulab_Jamun_%281%29.jpg/240px-Gulab_Jamun_%281%29.jpg' },
  { id: 'ind22', name: 'Lassi (Sweet)', caloriesPer100g: 110, proteinPer100g: 3, carbsPer100g: 16, fatsPer100g: 3, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lassi_001.jpg/240px-Lassi_001.jpg' },
  { id: 'ind23', name: 'Egg Bhurji', caloriesPer100g: 160, proteinPer100g: 14, carbsPer100g: 3, fatsPer100g: 11, fiberPer100g: 0, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Egg_Bhurji.jpg/240px-Egg_Bhurji.jpg' },
  { id: 'ind24', name: 'Besan Ladoo', caloriesPer100g: 365, proteinPer100g: 4, carbsPer100g: 50, fatsPer100g: 16, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Besan_Ladoo.jpg/240px-Besan_Ladoo.jpg' },
  { id: 'ind25', name: 'Dhokla', caloriesPer100g: 160, proteinPer100g: 6, carbsPer100g: 25, fatsPer100g: 3, fiberPer100g: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Khaman_Dhokla.jpg/240px-Khaman_Dhokla.jpg' },
];

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // Chest
  { id: 'ex_c1', name: 'Barbell Bench Press', muscleGroup: 'Chest', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnZ6cHR5amN6amN6eHZ6eHZ6eHZ6eHZ6eHZ6eHZ6eA/3o7TKn6e6c4e6c4e6c/giphy.gif', notes: 'Keep back arched, feet planted. Lower bar to mid-chest.' },
  { id: 'ex_c2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', gifUrl: 'https://media.giphy.com/media/26AHG5KGFxSkQLBQQ/giphy.gif', notes: 'Bench at 30-45 degrees. Press straight up.' },
  { id: 'ex_c3', name: 'Cable Flys', muscleGroup: 'Chest', gifUrl: 'https://media.giphy.com/media/l41Yh18f5Tbi9HEzu/giphy.gif', notes: 'Slight bend in elbows. Squeeze chest at peak.' },
  // Back
  { id: 'ex_b1', name: 'Pull Ups', muscleGroup: 'Back', gifUrl: 'https://media.giphy.com/media/eM251IxZWv4qL81rTu/giphy.gif', notes: 'Full range of motion. Chin over bar.' },
  { id: 'ex_b2', name: 'Barbell Row', muscleGroup: 'Back', gifUrl: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif', notes: 'Keep back straight. Pull to lower ribcage.' },
  { id: 'ex_b3', name: 'Lat Pulldown', muscleGroup: 'Back', gifUrl: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif', notes: 'Wide grip. Pull elbows down and back.' },
  // Legs
  { id: 'ex_l1', name: 'Barbell Squat', muscleGroup: 'Legs', gifUrl: 'https://media.giphy.com/media/1iTH1WIUjM0VATSw/giphy.gif', notes: 'Knees tracking over toes. Break parallel.' },
  { id: 'ex_l2', name: 'Leg Press', muscleGroup: 'Legs', gifUrl: 'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif', notes: 'Do not lock knees at top. Control weight down.' },
  { id: 'ex_l3', name: 'Romanian Deadlift', muscleGroup: 'Legs', gifUrl: 'https://media.giphy.com/media/3o7TKM1lP4H15oYlEI/giphy.gif', notes: 'Hinge at hips. Keep bar close to shins.' },
  // Shoulders
  { id: 'ex_s1', name: 'Overhead Press', muscleGroup: 'Shoulders', gifUrl: 'https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif', notes: 'Core tight. Press bar vertically.' },
  { id: 'ex_s2', name: 'Lateral Raises', muscleGroup: 'Shoulders', gifUrl: 'https://media.giphy.com/media/3o7TKP4tLpQd1X1lV6/giphy.gif', notes: 'Lead with elbows. Control the descent.' },
  // Arms
  { id: 'ex_a1', name: 'Bicep Curls', muscleGroup: 'Arms', gifUrl: 'https://media.giphy.com/media/3o7TKDkDbIDJieoJsk/giphy.gif', notes: 'Keep elbows pinned to sides.' },
  { id: 'ex_a2', name: 'Tricep Pushdowns', muscleGroup: 'Arms', gifUrl: 'https://media.giphy.com/media/3o7TKU5C4434l77vC8/giphy.gif', notes: 'Full extension at bottom.' },
  // Core
  { id: 'ex_cr1', name: 'Plank', muscleGroup: 'Core', gifUrl: 'https://media.giphy.com/media/xT8qBff8cRRFf7k2u4/giphy.gif', notes: 'Keep body in straight line. Squeeze glutes.' },
  { id: 'ex_cr2', name: 'Crunches', muscleGroup: 'Core', gifUrl: 'https://media.giphy.com/media/1qfKUnW2ckL7y/giphy.gif', notes: 'Lift shoulder blades off floor.' },
  // Cardio
  { id: 'ex_ca1', name: 'Treadmill Run', muscleGroup: 'Cardio', gifUrl: 'https://media.giphy.com/media/3o7TKn6e6c4e6c4e6c/giphy.gif', notes: 'Maintain steady pace.' },
  { id: 'ex_ca2', name: 'Cycling', muscleGroup: 'Cardio', gifUrl: 'https://media.giphy.com/media/3o7TKTK9J6yJ9J6yJ9/giphy.gif', notes: 'Adjust resistance.' },
  { id: 'ex_ca3', name: 'Jump Rope', muscleGroup: 'Cardio', gifUrl: 'https://media.giphy.com/media/3o7TKq8i9X6i9X6i9X/giphy.gif', notes: 'Stay on toes. Keep rhythm.' },
];

export const THRESHOLDS = {
  GREEN_LIMIT: -0.2,
  RED_LIMIT: 0.2
};