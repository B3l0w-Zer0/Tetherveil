export class QuestManager {
    constructor(scene) {
        this.scene = scene;
        this.quests = {};       // questId → Quest-Definition
        this.playerQuests = {}; // questId → { status, progress }

        this.loadQuestData();
    }

    // LADEN
    async loadQuestData() {
        try {
            const response = await fetch('src/data/quests/questData.json');
            this.quests = await response.json();
            console.log('✅ Quest-Daten geladen:', Object.keys(this.quests).length, 'Quests');
        } catch (error) {
            console.warn('⚠️ Konnte questData.json nicht laden:', error);
            this.quests = {};
        }
    }

    // STATUS-ABFRAGEN
    getQuestStatus(questId) {
        return this.playerQuests[questId]?.status || 'unknown';
    }

    isActive(questId) {
        return this.getQuestStatus(questId) === 'active';
    }

    isCompleted(questId) {
        const s = this.getQuestStatus(questId);
        return s === 'completed' || s === 'finished';
    }

    isFinished(questId) {
        return this.getQuestStatus(questId) === 'finished';
    }

    /**
     * Gibt alle Quest-IDs zurück, die ein bestimmter NPC anbieten kann
     * und die noch nicht gestartet / declined sind.
     */
    getAvailableQuestsForNPC(npcId) {
        return Object.values(this.quests).filter(quest => {
            if (quest.giver !== npcId) return false;
            const status = this.getQuestStatus(quest.id);
            return status === 'unknown' || status === 'declined';
        });
    }

    /**
     * Gibt aktive Quests zurück, bei denen dieser NPC der Giver ist
     * (für "Hast du es schon?" Dialog)
     */
    getActiveQuestsForNPC(npcId) {
        return Object.values(this.quests).filter(quest => {
            return quest.giver === npcId && this.isActive(quest.id);
        });
    }

    /**
     * Gibt abgeschlossene (aber noch nicht abgegebene) Quests für diesen NPC zurück
     */
    getCompletableQuestsForNPC(npcId) {
        return Object.values(this.quests).filter(quest => {
            return quest.giver === npcId && this.getQuestStatus(quest.id) === 'completed';
        });
    }

    // QUEST ANNEHMEN / ABLEHNEN
    acceptQuest(questId) {
        if (!this.quests[questId]) {
            console.warn('Quest nicht gefunden:', questId);
            return false;
        }

        this.playerQuests[questId] = {
            status: 'active',
            progress: {}
        };

        // Fortschritt für jeden Step initialisieren
        const quest = this.quests[questId];
        quest.steps.forEach(step => {
            this.playerQuests[questId].progress[step.id] = {
                current: 0,
                required: step.amount || 1,
                done: false
            };
        });

        console.log(`📜 Quest angenommen: "${quest.title}"`);
        this.scene.events.emit('quest-accepted', quest);
        return true;
    }

    declineQuest(questId) {
        this.playerQuests[questId] = { status: 'declined', progress: {} };
        console.log(`❌ Quest abgelehnt: "${questId}"`);
        this.scene.events.emit('quest-declined', this.quests[questId]);
    }


    // FORTSCHRITT AKTUALISIEREN

    /**
     * Fortschritt für einen Step-Typ aktualisieren
     * @param {string} type     - 'collect', 'kill', 'talk', etc.
     * @param {string} target   - z.B. Item-ID, NPC-ID, Enemy-ID
     * @param {number} amount   - wie viel dazu kommt (Standard: 1)
     */
    updateProgress(type, target, amount = 1) {
        Object.entries(this.playerQuests).forEach(([questId, questState]) => {
            if (questState.status !== 'active') return;

            const quest = this.quests[questId];
            if (!quest) return;

            quest.steps.forEach(step => {
                if (step.type !== type || step.target !== target) return;

                const progress = questState.progress[step.id];
                if (!progress || progress.done) return;

                progress.current = Math.min(progress.current + amount, progress.required);

                if (progress.current >= progress.required) {
                    progress.done = true;
                    console.log(`✅ Quest-Step erledigt: "${step.description}" (${questId})`);
                    this.scene.events.emit('quest-step-done', quest, step);
                }
            });

            // Alle Steps done? → Quest abschließbar
            this.checkQuestCompletion(questId);
        });
    }

    checkQuestCompletion(questId) {
        const questState = this.playerQuests[questId];
        if (!questState || questState.status !== 'active') return;

        const quest = this.quests[questId];
        const allDone = quest.steps.every(step => questState.progress[step.id]?.done);

        if (allDone) {
            questState.status = 'completed';
            console.log(`🎉 Quest abschließbar: "${quest.title}"`);
            this.scene.events.emit('quest-completable', quest);
        }
    }

    // QUEST ABGEBEN & BELOHNUNG
    finishQuest(questId) {
        const questState = this.playerQuests[questId];
        if (!questState || questState.status !== 'completed') return false;

        const quest = this.quests[questId];
        questState.status = 'finished';

        // Belohnungen ausgeben
        if (quest.rewards) {
            this.giveRewards(quest.rewards);
        }

        console.log(`🏆 Quest abgeschlossen: "${quest.title}"`);
        this.scene.events.emit('quest-finished', quest);
        return true;
    }

    giveRewards(rewards) {
        if (rewards.xp) {
            console.log(`+${rewards.xp} XP`);
            // this.scene.player.addXP(rewards.xp);
            this.scene.events.emit('xp-gained', rewards.xp);
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(itemId => {
                console.log(`+Item: ${itemId}`);
                // this.scene.inventory.addItem(itemId);
                this.scene.events.emit('item-received', itemId);
            });
        }
    }

    // DIALOG-HELFER FÜR NPCs

    /**
     * Gibt zurück welche Art von Quest-Dialog ein NPC führen soll
     * Returns: { type, quest, lines }
     *   type: 'offer' | 'active' | 'completable' | 'finished' | 'normal'
     */
    getQuestDialogForNPC(npcId, npcDefaultDialog) {
        // 1. Abgebbare Quest zuerst prüfen
        const completable = this.getCompletableQuestsForNPC(npcId);
        if (completable.length > 0) {
            const quest = completable[0];
            return {
                type: 'completable',
                quest,
                lines: quest.dialogOnComplete || ["Gut gemacht! Hier deine Belohnung."]
            };
        }

        // 2. Aktive Quest → Hinweis-Dialog
        const active = this.getActiveQuestsForNPC(npcId);
        if (active.length > 0) {
            const quest = active[0];
            return {
                type: 'active',
                quest,
                lines: quest.dialogIfActive || ["Bist du schon fertig?"]
            };
        }

        // 3. Neue Quest anbieten
        const available = this.getAvailableQuestsForNPC(npcId);
        if (available.length > 0) {
            const quest = available[0];
            return {
                type: 'offer',
                quest,
                lines: quest.dialogOnOffer || ["Ich hätte eine Aufgabe für dich..."]
            };
        }

        // 4. Normaler Dialog
        return {
            type: 'normal',
            quest: null,
            lines: npcDefaultDialog
        };
    }

    // SAVE / LOAD (für später)
    getSaveData() {
        return this.playerQuests;
    }

    loadSaveData(data) {
        this.playerQuests = data || {};
    }
}