/**
 * @link e:\git\hyphae-pos\src\components\layout\ModalManager.tsx
 * @author Hyphae POS Team
 * @description Centralized modal management component.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React from 'react';
import { Settings, ChevronRight, AlertCircle } from 'lucide-react';
import HistoryModal from '../HistoryModal';

interface ModalManagerProps {
  activeModal: string | null;
  setActiveModal: (val: string | null) => void;
  handleSettingsClick: () => void;
  activeConcept: any;
  concepts: any[];
  setActiveConceptId: (id: string) => void;
  activeConceptId: string;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  activeModal,
  setActiveModal,
  handleSettingsClick,
  activeConcept,
  concepts,
  setActiveConceptId,
  activeConceptId,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={() => setActiveModal(null)}
      />

      {activeModal === 'Order History' && <HistoryModal onClose={() => setActiveModal(null)} />}

      {activeModal === 'SettingsMenu' && (
        <div className="relative bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-2xl w-64 animate-in zoom-in-95 duration-100">
          <div className="flex flex-col space-y-1">
            <button
              onClick={handleSettingsClick}
              className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex justify-between items-center group rounded-lg"
            >
              <span>Settings</span>
              <Settings
                size={14}
                className="text-zinc-400 group-hover:text-lime-600 dark:group-hover:text-lime-400"
              />
            </button>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
            <button
              onClick={() => setActiveModal('ModalitySelector')}
              className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex justify-between items-center group rounded-lg"
            >
              <span>Modality</span>
              <div className="flex items-center text-xs text-zinc-500">
                <span className="mr-2">{activeConcept?.name}</span>
                <ChevronRight
                  size={14}
                  className="group-hover:text-lime-600 dark:group-hover:text-lime-400"
                />
              </div>
            </button>
          </div>
        </div>
      )}

      {activeModal === 'ModalitySelector' && (
        <div className="relative bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-100">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Select Modality
          </h3>
          <div className="flex flex-col space-y-2">
            {concepts.map((concept) => (
              <button
                key={concept.id}
                onClick={() => {
                  setActiveConceptId(concept.id);
                  setActiveModal(null);
                }}
                className={`
                                w-full py-4 px-6 text-left border rounded-xl transition-all
                                flex items-center justify-between
                                ${
                                  activeConceptId === concept.id
                                    ? 'bg-lime-50 dark:bg-lime-900/20 border-lime-500 dark:border-lime-400 text-lime-700 dark:text-lime-400'
                                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500'
                                }
                            `}
              >
                <span className="font-bold text-lg">{concept.name}</span>
                {activeConceptId === concept.id && (
                  <div className="w-2 h-2 bg-lime-500 dark:bg-lime-400 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveModal('SettingsMenu')}
            className="mt-6 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 underline"
          >
            Back to Settings
          </button>
        </div>
      )}

      {['Active Register', 'Customers'].includes(activeModal || '') && (
        <div className="relative bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center transform transition-all scale-100">
          <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-lime-600 dark:text-lime-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{activeModal}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            This feature is currently under development. The module will be available in the next
            sprint release.
          </p>
          <button
            onClick={() => setActiveModal(null)}
            className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Close Console
          </button>
        </div>
      )}
    </div>
  );
};

export default ModalManager;
