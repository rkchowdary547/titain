import React, { useState, useEffect, useRef } from 'react';
import { Footprints, Plus, Play, Pause } from 'lucide-react';

interface StepTrackerProps {
  currentSteps: number;
  dailyGoal: number;
  onUpdateSteps: (steps: number) => void;
}

const StepTracker: React.FC<StepTrackerProps> = ({ currentSteps, dailyGoal, onUpdateSteps }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [isManual, setIsManual] = useState(false);
  
  // Pedometer Logic Ref
  const accelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const lastStepTime = useRef(0);

  useEffect(() => {
    let cleanup: () => void;

    if (isTracking && window.DeviceMotionEvent) {
      const handleMotion = (event: DeviceMotionEvent) => {
        const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
        
        // Simple magnitude calculation
        if (x === null || y === null || z === null) return;

        const magnitude = Math.sqrt(x*x + y*y + z*z);
        
        // Threshold for step detection (approximate for demo)
        // 1.2G is a common threshold for walking
        const now = Date.now();
        if (magnitude > 12 && (now - lastStepTime.current > 400)) { // 12 m/s^2 (~1.2g), debounce 400ms
           setSessionSteps(prev => {
             const newCount = prev + 1;
             onUpdateSteps(currentSteps + 1);
             return newCount;
           });
           lastStepTime.current = now;
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      cleanup = () => window.removeEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isTracking, currentSteps, onUpdateSteps]);

  const toggleTracking = () => {
    if (!isTracking) {
      // Request permission for iOS 13+
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              setIsTracking(true);
            }
          })
          .catch(console.error);
      } else {
        setIsTracking(true);
      }
    } else {
      setIsTracking(false);
    }
  };

  const addManualSteps = () => {
    const steps = parseInt(manualInput);
    if (!isNaN(steps) && steps > 0) {
      onUpdateSteps(currentSteps + steps);
      setManualInput('');
      setIsManual(false);
    }
  };

  const percentage = Math.min((currentSteps / dailyGoal) * 100, 100);

  return (
    <div className="p-6 border rounded-xl bg-titan-900 border-titan-800">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-titan-200">Step Tracker</h3>
        <button 
          onClick={() => setIsManual(!isManual)}
          className="text-xs text-titan-400 hover:text-white underline"
        >
          {isManual ? 'Cancel' : 'Add Manual'}
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-titan-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
            <path className="text-purple-500" strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
          </svg>
          <div className="absolute flex flex-col items-center">
             <Footprints size={20} className="text-purple-500 mb-1"/>
             <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
           <div>
             <div className="text-2xl font-bold text-white">{currentSteps.toLocaleString()}</div>
             <div className="text-xs text-titan-500">of {dailyGoal.toLocaleString()} goal</div>
           </div>
           
           {isManual ? (
             <div className="flex gap-2">
               <input 
                 type="number" 
                 placeholder="Steps" 
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
                 className="w-full bg-titan-950 border border-titan-700 rounded px-2 py-1 text-sm text-white"
               />
               <button onClick={addManualSteps} className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded text-sm">
                 <Plus size={16}/>
               </button>
             </div>
           ) : (
             <button 
              onClick={toggleTracking}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors w-full justify-center ${
                isTracking 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-titan-800 text-titan-300 hover:bg-titan-700'
              }`}
             >
               {isTracking ? <><Pause size={12}/> Stop Pedometer</> : <><Play size={12}/> Start Pedometer</>}
             </button>
           )}
        </div>
      </div>
      
      {isTracking && (
        <div className="mt-3 text-center text-[10px] text-titan-500 animate-pulse">
           Sensor Active • Keep phone in pocket
        </div>
      )}
    </div>
  );
};

export default StepTracker;