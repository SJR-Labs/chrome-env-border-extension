const DEFAULT_RULES = [
  { regex: '^localhost$|^127\\.0\\.0\\.1$', color: '#4CAF50', label: 'LOCAL', priority: 100 },
  { regex: '(^|\\.)int\\.', color: '#2196F3', label: 'INT', priority: 80 },
  { regex: '(^|\\.)uat\\.', color: '#FF9800', label: 'UAT', priority: 60 },
  { regex: '(^|\\.)prod\\.|(^|\\.)www\\.', color: '#F44336', label: 'PROD', priority: 40 }
];

function createField(labelText, input) {
  const label = document.createElement('label');
  label.append(`${labelText}:`, input);
  return label;
}

function createRow(r = { regex: '', color: '#000000', label: '', priority: 50 }) {
  const d = document.createElement('div');
  const regex = document.createElement('input');
  const color = document.createElement('input');
  const label = document.createElement('input');
  const priority = document.createElement('input');
  const remove = document.createElement('button');

  regex.className = 'regex';
  regex.value = r.regex;

  color.type = 'color';
  color.className = 'color';
  color.value = r.color;

  label.className = 'label';
  label.value = r.label;

  priority.type = 'number';
  priority.className = 'priority';
  priority.value = Number.isFinite(Number(r.priority)) ? Number(r.priority) : 50;

  remove.type = 'button';
  remove.className = 'rm';
  remove.textContent = 'X';
  remove.onclick = () => d.remove();

  d.append(
    createField('Regex', regex),
    createField('Color', color),
    createField('Label', label),
    createField('Priority', priority),
    remove
  );
  return d;
}

function renderRules(rules) {
  const container = document.getElementById('rules');
  container.innerHTML = '';
  rules.forEach(r => container.appendChild(createRow(r)));
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
  return Array.from(document.querySelectorAll('#rules>div')).map(d => ({
    regex: d.querySelector('.regex').value,
    color: d.querySelector('.color').value,
    label: d.querySelector('.label').value,
    priority: Number(d.querySelector('.priority').value)
  }));
}

document.getElementById('add').onclick = () => document.getElementById('rules').appendChild(createRow());
document.getElementById('save').onclick = () => {
  try {
    const rules = validateRules(collect());
    chrome.storage.sync.set({ rules }, () => alert('Saved'));
  } catch (error) {
    alert(error.message);
  }
};

document.getElementById('export').onclick = () => {
  const blob = new Blob([JSON.stringify(collect(), null, 2)]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'rules.json';
  a.click();
};

document.getElementById('import').onclick = () => document.getElementById('fileInput').click();
document.getElementById('fileInput').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const rules = validateRules(parsed);
      chrome.storage.sync.set({ rules }, () => load());
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
};

load();
