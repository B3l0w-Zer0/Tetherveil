/**
 * questMenuGen.js
 * Zeigt alle aktiven, abschließbaren und fertigen Quests mit Fortschritt an.
 * Wird über den "Quests" Button im General Menu geöffnet.
 */

let questMenuOverlay = null;

function injectStyles() {
    if (document.getElementById('quest-menu-styles')) return; // nicht doppelt einfügen

    const style = document.createElement('style');
    style.id = 'quest-menu-styles';
    style.textContent = `
        .quest-menu-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 520px;
            max-height: 70vh;
            background: rgba(10, 10, 30, 0.97);
            border: 2px solid #4a4a8a;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            z-index: 2000;
            font-family: sans-serif;
            color: #ffffff;
            box-shadow: 0 0 30px rgba(80, 80, 200, 0.3);
        }
        .quest-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #4a4a8a;
            flex-shrink: 0;
        }
        .quest-menu-header h2 {
            margin: 0;
            font-size: 22px;
            color: #aaaaff;
        }
        .quest-menu-close-btn {
            background: none;
            border: 1px solid #666;
            color: #ccc;
            font-size: 18px;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
        }
        .quest-menu-close-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .quest-menu-content {
            overflow-y: auto;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .quest-menu-content::-webkit-scrollbar { width: 6px; }
        .quest-menu-content::-webkit-scrollbar-thumb { background: #4a4a8a; border-radius: 3px; }
        .quest-empty { color: #888; text-align: center; padding: 40px 0; font-size: 15px; }
        .quest-section-title {
            margin: 0 0 8px 0;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8888bb;
            border-bottom: 1px solid #2a2a4a;
            padding-bottom: 4px;
        }
        .quest-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid #2a2a5a;
            border-radius: 8px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .quest-card--completable { border-color: #44aa44; background: rgba(60,120,60,0.12); }
        .quest-card--active      { border-color: #4466cc; background: rgba(40,60,120,0.12); }
        .quest-card--finished    { border-color: #666; opacity: 0.6; }
        .quest-card--declined    { border-color: #663333; opacity: 0.5; }
        .quest-card-title { font-size: 16px; font-weight: bold; color: #ffffff; }
        .quest-card-desc  { margin: 0; font-size: 13px; color: #aaaaaa; line-height: 1.4; }
        .quest-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .quest-step  { font-size: 13px; color: #cccccc; }
        .quest-step--done { color: #66cc66; }
        .quest-step-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .quest-step-count { color: #aaaaff; font-weight: bold; font-size: 12px; }
        .quest-progress-bar {
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            overflow: hidden;
        }
        .quest-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4466cc, #6688ff);
            border-radius: 2px;
            transition: width 0.3s ease;
        }
        .quest-step--done .quest-progress-fill { background: linear-gradient(90deg, #44aa44, #66cc66); }
        .quest-rewards { font-size: 12px; color: #888; margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap; }
        .quest-rewards-label { color: #666; }
        .quest-reward-xp   { color: #ffcc44; }
        .quest-reward-item { color: #88aaff; }
    `;
    document.head.appendChild(style);
}

export function createGenQuestMenu(questManager) {
    injectStyles();
    const existing = document.getElementById('quest-menu-overlay');
    if (existing) {
        existing.remove();
        questMenuOverlay = null;
        return; // toggle - zweiter Klick schließt
    }

    const overlay = document.createElement('div');
    overlay.classList.add('quest-menu-overlay');
    overlay.id = 'quest-menu-overlay';

    // Header
    const header = document.createElement('div');
    header.classList.add('quest-menu-header');
    header.innerHTML = `
        <h2>📜 Questbuch</h2>
        <button class="quest-menu-close-btn" id="questMenuCloseBtn">✕</button>
    `;

    // Content
    const content = document.createElement('div');
    content.classList.add('quest-menu-content');

    // Quests aus dem QuestManager laden
    renderQuests(content, questManager);

    overlay.appendChild(header);
    overlay.appendChild(content);

    const container = document.getElementById('game-container');
    container.appendChild(overlay);
    questMenuOverlay = overlay;

    // Schließen Button
    document.getElementById('questMenuCloseBtn').addEventListener('click', () => {
        overlay.remove();
        questMenuOverlay = null;
    });
    questMenuOverlay = overlay;
    return overlay;
}

function renderQuests(container, questManager) {
    container.innerHTML = '';

    const allQuests = questManager.quests;
    const playerQuests = questManager.playerQuests;

    // Kategorien
    const categories = {
        completable: { label: '✅ Abgabereif', quests: [] },
        active:      { label: '⚔️ Aktiv',      quests: [] },
        declined:    { label: '❌ Abgelehnt',  quests: [] },
        finished:    { label: '🏆 Abgeschlossen', quests: [] },
    };

    // Quests sortieren
    Object.values(allQuests).forEach(quest => {
        const status = questManager.getQuestStatus(quest.id);
        if (status === 'completed')  categories.completable.quests.push(quest);
        else if (status === 'active') categories.active.quests.push(quest);
        else if (status === 'declined') categories.declined.quests.push(quest);
        else if (status === 'finished') categories.finished.quests.push(quest);
    });

    // Prüfen ob überhaupt Quests vorhanden
    const hasAny = Object.values(categories).some(c => c.quests.length > 0);
    if (!hasAny) {
        const empty = document.createElement('div');
        empty.classList.add('quest-empty');
        empty.textContent = 'Du hast noch keine Quests angenommen.';
        container.appendChild(empty);
        return;
    }

    // Kategorien rendern
    Object.entries(categories).forEach(([key, category]) => {
        if (category.quests.length === 0) return;

        const section = document.createElement('div');
        section.classList.add('quest-section');

        const sectionTitle = document.createElement('h3');
        sectionTitle.classList.add('quest-section-title');
        sectionTitle.textContent = category.label;
        section.appendChild(sectionTitle);

        category.quests.forEach(quest => {
            const card = createQuestCard(quest, questManager, key);
            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

function createQuestCard(quest, questManager, statusKey) {
    const card = document.createElement('div');
    card.classList.add('quest-card', `quest-card--${statusKey}`);

    // Titel + Status Badge
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('quest-card-header');

    const title = document.createElement('span');
    title.classList.add('quest-card-title');
    title.textContent = quest.title;

    cardHeader.appendChild(title);
    card.appendChild(cardHeader);

    // Beschreibung
    const desc = document.createElement('p');
    desc.classList.add('quest-card-desc');
    desc.textContent = quest.description;
    card.appendChild(desc);

    // Steps mit Fortschritt
    if (statusKey === 'active' || statusKey === 'completable') {
        const stepsContainer = document.createElement('div');
        stepsContainer.classList.add('quest-steps');

        const questState = questManager.playerQuests[quest.id];

        quest.steps.forEach(step => {
            const progress = questState?.progress?.[step.id];
            const current = progress?.current ?? 0;
            const required = progress?.required ?? 1;
            const done = progress?.done ?? false;

            const stepEl = document.createElement('div');
            stepEl.classList.add('quest-step');
            if (done) stepEl.classList.add('quest-step--done');

            // Step Icon je nach Typ
            const icons = { collect: '🎒', kill: '⚔️', talk: '💬', explore: '🗺️' };
            const icon = icons[step.type] || '•';

            if (step.type === 'collect' || step.type === 'kill') {
                // Mit Fortschrittsbalken
                stepEl.innerHTML = `
                    <div class="quest-step-row">
                        <span>${done ? '✅' : icon} ${step.description}</span>
                        <span class="quest-step-count">${current}/${required}</span>
                    </div>
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${Math.round((current/required)*100)}%"></div>
                    </div>
                `;
            } else {
                // Ohne Fortschrittsbalken (talk, explore etc.)
                stepEl.innerHTML = `
                    <div class="quest-step-row">
                        <span>${done ? '✅' : icon} ${step.description}</span>
                    </div>
                `;
            }

            stepsContainer.appendChild(stepEl);
        });

        card.appendChild(stepsContainer);

        // Belohnungsvorschau
        if (quest.rewards) {
            const rewards = document.createElement('div');
            rewards.classList.add('quest-rewards');
            rewards.innerHTML = `<span class="quest-rewards-label">Belohnung:</span>`;
            if (quest.rewards.xp) rewards.innerHTML += ` <span class="quest-reward-xp">⭐ ${quest.rewards.xp} XP</span>`;
            if (quest.rewards.items?.length > 0) {
                quest.rewards.items.forEach(item => {
                    rewards.innerHTML += ` <span class="quest-reward-item">🎁 ${item}</span>`;
                });
            }
            card.appendChild(rewards);
        }
    }

    return card;

}