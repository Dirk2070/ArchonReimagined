import { useState, useEffect } from 'react';
import { Piece, FieldType, CombatResult } from '@archon/core';

interface ArenaDialogProps {
  attacker: Piece;
  defender: Piece;
  fieldType: FieldType;
  autoResolve: boolean;
  onCombatEnd: (result: CombatResult) => void;
}

export const ArenaDialog: React.FC<ArenaDialogProps> = ({
  attacker,
  defender,
  fieldType: _fieldType,
  autoResolve,
  onCombatEnd
}) => {
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [attackerHealth, setAttackerHealth] = useState(attacker.health);
  const [defenderHealth, setDefenderHealth] = useState(defender.health);
  const [isCombatActive, setIsCombatActive] = useState(true);

  useEffect(() => {
    if (autoResolve) {
      setTimeout(() => {
        const result = simulateCombat();
        onCombatEnd(result);
      }, 1000);
    }
  }, [autoResolve, onCombatEnd]);

  const simulateCombat = (): CombatResult => {
    let currentAttackerHealth = attacker.health;
    let currentDefenderHealth = defender.health;
    const log: string[] = [];

    // Simple combat simulation
    while (currentAttackerHealth > 0 && currentDefenderHealth > 0) {
      // Attacker attacks
      const attackerDamage = Math.floor(Math.random() * 20) + 10;
      currentDefenderHealth = Math.max(0, currentDefenderHealth - attackerDamage);
      log.push(`${attacker.type} deals ${attackerDamage} damage to ${defender.type}`);

      if (currentDefenderHealth <= 0) break;

      // Defender attacks
      const defenderDamage = Math.floor(Math.random() * 20) + 10;
      currentAttackerHealth = Math.max(0, currentAttackerHealth - defenderDamage);
      log.push(`${defender.type} deals ${defenderDamage} damage to ${attacker.type}`);
    }

    const winner = currentAttackerHealth > 0 ? attacker : defender;
    const loser = currentAttackerHealth > 0 ? defender : attacker;
    const damageDealt = winner === attacker ? attacker.health - currentAttackerHealth : defender.health - currentDefenderHealth;

    setCombatLog(log);
    setAttackerHealth(currentAttackerHealth);
    setDefenderHealth(currentDefenderHealth);
    setIsCombatActive(false);

    return { winner, loser, damageDealt };
  };

  const handleManualResolve = () => {
    const result = simulateCombat();
    setTimeout(() => onCombatEnd(result), 1000);
  };

  if (!isCombatActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Combat Resolved!</h2>
          <div className="space-y-2 mb-4">
            {combatLog.map((entry, index) => (
              <div key={index} className="text-sm text-gray-300">{entry}</div>
            ))}
          </div>
          <button
            onClick={() => onCombatEnd({ winner: attacker, loser: defender, damageDealt: 50 })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Arena Combat</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{attacker.type}</div>
              <div className="text-sm text-gray-400">HP: {attackerHealth}/{attacker.maxHealth}</div>
            </div>
            <div className="text-2xl">⚔️</div>
            <div className="text-right">
              <div className="font-semibold">{defender.type}</div>
              <div className="text-sm text-gray-400">HP: {defenderHealth}/{defender.maxHealth}</div>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(attackerHealth / attacker.maxHealth) * 100}%` }}
            />
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(defenderHealth / defender.maxHealth) * 100}%` }}
            />
          </div>

          {!autoResolve && (
            <button
              onClick={handleManualResolve}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Resolve Combat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};