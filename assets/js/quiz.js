// Quiz Logic
let currentBank, currentIdx, examState, currentMode, timerInterval, timeElapsed, timeRemaining;

async function openConfig(id, mode) {
    currentBank = await db.examVault.get(id);
    currentMode = mode;
    
    const configInput = document.getElementById('config-count');
    const configDisplay = document.getElementById('config-count-display');
    const totalQuestions = currentBank.questions.length;
    
    // Set slider min and max based on exam
    configInput.min = 1;
    configInput.max = totalQuestions;
    
    // Set default question count based on mode
    let questionCount;
    if (mode === 'practice') {
        // In practice mode, default to all questions in the bank
        questionCount = totalQuestions;
    } else {
        // In test mode, keep the standard exam length (or all questions if less)
        questionCount = Math.min(100, totalQuestions);
    }
    
    // Set slider value and display
    configInput.value = questionCount;
    configDisplay.innerText = questionCount;
    
    // Update display when slider changes (use both oninput and onchange for compatibility)
    const updateDisplay = function() {
        configDisplay.innerText = this.value;
    };
    configInput.oninput = updateDisplay;
    configInput.onchange = updateDisplay;
    
    document.getElementById('start-btn-confirm').onclick = () => startExam();
    document.getElementById('config-modal').classList.remove('hidden');
}

function closeConfigModal() {
    document.getElementById('config-modal').classList.add('hidden');
}

function startExam(qsToUse = null) {
    document.getElementById('config-modal').classList.add('hidden');
    let qs = qsToUse || [...currentBank.questions];
    
    // Always randomize questions to prevent memorization
    qs.sort(() => Math.random() - 0.5);

    if (!qsToUse) {
        const limit = parseInt(document.getElementById('config-count').value);
        if (limit > 0 && limit < qs.length) {
            qs = qs.slice(0, limit);
        }
    }
    examState = qs.map(q => {
        // Shuffle options and reassign sequential keys (A, B, C, D, etc.)
        const shuffled = Object.entries(q.options)
            .map(p => ({ originalKey: p[0], value: p[1] }))
            .sort(() => Math.random() - 0.5);
        
        // Create a mapping from new keys to original keys
        const keyMapping = {};
        const newOptions = shuffled.map((opt, idx) => {
            const newKey = String.fromCharCode(65 + idx); // A, B, C, D, etc.
            keyMapping[newKey] = opt.originalKey;
            return { key: newKey, value: opt.value, originalKey: opt.originalKey };
        });
        
        return {
            ...q,
            shuffledOptions: newOptions,
            keyMapping: keyMapping, // Store mapping for answer validation
            selectedKeys: [],
            isChecked: false,
            isCorrect: false,
            struckKeys: []
        };
    });
    currentIdx = 0;
    timeElapsed = 0;
    timeRemaining = parseInt(document.getElementById('config-time').value) * 60;
    startTimer();
    showView('quiz-view');
    buildNavGrid();
    showQuestion(true);
}

function showQuestion(shouldScroll = false) {
    if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    const q = examState[currentIdx], isSeq = q.answer_type === "sequence";
    document.getElementById('q-meta').innerText = `ITEM ${currentIdx + 1} / ${examState.length}`;
    document.getElementById('exam-progress-bar').style.width = ((currentIdx + 1) / examState.length * 100) + '%';
    document.getElementById('q-text').innerHTML = marked.parse(q.text);
    document.getElementById('clear-seq-btn').classList.toggle('hidden', !isSeq || q.isChecked);
    const explBox = document.getElementById('explanation-box');
    explBox.classList.toggle('hidden', !(q.isChecked && q.explanation));
    if (q.isChecked && q.explanation) explBox.innerHTML = `<p class="text-[10px] font-black text-accent uppercase mb-2">Reasoning</p><div class="text-sm italic markdown-content">${marked.parse(q.explanation)}</div>`;
    const badge = document.getElementById('instant-badge');
    badge.classList.toggle('hidden', !q.isChecked);
    if (q.isChecked) {
        badge.innerText = q.isCorrect ? "PASS ✓" : "FAIL ✗";
        badge.style.backgroundColor = q.isCorrect ? "#10b981" : "#ef4444";
    }
    const btn = document.getElementById('action-btn');
    btn.innerText = q.isChecked ? 'Next' : 'Confirm';
    btn.onclick = q.isChecked ? () => nextQuestion(true) : handleAction;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.shuffledOptions.forEach((opt, index) => {
        const stepIdx = q.selectedKeys.indexOf(opt.key),
            isSel = stepIdx !== -1;
        const isStruck = q.struckKeys.includes(opt.key) && !q.isChecked;

        const div = document.createElement('div');
        div.className = `flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSel ? 'border-accent bg-accent/5' : 'border-border-clr'} ${isStruck ? 'opt-strike' : ''}`;
        div.setAttribute('data-option-key', opt.key);
        div.setAttribute('data-option-index', index);

        if (q.isChecked) {
            const corr = Array.isArray(q.answer) ? q.answer : [q.answer];
            // Check if this option's original key is correct
            const isPartCorrect = isSeq ?
                (q.answer[stepIdx] === opt.originalKey) :
                corr.includes(opt.originalKey);
            if (isSel) div.classList.add(isPartCorrect ? 'opt-correct' : 'opt-incorrect');
            else if (corr.includes(opt.originalKey)) div.classList.add('border-dashed', 'border-green-500');
        }

        div.onclick = () => { if (!q.isChecked) toggleItem(opt.key); };
        div.oncontextmenu = (e) => {
            e.preventDefault();
            if (!q.isChecked) toggleStrike(opt.key);
        };
        
        // Add option label badge at the top
        const optionLabel = `<div class="flex items-center gap-2">
            <span class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full border-2 ${isSel ? 'border-accent bg-accent text-white' : 'border-border-clr bg-app-bg text-txt-muted'} font-black text-xs">${opt.key}</span>
            ${(isSel && isSeq) ? `<span class="step-badge">STEP ${stepIdx + 1}</span>` : ""}
        </div>`;
        
        div.innerHTML = optionLabel + `<div class="markdown-content">${marked.parse(opt.value)}</div>`;
        container.appendChild(div);
    });
    updateNavUI();
}

function toggleItem(key) {
    const q = examState[currentIdx], isSeq = q.answer_type === "sequence", max = Array.isArray(q.answer) ? q.answer.length : 1;
    if (q.selectedKeys.includes(key)) q.selectedKeys = q.selectedKeys.filter(k => k !== key);
    else {
        if (!isSeq && !Array.isArray(q.answer)) q.selectedKeys = [];
        if (q.selectedKeys.length < max) q.selectedKeys.push(key);
    }
    showQuestion(false);
}

function toggleStrike(key) {
    const q = examState[currentIdx];
    q.struckKeys = q.struckKeys.includes(key) ? q.struckKeys.filter(k => k !== key) : [...q.struckKeys, key];
    showQuestion(false);
}

function handleAction() {
    const q = examState[currentIdx];
    if (!q.selectedKeys.length) return;
    
    // Map selected keys back to original keys for validation
    const selectedOriginalKeys = q.selectedKeys.map(key => q.keyMapping[key]);
    
    if (q.answer_type === "sequence") {
        q.isCorrect = q.answer.length === selectedOriginalKeys.length &&
                      q.answer.every((v, i) => v === selectedOriginalKeys[i]);
    } else if (Array.isArray(q.answer)) {
        q.isCorrect = q.answer.length === selectedOriginalKeys.length &&
                      q.answer.every(v => selectedOriginalKeys.includes(v));
    } else {
        q.isCorrect = q.answer === selectedOriginalKeys[0];
    }
    
    q.isChecked = true;
    showQuestion(false);
}

function buildNavGrid() {
    const g = document.getElementById('nav-grid');
    g.innerHTML = '';
    
    // Create a single flex container that wraps naturally
    const container = document.createElement('div');
    container.className = 'flex gap-2 justify-center flex-wrap';
    
    // Add all question buttons to the container
    examState.forEach((_, i) => {
        const b = document.createElement('button');
        b.id = `nav-btn-${i}`;
        b.className = "w-9 h-9 border-2 rounded-xl text-[10px] font-black border-border-clr flex items-center justify-center shrink-0 hover:scale-105 transition-transform";
        b.innerText = i + 1;
        b.onclick = () => { currentIdx = i; showQuestion(true); };
        container.appendChild(b);
    });
    
    g.appendChild(container);
}

function updateNavUI() {
    examState.forEach((q, i) => {
        const b = document.getElementById(`nav-btn-${i}`);
        if (!b) return;
        b.classList.remove('nav-active', 'nav-pass', 'nav-fail', 'nav-completed');
        if (q.isChecked) b.classList.add(q.isCorrect ? 'nav-pass' : 'nav-fail');
        else if (q.selectedKeys.length > 0) b.classList.add('nav-completed');
        if (i === currentIdx) b.classList.add('nav-active');
    });
}

function nextQuestion(shouldScroll = true) {
    if (currentIdx < examState.length - 1) {
        currentIdx++;
        showQuestion(shouldScroll);
    } else {
        finishExam();
    }
}

function confirmFinishExam() {
    document.getElementById('confirm-finish-modal').classList.remove('hidden');
    document.getElementById('confirm-finish-btn').onclick = () => {
        closeConfirmModal();
        finishExam();
    };
}

function closeConfirmModal() {
    document.getElementById('confirm-finish-modal').classList.add('hidden');
}

async function finishExam() {
    clearInterval(timerInterval);
    const totalQs = examState.length;
    const correctQs = examState.filter(s => s.isCorrect).length;
    const scaledScore = Math.round((correctQs / totalQs) * 1000);
    const percentage = Math.round((correctQs / totalQs) * 100);
    const passed = scaledScore >= 700;

    // Setup Result Page
    document.getElementById('result-exam-name').innerText = currentBank.name;
    document.getElementById('result-scaled-score').innerText = scaledScore;
    document.getElementById('result-scaled-score').className = `text-8xl font-black leading-none tracking-tighter ${passed ? 'text-green-500' : 'text-red-500'}`;
    document.getElementById('result-raw-score').innerText = `${correctQs} / ${totalQs}`;
    document.getElementById('result-percentage').innerText = `${percentage}%`;
    document.getElementById('result-status-box').innerText = passed ? "Passed" : "Failed";
    document.getElementById('result-status-box').style.backgroundColor = passed ? "#10b981" : "#ef4444";
    document.getElementById('results-card').style.borderColor = passed ? "#10b981" : "#ef4444";

    showView('results-view');

    if (passed) {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#38bdf8', '#ffffff', '#2563eb'] });
    }

    await db.examHistory.add({
        exam: currentBank.name,
        timestamp: Date.now(),
        score: correctQs,
        total: totalQs,
        scaledScore: scaledScore,
        passed: passed,
        details: JSON.parse(JSON.stringify(examState))
    });
}

async function retakeErrors(id) {
    const att = await db.examHistory.get(id);
    if (!att) return;
    const errs = att.details.filter(q => !q.isCorrect).map(q => ({ ...q, isChecked: false, isCorrect: false, selectedKeys: [], struckKeys: [] }));
    currentBank = { name: "Errors: " + att.exam, id: "err", questions: errs };
    startExam(errs);
}

// Timer Logic
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (currentMode === 'test') {
            timeRemaining--;
            updateTimer(timeRemaining);
            if (timeRemaining <= 0) finishExam();
        } else {
            timeElapsed++;
            updateTimer(timeElapsed);
        }
    }, 1000);
}

function updateTimer(s) {
    const h = Math.floor(s / 3600).toString().padStart(2, '0'),
        m = Math.floor((s % 3600) / 60).toString().padStart(2, '0'),
        sec = (s % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').innerText = h + ":" + m + ":" + sec;
}

function clearCurrentSelection() {
    examState[currentIdx].selectedKeys = [];
    showQuestion();
}

// Keyboard Shortcuts Handler
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when quiz is active
        const quizView = document.getElementById('quiz-view');
        if (quizView.classList.contains('hidden')) return;
        
        // Ignore shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const q = examState[currentIdx];
        
        // Arrow keys for navigation
        if (e.key === 'ArrowLeft' && currentIdx > 0) {
            e.preventDefault();
            currentIdx--;
            showQuestion();
        } else if (e.key === 'ArrowRight' && currentIdx < examState.length - 1) {
            e.preventDefault();
            currentIdx++;
            showQuestion();
        }
        
        // Letter keys (A-Z) for selecting options by their key
        else if (e.key.match(/^[a-zA-Z]$/) && !q.isChecked) {
            const upperKey = e.key.toUpperCase();
            // Check if this key exists in the current question's options
            const optionExists = q.shuffledOptions.some(opt => opt.key === upperKey);
            if (optionExists) {
                e.preventDefault();
                toggleItem(upperKey);
            }
        }
        
        // Enter or Space to submit answer
        else if ((e.key === 'Enter' || e.key === ' ') && !q.isChecked && q.selectedKeys.length > 0) {
            e.preventDefault();
            handleAction();
        }
        
        // 'n' or 'N' for next question (after checking answer)
        else if ((e.key === 'n' || e.key === 'N') && q.isChecked) {
            e.preventDefault();
            nextQuestion();
        }
        
        // 's' or 'S' to skip question
        else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            nextQuestion(true);
        }
        
        // 'c' or 'C' to clear selection
        else if ((e.key === 'c' || e.key === 'C') && !q.isChecked && q.selectedKeys.length > 0) {
            e.preventDefault();
            clearCurrentSelection();
        }
        
        // 'f' or 'F' to toggle focus mode
        else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFocus();
        }
        
        // 'Escape' to exit focus mode
        else if (e.key === 'Escape') {
            const focusExit = document.getElementById('focus-exit');
            if (!focusExit.classList.contains('hidden')) {
                e.preventDefault();
                toggleFocus();
            }
        }
        
        // '?' to show keyboard shortcuts help
        else if (e.key === '?') {
            e.preventDefault();
            showKeyboardShortcutsHelp();
        }
    });
}

// Show keyboard shortcuts help modal
function showKeyboardShortcutsHelp() {
    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-card-bg w-full max-w-2xl p-8 rounded-[2.5rem] border border-border-clr shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-black uppercase">Keyboard Shortcuts</h3>
                <button onclick="closeShortcutsModal()" class="text-txt-muted hover:text-txt-main text-2xl font-bold">&times;</button>
            </div>
            <div class="space-y-6">
                <div>
                    <h4 class="text-sm font-black uppercase text-accent mb-3">Navigation</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Previous Question</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">←</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Next Question</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">→</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Skip Question</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">S</kbd>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-sm font-black uppercase text-accent mb-3">Answer Selection</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Select Option by Letter</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">A-Z</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Submit Answer</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">Enter</kbd>
                            <span class="text-txt-muted mx-2">or</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">Space</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Clear Selection</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">C</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Next (After Submit)</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">N</kbd>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-sm font-black uppercase text-accent mb-3">View Controls</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Toggle Focus Mode</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">F</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Exit Focus Mode</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">Esc</kbd>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-app-bg rounded-xl">
                            <span>Show This Help</span>
                            <kbd class="px-3 py-1 bg-card-bg border border-border-clr rounded-lg font-mono text-xs">?</kbd>
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="closeShortcutsModal()" class="w-full mt-8 bg-accent text-white py-4 rounded-2xl font-black uppercase text-xs">Got It!</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeShortcutsModal();
    });
}

function closeShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) modal.remove();
}

// Initialize keyboard shortcuts when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
    initKeyboardShortcuts();
}
