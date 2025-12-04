import React, { useState } from 'react';
import { ClientProfile, Macros, Workout, ExerciseDefinition, FoodItem, MealPlan, Habit, WeightLog, MeasurementLog } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Dumbbell, PlayCircle, BookOpen, X, Zap, Loader2, Search, Check, Utensils, Edit3, Footprints, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { EXERCISE_LIBRARY, FOOD_DATABASE } from '../constants';
import { generateAiDiet, generateAiWorkout } from '../services/geminiService';

interface CoachClientDetailProps {
  client: ClientProfile;
  workouts: Workout[];
  weightLogs: WeightLog[];
  measurementLogs: MeasurementLog[];
  onUpdateClient: (updatedClient: ClientProfile) => void;
  onAddWorkout: (workout: Workout) => void;
  onUpdateWorkout: (workout: Workout) => void;
}

const CoachClientDetail: React.FC<CoachClientDetailProps> = ({ client, workouts, weightLogs, measurementLogs, onUpdateClient, onAddWorkout, onUpdateWorkout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'workouts'>('overview');
  
  // State for Overview / Goals
  const [stepGoal, setStepGoal] = useState(client.stepGoal || 10000);
  const [weeklyStepGoal, setWeeklyStepGoal] = useState(client.weeklyStepGoal || (client.stepGoal || 10000) * 7);
  const [habits, setHabits] = useState<Habit[]>(client.habits || []);
  const [newHabitName, setNewHabitName] = useState('');

  // State for Diet Editing
  const [dietForm, setDietForm] = useState<Macros>(client.dailyMacroTargets);
  const [mealPlan, setMealPlan] = useState<MealPlan>(client.mealPlan || {
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  });
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [newMealSlotName, setNewMealSlotName] = useState('');
  
  // State for Food Picker (Meal Plan)
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [targetMealSlot, setTargetMealSlot] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoodForSlot, setSelectedFoodForSlot] = useState<FoodItem | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(100);
  const [autoUpdateMacros, setAutoUpdateMacros] = useState(true);

  // State for Workout Editing
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    dayOfWeek: 'Monday',
    title: '',
    exercises: []
  });
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);

  // Library Modal State
  const [showLibModal, setShowLibModal] = useState(false);
  const [libCategory, setLibCategory] = useState<string>('All');
  
  // Mock weight history safely
  const weightHistory = [
     { date: 'Jan', weight: client.startWeightKg || 0 },
     { date: 'Feb', weight: (client.startWeightKg || 0) - 1 },
     { date: 'Mar', weight: (client.startWeightKg || 0) - 2.5 },
     { date: 'Apr', weight: (client.startWeightKg || 0) - 2.8 },
     { date: 'May', weight: client.currentWeightKg || 0 },
  ];

  const handleDailyStepChange = (val: number) => {
      setStepGoal(val);
      setWeeklyStepGoal(val * 7);
  }

  const handleWeeklyStepChange = (val: number) => {
      setWeeklyStepGoal(val);
      setStepGoal(Math.round(val / 7));
  }

  const handleUpdateGoals = () => {
    onUpdateClient({
        ...client,
        stepGoal: stepGoal,
        weeklyStepGoal: weeklyStepGoal,
        habits: habits
    });
    alert('Client goals & habits updated successfully!');
  };

  const handleAddHabit = () => {
      if(!newHabitName) return;
      setHabits([...habits, { id: Date.now().toString(), name: newHabitName, frequency: 'Daily', completed: false }]);
      setNewHabitName('');
  };

  const handleRemoveHabit = (id: string) => {
      setHabits(habits.filter(h => h.id !== id));
  };

  const handleSaveDiet = () => {
    onUpdateClient({
      ...client,
      dailyMacroTargets: dietForm,
      mealPlan: mealPlan
    });
    alert('Diet & Meal Plan updated successfully!');
  };

  const handleAiDietGen = async () => {
    setIsGeneratingDiet(true);
    try {
      const result = await generateAiDiet({
        age: client.age,
        weight: client.currentWeightKg,
        goal: client.goal
      });
      setDietForm(result.macros);
      setMealPlan(result.mealPlan);
    } catch (e) {
      alert("Failed to generate diet plan. Please try again.");
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const handleLoadIndianPreset = () => {
    setDietForm({
      calories: 1800,
      protein: 120,
      carbs: 220,
      fats: 60,
      fiber: 35
    });
    setMealPlan({
      breakfast: 'Poha with Peanuts and Green Tea',
      lunch: '2 Roti, 1 Bowl Dal Tadka, Salad',
      dinner: '1 Bowl Chicken Curry or Paneer Butter Masala with 1 Roti',
      snack: 'Roasted Makhana and Chai'
    });
    alert("Loaded Standard Indian Diet Preset!");
  };

  const openFoodPicker = (slot: string) => {
    setTargetMealSlot(slot);
    setFoodSearch('');
    setSelectedFoodForSlot(null);
    setFoodQuantity(100);
    setShowFoodModal(true);
  };

  const confirmFoodToMeal = () => {
    if (!targetMealSlot || !selectedFoodForSlot) return;
    
    const formattedItem = `${foodQuantity}g ${selectedFoodForSlot.name}`;
    const currentText = mealPlan[targetMealSlot] || '';
    const newText = currentText ? `${currentText}, ${formattedItem}` : formattedItem;
    setMealPlan({ ...mealPlan, [targetMealSlot]: newText });

    if (autoUpdateMacros) {
      const ratio = foodQuantity / 100;
      setDietForm(prev => ({
        calories: prev.calories + Math.round(selectedFoodForSlot.caloriesPer100g * ratio),
        protein: prev.protein + Math.round(selectedFoodForSlot.proteinPer100g * ratio),
        carbs: prev.carbs + Math.round(selectedFoodForSlot.carbsPer100g * ratio),
        fats: prev.fats + Math.round(selectedFoodForSlot.fatsPer100g * ratio),
        fiber: prev.fiber + Math.round(selectedFoodForSlot.fiberPer100g * ratio),
      }));
    }

    setShowFoodModal(false);
  };

  const handleAddMealSlot = () => {
      if(!newMealSlotName) return;
      setMealPlan({...mealPlan, [newMealSlotName.toLowerCase()]: ''});
      setNewMealSlotName('');
  }

  const handleAiWorkoutGen = async () => {
    if (!newWorkout.dayOfWeek) return;
    setIsGeneratingWorkout(true);
    try {
      const result = await generateAiWorkout(
        { goal: client.goal },
        newWorkout.dayOfWeek,
        newWorkout.title || 'General' 
      );
      setNewWorkout(prev => ({
        ...prev,
        title: result.title,
        exercises: result.exercises as any
      }));
    } catch (e) {
      alert("Failed to generate workout. Please try again.");
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const handleAddExerciseFromLib = (exDef: ExerciseDefinition) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [
        ...(prev.exercises || []),
        {
          id: Date.now().toString(),
          name: exDef.name,
          sets: 3,
          reps: '10-12',
          completed: false,
          videoUrl: exDef.gifUrl,
          notes: exDef.notes
        }
      ]
    }));
    setShowLibModal(false);
  };

  const updateExercise = (idx: number, field: string, val: any) => {
      setNewWorkout(prev => {
          const updated = [...(prev.exercises || [])];
          updated[idx] = { ...updated[idx], [field]: val };
          return { ...prev, exercises: updated };
      });
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setNewWorkout({
        dayOfWeek: workout.dayOfWeek,
        title: workout.title,
        exercises: workout.exercises
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleSaveWorkout = () => {
    if(!newWorkout.title || !newWorkout.dayOfWeek) return;
    
    const workoutData = {
        id: editingWorkoutId || Date.now().toString(),
        clientId: client.id,
        completed: false,
        dayOfWeek: newWorkout.dayOfWeek!,
        title: newWorkout.title!,
        exercises: newWorkout.exercises || []
    } as Workout;

    if (editingWorkoutId) {
        onUpdateWorkout(workoutData);
        alert('Workout updated successfully!');
        setEditingWorkoutId(null);
    } else {
        onAddWorkout(workoutData);
        alert('Workout assigned successfully!');
    }

    setNewWorkout({ dayOfWeek: 'Monday', title: '', exercises: [] });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-titan-800 text-titan-300 hover:bg-titan-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-sm text-titan-400">Manage plan and settings</p>
        </div>
      </div>

      <div className="flex border-b border-titan-800 space-x-6">
        {['overview', 'diet', 'workouts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-accent-500 border-b-2 border-accent-500'
                : 'text-titan-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                      <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl">
                        <h3 className="font-semibold text-white mb-4">Client Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-titan-800">
                                <span className="text-titan-400">Current Weight</span>
                                <span className="text-white font-medium">{client.currentWeightKg} kg</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-titan-800">
                                <span className="text-titan-400">Start Weight</span>
                                <span className="text-white font-medium">{client.startWeightKg} kg</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-titan-800">
                                <span className="text-titan-400">Goal</span>
                                <span className="text-white font-medium">{client.goal}</span>
                            </div>
                        </div>
                      </div>

                      <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold text-white flex items-center gap-2">
                               <Footprints size={18} className="text-accent-500" />
                               Activity & Habits
                             </h3>
                             <button onClick={handleUpdateGoals} className="text-xs bg-accent-600 hover:bg-accent-500 text-white px-3 py-1.5 rounded font-medium transition-colors">
                               Save
                             </button>
                         </div>
                         <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs text-titan-400 block mb-1.5 uppercase font-bold">Daily Step Target</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={stepGoal} 
                                        onChange={(e) => handleDailyStepChange(Number(e.target.value))}
                                        className="bg-titan-950 border border-titan-700 rounded-lg px-3 py-2 text-white w-full focus:border-accent-500 focus:outline-none"
                                    />
                                    <span className="text-sm text-titan-500 font-medium whitespace-nowrap w-24">steps / day</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-titan-400 block mb-1.5 uppercase font-bold">Weekly Step Target</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={weeklyStepGoal} 
                                        onChange={(e) => handleWeeklyStepChange(Number(e.target.value))}
                                        className="bg-titan-950 border border-titan-700 rounded-lg px-3 py-2 text-white w-full focus:border-accent-500 focus:outline-none"
                                    />
                                    <span className="text-sm text-titan-500 font-medium whitespace-nowrap w-24">steps / week</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-titan-800 pt-4">
                            <label className="text-xs text-titan-400 block mb-3 uppercase font-bold">Habit Tracking</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                  value={newHabitName}
                                  onChange={(e) => setNewHabitName(e.target.value)}
                                  placeholder="New Habit (e.g. Drink 3L Water)"
                                  className="flex-1 bg-titan-950 border border-titan-700 rounded px-3 py-2 text-white text-sm"
                                />
                                <button onClick={handleAddHabit} className="bg-titan-800 hover:bg-titan-700 text-white px-3 rounded">
                                    <Plus size={16}/>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {habits.map(h => (
                                    <div key={h.id} className="flex justify-between items-center bg-titan-950 px-3 py-2 rounded border border-titan-800">
                                        <div className="flex items-center gap-2">
                                            <Sun size={14} className="text-accent-500"/>
                                            <span className="text-sm text-white">{h.name}</span>
                                        </div>
                                        <button onClick={() => handleRemoveHabit(h.id)} className="text-titan-500 hover:text-rose-500">
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                  </div>

                  <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl">
                      <h3 className="font-semibold text-white mb-4">Weight Progress</h3>
                      <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weightHistory}>
                                <defs>
                                  <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false}/>
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="weight" stroke="#10b981" fillOpacity={1} fill="url(#colorW)" strokeWidth={2} />
                              </AreaChart>
                           </ResponsiveContainer>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {activeTab === 'diet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
            <div className="col-span-1 lg:col-span-2 flex justify-end gap-3">
                <button 
                  onClick={handleLoadIndianPreset}
                  className="flex items-center gap-2 bg-titan-800 hover:bg-titan-700 text-white px-4 py-2 rounded-lg text-sm font-bold border border-titan-600 transition-all"
                >
                  <Utensils size={16} /> Load Indian Diet Preset
                </button>
                <button 
                  onClick={handleAiDietGen} 
                  disabled={isGeneratingDiet}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all"
                >
                  {isGeneratingDiet ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="white" />}
                  {isGeneratingDiet ? 'AI is creating plan...' : 'Auto-Generate Plan with AI'}
                </button>
            </div>

            <div className="space-y-6">
                <h3 className="font-semibold text-white">Daily Macro Targets</h3>
                <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-titan-400">Calories</label>
                        <input type="number" value={dietForm.calories} onChange={e => setDietForm({...dietForm, calories: Number(e.target.value)})} className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-titan-400">Protein (g)</label>
                        <input type="number" value={dietForm.protein} onChange={e => setDietForm({...dietForm, protein: Number(e.target.value)})} className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-titan-400">Carbs (g)</label>
                        <input type="number" value={dietForm.carbs} onChange={e => setDietForm({...dietForm, carbs: Number(e.target.value)})} className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-titan-400">Fats (g)</label>
                        <input type="number" value={dietForm.fats} onChange={e => setDietForm({...dietForm, fats: Number(e.target.value)})} className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white" />
                      </div>
                  </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">Meal Suggestions</h3>
                    <div className="flex gap-2">
                        <input 
                           placeholder="New Meal Slot Name" 
                           value={newMealSlotName}
                           onChange={e => setNewMealSlotName(e.target.value)}
                           className="bg-titan-900 border border-titan-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <button onClick={handleAddMealSlot} className="bg-titan-800 hover:bg-titan-700 text-white px-2 rounded"><Plus size={14}/></button>
                    </div>
                </div>
                <div className="p-6 bg-titan-900 border border-titan-800 rounded-xl space-y-4">
                  {Object.keys(mealPlan).map((meal) => (
                    <div key={meal}>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-accent-500 font-medium uppercase">{meal}</label>
                        <div className="flex gap-2">
                            <button 
                              onClick={() => openFoodPicker(meal)}
                              className="flex items-center gap-1 text-[10px] bg-titan-800 hover:bg-titan-700 text-white px-2 py-0.5 rounded transition-colors"
                            >
                              <Plus size={10} /> Add Food
                            </button>
                            <button 
                                onClick={() => {
                                    const newPlan = {...mealPlan};
                                    delete newPlan[meal];
                                    setMealPlan(newPlan);
                                }}
                                className="text-titan-500 hover:text-rose-500"
                            >
                                <Trash2 size={12}/>
                            </button>
                        </div>
                      </div>
                      <textarea 
                          rows={2}
                          placeholder={`Enter ${meal} suggestions...`}
                          value={mealPlan[meal]}
                          onChange={e => setMealPlan({...mealPlan, [meal]: e.target.value})}
                          className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white text-sm" 
                      />
                    </div>
                  ))}
                </div>
            </div>

            <div className="lg:col-span-2">
                 <button onClick={handleSaveDiet} className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-500 text-white px-6 py-3 rounded-lg text-sm font-bold">
                  <Save size={16} /> Save Diet Plan
               </button>
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
             <div className="bg-titan-900 border border-titan-800 rounded-xl p-6 h-fit sticky top-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">{editingWorkoutId ? 'Edit Workout' : 'Create Workout'}</h3>
                    {editingWorkoutId && (
                        <button onClick={() => setEditingWorkoutId(null)} className="text-xs text-titan-400 hover:text-white">Cancel</button>
                    )}
                </div>
                
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                       <select 
                        value={newWorkout.dayOfWeek}
                        onChange={(e) => setNewWorkout({...newWorkout, dayOfWeek: e.target.value})}
                        className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white"
                       >
                         {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                           <option key={d} value={d}>{d}</option>
                         ))}
                       </select>
                       <input 
                          placeholder="Title / Focus (e.g. Leg Day)"
                          value={newWorkout.title}
                          onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})}
                          className="w-full bg-titan-950 border border-titan-700 rounded p-2 text-white"
                       />
                   </div>
                   
                   <button 
                      onClick={handleAiWorkoutGen}
                      disabled={isGeneratingWorkout}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded font-bold text-xs flex items-center justify-center gap-2 shadow-md mb-4"
                   >
                       {isGeneratingWorkout ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="white"/>}
                       AI Suggest Workout
                   </button>
                   
                   <div className="border-t border-titan-800 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                         <p className="text-xs font-medium text-titan-400">Exercises</p>
                         <button 
                           onClick={() => setShowLibModal(true)}
                           className="text-xs flex items-center gap-1 bg-titan-800 hover:bg-titan-700 px-3 py-1.5 rounded text-white transition-colors"
                         >
                            <BookOpen size={12}/> Open Library
                         </button>
                      </div>
                      
                      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                         {newWorkout.exercises?.map((ex, idx) => (
                           <div key={idx} className="bg-titan-950 p-3 rounded border border-titan-800">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium text-titan-200 text-sm">{ex.name}</div>
                                  <button onClick={() => {
                                      const updated = [...(newWorkout.exercises || [])];
                                      updated.splice(idx, 1);
                                      setNewWorkout({...newWorkout, exercises: updated});
                                  }} className="text-rose-500 hover:text-rose-400"><Trash2 size={14}/></button>
                              </div>
                              <div className="flex gap-2">
                                  <input 
                                    className="w-16 bg-titan-900 border border-titan-700 rounded px-2 py-1 text-xs text-white" 
                                    value={ex.sets}
                                    placeholder="Sets"
                                    onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                                  />
                                  <span className="text-titan-500 text-xs self-center">x</span>
                                  <input 
                                    className="w-20 bg-titan-900 border border-titan-700 rounded px-2 py-1 text-xs text-white" 
                                    value={ex.reps}
                                    placeholder="Reps"
                                    onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                                  />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <button 
                    onClick={handleSaveWorkout} 
                    className={`w-full py-2 text-white rounded font-medium ${editingWorkoutId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-accent-600 hover:bg-accent-500'}`}
                   >
                      {editingWorkoutId ? 'Update Assigned Workout' : 'Assign Workout'}
                   </button>
                </div>
             </div>

             <div className="space-y-4">
               <h3 className="font-semibold text-white">Assigned Workouts</h3>
               {workouts.map(w => (
                 <button 
                    key={w.id} 
                    onClick={() => handleEditWorkout(w)}
                    className={`w-full text-left p-4 bg-titan-900 border rounded-lg transition-all ${editingWorkoutId === w.id ? 'border-accent-500 ring-1 ring-accent-500' : 'border-titan-800 hover:border-titan-600'}`}
                 >
                    <div className="flex justify-between mb-2">
                       <span className="font-bold text-accent-500">{w.dayOfWeek}</span>
                       <span className="text-white flex items-center gap-2">
                           {w.title}
                           <Edit3 size={14} className="text-titan-500" />
                       </span>
                    </div>
                    <ul className="text-sm text-titan-400 space-y-1">
                      {w.exercises.map(ex => (
                        <li key={ex.id} className="flex items-center gap-2">
                            <Dumbbell size={12}/> {ex.name} ({ex.sets} x {ex.reps})
                        </li>
                      ))}
                    </ul>
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-titan-900 border border-titan-700 rounded-xl w-full max-w-md flex flex-col max-h-[80vh]">
             <div className="p-4 border-b border-titan-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Add Food to {targetMealSlot?.toUpperCase()}</h3>
                <button onClick={() => setShowFoodModal(false)} className="text-titan-400 hover:text-white"><X size={20}/></button>
             </div>
             
             <div className="p-4 border-b border-titan-800">
               <div className="relative">
                 <input 
                   placeholder="Search Food Database..." 
                   value={foodSearch}
                   onChange={(e) => setFoodSearch(e.target.value)}
                   className="w-full bg-titan-950 border border-titan-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-accent-500 focus:outline-none"
                   autoFocus
                 />
                 <Search size={18} className="absolute left-3 top-2.5 text-titan-500"/>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).slice(0, 20).map(food => (
                 <button 
                    key={food.id}
                    onClick={() => setSelectedFoodForSlot(food)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedFoodForSlot?.id === food.id ? 'bg-accent-600/20 border border-accent-600' : 'hover:bg-titan-800 border border-transparent'}`}
                 >
                    <div className="w-10 h-10 bg-titan-800 rounded overflow-hidden flex-shrink-0">
                      <img src={food.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{food.name}</div>
                      <div className="text-xs text-titan-400">{food.caloriesPer100g} kcal / 100g</div>
                    </div>
                    {selectedFoodForSlot?.id === food.id && <Check size={16} className="text-accent-500" />}
                 </button>
               ))}
             </div>

             {selectedFoodForSlot && (
               <div className="p-4 border-t border-titan-800 bg-titan-900">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm text-white font-medium">{selectedFoodForSlot.name}</span>
                     <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={foodQuantity}
                          onChange={(e) => setFoodQuantity(Number(e.target.value))}
                          className="w-20 bg-titan-950 border border-titan-700 rounded px-2 py-1 text-white text-sm"
                        />
                        <span className="text-xs text-titan-400">g</span>
                     </div>
                  </div>
                  <button 
                    onClick={confirmFoodToMeal}
                    className="w-full bg-accent-600 hover:bg-accent-500 text-white py-2 rounded-lg font-bold text-sm mt-2"
                  >
                    Add to Plan
                  </button>
               </div>
             )}
          </div>
        </div>
      )}

      {showLibModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-titan-900 border border-titan-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
             <div className="p-6 border-b border-titan-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Exercise Library</h3>
                <button onClick={() => setShowLibModal(false)}><X size={24} className="text-titan-400 hover:text-white"/></button>
             </div>
             <div className="p-4 border-b border-titan-800 flex gap-2 overflow-x-auto">
                {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setLibCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${libCategory === cat ? 'bg-accent-600 text-white' : 'bg-titan-800 text-titan-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
             <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXERCISE_LIBRARY.filter(ex => libCategory === 'All' || ex.muscleGroup === libCategory).map(ex => (
                    <div key={ex.id} className="bg-titan-950 border border-titan-800 rounded-lg overflow-hidden flex flex-col">
                        <div className="aspect-video bg-titan-900 relative">
                            <img src={ex.gifUrl} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                                {ex.muscleGroup}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="font-bold text-white mb-1">{ex.name}</h4>
                            <p className="text-xs text-titan-400 line-clamp-2 mb-4 flex-1">{ex.notes}</p>
                            <button 
                                onClick={() => handleAddExerciseFromLib(ex)}
                                className="w-full py-2 bg-titan-800 hover:bg-accent-600 hover:text-white text-titan-300 rounded font-medium text-xs transition-colors"
                            >
                                Add to Workout
                            </button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachClientDetail;