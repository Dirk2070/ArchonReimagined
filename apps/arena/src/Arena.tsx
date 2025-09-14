import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Piece, FieldType } from '@archon/core';

interface ArenaProps {
  attacker: Piece;
  defender: Piece;
  fieldType: FieldType;
  onCombatEnd: (result: { winner: Piece; loser: Piece; damage: number }) => void;
}

class CombatScene extends Phaser.Scene {
  private attacker!: Piece;
  private defender!: Piece;
  private fieldType!: FieldType;
  private onCombatEnd!: (result: { winner: Piece; loser: Piece; damage: number }) => void;

  private attackerSprite!: Phaser.GameObjects.Sprite;
  private defenderSprite!: Phaser.GameObjects.Sprite;
  private healthBars!: { attacker: Phaser.GameObjects.Graphics; defender: Phaser.GameObjects.Graphics };
  private timerText!: Phaser.GameObjects.Text;
  private combatTimer: number = 60;

  init(data: { attacker: Piece; defender: Piece; fieldType: FieldType; onCombatEnd: Function }) {
    this.attacker = data.attacker;
    this.defender = data.defender;
    this.fieldType = data.fieldType;
    this.onCombatEnd = data.onCombatEnd;
  }

  preload() {
    // Simple colored rectangles for pieces (placeholder)
    this.load.image('attacker', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image('defender', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    // Background based on field type
    this.add.rectangle(400, 300, 800, 600,
      this.fieldType === 'permanent-light' ? 0xfff8dc :
      this.fieldType === 'permanent-dark' ? 0x2f1b14 : 0x708090
    );

    // Create sprites
    this.attackerSprite = this.add.sprite(200, 300, 'attacker');
    this.attackerSprite.setTint(this.attacker.side === 'light' ? 0xffff00 : 0x000000);
    this.attackerSprite.setScale(2);

    this.defenderSprite = this.add.sprite(600, 300, 'defender');
    this.defenderSprite.setTint(this.defender.side === 'light' ? 0xffff00 : 0x000000);
    this.defenderSprite.setScale(2);

    // Health bars
    this.healthBars = {
      attacker: this.add.graphics(),
      defender: this.add.graphics()
    };

    // Timer
    this.timerText = this.add.text(400, 50, '60', { fontSize: '32px', color: '#ffffff' });
    this.timerText.setOrigin(0.5);

    // Input handling (simplified)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 400) {
        // Attack left (attacker)
        this.performAttack(this.attacker, this.defender);
      } else {
        // Attack right (defender)
        this.performAttack(this.defender, this.attacker);
      }
    });

    // Combat timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    // Simple AI for defender (auto-attack)
    if (Math.random() < 0.02) { // 2% chance per frame
      this.performAttack(this.defender, this.attacker);
    }
  }

  private performAttack(attacker: Piece, defender: Piece) {
    const damage = Math.floor(Math.random() * 20) + 10; // 10-30 damage
    defender.health = Math.max(0, defender.health - damage);

    // Visual feedback
    this.tweens.add({
      targets: defender === this.attacker ? this.attackerSprite : this.defenderSprite,
      x: '+=10',
      yoyo: true,
      duration: 100,
      ease: 'Power2'
    });

    this.updateHealthBars();

    // Check for combat end
    if (this.attacker.health <= 0 || this.defender.health <= 0 || this.combatTimer <= 0) {
      this.endCombat();
    }
  }

  private updateHealthBars() {
    // Clear previous bars
    this.healthBars.attacker.clear();
    this.healthBars.defender.clear();

    // Attacker health bar
    const attackerHealthPercent = this.attacker.health / this.attacker.maxHealth;
    this.healthBars.attacker.fillStyle(attackerHealthPercent > 0.5 ? 0x00ff00 : attackerHealthPercent > 0.25 ? 0xffff00 : 0xff0000);
    this.healthBars.attacker.fillRect(150, 200, 100 * attackerHealthPercent, 10);

    // Defender health bar
    const defenderHealthPercent = this.defender.health / this.defender.maxHealth;
    this.healthBars.defender.fillStyle(defenderHealthPercent > 0.5 ? 0x00ff00 : defenderHealthPercent > 0.25 ? 0xffff00 : 0xff0000);
    this.healthBars.defender.fillRect(550, 200, 100 * defenderHealthPercent, 10);
  }

  private updateTimer() {
    this.combatTimer--;
    this.timerText.setText(this.combatTimer.toString());

    if (this.combatTimer <= 0) {
      this.endCombat();
    }
  }

  private endCombat() {
    let winner: Piece;
    let loser: Piece;
    let damage: number;

    if (this.attacker.health > this.defender.health) {
      winner = this.attacker;
      loser = this.defender;
      damage = this.attacker.maxHealth - this.attacker.health;
    } else {
      winner = this.defender;
      loser = this.attacker;
      damage = this.defender.maxHealth - this.defender.health;
    }

    this.onCombatEnd({ winner, loser, damage });
    this.scene.stop();
  }
}

export const Arena: React.FC<ArenaProps> = ({ attacker, defender, fieldType, onCombatEnd }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        scene: CombatScene,
        physics: {
          default: 'arcade',
          arcade: { debug: false }
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    // Start combat scene
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.start('CombatScene', {
        attacker,
        defender,
        fieldType,
        onCombatEnd
      });
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [attacker, defender, fieldType, onCombatEnd]);

  return (
    <div className="arena-container">
      <div ref={gameRef} className="phaser-game" />
      <div className="arena-ui">
        <button
          onClick={() => onCombatEnd({
            winner: attacker,
            loser: defender,
            damage: 50
          })}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Autoresolve
        </button>
      </div>
    </div>
  );
};
