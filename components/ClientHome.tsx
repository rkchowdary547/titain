
import React, { useState, useEffect, useRef } from 'react';
import { ClientProfile, FoodLog, WeightLog, Workout, FoodItem, MeasurementLog, Habit } from '../types';
import { Plus, Camera, CheckCircle2, Circle, Edit3, Utensils, Search, Flame, Clock, Trash2, ChevronRight, Activity, BarChart2, AlertTriangle, Check, ArrowRight, Zap, CheckSquare, Square, Filter, X, Ruler, Scale, Droplets, Moon, Sun, Footprints, History, ArrowRightLeft } from 'lucide-react';
import { analyzeFoodImage, searchFoodDatabase } from '../services/geminiService';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import StepTracker from './StepTracker';
import { FOOD_DATABASE } from '../constants';
import { useNavigate } from 'react-router-dom';

interface ClientHomeProps {
  view: 'dashboard' | 'nutrition' | 'workouts' | 'progress' | 'habits';
  client: ClientProfile;
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  workouts: Workout[];
  measurementLogs: MeasurementLog[];
  steps: number;
  onAddFood: (log: FoodLog) => void;
  onDeleteFood: (logId: string) => void;
  onAddWeight: (weight: number) => void;
  onAddMeasurement: (log: MeasurementLog) => void;
  onUpdateSteps: (steps: number) => void;
  onToggleExercise: (workoutId: string, exerciseId: string) => void;
}

// Helper to compress images before saving to LocalStorage (to avoid quota limits)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 600; // Limit width to 600px
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to JPEG 60% quality
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const ClientHome: React.FC<ClientHomeProps> = ({ view, client, foodLogs, weightLogs, workouts, measurementLogs, steps, onAddFood, onDeleteFood, onAddWeight, onAddMeasurement, onUpdateSteps, onToggleExercise }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // -- Safety Check --
  if (!client) {
      return (
          <div className="flex items-center justify-center min-h-screen text-titan-400">
              <div className="animate-spin w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full mr-3"></div>
              Loading Client Profile...
          </div>
      );
  }

  // -- Local State --
  const [logMethod, setLogMethod] = useState<'manual' | 'photo'>('manual');
  const [analyzing, setAnalyzing] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [aiAlert, setAiAlert] = useState<{ type: 'success' | 'warning', message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'body' | 'photos'>('weight');

  // Measurements State
  const [measurementForm, setMeasurementForm] = useState<Partial<MeasurementLog>>({
      chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0
  });

  // Photo Compare State
  const [photoCompareMode, setPhotoCompareMode] = useState(false);
  const [compareDate1, setCompareDate1] = useState('');
  const [compareDate2, setCompareDate2] = useState('');

  // Habits State
  const [habits, setHabits] = useState<Habit[]>(client.habits || []);

  const toggleHabit = (id: string) => {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };
  
  // Time Context State
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Manual Food Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [manualGrams, setManualGrams] = useState(100);
  const [manualMealType, setManualMealType] = useState('Breakfast');
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setManualMealType('Breakfast');
    else if (hour >= 11 && hour < 16) setManualMealType('Lunch');
    else if (hour >= 16 && hour < 22) setManualMealType('Dinner');
    else setManualMealType('Snack');
    return () => clearInterval(timer);
  }, []);

  // -- Helpers --
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getCurrentMealContext = () => {
      const hour = currentTime.getHours();
      if (hour >= 5 && hour < 11) return "Breakfast Time";
      if (hour >= 11 && hour < 15) return "Lunch Time";
      if (hour >= 15 && hour < 18) return "Afternoon Snack";
      if (hour >= 18 && hour < 22) return "Dinner Time";
      return "Late Night Snack";
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = foodLogs.filter(log => log.date.startsWith(today));
  
  const consumed = todaysLogs.reduce((acc, log) => ({
    calories: acc.calories + log.macros.calories,
    protein: acc.protein + log.macros.protein,
    carbs: acc.carbs + log.macros.carbs,
    fats: acc.fats + log.macros.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const sortedWeights = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let trendSlope = 0;
  let trendColor = 'text-titan-400';
  let trendMsg = 'Need more data';
  
  if (sortedWeights.length >= 4) {
      const todayW = sortedWeights[sortedWeights.length - 1].weightKg;
      const prevW = sortedWeights[sortedWeights.length - 4].weightKg; 
      trendSlope = ((todayW - prevW) / 3);
      const percentChange = (trendSlope / todayW) * 100;

      if (percentChange <= -0.2) {
          trendColor = 'text-emerald-500';
          trendMsg = 'On Track';
      } else if (percentChange > 0.2) {
          trendColor = 'text-rose-500';
          trendMsg = 'Regressing';
      } else {
          trendColor = 'text-amber-500';
          trendMsg = 'Plateau';
      }
  }

  // Measurement Logic
  const sortedMeasurements = [...measurementLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestMeasurement = sortedMeasurements[0];
  const previousMeasurement = sortedMeasurements[1];

  const getMeasurementDiff = (key: keyof MeasurementLog) => {
      if(!latestMeasurement || !previousMeasurement || !latestMeasurement[key] || !previousMeasurement[key]) return null;
      const diff = (latestMeasurement[key] as number) - (previousMeasurement[key] as number);
      return diff;
  };

  const formatDiff = (val: number | null) => {
      if (val === null) return '-';
      if (val === 0) return '0';
      const color = val < 0 ? 'text-emerald-500' : 'text-rose-500'; 
      return <span className={color}>{val > 0 ? '+' : ''}{val.toFixed(1)} cm</span>;
  };

  // Step Calculation Logic
  const weeklyTarget = client.weeklyStepGoal || 70000;
  const estimatedPastSteps = steps * 5; 
  const totalWeeklySteps = estimatedPastSteps + steps;
  const remainingWeekly = Math.max(0, weeklyTarget - totalWeeklySteps);

  // -- Handlers --
  const handleProgressPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const compressedBase64 = await compressImage(file);
          
          onAddMeasurement({
              id: Date.now().toString(),
              date: new Date().toISOString(),
              photoUrl: compressedBase64,
              notes: 'Weekly Check-in Photo',
              clientId: client.id 
          } as MeasurementLog);
          
          alert('Photo Uploaded Successfully!');
      } catch (err) {
          console.error("Upload failed", err);
          alert("Failed to upload image. Please try a smaller file.");
      }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if(q.length < 2) {
        setSearchResults([]);
        return;
    }
    const results = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
    if (results.length === 0 && q.length > 3) {
       setIsAiSearching(true);
       try {
          const aiResult = await searchFoodDatabase(q);
          const aiFoodItem: FoodItem = {
            id: 'ai-' + Date.now(),
            name: aiResult.foodName,
            caloriesPer100g: Math.round(aiResult.macros.calories / (aiResult.grams/100)),
            proteinPer100g: Math.round(aiResult.macros.protein / (aiResult.grams/100)),
            carbsPer100g: Math.round(aiResult.macros.carbs / (aiResult.grams/100)),
            fatsPer100g: Math.round(aiResult.macros.fats / (aiResult.grams/100)),
            fiberPer100g: 0,
            imageUrl: `https://image.pollinations.ai/prompt/delicious%20${encodeURIComponent(aiResult.foodName)}%20plated%20food%20photo?width=400&height=300&nologo=true`
          };
          setSearchResults([aiFoodItem]);
       } catch (e) {
         console.error(e);
       } finally {
         setIsAiSearching(false);
       }
    } else {
      setSearchResults(results);
    }
  }

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery('');
    setSearchResults([]);
  }

  const handleConfirmManualFood = () => {
      if(!selectedFood) return;
      const ratio = manualGrams / 100;
      onAddFood({
        id: Date.now().toString(),
        clientId: client.id,
        date: new Date().toISOString(),
        mealType: manualMealType,
        foodName: selectedFood.name,
        grams: manualGrams,
        macros: {
            calories: Math.round(selectedFood.caloriesPer100g * ratio),
            protein: Math.round(selectedFood.proteinPer100g * ratio),
            carbs: Math.round(selectedFood.carbsPer100g * ratio),
            fats: Math.round(selectedFood.fatsPer100g * ratio),
            fiber: Math.round(selectedFood.fiberPer100g * ratio)
        },
        isVerified: true,
        photoUrl: selectedFood.imageUrl 
      });
      setSelectedFood(null);
      setManualGrams(100);
      setSearchQuery('');
      setAiAlert({ type: 'success', message: `Logged ${selectedFood.name}` });
      setTimeout(() => setAiAlert(null), 3000);
  }

  const handleSaveMeasurements = () => {
      if(!measurementForm.chest && !measurementForm.waist) return;
      onAddMeasurement({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          ...measurementForm,
          clientId: client.id
      } as MeasurementLog);
      setMeasurementForm({ chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0 });
      alert("Measurements Logged!");
  };

  const handleEditFood = (log: FoodLog) => {
      const foodItem = FOOD_DATABASE.find(f => f.name === log.foodName);
      if (foodItem) setSelectedFood(foodItem);
      else {
          setSelectedFood({
              id: 'temp',
              name: log.foodName,
              caloriesPer100g: Math.round(log.macros.calories / (log.grams/100)),
              proteinPer100g: Math.round(log.macros.protein / (log.grams/100)),
              carbsPer100g: Math.round(log.macros.carbs / (log.grams/100)),
              fatsPer100g: Math.round(log.macros.fats / (log.grams/100)),
              fiberPer100g: 0,
              imageUrl: log.photoUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(log.foodName)}%20food?width=400&height=300&nologo=true`
          });
      }
      setManualGrams(log.grams);
      setManualMealType(log.mealType);
      onDeleteFood(log.id); 
      setLogMethod('manual');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickLogCoachMeal = (mealText: string, mealType: string) => {
      const match = mealText.match(/(\d+)\s*g\s+([a-zA-Z\s]+)/i);
      setManualMealType(mealType);
      if (match) {
          const grams = parseInt(match[1]);
          const name = match[2].trim();
          const foodMatch = FOOD_DATABASE.find(f => f.name.toLowerCase().includes(name.toLowerCase()));
          if (foodMatch) {
              setSelectedFood(foodMatch);
              setManualGrams(grams);
          } else {
              setSearchQuery(name);
              handleSearch(name); 
          }
      } else {
         setSearchQuery(mealText.substring(0, 20));
         handleSearch(mealText.substring(0, 20));
      }
      setLogMethod('manual');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setAiAlert(null);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        try {
            const result = await analyzeFoodImage(base64String);
            const CONFIDENCE_THRESHOLD = 0.75;

            if (result.confidence > CONFIDENCE_THRESHOLD) {
                onAddFood({
                    id: Date.now().toString(),
                    clientId: client.id,
                    date: new Date().toISOString(),
                    mealType: manualMealType as any,
                    foodName: result.foodName,
                    grams: result.grams,
                    macros: result.macros,
                    isVerified: true,
                    photoUrl: URL.createObjectURL(file),
                    aiConfidence: result.confidence
                });
                setAiAlert({ type: 'success', message: `Added: ${result.foodName} (${result.grams}g)` });
            } else {
                const per100Multiplier = 100 / (result.grams || 100);
                const tempFoodItem: FoodItem = {
                    id: 'ai-temp-' + Date.now(),
                    name: result.foodName + (result.confidence < 0.5 ? ' (?)' : ''),
                    caloriesPer100g: Math.round(result.macros.calories * per100Multiplier),
                    proteinPer100g: Math.round(result.macros.protein * per100Multiplier),
                    carbsPer100g: Math.round(result.macros.carbs * per100Multiplier),
                    fatsPer100g: Math.round(result.macros.fats * per100Multiplier),
                    fiberPer100g: Math.round(result.macros.fiber * per100Multiplier),
                    imageUrl: URL.createObjectURL(file)
                };
                setSelectedFood(tempFoodItem);
                setManualGrams(result.grams);
                setLogMethod('manual');
                setAiAlert({ type: 'warning', message: 'Low confidence detection. Please review details.' });
            }
        } catch (err) {
            console.error(err);
            setAiAlert({ type: 'warning', message: "AI Analysis failed. Please enter manually." });
            setLogMethod('manual');
        } finally {
            setAnalyzing(false);
        }
    };
    reader.readAsDataURL(file);
  };

  // -- Sub-Components --
  const MacroCard = ({ compact = false }: { compact?: boolean }) => {
    const calsPct = Math.min((consumed.calories / client.dailyMacroTargets.calories) * 100, 100);
    return (
        <div className={`p-6 border rounded-2xl bg-titan-900 border-titan-800 shadow-xl relative overflow-hidden ${compact ? '' : 'h-full'}`}>
             <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-white">Daily Nutrition</h3>
                    <p className="text-sm text-titan-400">Goal: {client.dailyMacroTargets.calories} kcal</p>
                </div>
                {view !== 'nutrition' && (
                    <button onClick={() => navigate('/nutrition')} className="p-2 bg-titan-800 hover:bg-titan-700 rounded-lg text-accent-500 transition-colors">
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>
            
            <div className={`flex ${compact ? 'flex-row items-center' : 'flex-col items-center'} gap-8`}>
                <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                         <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient-cals)" strokeWidth="8" strokeDasharray={`${calsPct * 2.83} 283`} strokeLinecap="round" />
                         <defs>
                            <linearGradient id="gradient-cals" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                         </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                         <span className="text-3xl font-bold text-white tracking-tighter">{consumed.calories}</span>
                         <span className="text-xs font-medium text-titan-400 uppercase tracking-widest">Consumed</span>
                    </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                    <MacroRow label="Protein" current={consumed.protein} target={client.dailyMacroTargets.protein} color="bg-blue-500" bg="bg-blue-500/10" />
                    <MacroRow label="Carbs" current={consumed.carbs} target={client.dailyMacroTargets.carbs} color="bg-amber-500" bg="bg-amber-500/10" />
                    <MacroRow label="Fats" current={consumed.fats} target={client.dailyMacroTargets.fats} color="bg-rose-500" bg="bg-rose-500/10" />
                </div>
            </div>
        </div>
    );
  }

  const FoodLoggerNew = () => (
    <div className="bg-titan-900 border border-titan-800 rounded-2xl shadow-2xl relative z-10 overflow-visible">
        <div className="p-4 border-b border-titan-800 bg-titan-950/50 flex justify-between items-center rounded-t-2xl">
            <h3 className="font-bold text-white flex items-center gap-2"><Plus size={18} className="text-accent-500"/> Add Food</h3>
            <select className="bg-titan-800 border border-titan-700 rounded-lg text-xs text-white px-3 py-1.5 outline-none focus:border-accent-500 cursor-pointer" value={manualMealType} onChange={e => setManualMealType(e.target.value)}>
                {Object.keys(client.mealPlan || {}).map(k => k.charAt(0).toUpperCase() + k.slice(1)).map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
                {Object.keys(client.mealPlan || {}).length === 0 && ['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => <option key={t}>{t}</option>)}
            </select>
        </div>
        
        {/* Alerts */}
        {aiAlert && (
            <div className={`mx-4 mt-4 p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${aiAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                {aiAlert.type === 'success' ? <Check size={16}/> : <AlertTriangle size={16}/>}
                {aiAlert.message}
            </div>
        )}

        <div className="p-4">
            <div className="flex p-1 bg-titan-950 rounded-lg mb-4 border border-titan-800">
                <button onClick={() => setLogMethod('manual')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${logMethod === 'manual' ? 'bg-titan-800 text-white shadow' : 'text-titan-500 hover:text-titan-300'}`}><Search size={14} className="inline mr-2"/> Database</button>
                <button onClick={() => setLogMethod('photo')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${logMethod === 'photo' ? 'bg-titan-800 text-white shadow' : 'text-titan-500 hover:text-titan-300'}`}><Camera size={14} className="inline mr-2"/> AI Photo</button>
            </div>

            {logMethod === 'manual' && (
                <div className="space-y-4">
                    {!selectedFood ? (
                        <div className="relative">
                            <input className="w-full bg-titan-950 border border-titan-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-titan-500" placeholder="Search food..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                            <Search className="absolute top-3.5 left-4 text-titan-500 w-5 h-5" />
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-titan-800 border border-titan-700 rounded-xl max-h-80 overflow-y-auto shadow-2xl">
                                    {searchResults.map(food => (
                                        <button key={food.id} onClick={() => handleSelectFood(food)} className="w-full text-left px-4 py-3 hover:bg-titan-900 text-sm text-white flex items-center gap-3 border-b border-titan-700/50">
                                            <div className="w-8 h-8 rounded bg-titan-950 overflow-hidden"><img src={food.imageUrl} className="w-full h-full object-cover"/></div>
                                            <div>{food.name} <span className="text-xs text-titan-400 block">{food.caloriesPer100g} kcal</span></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-titan-950 rounded-xl border border-titan-800 animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-white">{selectedFood.name}</span>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={manualGrams} onChange={e => setManualGrams(Number(e.target.value))} className="w-20 bg-titan-900 border border-titan-700 rounded px-2 py-1 text-white" />
                                    <span className="text-xs text-titan-500">g</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                <NutrientBox label="Cal" value={Math.round(selectedFood.caloriesPer100g * (manualGrams / 100))} unit="" color="text-white" />
                                <NutrientBox label="Pro" value={Math.round(selectedFood.proteinPer100g * (manualGrams / 100))} unit="g" color="text-blue-400" />
                                <NutrientBox label="Carb" value={Math.round(selectedFood.carbsPer100g * (manualGrams / 100))} unit="g" color="text-amber-400" />
                                <NutrientBox label="Fat" value={Math.round(selectedFood.fatsPer100g * (manualGrams / 100))} unit="g" color="text-rose-400" />
                            </div>
                            <button onClick={handleConfirmManualFood} className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-2 rounded-lg">Log Food</button>
                        </div>
                    )}
                </div>
            )}
            
            {logMethod === 'photo' && (
                 <div className="flex flex-col items-center justify-center w-full py-8">
                    <label className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer border-titan-700 bg-titan-950 hover:bg-titan-900 hover:border-accent-500/50 transition-all relative overflow-hidden">
                        {analyzing ? (
                            <div className="flex flex-col items-center gap-4 text-accent-500">
                                <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium animate-pulse">Analyzing food structure...</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-titan-800 flex items-center justify-center mb-4 group-hover:bg-titan-800/80 transition-colors">
                                    <Camera className="w-8 h-8 text-titan-400 group-hover:text-accent-500 transition-colors" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Upload Meal Photo</h3>
                                <p className="text-xs text-titan-500 text-center max-w-[200px]">AI will identify food items and estimate macros.</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </>
                        )}
                    </label>
                 </div>
            )}
        </div>
    </div>
  );

  const FoodLogList = () => (
    <div className="mt-8">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-titan-500"/> Today's History
        </h4>
        <div className="space-y-3">
            {todaysLogs.length === 0 && <div className="text-center py-12 bg-titan-900/30 rounded-xl border border-titan-800 border-dashed"><p className="text-sm text-titan-500">Your food log is empty today.</p></div>}
            {todaysLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center p-4 bg-titan-900/50 hover:bg-titan-900 rounded-xl border border-titan-800 group transition-all">
                    <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-titan-950 border border-titan-800 overflow-hidden flex-shrink-0">
                                {log.photoUrl ? (
                                    <img src={log.photoUrl} className="w-full h-full object-cover" alt="Meal" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-titan-400 uppercase">
                                        {log.mealType.substring(0,3)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-white font-medium flex items-center gap-2">
                                    {log.foodName}
                                    {log.aiConfidence && log.aiConfidence > 0.8 && <CheckCircle2 size={14} className="text-accent-500" />}
                                </div>
                                <div className="text-xs text-titan-500 flex gap-2">
                                    <span>{log.grams}g</span>
                                    <span>•</span>
                                    <span className="text-titan-300">{log.macros.calories} kcal</span>
                                </div>
                            </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleEditFood(log)} className="p-2 text-titan-500 hover:text-white hover:bg-titan-800 rounded-lg transition-all" title="Edit Entry"><Edit3 size={16} /></button>
                        <button onClick={() => onDeleteFood(log.id)} className="p-2 text-titan-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete Entry"><Trash2 size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const CoachMealPlan = () => (
    <div className="p-6 border rounded-xl bg-titan-900 border-titan-800 h-full">
        <div className="flex items-center gap-2 mb-6">
            <Utensils className="text-accent-500" size={20} />
            <h3 className="font-semibold text-titan-200">Coach's Suggestions</h3>
        </div>
        <div className="space-y-4">
            {Object.keys(client.mealPlan || {}).map((meal) => (
                    <div key={meal} className={`p-4 rounded-lg border transition-colors ${manualMealType.toLowerCase() === meal.toLowerCase() ? 'bg-accent-500/10 border-accent-500/30' : 'bg-titan-950 border-titan-800'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <div className={`text-xs font-bold uppercase tracking-wider ${manualMealType.toLowerCase() === meal.toLowerCase() ? 'text-accent-500' : 'text-titan-500'}`}>{meal}</div>
                            {(client.mealPlan as any)?.[meal] && <button onClick={() => handleQuickLogCoachMeal((client.mealPlan as any)[meal], meal)} className="text-[10px] bg-accent-600 hover:bg-accent-500 text-white px-2 py-0.5 rounded flex items-center gap-1"><Zap size={10} fill="white"/> Log</button>}
                        </div>
                        <p className="text-sm text-titan-200 leading-relaxed">{(client.mealPlan as any)?.[meal] || 'No specific suggestion.'}</p>
                    </div>
            ))}
        </div>
    </div>
  );

  const WeightCard = () => (
    <div className="p-6 border rounded-xl bg-titan-900 border-titan-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-titan-200">Weight Trend</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-titan-950 border border-titan-800 ${trendColor}`}>{trendMsg}</span>
            </div>
            <div className="flex-1 min-h-[200px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedWeights}>
                    <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="weightKg" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-titan-800">
                <input type="number" placeholder="Current weight (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-full bg-titan-950 border border-titan-700 rounded px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none" />
                <button onClick={() => { if(newWeight) { onAddWeight(parseFloat(newWeight)); setNewWeight(''); } }} className="px-4 bg-titan-700 hover:bg-titan-600 rounded text-sm font-medium transition-colors text-white">Log</button>
            </div>
    </div>
  );

  const WorkoutCard = () => (
    <div className="p-6 border rounded-xl bg-titan-900 border-titan-800 h-full">
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-titan-200">Workouts</h3>{view !== 'workouts' && <button onClick={() => navigate('/workouts')} className="text-xs text-accent-500 hover:text-accent-400">View Full Plan</button>}</div>
        <div className="space-y-4">{workouts.slice(0, view === 'dashboard' ? 3 : 99).map(w => (<div key={w.id} className="p-4 bg-titan-950 rounded-lg border border-titan-800"><div className="flex justify-between items-center pb-2 border-b border-titan-800 mb-2"><span className="font-medium text-accent-500">{w.title}</span></div><div className="space-y-2 mb-3">{w.exercises.map(ex => (<div key={ex.id} className="flex items-start gap-3 text-sm group"><button onClick={() => onToggleExercise(w.id, ex.id)} className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${ex.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-titan-600'}`}>{ex.completed && <Check size={12} className="text-white" />}</button><div className="flex-1"><div className={`font-medium ${ex.completed ? 'text-titan-500 line-through' : 'text-titan-200'}`}>{ex.name}</div></div></div>))}</div></div>))}</div>
    </div>
  );

  const Header = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {getGreeting()}, <span className="text-accent-500">{client.name.split(' ')[0]}</span>
        </h1>
        <p className="text-titan-400 text-sm md:text-base flex items-center gap-2 mt-1">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           {getCurrentMealContext()}
        </p>
      </div>
      <div className="flex items-center gap-3 bg-titan-900/50 px-4 py-2 rounded-lg border border-titan-800">
         <div className="text-right">
             <div className="text-xs text-titan-500 uppercase font-bold tracking-wider">Current Time</div>
             <div className="text-lg font-mono text-white font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      <Header />

      {view === 'progress' && (
        <div className="flex gap-4 mb-6 border-b border-titan-800 overflow-x-auto">
            <button onClick={() => setActiveSubTab('weight')} className={`pb-3 text-sm font-medium whitespace-nowrap ${activeSubTab === 'weight' ? 'text-accent-500 border-b-2 border-accent-500' : 'text-titan-400'}`}>Weight</button>
            <button onClick={() => setActiveSubTab('body')} className={`pb-3 text-sm font-medium whitespace-nowrap ${activeSubTab === 'body' ? 'text-accent-500 border-b-2 border-accent-500' : 'text-titan-400'}`}>Measurements</button>
            <button onClick={() => setActiveSubTab('photos')} className={`pb-3 text-sm font-medium whitespace-nowrap ${activeSubTab === 'photos' ? 'text-accent-500 border-b-2 border-accent-500' : 'text-titan-400'}`}>Photos</button>
        </div>
      )}

      {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col h-full"><MacroCard compact /><div className="mt-4 flex-1"><button onClick={() => navigate('/nutrition')} className="w-full py-4 border border-dashed border-titan-700 rounded-xl text-titan-400 hover:text-white hover:border-accent-500 hover:bg-titan-900 transition-all flex items-center justify-center gap-2 group"><div className="p-2 rounded-full bg-titan-800 group-hover:bg-accent-600 transition-colors text-white"><Plus size={18} /></div><span className="font-medium">Log Meal</span></button></div></div>
                <WeightCard />
                <WorkoutCard />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StepTracker currentSteps={steps} dailyGoal={client.stepGoal || 10000} onUpdateSteps={onUpdateSteps} />
                <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-titan-400">Weekly Step Target</span>
                        <span className="text-white font-bold">{weeklyTarget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-titan-800 rounded-full h-3 mb-4 overflow-hidden">
                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${Math.min(100, ((weeklyTarget - remainingWeekly)/weeklyTarget)*100)}%` }}></div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">{remainingWeekly.toLocaleString()}</span>
                            <span className="text-xs text-titan-500 uppercase tracking-wider font-medium">Steps Remaining This Week</span>
                        </div>
                        <Footprints className="text-purple-500 opacity-50" size={32} />
                    </div>
                </div>
             </div>
          </div>
      )}

      {view === 'nutrition' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in slide-in-from-right-8 duration-500">
              <div className="lg:col-span-7 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MacroCard />
                      <CoachMealPlan />
                  </div>
                  <FoodLoggerNew />
              </div>
              <div className="lg:col-span-5"><div className="bg-titan-950 border border-titan-800 rounded-xl p-6 shadow-xl h-full"><FoodLogList /></div></div>
          </div>
      )}

      {view === 'habits' && (
        <div className="mt-6 animate-in fade-in">
           <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl">
               <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Sun className="text-accent-500" /> Daily Habits</h3>
               <div className="space-y-3">
                   {habits.length === 0 && <p className="text-sm text-titan-500">No habits assigned yet.</p>}
                   {habits.map(habit => (
                       <button key={habit.id} onClick={() => toggleHabit(habit.id)} className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${habit.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-titan-950 border-titan-800 hover:border-titan-600'}`}>
                           <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${habit.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-titan-500'}`}>{habit.completed && <Check size={14} className="text-white"/>}</div>
                               <span className={`text-sm ${habit.completed ? 'text-white line-through opacity-70' : 'text-white'}`}>{habit.name}</span>
                           </div>
                           <span className="text-xs text-titan-500">{habit.frequency}</span>
                       </button>
                   ))}
               </div>
           </div>
        </div>
      )}

      {view === 'progress' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
               {activeSubTab === 'weight' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><WeightCard /><StepTracker currentSteps={steps} dailyGoal={client.stepGoal || 10000} onUpdateSteps={onUpdateSteps} /></div>}
               
               {activeSubTab === 'body' && (
                   <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-titan-900 border border-titan-800 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Ruler className="text-accent-500"/> Log Measurements</h3>
                                    <div className="space-y-4">
                                        {['chest', 'waist', 'hips', 'arms', 'thighs'].map(part => (
                                            <div key={part}><label className="text-xs text-titan-400 capitalize">{part} (cm)</label><input type="number" value={(measurementForm as any)[part]} onChange={(e) => setMeasurementForm({...measurementForm, [part]: Number(e.target.value)})} className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white" /></div>
                                        ))}
                                        <button onClick={handleSaveMeasurements} className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-2 rounded-lg mt-2 transition-colors">Save Entry</button>
                                    </div>
                            </div>
                            <div className="bg-titan-900 border border-titan-800 rounded-xl p-6 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History className="text-accent-500"/> Weekly Comparison</h3>
                                <div className="space-y-4 flex-1">
                                    <div className="flex justify-between items-center text-xs text-titan-500 uppercase pb-2 border-b border-titan-800">
                                        <span>Body Part</span>
                                        <div className="flex gap-8">
                                            <span>Current</span>
                                            <span>Change</span>
                                        </div>
                                    </div>
                                    {['chest', 'waist', 'hips', 'arms', 'thighs'].map(part => (
                                        <div key={part} className="flex justify-between items-center py-2 border-b border-titan-800 last:border-0">
                                            <span className="text-sm text-titan-300 capitalize">{part}</span>
                                            <div className="flex gap-8 items-center w-32 justify-between">
                                                <span className="text-white font-bold">{latestMeasurement?.[part as keyof MeasurementLog] || '-'}</span>
                                                <span className="text-sm font-medium">{formatDiff(getMeasurementDiff(part as keyof MeasurementLog))}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {sortedMeasurements.length < 2 && <p className="text-xs text-titan-500 italic mt-2">Log one more week to see comparisons.</p>}
                                </div>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-titan-900 border border-titan-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-titan-800"><h3 className="font-bold text-white">Full History</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-titan-500 uppercase bg-titan-950/50">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Chest</th>
                                            <th className="px-6 py-3">Waist</th>
                                            <th className="px-6 py-3">Hips</th>
                                            <th className="px-6 py-3">Arms</th>
                                            <th className="px-6 py-3">Thighs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-titan-800">
                                        {sortedMeasurements.map(log => (
                                            <tr key={log.id} className="hover:bg-titan-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-titan-300">{new Date(log.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-white">{log.chest || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-white">{log.waist || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-white">{log.hips || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-white">{log.arms || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-white">{log.thighs || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                   </div>
               )}

               {activeSubTab === 'photos' && (
                   <div className="bg-titan-900 border border-titan-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Camera className="text-accent-500"/> Weekly Check-in Photos</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setPhotoCompareMode(!photoCompareMode)} className={`text-xs px-3 py-1.5 rounded flex items-center gap-2 border transition-colors ${photoCompareMode ? 'bg-accent-600 border-accent-600 text-white' : 'bg-titan-950 border-titan-700 text-titan-400 hover:text-white'}`}>
                                    <ArrowRightLeft size={14}/> Compare Side-by-Side
                                </button>
                                <button 
                                  onClick={() => fileInputRef.current?.click()} 
                                  className="text-xs bg-titan-800 hover:bg-titan-700 text-white px-3 py-1.5 rounded flex items-center gap-2 border border-titan-700"
                                >
                                    <Plus size={14}/> Upload New
                                </button>
                                <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={handleProgressPhotoUpload} 
                                />
                            </div>
                        </div>

                        {photoCompareMode ? (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                {[1, 2].map(i => (
                                    <div key={i} className="space-y-2">
                                        <select 
                                            className="w-full bg-titan-950 border border-titan-700 rounded-lg px-3 py-2 text-xs text-white"
                                            value={i === 1 ? compareDate1 : compareDate2}
                                            onChange={(e) => i === 1 ? setCompareDate1(e.target.value) : setCompareDate2(e.target.value)}
                                        >
                                            <option value="">Select Date...</option>
                                            {measurementLogs.map(log => <option key={log.id} value={log.id}>{new Date(log.date).toLocaleDateString()}</option>)}
                                        </select>
                                        <div className="aspect-[3/4] bg-titan-950 border border-titan-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                                            {(i === 1 ? compareDate1 : compareDate2) ? (
                                                <img 
                                                    src={measurementLogs.find(m => m.id === (i === 1 ? compareDate1 : compareDate2))?.photoUrl} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Progress"
                                                />
                                            ) : (
                                                <span className="text-xs text-titan-500">Select a date</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {sortedMeasurements.filter(m => m.photoUrl).map(log => {
                                    // Find corresponding weight log for this date (simple approximation)
                                    const associatedWeight = weightLogs.find(w => w.date.startsWith(log.date.split('T')[0]))?.weightKg;
                                    
                                    return (
                                        <div key={log.id} className="aspect-[3/4] bg-titan-950 border border-titan-800 rounded-lg flex items-center justify-center relative group overflow-hidden">
                                            <img src={log.photoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Progress" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex flex-col justify-end p-3">
                                                <span className="text-xs font-bold text-white">{new Date(log.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-titan-400">{associatedWeight ? `${associatedWeight}kg` : 'No weight'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {sortedMeasurements.filter(m => m.photoUrl).length === 0 && <p className="col-span-full text-center text-sm text-titan-500 py-12">No progress photos uploaded yet.</p>}
                            </div>
                        )}
                   </div>
               )}
          </div>
      )}

      {view === 'workouts' && <div className="animate-in fade-in"><WorkoutCard /></div>}
    </div>
  );
};

const MacroRow = ({ label, current, target, color, bg }: { label: string, current: number, target: number, color: string, bg: string }) => {
    const pct = Math.min((current / target) * 100, 100);
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-titan-300">{label}</span>
                <span className="text-white">{Math.round(current)} / {target}g</span>
            </div>
            <div className={`h-2.5 w-full ${bg} rounded-full overflow-hidden`}>
                <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    )
}

const NutrientBox = ({ label, value, unit, color }: any) => (
    <div className="bg-titan-900 rounded-xl p-3 border border-titan-800 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-titan-500 uppercase tracking-widest font-bold mb-1">{label}</span>
        <span className={`text-xl font-bold ${color}`}>{value}<span className="text-sm ml-0.5 text-titan-500">{unit}</span></span>
    </div>
)

export default ClientHome;
