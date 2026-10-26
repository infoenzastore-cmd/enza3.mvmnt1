const surveySteps = [
  {
    eyebrow: "LET'S BEGIN",
    title: "How are you feeling today?",
    description: "Select what feels most relevant. You can choose up to 5.",
    max: 5,
    options: [
      ["Headache", "bi-lightning-charge"], ["Migraine", "bi-person"], ["Tired / Low Energy", "bi-battery-half"],
      ["Poor Sleep", "bi-moon-stars"], ["Stress / Anxiety", "bi-flower1"], ["Low Mood", "bi-sun"],
      ["Focus Issues", "bi-lightbulb"], ["Back Ache", "bi-person-standing"], ["Neck & Shoulder Tension", "bi-person-arms-up"],
      ["Joint Pain", "bi-activity"], ["Muscle Soreness", "bi-heart-pulse"], ["Digestion Issues", "bi-droplet"],
      ["Bloating", "bi-wind"], ["Acidity / Reflux", "bi-water"], ["Skin Concerns", "bi-droplet-half"],
      ["Hair Fall", "bi-stars"], ["Immunity Support", "bi-shield-check"], ["Hormonal Balance", "bi-diagram-3"],
      ["Weight Management", "bi-speedometer2"], ["Glucose Balance", "bi-heart"], ["Heart Health", "bi-heart-pulse"],
      ["Eye Strain", "bi-eye"], ["Screen Fatigue", "bi-display"], ["Respiratory Health", "bi-lungs"],
      ["Frequent Colds", "bi-snow"], ["Women's Health", "bi-gender-female"], ["Men's Health", "bi-gender-male"],
      ["General Wellbeing", "bi-leaf"]
    ]
  },
  {
    eyebrow: "YOUR INTENTION",
    title: "What would you like more of?",
    description: "Choose up to 3 intentions for your everyday life.",
    max: 3,
    options: [
      ["Better rest", "bi-moon-stars"], ["More energy", "bi-lightning-charge"], ["Calmer moments", "bi-flower1"],
      ["Gentle movement", "bi-person-walking"], ["Nourishment", "bi-cup-hot"], ["Focus", "bi-lightbulb"],
      ["A simple ritual", "bi-sunrise"], ["Connection", "bi-people"]
    ]
  },
  {
    eyebrow: "YOUR RHYTHM",
    title: "What does your day look like?",
    description: "Choose the settings that feel familiar. You can choose up to 3.",
    max: 3,
    options: [
      ["Busy workdays", "bi-briefcase"], ["Lots of screen time", "bi-display"], ["Caring for others", "bi-heart"],
      ["Time outdoors", "bi-tree"], ["Frequent travel", "bi-airplane"], ["On my feet", "bi-person-walking"],
      ["Slow mornings", "bi-cup-hot"], ["Changing schedules", "bi-clock"]
    ]
  },
  {
    eyebrow: "YOUR CURIOSITY",
    title: "What would you like to explore?",
    description: "Pick up to 3 parts of ENZA that catch your eye.",
    max: 3,
    options: [
      ["Food & pantry", "bi-basket"], ["Skin & hair care", "bi-droplet"], ["Home rituals", "bi-house-heart"],
      ["Mindful objects", "bi-flower1"], ["Style & fashion", "bi-bag"], ["Shared experiences", "bi-people"]
    ]
  },
  {
    eyebrow: "A LAST DETAIL",
    title: "How do you like to recharge?",
    description: "Choose up to 3. Your answers shape your first edit.",
    max: 3,
    options: [
      ["A quiet evening", "bi-moon-stars"], ["Something nourishing", "bi-cup-hot"], ["Making a space feel calm", "bi-house-heart"],
      ["Moving my body", "bi-person-walking"], ["Getting creative", "bi-palette"], ["Being with people", "bi-people"],
      ["A thoughtful gift", "bi-gift"], ["Trying something new", "bi-stars"]
    ]
  }
];

const surveyModal = document.querySelector('#survey-modal');
const surveyContent = document.querySelector('#survey-content');
const surveySelections = surveySteps.map(() => []);
let surveyStep = 0;
let surveyResult = false;
let surveyPreviousFocus = null;

function surveyEscape(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function surveyOpen() {
  surveyPreviousFocus = document.activeElement;
  document.querySelector('#survey-backdrop').hidden = false;
  surveyModal.hidden = false;
  document.body.classList.add('locked');
  renderSurvey();
}

function surveyClose() {
  surveyModal.hidden = true;
  document.querySelector('#survey-backdrop').hidden = true;
  document.body.classList.remove('locked');
  if (surveyPreviousFocus && document.contains(surveyPreviousFocus)) surveyPreviousFocus.focus();
}

function renderSurvey() {
  const step = surveySteps[surveyStep];
  document.querySelector('#survey-progress-label').textContent = surveyResult ? 'Your edit' : `Step ${surveyStep + 1} of ${surveySteps.length}`;
  document.querySelector('#survey-progress').innerHTML = surveySteps.map((_, index) =>
    `<span class="${index <= surveyStep ? 'active' : ''}"></span>`
  ).join('');
  document.querySelector('#survey-back').hidden = !surveyResult && surveyStep === 0;
  if (surveyResult) {
    renderSurveyResults();
    return;
  }
  surveyContent.innerHTML = `
    <p class="survey-eyebrow">${step.eyebrow}</p>
    <h2 id="survey-title" tabindex="-1">${step.title}</h2>
    <p class="survey-description" id="survey-description">${step.description}</p>
    <div class="survey-choices" role="group" aria-label="${surveyEscape(step.title)}">
      ${step.options.map(([label, icon]) => {
        const selected = surveySelections[surveyStep].includes(label);
        return `<button class="survey-choice ${selected ? 'selected' : ''}" type="button" data-survey-choice="${surveyEscape(label)}" aria-pressed="${selected}"><i class="bi ${icon}" aria-hidden="true"></i><span>${surveyEscape(label)}</span></button>`;
      }).join('')}
    </div>
    <p class="survey-count" id="survey-count" role="status">${surveySelections[surveyStep].length} of ${step.max} selected</p>
    <button type="button" class="survey-next" id="survey-next" ${surveySelections[surveyStep].length ? '' : 'disabled'}>${surveyStep === surveySteps.length - 1 ? 'See my recommendations' : 'Next question'} <span aria-hidden="true">→</span></button>
  `;
  surveyContent.scrollTop = 0;
  surveyContent.querySelector('#survey-title').focus({ preventScroll: true });
}

function surveyToggle(label) {
  const selected = surveySelections[surveyStep];
  const index = selected.indexOf(label);
  if (index >= 0) selected.splice(index, 1);
  else if (selected.length < surveySteps[surveyStep].max) selected.push(label);
  else {
    document.querySelector('#survey-count').textContent = `Choose up to ${surveySteps[surveyStep].max}; deselect one to change your answer.`;
    return;
  }
  surveyContent.querySelectorAll('[data-survey-choice]').forEach(button => {
    const active = selected.includes(button.dataset.surveyChoice);
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#survey-count').textContent = `${selected.length} of ${surveySteps[surveyStep].max} selected`;
  document.querySelector('#survey-next').disabled = !selected.length;
}

function surveyRankProducts() {
  const answers = surveySelections.flat();
  const joined = answers.join(' ').toLowerCase();
  const targetMood = /sleep|rest|stress|anxiety|calm|quiet|tension|mood/.test(joined) ? 'Rested'
    : /energy|tired|focus|movement|moving|workday/.test(joined) ? 'Energized' : 'Grounded';
  return products.map(product => {
    let score = product.mood === targetMood ? 4 : 0;
    if (/food|pantry|nourish|digestion|bloat/.test(joined) && product.category === 'Food') score += 5;
    if (/skin|hair/.test(joined) && /hair|tea/.test(product.name.toLowerCase())) score += 7;
    if (/home|quiet|calm|ritual/.test(joined) && product.category === 'Home') score += 6;
    if (/style|fashion|creative/.test(joined) && product.category === 'Fashion') score += 5;
    if (/object|gift/.test(joined) && product.category === 'Lifestyle') score += 4;
    if (/rest|sleep|evening/.test(joined) && /unwind|candle|hair oil/.test(product.name.toLowerCase())) score += 4;
    if (/energy|tired|focus/.test(joined) && /protein|seeds|cleanergizer/.test(product.name.toLowerCase())) score += 4;
    return { product, score };
  }).sort((a, b) => b.score - a.score || a.product.id - b.product.id).slice(0, 3).map(item => item.product);
}

function renderSurveyResults() {
  const picks = surveyRankProducts();
  const topAnswers = [...surveySelections[1], ...surveySelections[3]].slice(0, 4);
  surveyContent.innerHTML = `
    <p class="survey-eyebrow">CURATED FOR YOU</p>
    <h2 id="survey-title" tabindex="-1">Your thoughtful first edit.</h2>
    <p class="survey-description" id="survey-description">A few places to begin, chosen from the ENZA concept collection using your answers.</p>
    <div class="survey-answer-summary">${topAnswers.map(answer => `<span>${surveyEscape(answer)}</span>`).join('')}</div>
    <div class="survey-results">${picks.map(product => `
      <article class="survey-result-card">
        <img src="${product.image}" alt="Concept render of ${surveyEscape(product.name)}">
        <div class="survey-result-body"><span>${surveyEscape(product.category)} · Concept edit</span><h3>${surveyEscape(product.name)}</h3><p>${surveyEscape(product.description)}</p><div class="survey-result-footer"><strong>${money(product.price)}</strong><button type="button" data-add="${product.id}" aria-label="Add ${surveyEscape(product.name)} to concept bag">Add to bag +</button></div></div>
      </article>`).join('')}</div>
    <p class="survey-result-note">This is a discovery edit based on your preferences, not a diagnosis or medical recommendation. Products and prices are illustrative; checkout is unavailable.</p>
    <div class="survey-result-actions"><button type="button" class="survey-next" id="survey-start-over">Start over <span aria-hidden="true">↺</span></button><button type="button" class="survey-shop" id="survey-explore">Explore the full collection →</button></div>
  `;
  surveyContent.scrollTop = 0;
  surveyContent.querySelector('#survey-title').focus({ preventScroll: true });
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-open-survey]')) surveyOpen();
  if (event.target.closest('#survey-close') || event.target.id === 'survey-backdrop') surveyClose();
  if (event.target.closest('#survey-back')) {
    if (surveyResult) surveyResult = false;
    else surveyStep = Math.max(0, surveyStep - 1);
    renderSurvey();
  }
  const choice = event.target.closest('[data-survey-choice]');
  if (choice) surveyToggle(choice.dataset.surveyChoice);
  if (event.target.closest('#survey-next') && surveySelections[surveyStep].length) {
    if (surveyStep === surveySteps.length - 1) surveyResult = true;
    else surveyStep++;
    renderSurvey();
  }
  if (event.target.closest('#survey-start-over')) {
    surveySelections.forEach(selected => selected.splice(0));
    surveyStep = 0;
    surveyResult = false;
    renderSurvey();
  }
  if (event.target.closest('#survey-explore')) {
    surveyClose();
    document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
  }
});

document.addEventListener('keydown', event => {
  if (surveyModal.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); surveyClose(); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...surveyModal.querySelectorAll('button:not(:disabled):not([hidden])')];
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
