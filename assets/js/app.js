// UI & State Management
const db = new Dexie('SnowProMasteryDB');
db.version(1).stores({
  examVault: '++id, name', // This is our "table" for exams
  examHistory: '++id, timestamp' // A table for exam results
});

// Wrap database operations with error handling
const getVault = async () => {
    try {
        return await db.examVault.toArray();
    } catch (error) {
        errorHandler.logError('Database: Get Vault', error);
        errorHandler.showUserError('Database Error', 'Failed to load question banks. Please refresh the page.', error.message);
        return [];
    }
};

const getHistory = async () => {
    try {
        return await db.examHistory.orderBy('timestamp').reverse().toArray();
    } catch (error) {
        errorHandler.logError('Database: Get History', error);
        errorHandler.showUserError('Database Error', 'Failed to load exam history. Please refresh the page.', error.message);
        return [];
    }
};
let activeAuditData;

function showView(id) {
    const views = ['home-view', 'library-view', 'quiz-view', 'results-view', 'analytics-view', 'lab-view', 'sidebar-nav'];
    views.forEach(v => document.getElementById(v)?.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    const isQuiz = id === 'quiz-view';
    document.getElementById('sidebar-nav').classList.toggle('hidden', !isQuiz);
    document.getElementById('focus-toggle').classList.toggle('hidden', !isQuiz);
    if (id === 'home-view') renderDashboard();
    if (id === 'library-view') renderLibrary();
    if (id === 'analytics-view') renderAnalytics();
    if (id === 'lab-view') renderLab();
    if (!isQuiz && id !== 'results-view') clearInterval(timerInterval);
}

// Dashboard
async function renderDashboard() {
    const lib = await getVault(),
        hist = await getHistory();
    document.getElementById('stat-banks').innerText = lib.length;
    document.getElementById('stat-attempts').innerText = hist.length;
    if (hist.length) {
        const total = hist.reduce((a, c) => a + c.total, 0),
            score = hist.reduce((a, c) => a + c.score, 0);
        document.getElementById('stat-acc').innerText = Math.round((score / total) * 100) + "%";
    }
    const grid = document.getElementById('quick-launch-grid');
    grid.innerHTML = lib.length ? lib.map(b => `
        <div class="bg-card-bg p-8 rounded-[2.5rem] border border-border-clr shadow-sm hover:border-accent transition-all">
            <h4 class="font-black italic uppercase mb-4 text-lg truncate">${b.name}</h4>
            <div class="flex gap-2">
                <button onclick="openConfig(${b.id},'practice')" class="flex-1 bg-accent/10 text-accent font-black py-4 rounded-xl text-[10px] uppercase border border-accent/20">Practice</button>
                <button onclick="openConfig(${b.id},'test')" class="flex-1 btn-simulator font-black py-4 rounded-xl text-[10px] uppercase shadow-lg">Simulator</button>
            </div>
        </div>`).join('') : '<p class="opacity-50 text-center col-span-full py-10">No banks in library.</p>';
}

// Library
async function renderLibrary() {
    const lib = await getVault(),
        container = document.getElementById('bank-list');
    container.innerHTML = lib.length ? lib.map(b => `
        <div class="bg-card-bg p-6 rounded-2xl border border-border-clr flex justify-between items-center shadow-sm">
            <div>
                <h3 class="font-black italic uppercase text-txt-main">${b.name}</h3>
                <p class="text-[10px] opacity-50 uppercase font-black tracking-widest">${b.questions.length} Questions</p>
            </div>
            <button onclick="deleteBank(${b.id})" class="text-red-500 font-black text-[10px] uppercase bg-red-500/10 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition">Delete</button>
        </div>`).join('') : '<p class="opacity-50 text-center p-12 border-2 border-dashed border-border-clr rounded-[2rem]">Empty Vault.</p>';
}

async function handleFileSelect(e) {
    let successCount = 0;
    let errorCount = 0;
    
    for (let file of e.target.files) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate question bank
            const validation = errorHandler.validateQuestionBank(data);
            
            if (!validation.valid) {
                errorHandler.showUserError(
                    `Invalid File: ${file.name}`,
                    'The question bank file has validation errors:',
                    validation.errors.join('\n')
                );
                errorCount++;
                continue;
            }
            
            const qs = data.questions || (Array.isArray(data) ? data : []);
            await db.examVault.add({
                name: data.exam || file.name.replace('.json', ''),
                questions: qs
            });
            
            successCount++;
            errorHandler.logError('File Import Success', `Imported ${file.name} with ${qs.length} questions`);
            
        } catch (err) {
            errorCount++;
            errorHandler.logError('File Import Error', err);
            
            if (err instanceof SyntaxError) {
                errorHandler.showUserError(
                    `Invalid JSON: ${file.name}`,
                    'The file contains invalid JSON syntax. Please check the file format.',
                    err.message
                );
            } else {
                errorHandler.showUserError(
                    `Import Failed: ${file.name}`,
                    'An error occurred while importing the question bank.',
                    err.message
                );
            }
        }
    }
    
    // Show success message if any files were imported
    if (successCount > 0) {
        errorHandler.showSuccessMessage(
            `Successfully imported ${successCount} question bank${successCount > 1 ? 's' : ''}`
        );
    }
    
    renderLibrary();
    renderDashboard();
}

function openGenericConfirmModal(title, text, onConfirm) {
    document.getElementById('generic-confirm-title').innerText = title;
    document.getElementById('generic-confirm-text').innerText = text;
    document.getElementById('generic-confirm-btn').onclick = () => {
        closeGenericConfirmModal();
        onConfirm();
    };
    document.getElementById('generic-confirm-modal').classList.remove('hidden');
}

function closeGenericConfirmModal() {
    document.getElementById('generic-confirm-modal').classList.add('hidden');
}

async function deleteBank(id) {
    openGenericConfirmModal('Delete Bank', 'Are you sure you want to delete this question bank? This action is permanent.', async () => {
        await db.examVault.delete(id);
        renderLibrary();
        renderDashboard();
    });
}

// Lab & Auditing
async function renderLab() {
    const hist = await getHistory(),
        container = document.getElementById('merged-history-list');
    container.innerHTML = hist.length ? hist.map(h => `
        <div class="bg-card-bg p-6 rounded-2xl border ${h.passed ? 'border-green-500/30' : 'border-red-500/30'} flex justify-between items-center shadow-sm">
            <div>
                <h3 class="font-black italic uppercase text-txt-main">${h.exam}</h3>
                <div class="flex items-center gap-3 mt-1">
                    <span class="${h.passed ? 'pass-badge' : 'fail-badge'}">${h.passed ? 'Pass' : 'Fail'}</span>
                    <span class="text-[14px] font-black">${h.scaledScore} / 1000</span>
                    <span class="text-[9px] opacity-40 uppercase font-black">${new Date(h.timestamp).toLocaleString()}</span>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="auditAttempt(${h.id})" class="bg-accent/10 text-accent px-5 py-2 rounded-xl text-[9px] font-black uppercase">Audit</button>
                ${!h.passed ? `<button onclick="retakeErrors(${h.id})" class="bg-red-500 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg">Retake</button>` : ''}
            </div>
        </div>`).join('') : '<p class="opacity-50 text-center py-10">No logs.</p>';
}

async function auditAttempt(id) {
    const hist = await db.examHistory.get(id);
    if (!hist) return;
    activeAuditData = hist;
    document.getElementById('audit-subtitle').innerText = `${hist.exam} — ${new Date(hist.timestamp).toLocaleString()}`;
    filterAudit('all');
    document.getElementById('audit-modal').classList.remove('hidden');
}

function filterAudit(type) {
    const items = type === 'all' ? activeAuditData.details : (type === 'errors' ? activeAuditData.details.filter(q => q.isChecked && !q.isCorrect) : activeAuditData.details.filter(q => !q.isChecked));
    document.getElementById('audit-content').innerHTML = items.map((q, idx) => `
        <div class="p-8 rounded-[2rem] border-2 ${!q.isChecked ? 'border-border-clr' : (q.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5')}">
            <p class="text-[10px] font-black uppercase opacity-50 mb-4">Item #${idx + 1}</p>
            <div class="font-bold text-xl mb-6 markdown-content">${marked.parse(q.text)}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-app-bg rounded-xl border border-border-clr">
                    <p class="text-[9px] font-black uppercase opacity-50">Response</p>
                    <div class="${q.isCorrect ? 'text-green-500' : 'text-red-500'} font-bold markdown-content">${q.selectedKeys.map(k => marked.parse(q.options[k])).join(", ") || 'None'}</div>
                </div>
                <div class="p-4 bg-app-bg rounded-xl border border-border-clr">
                    <p class="text-[9px] font-black uppercase opacity-50">Expected</p>
                    <div class="text-green-500 font-bold markdown-content">${Array.isArray(q.answer) ? q.answer.map(k => marked.parse(q.options[k])).join(", ") : marked.parse(q.options[q.answer])}</div>
                </div>
            </div>
        </div>`).join('');
}

function closeAudit() {
    document.getElementById('audit-modal').classList.add('hidden');
}

// Analytics
async function renderAnalytics() {
    const hist = await getHistory(),
        radar = document.getElementById('topic-proficiency-container');
    const tops = {};
    hist.flatMap(h => h.details).forEach(q => {
        const c = q.category1 || "General";
        if (!tops[c]) tops[c] = { c: 0, t: 0 };
        tops[c].t++;
        if (q.isCorrect) tops[c].c++;
    });
    radar.innerHTML = Object.entries(tops).map(([n, d]) => {
        const p = Math.round((d.c / d.t) * 100);
        return `<div class="space-y-1"><div class="flex justify-between text-[9px] font-black uppercase"><span>${n}</span><span>${p}%</span></div><div class="h-1 bg-app-bg rounded-full border border-border-clr"><div class="h-full bg-accent" style="width:${p}%"></div></div></div>`;
    }).join('');
}

// UI Helpers
function toggleFocus() {
    const active = document.body.classList.toggle('focus-active');
    document.getElementById('focus-toggle').innerText = active ? "Focus On" : "Focus";
}

function exitFocusMode() {
    if (document.body.classList.contains('focus-active')) {
        toggleFocus();
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}
async function clearHistory() {
    openGenericConfirmModal('Clear History', 'Are you sure you want to delete all exam logs? This cannot be undone.', async () => {
        await db.examHistory.clear();
        renderLab();
        renderAnalytics();
        renderDashboard();
    });
}
// Force reload exams from directory
async function reloadExamsFromDirectory() {
    openGenericConfirmModal(
        'Reload Exams', 
        'This will clear all existing exam banks and reload them from the exams directory. Your exam history will be preserved. Continue?', 
        async () => {
            try {
                // Clear existing exams
                await db.examVault.clear();
                console.log('Cleared existing exams');
                
                // Load exam files from manifest
                let examFiles = [];
                try {
                    const manifestResponse = await fetch('exam-manifest.json');
                    if (manifestResponse.ok) {
                        examFiles = await manifestResponse.json();
                        console.log('📋 Loaded manifest with', examFiles.length, 'exam files');
                    }
                } catch (err) {
                    console.error('❌ Error loading manifest:', err);
                }

                let loadedCount = 0;
                let errorCount = 0;

                for (const filePath of examFiles) {
                    try {
                        // Encode the file path to handle spaces and special characters
                        const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
                        const response = await fetch(encodedPath);
                        if (!response.ok) {
                            console.warn(`Failed to load ${filePath}: ${response.status}`);
                            errorCount++;
                            continue;
                        }

                        const data = await response.json();
                        
                        // Validate question bank (this modifies the questions in place to add answer_type if missing)
                        const validation = errorHandler.validateQuestionBank(data);
                        
                        if (!validation.valid) {
                            console.error(`❌ Invalid exam file ${filePath}:`, validation.errors);
                            errorCount++;
                            continue;
                        }

                        // Get questions AFTER validation (which may have added answer_type)
                        const qs = data.questions || (Array.isArray(data) ? data : []);
                        const examName = data.exam || filePath.split('/').pop().replace('.json', '').replace(/%20/g, ' ');
                        
                        try {
                            await db.examVault.add({
                                name: examName,
                                questions: qs
                            });
                            loadedCount++;
                            console.log(`✅ Reloaded: ${examName} (${qs.length} questions)`);
                        } catch (dbError) {
                            console.error(`❌ Database error for ${examName}:`, dbError);
                            errorCount++;
                        }
                        
                    } catch (err) {
                        console.error(`Error loading ${filePath}:`, err);
                        errorCount++;
                    }
                }
                
                // Refresh UI
                renderLibrary();
                renderDashboard();
                
                if (loadedCount > 0) {
                    errorHandler.showSuccessMessage(
                        `Reloaded ${loadedCount} exam bank${loadedCount > 1 ? 's' : ''}`
                    );
                }
                
            } catch (error) {
                errorHandler.logError('Reload Exams', error);
                errorHandler.showUserError(
                    'Reload Failed',
                    'An error occurred while reloading exams from directory.',
                    error.message
                );
            }
        }
    );
}


// Auto-load exams from directory structure
async function autoLoadExams() {
    console.log('🔄 autoLoadExams() called');
    try {
        // Fetch the manifest file that lists all exam files
        let examFiles = [];
        try {
            const manifestResponse = await fetch('exam-manifest.json');
            if (manifestResponse.ok) {
                examFiles = await manifestResponse.json();
                console.log('📋 Loaded manifest with', examFiles.length, 'exam files');
            } else {
                console.warn('⚠️ Manifest not found, using fallback list');
                // Fallback to hardcoded list if manifest doesn't exist
                examFiles = [
                    'exams/snowflake/pro core/Gemini Exam 1.json',
                    'exams/snowflake/pro core/Gemini Exam 2.json',
                    'exams/snowflake/pro core/Official Practice Test.json',
                    'exams/snowflake/pro core/Test 19 with categories.json',
                    'exams/snowflake/pro core/Test 20 with categories.json',
                    'exams/snowflake/pro core/Test 21 with categories.json',
                    'exams/databricks/Data Eng/markdown/tests/databricks-certified-data-engineer-associate.json'
                ];
            }
        } catch (err) {
            console.error('❌ Error loading manifest:', err);
            // Use fallback list
            examFiles = [
                'exams/snowflake/pro core/Gemini Exam 1.json',
                'exams/snowflake/pro core/Gemini Exam 2.json',
                'exams/snowflake/pro core/Official Practice Test.json',
                'exams/snowflake/pro core/Test 19 with categories.json',
                'exams/snowflake/pro core/Test 20 with categories.json',
                'exams/snowflake/pro core/Test 21 with categories.json',
                'exams/databricks/Data Eng/markdown/tests/databricks-certified-data-engineer-associate.json'
            ];
        }

        // Check if we already have all exams from the manifest
        const existingExams = await getVault();
        console.log('📊 Existing exams in DB:', existingExams.length);
        
        if (existingExams.length >= examFiles.length) {
            console.log('✅ All exams already loaded in database');
            return;
        }
        
        console.log(`🚀 Loading ${examFiles.length - existingExams.length} new exams...`);

        let loadedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const filePath of examFiles) {
            console.log(`📥 Attempting to load: ${filePath}`);
            try {
                // Encode the file path to handle spaces and special characters
                const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
                const response = await fetch(encodedPath);
                console.log(`📡 Fetch response for ${filePath}:`, response.status, response.ok);
                if (!response.ok) {
                    console.warn(`❌ Failed to load ${filePath}: ${response.status}`);
                    errorCount++;
                    continue;
                }

                const data = await response.json();
                console.log(`📄 Parsed JSON for ${filePath}`, data.exam || 'no exam name');
                
                // Validate question bank (this modifies the questions in place to add answer_type if missing)
                const validation = errorHandler.validateQuestionBank(data);
                
                if (!validation.valid) {
                    console.error(`❌ Invalid exam file ${filePath}:`, validation.errors);
                    errorCount++;
                    continue;
                }

                // Get questions AFTER validation (which may have added answer_type)
                const qs = data.questions || (Array.isArray(data) ? data : []);
                const examName = data.exam || filePath.split('/').pop().replace('.json', '').replace(/%20/g, ' ');
                
                console.log(`✓ Validated: ${examName} with ${qs.length} questions`);
                
                // Check if this exam already exists in the database
                const existingExam = existingExams.find(e => e.name === examName);
                if (existingExam) {
                    console.log(`⏭️  Skipped: ${examName} (already in database)`);
                    skippedCount++;
                    continue;
                }
                
                try {
                    await db.examVault.add({
                        name: examName,
                        questions: qs
                    });
                    loadedCount++;
                    console.log(`✅ Loaded: ${examName} (${qs.length} questions)`);
                } catch (dbError) {
                    console.error(`❌ Database error for ${examName}:`, dbError);
                    errorCount++;
                }
                
            } catch (err) {
                console.error(`❌ Error loading ${filePath}:`, err);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary: Loaded ${loadedCount}, Skipped ${skippedCount}, Failed ${errorCount}`);
        
        if (loadedCount > 0) {
            errorHandler.showSuccessMessage(
                `Auto-loaded ${loadedCount} new exam bank${loadedCount > 1 ? 's' : ''}`
            );
        }

        if (errorCount > 0) {
            console.warn(`⚠️ Failed to load ${errorCount} exam(s)`);
        }
        
        if (skippedCount > 0) {
            console.log(`⏭️  Skipped ${skippedCount} exam(s) already in database`);
        }

    } catch (error) {
        console.error('Auto-load error:', error);
        errorHandler.logError('Auto-load Exams', error);
    }
}

window.onload = async () => {
    // Auto-load exams first
    await autoLoadExams();
    
    showView('home-view');
    
    // Add ESC key listener for focus mode and modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Check if config modal is open
            const configModal = document.getElementById('config-modal');
            if (configModal && !configModal.classList.contains('hidden')) {
                closeConfigModal();
                return;
            }
            
            // Check if confirm finish modal is open
            const confirmModal = document.getElementById('confirm-finish-modal');
            if (confirmModal && !confirmModal.classList.contains('hidden')) {
                closeConfirmModal();
                return;
            }
            
            // Check if generic confirm modal is open
            const genericModal = document.getElementById('generic-confirm-modal');
            if (genericModal && !genericModal.classList.contains('hidden')) {
                closeGenericConfirmModal();
                return;
            }
            
            // Check if audit modal is open
            const auditModal = document.getElementById('audit-modal');
            if (auditModal && !auditModal.classList.contains('hidden')) {
                closeAudit();
                return;
            }
            
            // Otherwise exit focus mode
            exitFocusMode();
        }
    });
};
