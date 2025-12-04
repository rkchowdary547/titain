import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ClientProfile, Macros, UserRole } from '../types';

interface CreateClientModalProps {
  onClose: () => void;
  onSave: (client: ClientProfile) => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    passportCode: '',
    dob: '',
    heightCm: '',
    startWeightKg: '',
    goal: '',
    subscriptionEndDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dobDate = new Date(formData.dob);
    const ageDiffMs = Date.now() - dobDate.getTime();
    const ageDate = new Date(ageDiffMs); 
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

    const newClient: ClientProfile = {
      id: Date.now().toString(),
      coachId: 'coach1', // Hardcoded for this demo
      role: UserRole.CLIENT,
      name: formData.name,
      username: formData.username,
      passportCode: formData.passportCode,
      dob: formData.dob,
      age: calculatedAge,
      occupation: 'Not Set',
      heightCm: Number(formData.heightCm),
      startWeightKg: Number(formData.startWeightKg),
      currentWeightKg: Number(formData.startWeightKg),
      goal: formData.goal,
      subscriptionEndDate: formData.subscriptionEndDate,
      status: 'active',
      stepGoal: 10000,
      weeklyStepGoal: 70000,
      dailyMacroTargets: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 65,
        fiber: 30
      },
      mealPlan: {
        breakfast: '',
        lunch: '',
        dinner: '',
        snack: ''
      },
      avatarUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`
    };

    onSave(newClient);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-titan-900 border border-titan-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-titan-800">
          <h2 className="text-xl font-bold text-white">Create New Client</h2>
          <button onClick={onClose} className="text-titan-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Full Name</label>
              <input required name="name" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Username</label>
              <input required name="username" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Passport Code (Secret)</label>
              <input required name="passportCode" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Date of Birth</label>
              <input required type="date" name="dob" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Height (cm)</label>
              <input required type="number" name="heightCm" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-titan-400 mb-1">Start Weight (kg)</label>
              <input required type="number" name="startWeightKg" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
               <label className="block text-xs font-medium text-titan-400 mb-1">Sub. End Date</label>
               <input required type="date" name="subscriptionEndDate" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-titan-400 mb-1">Primary Goal</label>
            <input required name="goal" placeholder="e.g. Loose 10kg, Build Muscle" onChange={handleChange} className="w-full bg-titan-950 border border-titan-700 rounded-lg px-4 py-2 text-white" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-titan-300 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-accent-600 hover:bg-accent-500 rounded-lg">Create Client</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;