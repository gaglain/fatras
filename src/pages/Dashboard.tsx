
import React from 'react';

export const Dashboard: React.FC = () => {
  console.log('🎯 Dashboard - Rendering Dashboard page...');
  
  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenue ! Voici un résumé de vos activités en temps réel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-blue-900">Artistes</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-green-900">Événements</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-purple-900">Publications</h3>
            <p className="text-2xl font-bold text-purple-600">24</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
          <div className="space-y-2">
            <p className="text-gray-600">• Nouvel artiste ajouté: The Midnight Express</p>
            <p className="text-gray-600">• Événement programmé: Concert Rock Festival</p>
            <p className="text-gray-600">• Publication planifiée: Annonce tournée</p>
          </div>
        </div>
      </div>
    </div>
  );
};
