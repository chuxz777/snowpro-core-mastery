// Quiz Logic
let currentBank, currentIdx, examState, currentMode, timerInterval, timeElapsed, timeRemaining;

async function openConfig(id, mode) {
    currentBank = await db.examVault.get(id);
    currentMode = mode;
    document.getElementById('config-count').value = currentBank.questions.length;
    document.getElementById('start-btn-confirm').onclick = () => startExam();
    document.getElementById('config-modal').classList.remove('hidden');
}

function startExam(qsToUse = null) {
    document.getElementById('config-modal').classList.add('hidden');
    let qs = qsToUse || [...currentBank.questions];
    
    // Randomize questions if the option is selected
    if (document.getElementById('randomize-questions').checked) {
        qs.sort(() => Math.random() - 0.5);
    }

    if (!qsToUse) {
        const limit = parseInt(document.getElementById('config-count').value);
        if (limit > 0 && limit < qs.length) {
            qs = qs.slice(0, limit);
        }
    }
    examState = qs.map(q => ({
        ...q,
        shuffledOptions: Object.entries(q.options).map(p => ({ key: p[0], value: p[1] })).sort(() => Math.random() - 0.5),
        selectedKeys: [],
        isChecked: false,
        isCorrect: false,
        struckKeys: []
    }));
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
    document.getElementById('q-text').innerText = q.text;
    document.getElementById('clear-seq-btn').classList.toggle('hidden', !isSeq || q.isChecked);
    const explBox = document.getElementById('explanation-box');
    explBox.classList.toggle('hidden', !(q.isChecked && q.explanation));
    if (q.isChecked && q.explanation) explBox.innerHTML = `<p class="text-[10px] font-black text-accent uppercase mb-2">Reasoning</p><p class="text-sm italic">${q.explanation}</p>`;
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

    q.shuffledOptions.forEach(opt => {
        const stepIdx = q.selectedKeys.indexOf(opt.key),
            isSel = stepIdx !== -1;
        const isStruck = q.struckKeys.includes(opt.key) && !q.isChecked;

        const div = document.createElement('div');
        div.className = `flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSel ? 'border-accent bg-accent/5' : 'border-border-clr'} ${isStruck ? 'opt-strike' : ''}`;

        if (q.isChecked) {
            const corr = Array.isArray(q.answer) ? q.answer : [q.answer];
            const isPartCorrect = isSeq ? (q.answer[stepIdx] === opt.key) : corr.includes(opt.key);
            if (isSel) div.classList.add(isPartCorrect ? 'opt-correct' : 'opt-incorrect');
            else if (corr.includes(opt.key)) div.classList.add('border-dashed', 'border-green-500');
        }

        div.onclick = () => { if (!q.isChecked) toggleItem(opt.key); };
        div.oncontextmenu = (e) => {
            e.preventDefault();
            if (!q.isChecked) toggleStrike(opt.key);
        };
        div.innerHTML = ((isSel && isSeq) ? `<span class="step-badge">STEP ${stepIdx + 1}</span>` : "") + `<span>${opt.value}</span>`;
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
    if (q.answer_type === "sequence") q.isCorrect = q.answer.length === q.selectedKeys.length && q.answer.every((v, i) => v === q.selectedKeys[i]);
    else if (Array.isArray(q.answer)) q.isCorrect = q.answer.length === q.selectedKeys.length && q.answer.every(v => q.selectedKeys.includes(v));
    else q.isCorrect = q.answer === q.selectedKeys[0];
    q.isChecked = true;
    showQuestion(false);
}

function buildNavGrid() {
    const g = document.getElementById('nav-grid');
    g.innerHTML = '';
    examState.forEach((_, i) => {
        const b = document.createElement('button');
        b.id = `nav-btn-${i}`;
        b.className = "w-10 h-10 border-2 rounded-xl text-[10px] font-black border-border-clr flex items-center justify-center shrink-0";
        b.innerText = i + 1;
        b.onclick = () => { currentIdx = i; showQuestion(true); };
        g.appendChild(b);
    });
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
