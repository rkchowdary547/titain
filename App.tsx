
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ClientHome from './components/ClientHome';
import CoachClientDetail from './components/CoachClientDetail';
import { User, UserRole, ClientProfile, FoodLog, WeightLog, Workout, MeasurementLog } from './types';
import { db } from './services/db';

function App() {
  const [user, setUser] = useState<User | null>(null);
  
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userSteps, setUserSteps] = useState(6500); 
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize DB on Mount
  useEffect(() => {
    const init = async () => {
        await db.initialize();
        refreshData();
        setIsDbReady(true);
    };
    init();
  }, []);

  const refreshData = () => {
      // Use spread operator to create new array references and trigger React re-renders
      setClients([...db.getClients()]);
      setFoodLogs([...db.getFoodLogs()]);
      setWeightLogs([...db.getWeightLogs()]);
      setMeasurementLogs([...db.getMeasurements()]);
      setWorkouts([...db.getWorkouts()]);
  };

  const handleLogin = async (role: UserRole, credentials: { identifier: string; secret: string }) => {
    const authenticatedUser = await db.authenticate(credentials.identifier, credentials.secret, role);
    if (authenticatedUser) {
        setUser(authenticatedUser);
        refreshData(); // Ensure data is fresh on login
    } else {
        throw new Error('Authentication failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  // --- WRAPPERS TO SYNC STATE & DB ---

  const addFoodLog = (log: FoodLog) => {
    db.addFoodLog(log);
    setFoodLogs([...db.getFoodLogs()]);
  };

  const deleteFoodLog = (logId: string) => {
    db.deleteFoodLog(logId);
    setFoodLogs([...db.getFoodLogs()]);
  };

  const addWeightLog = (weight: number) => {
    if (!user) return;
    const newLog: WeightLog = {
      id: Date.now().toString(),
      clientId: user.id,
      date: new Date().toISOString(),
      weightKg: weight,
      source: 'manual',
      trendStatus: 'green' 
    };
    db.addWeightLog(newLog);
    setWeightLogs([...db.getWeightLogs()]);
    setClients([...db.getClients()]); // To update current weight in profile
  };

  const addMeasurementLog = (log: MeasurementLog) => {
    const logWithClient = { ...log, clientId: user?.id || '' };
    db.addMeasurement(logWithClient);
    setMeasurementLogs([...db.getMeasurements()]);
  };

  const createClient = (newClient: ClientProfile) => {
    db.addClient(newClient);
    setClients([...db.getClients()]);
  };

  const updateClientProfile = (updatedClient: ClientProfile) => {
    db.updateClient(updatedClient);
    setClients([...db.getClients()]);
  };

  const addWorkout = (workout: Workout) => {
    db.addWorkout(workout);
    setWorkouts([...db.getWorkouts()]);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    db.updateWorkout(updatedWorkout);
    setWorkouts([...db.getWorkouts()]);
  };

  const toggleExerciseCompletion = (workoutId: string, exerciseId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );
    const allCompleted = updatedExercises.length > 0 && updatedExercises.every(ex => ex.completed);
    
    const updatedWorkout = { ...workout, exercises: updatedExercises, completed: allCompleted };
    db.updateWorkout(updatedWorkout);
    setWorkouts([...db.getWorkouts()]);
  };

  if (!isDbReady) {
      return <div className="min-h-screen bg-titan-950 flex items-center justify-center text-white">Initializing Secure Database...</div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderClientHome = (view: 'dashboard' | 'nutrition' | 'workouts' | 'progress' | 'habits') => (
    <ClientHome 
      view={view}
      client={clients.find(c => c.id === user.id) || clients[0]} 
      foodLogs={foodLogs.filter(f => f.clientId === user.id)}
      weightLogs={weightLogs.filter(w => w.clientId === user.id)}
      workouts={workouts.filter(w => w.clientId === user.id)}
      measurementLogs={measurementLogs.filter(m => m.clientId === user.id)}
      steps={userSteps}
      onAddFood={addFoodLog}
      onDeleteFood={deleteFoodLog}
      onAddWeight={addWeightLog}
      onAddMeasurement={addMeasurementLog}
      onUpdateSteps={setUserSteps}
      onToggleExercise={toggleExerciseCompletion}
    />
  );

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {user.role === UserRole.COACH ? (
            <>
              <Route path="/" element={<Dashboard clients={clients} onCreateClient={createClient} />} />
              <Route path="/clients" element={<Navigate to="/" replace />} />
              <Route path="/client/:clientId" element={
                <ClientDetailWrapper 
                   clients={clients} 
                   workouts={workouts}
                   weightLogs={weightLogs}
                   measurementLogs={measurementLogs}
                   onUpdateClient={updateClientProfile}
                   onAddWorkout={addWorkout}
                   onUpdateWorkout={updateWorkout}
                />
              } />
            </>
          ) : (
            <>
             <Route path="/" element={renderClientHome('dashboard')} />
             <Route path="/nutrition" element={renderClientHome('nutrition')} />
             <Route path="/workouts" element={renderClientHome('workouts')} />
             <Route path="/progress" element={renderClientHome('progress')} />
             <Route path="/habits" element={renderClientHome('habits')} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

// Wrapper to pass logs to Coach Client Detail
const ClientDetailWrapper = ({ clients, workouts, weightLogs, measurementLogs, onUpdateClient, onAddWorkout, onUpdateWorkout }: any) => {
  const { clientId } = useParams();
  const client = clients.find((c: ClientProfile) => c.id === clientId);
  if (!client) return <div className="text-white">Client not found</div>;
  
  return (
    <CoachClientDetail 
      client={client} 
      workouts={workouts.filter((w: Workout) => w.clientId === client.id)}
      weightLogs={weightLogs.filter((w: WeightLog) => w.clientId === client.id)}
      measurementLogs={measurementLogs.filter((m: MeasurementLog) => m.clientId === client.id)}
      onUpdateClient={onUpdateClient}
      onAddWorkout={onAddWorkout}
      onUpdateWorkout={onUpdateWorkout}
    />
  );
}

export default App;
