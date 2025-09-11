// --- CONFIG DATA ---
const kpis = [ 'Strategic Leadership', 'Organisational Performance', 'Financial Stewardship', 'Stakeholder Engagement', 'People Leadership & Culture', 'Conflict Resolution', 'Financial Resilience', 'Board–CEO Communication', 'Values Alignment' ];
const strategicPriorities = [ 'Strengthen Iwi relationships', 'Increase trusted relationships & social cohesion', 'Contribute to intergenerational wellbeing', 'Operate a positive & professional organisation' ];
const jdAreas = [ 'Strategic Leadership', 'People & Resources', 'Partnerships', 'Growth Opportunities', 'Accountability', 'Team & Culture' ];
const ratingDescriptions = { 5: 'Consistently exceeds expectations', 4: 'Meets and often exceeds expectations', 3: 'Meets expectations', 2: 'Partially meets expectations', 1: 'Unacceptable', 0: 'Don’t know' };
const STORAGE_KEY = 'ceoReviewFormData';

// --- GENERIC HELPERS ---
function addItem(containerId, templateFunction) { const container = document.getElementById(containerId); const itemCount = container.children.length; const newItem = document.createElement('div'); newItem.className = 'new-item'; newItem.innerHTML = templateFunction(itemCount); container.appendChild(newItem); return newItem; }
function removeItem(button) { button.closest('.repeater-item').remove(); }

// --- TEMPLATES ---
const challengeTemplate = (i) => `...existing code...`;
// NOTE: To keep this external file lighter, retain original template strings inlined in index if specialized.

// --- ADD ITEM ALIASES (kept for compatibility if needed) ---
// These will be defined inlined in index or refactored later.

// --- SAVE / LOAD LOGIC (exported) ---
function saveProgress() { const formData = { simple: {}, repeaters: {}, kpis: [], priorities: [], jdAlignment: [] }; document.querySelectorAll('textarea[id], input[type="text"][id]').forEach(el => { formData.simple[el.id] = el.value; }); document.querySelectorAll('[id$="-container"]').forEach(container => { const key = container.id.replace('-container',''); formData.repeaters[key] = []; container.querySelectorAll('.repeater-item').forEach(item => { const itemData = {}; item.querySelectorAll('[data-field]').forEach(field => { itemData[field.dataset.field] = field.value; }); formData.repeaters[key].push(itemData); }); }); document.querySelectorAll('#kpi-container > div').forEach((kpiDiv, idx) => { const rating = kpiDiv.querySelector('input[type="radio"]:checked')?.value || null; const evidence = kpiDiv.querySelector('textarea').value; const comparison = kpiDiv.querySelector('select').value; const why = kpiDiv.querySelector('input[type="text"]').value; formData.kpis.push({ name: kpis[idx], rating, evidence, comparison, why }); }); document.querySelectorAll('#strategic-priorities-container > div').forEach((div, idx) => { const textareas = div.querySelectorAll('textarea'); formData.priorities.push({ name: strategicPriorities[idx], progress: textareas[0].value, challenges: textareas[1].value, trend: div.querySelector('select').value }); }); document.querySelectorAll('#jd-alignment-container > div').forEach((div, idx) => { const textareas = div.querySelectorAll('textarea'); formData.jdAlignment.push({ name: jdAreas[idx], well: textareas[0].value, notWell: textareas[1].value }); }); const savedData = { timestamp: new Date().toISOString(), data: formData }; localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData)); const saveStatus = document.getElementById('save-status'); if (saveStatus) saveStatus.textContent = `Last saved: ${new Date(savedData.timestamp).toLocaleTimeString()}`; alert('Progress Saved!'); }

function loadProgress() { const savedDataJSON = localStorage.getItem(STORAGE_KEY); if (!savedDataJSON) return; const savedData = JSON.parse(savedDataJSON); const formData = savedData.data; for (const id in formData.simple) { const el = document.getElementById(id); if (el) el.value = formData.simple[id]; } document.querySelectorAll('#kpi-container > div').forEach((kpiDiv, idx) => { const kpiData = formData.kpis[idx]; if (!kpiData) return; if (kpiData.rating) { const input = kpiDiv.querySelector(`input[type="radio"][value="${kpiData.rating}"]`); if (input) input.checked = true; } kpiDiv.querySelector('textarea').value = kpiData.evidence; kpiDiv.querySelector('select').value = kpiData.comparison; kpiDiv.querySelector('input[type="text"]').value = kpiData.why; }); document.querySelectorAll('#strategic-priorities-container > div').forEach((div, idx) => { const pd = formData.priorities[idx]; if (!pd) return; const tas = div.querySelectorAll('textarea'); tas[0].value = pd.progress; tas[1].value = pd.challenges; div.querySelector('select').value = pd.trend; }); document.querySelectorAll('#jd-alignment-container > div').forEach((div, idx) => { const jd = formData.jdAlignment[idx]; if (!jd) return; const tas = div.querySelectorAll('textarea'); tas[0].value = jd.well; tas[1].value = jd.notWell; }); const saveStatus = document.getElementById('save-status'); if (saveStatus) saveStatus.textContent = `Last saved: ${new Date(savedData.timestamp).toLocaleString()}`; }

// Expose globally (could switch to modules later)
window.saveProgress = saveProgress;
window.loadProgress = loadProgress;
window.ceoReviewConfig = { kpis, strategicPriorities, jdAreas, ratingDescriptions };
