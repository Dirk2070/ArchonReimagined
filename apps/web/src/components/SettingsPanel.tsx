import React, { useState } from 'react';
import { Difficulty } from '../lib/packages';

interface Settings {
  aiDifficulty: Difficulty;
  aiSpeed: number;
  autoResolve: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2"
      >
        <span>⚙️</span>
        Settings
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 w-64 z-50">
          <h3 className="text-lg font-semibold mb-4">Game Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                AI Difficulty
              </label>
              <select
                value={settings.aiDifficulty}
                onChange={(e) => updateSetting('aiDifficulty', e.target.value as Difficulty)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="normal">Normal</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                AI Speed: {(settings.aiSpeed * 1000).toFixed(0)}ms
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={settings.aiSpeed}
                onChange={(e) => updateSetting('aiSpeed', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoResolve}
                  onChange={(e) => updateSetting('autoResolve', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-resolve combats</span>
              </label>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
