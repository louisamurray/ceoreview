// --- CONFIG DATA ---
const kpis = [
  "Strategic Leadership",
  "Organisational Performance",
  "Financial Stewardship",
  "Stakeholder Engagement",
  "People Leadership & Culture",
  "Conflict Resolution",
  "Financial Resilience",
  "Board–CEO Communication",
  "Values Alignment",
];
const strategicPriorities = [
  "Strengthen Iwi relationships",
  "Increase trusted relationships & social cohesion",
  "Contribute to intergenerational wellbeing",
  "Operate a positive & professional organisation",
];
const jdAreas = [
  "Strategic Leadership",
  "People & Resources",
  "Partnerships",
  "Growth Opportunities",
  "Accountability",
  "Team & Culture",
];
const ratingDescriptions = {
  5: "Consistently exceeds expectations",
  4: "Meets and often exceeds expectations",
  3: "Meets expectations",
  2: "Partially meets expectations",
  1: "Unacceptable",
};
const STORAGE_KEY = "ceoReviewFormData";

// --- GENERIC HELPERS ---
function addItem(containerId, templateFunction) {
  const container = document.getElementById(containerId);
  const itemCount = container.children.length;
  const newItem = document.createElement("div");
  newItem.className = "new-item";
  newItem.innerHTML = templateFunction(itemCount);
  container.appendChild(newItem);
  return newItem;
}
function removeItem(button) {
  button.closest(".repeater-item").remove();
}

// --- TEMPLATES ---
const challengeTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Challenge #${index + 1}</p>
      <button type="button" onclick="removeItem(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Challenge</label>
      <textarea data-field="challenge" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Describe the challenge..."></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Action Taken</label>
      <textarea data-field="action" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="What action was taken?"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Result</label>
      <textarea data-field="result" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="What was the outcome?"></textarea>
    </div>
  </div>`;

const lastYearGoalTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Goal from Last Year #${index + 1}</p>
      <button type="button" onclick="removeItem(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Goal</label>
      <input type="text" data-field="goal" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Enter the goal statement...">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Status</label>
      <select data-field="status" class="w-full p-2 border border-slate-300 rounded-md bg-white">
        <option>Achieved</option>
        <option>Partially Achieved</option>
        <option>Not Achieved</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Evidence / Examples</label>
      <textarea data-field="evidence" rows="3" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Provide supporting evidence..."></textarea>
    </div>
  </div>`;

const pdUndertakenTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Programme/Course #${index + 1}</p>
      <button type="button" onclick="removeItem(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Programme/Course Title</label>
      <input type="text" data-field="title" class="w-full p-2 border border-slate-300 rounded-md">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Key Learnings</label>
      <textarea data-field="learnings" rows="2" class="w-full p-2 border border-slate-300 rounded-md"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">How Learnings Were Applied</label>
      <textarea data-field="applied" rows="2" class="w-full p-2 border border-slate-300 rounded-md"></textarea>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-1">Was This Requested Previously?</label>
        <select data-field="requested" class="w-full p-2 border border-slate-300 rounded-md bg-white">
          <option>No</option>
          <option>Yes</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-1">Usefulness vs Last Year</label>
        <select data-field="usefulness" class="w-full p-2 border border-slate-300 rounded-md bg-white">
          <option>More Useful</option>
          <option>Same</option>
          <option>Less Useful</option>
        </select>
      </div>
    </div>
  </div>`;

const pdNeededTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Development Need #${index + 1}</p>
      <button type="button" onclick="removeItem(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Area of Need</label>
      <input type="text" data-field="area" class="w-full p-2 border border-slate-300 rounded-md">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Expected Impact</label>
      <textarea data-field="impact" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Describe the expected impact of this PD..."></textarea>
    </div>
  </div>`;

const futureGoalTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Future Goal #${index + 1}</p>
      <button type="button" onclick="removeFutureGoal(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Goal Statement</label>
      <input type="text" data-field="statement" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Enter the goal statement...">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Desired Outcome</label>
      <textarea data-field="outcome" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="What will success look like?"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Why It Matters (Alignment to strategic priorities)</label>
      <textarea data-field="matters" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="How does this align with strategic priorities?"></textarea>
    </div>
  </div>`;

const boardRequestTemplate = (index) => `
  <div class="repeater-item p-4 border border-slate-200 rounded-md space-y-3 bg-slate-50">
    <div class="flex justify-between items-center">
      <p class="font-semibold text-slate-600">Board Request #${index + 1}</p>
      <button type="button" onclick="removeItem(this)" class="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200">&times; Remove</button>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Request</label>
      <textarea data-field="request" rows="2" class="w-full p-2 border border-slate-300 rounded-md"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Why is this needed?</label>
      <textarea data-field="needed" rows="2" class="w-full p-2 border border-slate-300 rounded-md"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">Was this requested previously?</label>
      <select data-field="previously_requested" class="w-full p-2 border border-slate-300 rounded-md bg-white">
        <option>No</option>
        <option>Yes</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-600 mb-1">If Yes, what has changed since last year?</label>
      <textarea data-field="changed" rows="2" class="w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., Still not in place, workload pressure continues..."></textarea>
    </div>
  </div>`;

// Mapping for hydration
const repeaterTemplates = {
  challenges: challengeTemplate,
  'last-year-goals': lastYearGoalTemplate,
  'pd-undertaken': pdUndertakenTemplate,
  'pd-needed': pdNeededTemplate,
  'future-goals': futureGoalTemplate,
  'board-requests': boardRequestTemplate,
};

// --- ADD ITEM FUNCTIONS (global for inline handlers) ---
function addChallenge() { return addItem('challenges-container', challengeTemplate); }
function addLastYearGoal() { return addItem('last-year-goals-container', lastYearGoalTemplate); }
function addPDUndertaken() { return addItem('pd-undertaken-container', pdUndertakenTemplate); }
function addPDNeeded() { return addItem('pd-needed-container', pdNeededTemplate); }
function addFutureGoal() { return addItem('future-goals-container', futureGoalTemplate); }
function addBoardRequest() { return addItem('board-requests-container', boardRequestTemplate); }

function removeFutureGoal(button) {
  const container = document.getElementById('future-goals-container');
  if (container.children.length > 3) {
    removeItem(button);
  } else {
    alert('A minimum of 3 goals is required.');
  }
}

// Expose for inline usage
Object.assign(window, { addChallenge, addLastYearGoal, addPDUndertaken, addPDNeeded, addFutureGoal, addBoardRequest, removeFutureGoal });

// --- SAVE / LOAD LOGIC (exported) ---
function saveProgress() {
  const formData = {
    simple: {},
    repeaters: {},
    kpis: [],
    priorities: [],
    jdAlignment: [],
  };
  document
    .querySelectorAll('textarea[id], input[type="text"][id]')
    .forEach((el) => {
      formData.simple[el.id] = el.value;
    });
  document.querySelectorAll('[id$="-container"]').forEach((container) => {
    const key = container.id.replace("-container", "");
    formData.repeaters[key] = [];
    container.querySelectorAll(".repeater-item").forEach((item) => {
      const itemData = {};
      item.querySelectorAll("[data-field]").forEach((field) => {
        itemData[field.dataset.field] = field.value;
      });
      formData.repeaters[key].push(itemData);
    });
  });
  document.querySelectorAll("#kpi-container > div").forEach((kpiDiv, idx) => {
    const rating =
      kpiDiv.querySelector('input[type="radio"]:checked')?.value || null;
    const evidence = kpiDiv.querySelector("textarea").value;
    const comparison = kpiDiv.querySelector("select").value;
    const why = kpiDiv.querySelector('input[type="text"]').value;
    formData.kpis.push({ name: kpis[idx], rating, evidence, comparison, why });
  });
  document
    .querySelectorAll("#strategic-priorities-container > div")
    .forEach((div, idx) => {
      const textareas = div.querySelectorAll("textarea");
      formData.priorities.push({
        name: strategicPriorities[idx],
        progress: textareas[0].value,
        challenges: textareas[1].value,
        trend: div.querySelector("select").value,
      });
    });
  document
    .querySelectorAll("#jd-alignment-container > div")
    .forEach((div, idx) => {
      const textareas = div.querySelectorAll("textarea");
      formData.jdAlignment.push({
        name: jdAreas[idx],
        well: textareas[0].value,
        notWell: textareas[1].value,
      });
    });
  const savedData = { timestamp: new Date().toISOString(), data: formData };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  const saveStatus = document.getElementById("save-status");
  if (saveStatus)
    saveStatus.textContent = `Last saved: ${new Date(
      savedData.timestamp
    ).toLocaleTimeString()}`;
  alert("Progress Saved!");
}

function loadProgress() {
  const savedDataJSON = localStorage.getItem(STORAGE_KEY);
  if (!savedDataJSON) return;
  const savedData = JSON.parse(savedDataJSON);
  const formData = savedData.data;
  for (const id in formData.simple) {
    const el = document.getElementById(id);
    if (el) el.value = formData.simple[id];
  }
  // Hydrate repeater sections
  if (formData.repeaters) {
    Object.entries(formData.repeaters).forEach(([key, items]) => {
      const container = document.getElementById(`${key}-container`);
      if (!container) return;
      container.innerHTML = '';
      const templateFn = repeaterTemplates[key];
      if (!templateFn) return;
      items.forEach((itemData, idx) => {
        const newItem = addItem(`${key}-container`, templateFn);
        Object.entries(itemData).forEach(([fieldKey, value]) => {
          const field = newItem.querySelector(`[data-field="${fieldKey}"]`);
          if (field) field.value = value;
        });
      });
    });
  }
  document.querySelectorAll("#kpi-container > div").forEach((kpiDiv, idx) => {
    const kpiData = formData.kpis[idx];
    if (!kpiData) return;
    if (kpiData.rating) {
      const input = kpiDiv.querySelector(
        `input[type="radio"][value="${kpiData.rating}"]`
      );
      if (input) input.checked = true;
    }
    kpiDiv.querySelector("textarea").value = kpiData.evidence;
    kpiDiv.querySelector("select").value = kpiData.comparison;
    kpiDiv.querySelector('input[type="text"]').value = kpiData.why;
  });
  document
    .querySelectorAll("#strategic-priorities-container > div")
    .forEach((div, idx) => {
      const pd = formData.priorities[idx];
      if (!pd) return;
      const tas = div.querySelectorAll("textarea");
      tas[0].value = pd.progress;
      tas[1].value = pd.challenges;
      div.querySelector("select").value = pd.trend;
    });
  document
    .querySelectorAll("#jd-alignment-container > div")
    .forEach((div, idx) => {
      const jd = formData.jdAlignment[idx];
      if (!jd) return;
      const tas = div.querySelectorAll("textarea");
      tas[0].value = jd.well;
      tas[1].value = jd.notWell;
    });
  const saveStatus = document.getElementById("save-status");
  if (saveStatus)
    saveStatus.textContent = `Last saved: ${new Date(
      savedData.timestamp
    ).toLocaleString()}`;
}

// Expose globally (could switch to modules later)
window.saveProgress = saveProgress;
window.loadProgress = loadProgress;
window.ceoReviewConfig = { kpis, strategicPriorities, jdAreas, ratingDescriptions };

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Build KPI UI
  const kpiContainer = document.getElementById('kpi-container');
  if (kpiContainer) {
    kpis.forEach((kpi, index) => {
      const kpiId = `kpi-${index}`;
      const div = document.createElement('div');
      div.innerHTML = `
        <div>
          <p class=\"font-medium text-slate-700\">${kpi}</p>
          <fieldset class=\"mt-2\">
            <legend class=\"sr-only\">Rating for ${kpi}</legend>
            <div class=\"flex items-center space-x-2 sm:space-x-4\">
              ${[1,2,3,4,5].map(val => `
                <div class=\"tooltip\">
                  <label for=\"${kpiId}-${val}\" class=\"cursor-pointer text-center\">
                    <input type=\"radio\" id=\"${kpiId}-${val}\" name=\"${kpiId}\" value=\"${val}\" class=\"sr-only peer\">
                    <span class=\"block w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus:ring-2 peer-focus:ring-blue-500 transition\">${val}</span>
                  </label>
                  <span class=\"tooltip-text\">${ratingDescriptions[val]}<\/span>
                </div>`).join('')}
            </div>
          </fieldset>
          <textarea class=\"w-full mt-3 p-2 border border-slate-300 rounded-md\" rows=\"2\" placeholder=\"Evidence / Examples for ${kpi}...\"></textarea>
          <div class=\"mt-3 p-3 bg-slate-50 rounded-md border\">
            <label class=\"block text-sm font-medium text-slate-600 mb-2\">Compared to Last Year</label>
            <div class=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">
              <div>
                <select class=\"w-full p-2 border border-slate-300 rounded-md bg-white\">
                  <option>Better</option>
                  <option>Same</option>
                  <option>Worse</option>
                </select>
              </div>
              <div>
                <input type=\"text\" class=\"w-full p-2 border border-slate-300 rounded-md\" placeholder=\"Why? (briefly)\">
              </div>
            </div>
          </div>
        </div>`;
      kpiContainer.appendChild(div);
    });
  }

  // Build strategic priorities
  const prioritiesContainer = document.getElementById('strategic-priorities-container');
  if (prioritiesContainer) {
    strategicPriorities.forEach(priority => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class=\"p-4 border border-slate-200 rounded-md bg-slate-50\">
          <label class=\"block text-sm font-bold text-slate-700 mb-1\">${priority}</label>
          <div class=\"space-y-2 mt-2\">
            <textarea class=\"w-full p-2 border border-slate-300 rounded-md\" rows=\"2\" placeholder=\"Progress & Achievements...\"></textarea>
            <textarea class=\"w-full p-2 border border-slate-300 rounded-md\" rows=\"2\" placeholder=\"Challenges...\"></textarea>
          </div>
          <div class=\"mt-3\">
            <label class=\"block text-sm font-medium text-slate-600 mb-1\">Trend vs Last Year</label>
            <select class=\"w-full p-2 border border-slate-300 rounded-md bg-white\">
              <option>Improving</option>
              <option>Stable</option>
              <option>Declining</option>
            </select>
          </div>
        </div>`;
      prioritiesContainer.appendChild(div);
    });
  }

  // Build JD alignment areas
  const jdContainer = document.getElementById('jd-alignment-container');
  if (jdContainer) {
    jdAreas.forEach(area => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class=\"p-4 border border-slate-200 rounded-md bg-slate-50\">
          <label class=\"block text-sm font-bold text-slate-700 mb-1\">${area}</label>
          <div class=\"space-y-2 mt-2\">
            <textarea class=\"w-full p-2 border border-slate-300 rounded-md\" rows=\"2\" placeholder=\"What Went Well...\"></textarea>
            <textarea class=\"w-full p-2 border border-slate-300 rounded-md\" rows=\"2\" placeholder=\"What Did Not Go Well...\"></textarea>
          </div>
        </div>`;
      jdContainer.appendChild(div);
    });
  }

  // Default repeater items if no saved data
  if (!localStorage.getItem(STORAGE_KEY)) {
    addChallenge();
    addLastYearGoal();
    addPDUndertaken();
    addPDNeeded();
    for (let i = 0; i < 3; i++) addFutureGoal();
    addBoardRequest();
  }

  // Load saved content
  loadProgress();

  // Event listeners
  const saveBtn = document.getElementById('save-progress-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveProgress);
  const form = document.getElementById('reviewForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for completing the review. Your responses have been recorded.');
      console.log('Submission intercepted – integrate backend POST here.');
    });
  }
});
