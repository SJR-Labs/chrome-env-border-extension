function createRow(r = {regex:'',color:'#000000',label:'',priority:50}) {
  const d=document.createElement('div');
  d.innerHTML = `Regex:<input class=regex value="${r.regex}">
  Color:<input type=color class=color value="${r.color}">
  Label:<input class=label value="${r.label}">
  Priority:<input type=number class=priority value="${r.priority}">
  <button class=rm>X</button>`;
  d.querySelector('.rm').onclick=()=>d.remove();
  return d;
}

function load(){
  chrome.storage.sync.get(['rules'],res=>{
    (res.rules||[]).forEach(r=>document.getElementById('rules').appendChild(createRow(r)));
  });
}

function collect(){
  return Array.from(document.querySelectorAll('#rules>div')).map(d=>({
    regex:d.querySelector('.regex').value,
    color:d.querySelector('.color').value,
    label:d.querySelector('.label').value,
    priority:Number(d.querySelector('.priority').value)
  }));
}

document.getElementById('add').onclick=()=>document.getElementById('rules').appendChild(createRow());
document.getElementById('save').onclick=()=>chrome.storage.sync.set({rules:collect()},()=>alert('Saved'));

document.getElementById('export').onclick=()=>{
  const blob=new Blob([JSON.stringify(collect(),null,2)]);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='rules.json';
  a.click();
};

document.getElementById('import').onclick=()=>document.getElementById('fileInput').click();
document.getElementById('fileInput').onchange=e=>{
  const reader=new FileReader();
  reader.onload=()=>chrome.storage.sync.set({rules:JSON.parse(reader.result)},()=>location.reload());
  reader.readAsText(e.target.files[0]);
};

load();