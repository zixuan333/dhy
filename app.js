const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k, d){try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},
  set(k,v){localStorage.setItem(k, JSON.stringify(v))}
};
let agents = store.get('by_agents', [
  {name:'董奉',level:90,stars:3,fate:'技能强化',atk:3450,hp:18200},
  {name:'诸葛亮',level:80,stars:1,fate:'普攻强化',atk:3180,hp:16500}
]);
let recruits = store.get('by_recruits', [
  {pool:'绣衣天下',pulls:109,golds:3,names:'赵云、干吉'}
]);
let rounds = store.get('by_rounds', []);
let team = store.get('by_team', ['张邈','董奉','诸葛亮']);

function switchTab(id){
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  $$('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
  scrollTo({top:0,behavior:'smooth'});
}
$$('.tab').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('[data-go]').forEach(b=>b.onclick=()=>switchTab(b.dataset.go));

function renderAgents(){
  const wrap=$('#agentList'); wrap.innerHTML='';
  if(!agents.length){wrap.innerHTML='<div class="item small">还没有密探，点击“添加密探”开始记录。</div>';return}
  agents.forEach((a,i)=>{
    const el=document.createElement('div');el.className='item';
    el.innerHTML=`<div class="item-top"><div><h4>${esc(a.name)}</h4><div class="meta"><span class="chip">Lv.${a.level}</span><span class="chip">${a.stars}星</span><span class="chip">攻击 ${a.atk}</span><span class="chip">生命 ${a.hp}</span></div><div class="small" style="margin-top:8px">命盘：${esc(a.fate||'未记录')}</div></div><button class="danger" data-del-agent="${i}">删除</button></div>`;
    wrap.appendChild(el);
  });
  $$('[data-del-agent]').forEach(b=>b.onclick=()=>{agents.splice(+b.dataset.delAgent,1);store.set('by_agents',agents);renderAgents()});
}
$('#addAgentBtn').onclick=()=>$('#agentDialog').showModal();
$('#saveAgentBtn').onclick=e=>{
  e.preventDefault();
  const name=$('#agentName').value.trim(); if(!name) return;
  agents.push({name,level:+$('#agentLevel').value,stars:+$('#agentStars').value,fate:$('#agentFate').value.trim(),atk:+$('#agentAtk').value,hp:+$('#agentHp').value});
  store.set('by_agents',agents); renderAgents(); $('#agentDialog').close(); $('#agentForm').reset();
};

function renderRecruits(){
  const pulls=recruits.reduce((s,x)=>s+x.pulls,0), golds=recruits.reduce((s,x)=>s+x.golds,0);
  $('#totalPulls').textContent=pulls; $('#totalGolds').textContent=golds; $('#avgGold').textContent=golds?(pulls/golds).toFixed(1):'—';
  const wrap=$('#recruitList');wrap.innerHTML='';
  recruits.slice().reverse().forEach((r,ri)=>{
    const i=recruits.length-1-ri; const avg=r.golds?(r.pulls/r.golds).toFixed(1):'—';
    const el=document.createElement('div');el.className='item';el.innerHTML=`<div class="item-top"><div><h4>${esc(r.pool)}</h4><div class="meta"><span class="chip">总次数 ${r.pulls}</span><span class="chip">绝密 ${r.golds}</span><span class="chip">平均 ${avg}</span></div><div class="small" style="margin-top:8px">获得：${esc(r.names||'未记录')}</div></div><button class="danger" data-del-rec="${i}">删除</button></div>`;wrap.appendChild(el);
  });
  $$('[data-del-rec]').forEach(b=>b.onclick=()=>{recruits.splice(+b.dataset.delRec,1);store.set('by_recruits',recruits);renderRecruits()});
}
$('#addRecruitBtn').onclick=()=>{
  const pool=$('#poolName').value.trim()||'未命名卡池';
  recruits.push({pool,pulls:+$('#pullCount').value||0,golds:+$('#goldCount').value||0,names:$('#goldNames').value.trim()});
  store.set('by_recruits',recruits);renderRecruits();$('#poolName').value='';$('#goldNames').value='';$('#goldCount').value=0;
};

function makeEmptyRound(){return team.map(name=>({name,action:'普攻'}))}
function renderRounds(){
  const wrap=$('#roundList');wrap.innerHTML='';
  if(!rounds.length){wrap.innerHTML='<div class="item small">还没有回合，点击“新增回合”。</div>';return}
  rounds.forEach((actors,ri)=>{
    const el=document.createElement('div');el.className='round';
    el.innerHTML=`<div class="round-title"><strong>第 ${ri+1} 回合</strong><div><button class="ghost" data-copy-round="${ri}">复制上一回合</button> <button class="danger" data-del-round="${ri}">删除</button></div></div>`;
    actors.forEach((a,ai)=>{
      const row=document.createElement('div');row.className='actor';row.innerHTML=`<b>${esc(a.name)}</b><div class="action-buttons">${['普攻','技能','防御','特殊'].map(act=>`<button class="${a.action===act?'selected':''}" data-action="${ri}:${ai}:${act}">${act}</button>`).join('')}</div>`;el.appendChild(row);
    });wrap.appendChild(el);
  });
  $$('[data-action]').forEach(b=>b.onclick=()=>{const [r,a,act]=b.dataset.action.split(':');rounds[+r][+a].action=act;store.set('by_rounds',rounds);renderRounds()});
  $$('[data-del-round]').forEach(b=>b.onclick=()=>{rounds.splice(+b.dataset.delRound,1);store.set('by_rounds',rounds);renderRounds()});
  $$('[data-copy-round]').forEach(b=>b.onclick=()=>{const i=+b.dataset.copyRound;if(i===0)return;rounds[i]=JSON.parse(JSON.stringify(rounds[i-1]));store.set('by_rounds',rounds);renderRounds()});
}
$('#addRoundBtn').onclick=()=>{rounds.push(makeEmptyRound());store.set('by_rounds',rounds);renderRounds()};
$('#applyTeamBtn').onclick=()=>{team=$('#teamInput').value.split(/[、,，]/).map(s=>s.trim()).filter(Boolean);store.set('by_team',team);alert('阵容已更新，新建回合会使用这个阵容。')};
$('#clearOpsBtn').onclick=()=>{if(confirm('确定清空所有回合记录？')){rounds=[];store.set('by_rounds',rounds);renderRounds()}};
$('#copyOpsBtn').onclick=async()=>{const text=rounds.map((r,i)=>`第${i+1}回合\n`+r.map(a=>`${a.name}：${a.action}`).join('\n')).join('\n\n');await navigator.clipboard.writeText(text||'');alert('已复制操作记录。')};

$('#exportBtn').onclick=()=>{
  const data={version:'0.1',exportedAt:new Date().toISOString(),agents,recruits,rounds,team};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='biyong-data.json';a.click();URL.revokeObjectURL(a.href);
};
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

$('#teamInput').value=team.join('、');renderAgents();renderRecruits();renderRounds();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
