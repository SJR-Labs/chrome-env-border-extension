const PRIORITY_MIN = '0';
const PRIORITY_MAX = '100';
const PRIORITY_STEP = '5';
const PRIORITY_STEP_INT = parseInt(PRIORITY_STEP);
const DEFAULT_RULES = [
  { regex: '^localhost$|^127\\.0\\.0\\.1$', color: '#4CAF50', label: 'LOCAL', priority: 100 },
  { regex: '(^|\\.)int\\.', color: '#2196F3', label: 'INT', priority: 80 },
  { regex: '(^|\\.)uat\\.', color: '#FF9800', label: 'UAT', priority: 60 },
  { regex: '(^|\\.)prod\\.', color: '#F44336', label: 'PROD', priority: 40 }
];
const rulesContainer = document.getElementById('rules');
const addButton = document.getElementById('add');
const saveButton = document.getElementById('save');
const exportButton = document.getElementById('export');
const importButton = document.getElementById('import');
const fileInput = document.getElementById('fileInput');

function createField(element, input) {
  const label = document.createElement(element);
  if (element === 'th') {
    label.setAttribute('scope', 'row');
  }
  label.append(input);
  return label;
}

function changePriorityValidationListener() {
  return (e) => {
    const el = e.target;
    const min = parseInt(el.min);
    const max = parseInt(el.max);
    const valueUnround = parseInt(el.value);
    const value = Math.round(valueUnround / PRIORITY_STEP_INT) * PRIORITY_STEP_INT;

    if (el.value !== "" && !isNaN(value)) {
      if (min !== undefined && value < min) {
        el.value = min;
      } else if (max !== undefined && value > max) {
        el.value = max;
      } else{
        el.value = value;
      }
    }
  };
}

function createRow(r = {regex: '', color: '#000000', label: '', priority: 50}, i) {
  const index = i ?? rulesContainer.children.length;

  const d = document.createElement('tr');
  d.id = 'rule_' + index;
  const regex = document.createElement('input');
  const color = document.createElement('input');
  const label = document.createElement('input');
  const priority = document.createElement('input');
  const remove = document.createElement('button');

  regex.id = 'regex_' + index;
  regex.type = 'text';
  regex.className = 'regex';
  regex.value = r.regex;

  color.id = 'color_' + index;
  color.type = 'color';
  color.className = 'color';
  color.value = r.color;

  label.id = 'label_' + index;
  label.type = 'text';
  label.className = 'label';
  label.value = r.label;

  priority.id = 'priority_' + index;
  priority.type = 'number';
  priority.className = 'priority';
  priority.value = Number.isFinite(Number(r.priority)) ? Number(r.priority) : 50;
  priority.min = PRIORITY_MIN;
  priority.max = PRIORITY_MAX;
  priority.step = PRIORITY_STEP;
  priority.addEventListener('change', changePriorityValidationListener());

  remove.id = 'remove_' + index;
  remove.type = 'button';
  remove.className = 'rm';
  remove.textContent = 'X';
  remove.addEventListener('click',() => {
    priority.removeEventListener('change', changePriorityValidationListener());
    d.remove();
  });

  d.append(
    createField('th', regex),
    createField('td', color),
    createField('td', label),
    createField('td', priority),
    createField('td', remove),
  );
  return d;
}

function renderRules(rules) {
  const fragment = document.createDocumentFragment();
  rulesContainer.innerHTML = '';
  rules.forEach((r, index) => fragment.appendChild(createRow(r, index)));
  rulesContainer.appendChild(fragment);
}

function validateRules(rules) {
  if (!Array.isArray(rules)) {
    throw new Error('Rules must be provided as an array.');
  }

  return rules.map((rule, index) => {
    const normalized = {
      regex: typeof rule.regex === 'string' ? rule.regex.trim() : '',
      color: typeof rule.color === 'string' ? rule.color : '',
      label: typeof rule.label === 'string' ? rule.label.trim() : '',
      priority: Number(rule.priority)
    };

    if (!normalized.regex || !normalized.color || !normalized.label || !Number.isFinite(normalized.priority)) {
      throw new Error(`Rule ${index + 1} is incomplete.`);
    }

    try {
      new RegExp(normalized.regex, 'i');
    } catch {
      throw new Error(`Rule ${index + 1} has an invalid regex.`);
    }

    return normalized;
  });
}

function load() {
  chrome.storage.sync.get({ rules: DEFAULT_RULES }, res => {
    renderRules(res.rules);
  });
}

function collect() {
  return Array.from(rulesContainer.querySelectorAll('tr')).map(d => ({
    regex: d.querySelector('.regex').value,
    color: d.querySelector('.color').value,
    label: d.querySelector('.label').value,
    priority: Number(d.querySelector('.priority').value)
  }));
}

addButton.addEventListener('click', () => rulesContainer.appendChild(createRow()));
saveButton.addEventListener('click', () => {
  try {
    const rules = validateRules(collect());
    chrome.storage.sync.set({rules}, () => alert('Saved'));
  } catch (error) {
    alert(error.message);
  }
});

exportButton.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(collect(), null, 2)]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rules.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});

importButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const rules = validateRules(parsed);
      chrome.storage.sync.set({rules}, () => renderRules(rules));
    } catch (error) {
      alert(error.message || 'Invalid rules file.');
    } finally {
      e.target.value = '';
    }
  };
  reader.onerror = () => {
    alert('Could not read the selected file.');
    e.target.value = '';
  };
  reader.readAsText(file);
});

load();
