/* Точка опоры v14 — рабочий контур психолог ↔ клиент.
   Надстраивается над базовой логикой v12: вход по ролям, код доступа клиента,
   центр входящих, рабочая сессия, раздельные заметки, общий итог и синхронизация вкладок. */

const WORKSPACE_VERSION = 15;
const WORKSPACE_SESSION_KEY = 'tochka_opory_session_v15';
const WORKSPACE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let workSessionDraft = null;

function workCode(){
  let out=''; for(let i=0;i<6;i++) out+=WORKSPACE_CHARS[Math.floor(Math.random()*WORKSPACE_CHARS.length)];
  return out;
}
function uniqueWorkCode(){let code=workCode();while(data.clients.some(c=>c.accessCode===code))code=workCode();return code;}
function getWorkSession(){try{return JSON.parse(sessionStorage.getItem(WORKSPACE_SESSION_KEY)||'null')}catch{return null}}
function setWorkSession(value){if(value)sessionStorage.setItem(WORKSPACE_SESSION_KEY,JSON.stringify(value));else sessionStorage.removeItem(WORKSPACE_SESSION_KEY)}
function latestClientIntake(id){return data.clientIntakes?.filter(x=>x.clientId===id).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]||null}
function unreviewedAssignments(id){return activeAssignments(id).filter(a=>a.status==='done'&&!a.reviewedAt)}
function currentScenarioFor(c){return latestClientIntake(c.id)?.scenario||latestAssessment(c.id)?.scenario||''}
function daysUntil(v){if(!v)return null;const a=new Date(`${todayISO()}T12:00:00`),b=new Date(`${v}T12:00:00`);return Math.round((b-a)/86400000)}

function normalizeOperationalData(persist=true){
  if(!data.practiceSettings) data.practiceSettings={psychPin:'2468',practiceName:'Точка опоры'};
  if(!Array.isArray(data.activityLog)) data.activityLog=[];
  if(!Array.isArray(data.sharedNotes)) data.sharedNotes=[];
  data.clients.forEach(c=>{if(!c.accessCode)c.accessCode=uniqueWorkCode();});
  if(data.workspaceVersion!==WORKSPACE_VERSION){
    data.workspaceVersion=WORKSPACE_VERSION;
    // Заполняем демонстрационную карточку так, чтобы специалист сразу видел рабочий цикл.
    const anna=clientById('client_anna');
    if(anna && !latestClientIntake(anna.id)){
      data.clientIntakes.unshift({
        id:uid('intake'),clientId:anna.id,date:isoOffset(-2),scenario:'hire',
        answers:{problem:'overload',tried:'applications',protect:'income',preserve:'tasks',time:'30'},
        goal:'Понять, можно ли начать переход без резкого увольнения и потери дохода.',
        tried:'Смотрела вакансии и думала о частной практике, но каждый вариант кажется слишком большим решением.',
        concern:'Боюсь ошибиться и ухудшить финансовую ситуацию семьи.',
        preserve:'Доход, возможность быть с детьми вечером и интересные аналитические задачи.'
      });
    }
    if(anna && !clientPreparations(anna.id).length){
      data.preparations.unshift({id:uid('prep'),clientId:anna.id,date:todayISO(),changed:'Стало яснее, что уходить немедленно не обязательно.',worked:'Поговорила с одним знакомым о его проектной работе.',stuck:'Не понимаю, как отличить реальный спрос от дружеской поддержки.',focus:'Хочу обсудить критерии хорошего эксперимента.'});
      data.checkins.unshift({id:uid('check'),clientId:anna.id,date:todayISO(),clarity:6,energy:4,confidence:5,tension:7,note:'Много текущей работы, к вечеру трудно думать о переходе.'});
    }
    if(anna && !activeAssignments(anna.id).some(a=>a.source==='workspace-demo')){
      data.assignments.unshift({id:uid('as'),clientId:anna.id,title:'Разговор без продажи',prompt:'Поговорите с одним человеком, который мог бы быть потенциальным клиентом. Не предлагайте услугу. Уточните, какую задачу он сейчас пытается решить, что уже пробовал и за какой результат был бы готов заплатить.',deadline:isoOffset(2),createdAt:isoOffset(-1),status:'done',response:'Человек подробно рассказал о проблеме и попросил прислать структуру разбора. Я заметила, что сразу начала обесценивать это как «он просто знакомый».',completedAt:todayISO(),scenario:'hire',source:'workspace-demo',reviewedAt:''});
    }
    if(persist) baseWorkSave();
  } else if(persist) baseWorkSave();
}

// Сохраняем базовую функцию до переопределения.
const baseWorkSave = saveData;
saveData=function(){
  data.clients.forEach(c=>{if(!c.accessCode)c.accessCode=uniqueWorkCode();});
  baseWorkSave();
  try{window.dispatchEvent(new CustomEvent('tochka-opory-saved',{detail:{at:Date.now()}}));}catch{}
};
normalizeOperationalData(false);baseWorkSave();

// Убираем визуальный переключатель ролей из старой пилотной сборки.
if(document.getElementById('pilotRoleSwitch')) document.getElementById('pilotRoleSwitch').remove();

// Навигация психолога: добавляем входящие.
(function injectWorkNavigation(){
  const nav=document.querySelector('.main-nav');
  if(nav&&!nav.querySelector('[data-view="inbox"]')){
    const btn=document.createElement('button');btn.dataset.view='inbox';btn.innerHTML='<span class="nav-icon">↳</span><span>Входящие</span><b id="inboxCountBadge">0</b>';
    const guide=nav.querySelector('[data-view="guide"]');nav.insertBefore(btn,guide||null);
    btn.addEventListener('click',()=>{ui.view='inbox';renderView();window.scrollTo({top:0,behavior:'smooth'});});
  }
  const actions=document.querySelector('.topbar-actions');
  if(actions&&!document.getElementById('workLogout')){
    const btn=document.createElement('button');btn.id='workLogout';btn.className='icon-button work-logout';btn.title='Выйти';btn.textContent='↪';actions.appendChild(btn);
    btn.addEventListener('click',logoutWorkspace);
  }
})();

// Экран входа создаётся один раз. В рабочем режиме роли не переключаются внутри кабинета.
(function injectLoginGate(){
  const gate=document.createElement('section');gate.id='workLoginGate';gate.className='work-login-gate';gate.innerHTML=`
    <div class="work-login-shell">
      <div class="work-login-brand"><span class="work-login-mark">◎</span><div><strong>Точка опоры</strong><small>рабочее пространство психологического сопровождения</small></div></div>
      <div class="work-login-grid">
        <section class="work-login-card primary-card">
          <span class="work-login-kicker">СПЕЦИАЛИСТ</span><h1>Кабинет психолога</h1>
          <p>Клиенты, подготовка к встречам, рабочие сценарии, подсказки, протоколы и задания между сессиями.</p>
          <form id="psychLoginForm"><label><span>ПИН специалиста</span><input name="pin" inputmode="numeric" autocomplete="current-password" value="2468" maxlength="12" /></label><button class="primary-button" type="submit">Войти в кабинет →</button></form>
          <small class="work-login-help">Для первой апробации ПИН: <b>2468</b>. Его можно поменять в настройках.</small>
        </section>
        <section class="work-login-card">
          <span class="work-login-kicker">КЛИЕНТ</span><h2>Моё пространство</h2>
          <p>Подготовка к встрече, один текущий шаг, результат между сессиями и история согласованных итогов.</p>
          <form id="clientLoginForm"><label><span>Код доступа</span><input name="code" autocomplete="one-time-code" placeholder="Например, A7K9Q2" maxlength="12" /></label><button class="quiet-button strong" type="submit">Открыть моё пространство →</button></form>
          <small id="clientLoginHint" class="work-login-help">Код выдаёт психолог из карточки клиента.</small>
        </section>
      </div>
      <div class="work-login-foot"><span id="workConnectionState">Локальный режим</span><p>Для апробации используйте обезличенные данные. Производственный режим с персональными данными требует защищённой серверной инфраструктуры и настроенных прав доступа.</p></div>
    </div>`;
  document.body.appendChild(gate);
  gate.querySelector('#psychLoginForm').addEventListener('submit',e=>{
    e.preventDefault();const pin=new FormData(e.currentTarget).get('pin')?.trim();
    if(pin!==(data.practiceSettings?.psychPin||'2468')){gate.querySelector('#workConnectionState').textContent='Неверный ПИН';return;}
    enterWorkspace({role:'psychologist'});
  });
  gate.querySelector('#clientLoginForm').addEventListener('submit',e=>{
    e.preventDefault();const code=(new FormData(e.currentTarget).get('code')||'').trim().toUpperCase();
    const c=data.clients.find(x=>(x.accessCode||'').toUpperCase()===code);
    if(!c){gate.querySelector('#clientLoginHint').textContent='Код не найден. Проверьте символы или попросите психолога выдать новый.';return;}
    enterWorkspace({role:'client',clientId:c.id});
  });
})();

function enterWorkspace(session){
  setWorkSession(session);document.getElementById('workLoginGate').classList.add('hidden');document.querySelector('.app-layout').classList.remove('work-locked');
  if(session.role==='client'){
    const c=clientById(session.clientId);if(!c){logoutWorkspace();return;}
    data.activeClientId=c.id;baseWorkSave();pilotRole='client';document.body.classList.add('client-mode','work-client-role');document.body.classList.remove('work-psych-role');ui.view='clientPortal';clientJourneyView='today';
  }else{
    pilotRole='psychologist';document.body.classList.remove('client-mode','work-client-role');document.body.classList.add('work-psych-role');if(ui.view==='clientPortal')ui.view='dashboard';
  }
  renderView();
}
function logoutWorkspace(){setWorkSession(null);document.body.classList.remove('work-client-role','work-psych-role','client-mode');document.getElementById('workLoginGate')?.classList.remove('hidden');document.querySelector('.app-layout')?.classList.add('work-locked');}
function bootWorkspaceAuth(){
  document.querySelector('.app-layout')?.classList.add('work-locked');
  const url=new URL(location.href);const code=(url.searchParams.get('client')||'').trim().toUpperCase();
  if(code){const c=data.clients.find(x=>(x.accessCode||'').toUpperCase()===code);if(c){enterWorkspace({role:'client',clientId:c.id});return;}}
  const s=getWorkSession();if(s)enterWorkspace(s);else logoutWorkspace();
}

// Расширяем renderView рабочими разделами.
const workPrevRenderView=renderView;
renderView=function(){
  const s=getWorkSession();
  if(s?.role==='client'){
    pilotRole='client';document.body.classList.add('client-mode','work-client-role');document.body.classList.remove('work-psych-role');
    if(!clientById(s.clientId)){logoutWorkspace();return;}data.activeClientId=s.clientId;
    if(ui.view!=='clientPortal')ui.view='clientPortal';
  }
  if(ui.view==='inbox') renderWorkInbox(document.getElementById('viewRoot'));
  else workPrevRenderView();
  updateWorkChrome();
};

function updateWorkChrome(){
  const session=getWorkSession();const psych=session?.role==='psychologist';
  const inbox=countInbox();const badge=document.getElementById('inboxCountBadge');if(badge)badge.textContent=inbox;
  const mode=document.querySelector('.mode-badge');if(mode)mode.textContent=window.__sharedServerMode?'Общий режим':'Локальный режим';
  document.getElementById('workLogout')?.classList.toggle('pilot-hidden',!session);
  document.querySelector('.brand-copy small') && (document.querySelector('.brand-copy small').textContent=psych?'кабинет психолога':'моё пространство');
}

function countInbox(){
  const done=data.assignments.filter(a=>a.status==='done'&&!a.reviewedAt).length;
  const prep=data.preparations.filter(p=>!p.reviewedAt).length;
  const intake=data.clientIntakes.filter(i=>!i.reviewedAt).length;
  return done+prep+intake;
}

// Полностью заменяем старый "пилотный" блок на центр работы специалиста.
renderDashboard=function(root){
  _renderDashboard(root);
  appendWorkActionCenter(root);
};
function appendWorkActionCenter(root){
  root.querySelectorAll('.pilot-workflow').forEach(x=>x.remove());
  const items=buildInboxItems().slice(0,6);
  const todayClients=data.clients.filter(c=>c.nextSession===todayISO()).sort((a,b)=>(a.nextSessionTime||'').localeCompare(b.nextSessionTime||''));
  const section=document.createElement('section');section.className='work-action-center';section.innerHTML=`
    <section class="panel work-attention-panel"><div class="panel-head"><div><span class="section-label">Требует внимания</span><h2>Что сделать до следующей сессии</h2></div><button class="text-button" data-work-action="open-inbox">Все входящие ${countInbox()?`· ${countInbox()}`:''}</button></div>
      ${items.length?`<div class="work-inbox-preview">${items.map(renderInboxItem).join('')}</div>`:'<div class="empty-state"><strong>Новых входящих нет</strong><p>Ответы клиента и подготовка к встречам появятся здесь.</p></div>'}
    </section>
    <section class="panel work-today-sessions"><div class="panel-head"><div><span class="section-label">Сегодня</span><h2>Рабочие сессии</h2></div></div>
      ${todayClients.length?todayClients.map(c=>`<article><div><strong>${esc(c.nextSessionTime||'—')} · ${esc(c.name)}</strong><p>${esc(truncate(c.request||'',95))}</p></div><button class="primary-button compact" data-work-action="start-session" data-client="${c.id}">Открыть сессию</button></article>`).join(''):`<div class="empty-state"><p>На сегодня в карточках клиентов встречи не назначены.</p></div>`}
    </section>`;
  const first=root.firstElementChild; if(first) first.after(section); else root.appendChild(section);
  wireWorkActions(root);
}

function buildInboxItems(){
  const out=[];
  data.clientIntakes.forEach(x=>{if(!x.reviewedAt)out.push({type:'intake',date:x.date||'',clientId:x.clientId,title:'Стартовая подготовка',text:x.goal||'Клиент отправил подготовку к первой встрече',id:x.id})});
  data.preparations.forEach(x=>{if(!x.reviewedAt)out.push({type:'prep',date:x.date||'',clientId:x.clientId,title:'Подготовка к встрече',text:x.focus||x.stuck||x.changed||'Клиент обновил подготовку',id:x.id})});
  data.assignments.forEach(x=>{if(x.status==='done'&&!x.reviewedAt)out.push({type:'assignment',date:x.completedAt||x.createdAt||'',clientId:x.clientId,title:`Выполнено: ${x.title}`,text:x.response||'Клиент завершил шаг',id:x.id})});
  return out.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
}
function renderInboxItem(i){const c=clientById(i.clientId);const labels={intake:'Новая подготовка',prep:'Перед встречей',assignment:'Ответ на шаг'};return `<article class="work-inbox-item"><span class="work-inbox-type ${i.type}">${labels[i.type]}</span><div><strong>${esc(c?.name||'Клиент')}</strong><p>${esc(i.title)}</p><small>${esc(truncate(i.text||'',160))}</small></div><div class="work-inbox-actions"><button class="text-button" data-work-action="open-client" data-client="${i.clientId}">Карточка</button><button class="quiet-button compact" data-work-action="review" data-type="${i.type}" data-id="${i.id}">Разобрано</button></div></article>`}
function renderWorkInbox(root){
  setPage('Ответы и подготовка клиентов','Входящие');const items=buildInboxItems();
  root.innerHTML=`<div class="page-heading"><div><span class="section-label">Рабочая очередь</span><h2>Входящие от клиентов</h2><p>Здесь только то, что требует реакции: стартовая подготовка, ответы на задания и материалы перед встречей.</p></div><span class="work-queue-count">${items.length}</span></div><section class="panel work-inbox-full">${items.length?items.map(renderInboxItem).join(''):'<div class="empty-state"><strong>Очередь пуста</strong><p>Новые ответы клиентов появятся автоматически.</p></div>'}</section>`;
  wireWorkActions(root);
}

// Карточка клиента — рабочая, а не информационная.
renderClientTab=function(c,sessions,goals,assess){
  _renderClientTab(c,sessions,goals,assess);
  if(ui.clientTab==='overview') appendOperationalClientOverview(c);
  if(ui.clientTab==='plan') appendAssignmentsToPlan(c);
};
function appendOperationalClientOverview(c){
  const root=document.getElementById('clientTabRoot');if(!root)return;
  root.querySelectorAll('.pilot-between').forEach(x=>x.remove());
  const intake=latestClientIntake(c.id),prep=clientPreparations(c.id)[0],check=clientCheckins(c.id)[0];
  const done=unreviewedAssignments(c.id);const scenario=currentScenarioFor(c);
  const block=document.createElement('section');block.className='work-client-console';block.innerHTML=`
    <div class="work-client-console-head"><div><span class="section-label">Рабочий контур</span><h2>Следующая сессия: что уже известно</h2></div><div class="work-client-tools"><button class="quiet-button" data-work-action="access" data-client="${c.id}">Доступ клиента</button><button class="primary-button" data-work-action="start-session" data-client="${c.id}">Начать рабочую сессию →</button></div></div>
    <div class="work-client-snapshot">
      <article><small>Сценарий</small><strong>${esc(scenario?scenarios[scenario]?.title:'Не выбран')}</strong><p>${esc(intake?.goal||'Стартовая подготовка ещё не отправлена.')}</p></article>
      <article><small>Перед встречей</small><strong>${esc(prep?.focus||'Нет новой подготовки')}</strong><p>${esc(truncate(prep?.stuck||prep?.changed||'Клиент пока ничего не добавил.',140))}</p></article>
      <article><small>Новые результаты</small><strong>${done.length?`${done.length} требуют разбора`:'Всё просмотрено'}</strong><p>${esc(done[0]?.response||'Нет новых выполненных шагов.')}</p></article>
      <article><small>Check-in</small><strong>${check?`Ясность ${check.clarity}/10 · напряжение ${check.tension}/10`:'Нет данных'}</strong><p>${esc(check?.note||'Появится после подготовки клиента.')}</p></article>
    </div>
    ${intake?`<details class="work-intake-details"><summary>Стартовая подготовка клиента · ${esc(scenarios[intake.scenario]?.title||'сценарий')}</summary><div class="work-intake-grid"><div><span>Хочет изменить</span><p>${esc(intake.goal||'—')}</p></div><div><span>Уже пробовал(а)</span><p>${esc(intake.tried||'—')}</p></div><div><span>Тревожит</span><p>${esc(intake.concern||'—')}</p></div><div><span>Важно сохранить</span><p>${esc(intake.preserve||'—')}</p></div></div></details>`:''}`;
  root.prepend(block);wireWorkActions(root);
}

function markReviewed(type,id){
  let item=null;if(type==='assignment')item=data.assignments.find(x=>x.id===id);else if(type==='prep')item=data.preparations.find(x=>x.id===id);else if(type==='intake')item=data.clientIntakes.find(x=>x.id===id);
  if(item){item.reviewedAt=new Date().toISOString();saveData();renderView();toast('Отмечено как разобранное');}
}

function clientAccessDialog(clientId){
  const c=clientById(clientId);if(!c)return;
  const base=location.href.split('?')[0].split('#')[0];const link=`${base}?client=${encodeURIComponent(c.accessCode)}`;
  let modal=document.getElementById('accessModal');if(!modal){modal=document.createElement('div');modal.id='accessModal';modal.className='modal';modal.setAttribute('aria-hidden','true');modal.innerHTML=`<div class="modal-backdrop" data-work-close></div><section class="modal-dialog medium"><button class="modal-close" data-work-close>×</button><span class="section-label">Доступ клиента</span><h2 id="accessModalName"></h2><div id="accessModalBody"></div></section>`;document.body.appendChild(modal);modal.querySelectorAll('[data-work-close]').forEach(b=>b.addEventListener('click',()=>closeModal('#accessModal')));}
  document.getElementById('accessModalName').textContent=c.name;document.getElementById('accessModalBody').innerHTML=`<div class="work-access-code"><small>Код доступа</small><strong>${esc(c.accessCode)}</strong></div><label class="work-link-field"><span>Ссылка для входа</span><input readonly value="${esc(link)}" /></label><div class="panel-actions"><button class="primary-button" data-work-copy="${esc(link)}">Скопировать ссылку</button><button class="quiet-button" data-work-open-client="${esc(link)}">Открыть в новой вкладке</button></div><p class="work-access-note">В локальной версии ссылка работает с общей базой только в том же браузере. Если запустить комплект через <b>start_server.bat</b>, несколько вкладок и устройств в одной сети могут видеть общую базу в режиме апробации.</p>`;
  document.getElementById('accessModalBody').querySelector('[data-work-copy]').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.workCopy);toast('Ссылка скопирована')}catch{document.querySelector('.work-link-field input').select();document.execCommand('copy');toast('Ссылка скопирована')}});
  document.getElementById('accessModalBody').querySelector('[data-work-open-client]').addEventListener('click',e=>window.open(e.currentTarget.dataset.workOpenClient,'_blank','noopener'));
  openModal('#accessModal');
}

// Полноэкранный рабочий режим сессии.
(function injectWorkSession(){
  const shell=document.createElement('section');shell.id='workSessionOverlay';shell.className='work-session-overlay';shell.setAttribute('aria-hidden','true');shell.innerHTML='<div id="workSessionRoot"></div>';document.body.appendChild(shell);
})();
function startWorkSession(clientId){
  const c=clientById(clientId);if(!c)return;data.activeClientId=c.id;saveData();
  const prep=clientPreparations(c.id)[0],intake=latestClientIntake(c.id),last=latestSession(c.id),scenario=currentScenarioFor(c)||'hire';
  workSessionDraft={clientId:c.id,scenario,stage:'before',notes:'',hypothesis:c.formulation||'',interventions:'',sharedSummary:'',nextFocus:last?.nextFocus||'',assignmentTitle:'',assignmentPrompt:'',deadline:isoOffset(3),stateBefore:5,stateAfter:6,date:todayISO(),duration:60};
  const overlay=document.getElementById('workSessionOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderWorkSession();
}
function closeWorkSession(){const o=document.getElementById('workSessionOverlay');o.classList.remove('open');o.setAttribute('aria-hidden','true');document.body.style.overflow='';workSessionDraft=null;renderView();}
function renderWorkSession(){
  const d=workSessionDraft;if(!d)return;const c=clientById(d.clientId),prep=clientPreparations(c.id)[0],intake=latestClientIntake(c.id),last=latestSession(c.id),done=unreviewedAssignments(c.id),guide=SCENARIO_GUIDE[d.scenario],qs=questionSets[d.scenario]||[];
  const root=document.getElementById('workSessionRoot');
  root.innerHTML=`<div class="work-session-shell">
    <header class="work-session-head"><div class="work-session-brand"><span>◎</span><div><small>РАБОЧАЯ СЕССИЯ</small><strong>${esc(c.name)}</strong></div></div><nav><button class="${d.stage==='before'?'active':''}" data-session-stage="before">1 · До встречи</button><button class="${d.stage==='during'?'active':''}" data-session-stage="during">2 · Во время</button><button class="${d.stage==='finish'?'active':''}" data-session-stage="finish">3 · Итог</button></nav><button class="work-session-close" data-session-close>Сохранить черновик и выйти</button></header>
    <main class="work-session-body">${d.stage==='before'?renderSessionBefore(c,prep,intake,last,done,guide):d.stage==='during'?renderSessionDuring(c,intake,guide,qs,d):renderSessionFinish(c,d)}</main>
  </div>`;
  wireWorkSession(root);
}
function renderSessionBefore(c,prep,intake,last,done,guide){
  return `<section class="work-session-before"><div class="work-session-title"><span class="section-label">Перед разговором</span><h1>Соберите контекст за 2 минуты</h1><p>Цель — войти в сессию с фактами, но не с готовым объяснением клиента.</p></div><div class="work-before-grid">
    <section class="work-session-card"><small>Что клиент хочет обсудить</small><h3>${esc(prep?.focus||intake?.goal||'Фокус не указан')}</h3><p>${esc(prep?.stuck||intake?.concern||'Нет дополнительного комментария.')}</p>${prep?`<div class="work-mini-facts"><span>Изменилось: ${esc(prep.changed||'—')}</span><span>Удалось: ${esc(prep.worked||'—')}</span></div>`:''}</section>
    <section class="work-session-card"><small>Результат между встречами</small>${done.length?done.map(a=>`<article class="work-result-card"><strong>${esc(a.title)}</strong><p>${esc(a.response)}</p></article>`).join(''):'<p>Новых выполненных шагов нет.</p>'}</section>
    <section class="work-session-card"><small>Последняя рабочая гипотеза</small><h3>${esc(c.formulation||last?.hypothesis||'Не сформулирована')}</h3><p>${esc(last?.nextFocus||'Проверьте гипотезу в диалоге, а не подтверждайте её автоматически.')}</p></section>
    <section class="work-session-card accent"><small>Подсказка по сценарию</small><h3>${esc(scenarios[currentScenarioFor(c)]?.title||'Рабочий сценарий')}</h3><p>${esc(guide?.aim||'Уточните запрос и выберите один проверяемый фокус.')}</p><div class="work-opening">${(guide?.opening||[]).map(x=>`<button data-copy-question="${esc(x)}">${esc(x)}</button>`).join('')}</div></section>
  </div><div class="work-session-next"><button class="primary-button" data-session-stage="during">Перейти к работе в сессии →</button></div></section>`;
}
function renderSessionDuring(c,intake,guide,qs,d){
  const hints=qs.map((q,i)=>{const h=PSYCH_HINTS[d.scenario]?.[q.key];return `<article class="work-hint-row"><b>${i+1}</b><div><strong>${esc(q.title)}</strong><p>${esc(h?.listen||q.help||'')}</p><details><summary>Уточнение и ограничение</summary><p><em>Спросить:</em> ${esc(h?.ask||'—')}</p><p><em>Не спешить:</em> ${esc(h?.caution||'—')}</p></details></div></article>`}).join('');
  return `<section class="work-during-layout"><aside class="work-method-panel"><span class="section-label">Методический навигатор</span><h2>${esc(scenarios[d.scenario]?.title||'Сценарий')}</h2><p>${esc(guide?.aim||'')}</p><div class="work-hints-scroll">${hints}</div></aside><main class="work-live-notes"><div class="work-session-title compact"><span class="section-label">Во время встречи</span><h1>Фиксируйте факты и проверяемые гипотезы</h1></div><label><span>Ключевые высказывания / наблюдения</span><textarea data-session-field="notes" rows="8" placeholder="Формулировки клиента, противоречия, изменения, факты…">${esc(d.notes)}</textarea></label><label><span>Рабочая гипотеза</span><textarea data-session-field="hypothesis" rows="5" placeholder="Что сейчас может поддерживать проблему и что нужно проверить">${esc(d.hypothesis)}</textarea></label><label><span>Вопросы / интервенции, которые сработали</span><textarea data-session-field="interventions" rows="4">${esc(d.interventions)}</textarea></label><div class="work-state-row"><label><span>Состояние до</span><input type="range" min="0" max="10" value="${d.stateBefore}" data-session-field="stateBefore"><output>${d.stateBefore}</output></label><label><span>Состояние после</span><input type="range" min="0" max="10" value="${d.stateAfter}" data-session-field="stateAfter"><output>${d.stateAfter}</output></label></div><div class="work-session-next"><button class="quiet-button" data-session-stage="before">← Контекст</button><button class="primary-button" data-session-stage="finish">Сформировать итог →</button></div></main></section>`;
}
function renderSessionFinish(c,d){
  return `<section class="work-finish-layout"><div class="work-session-title"><span class="section-label">Завершение встречи</span><h1>Разделите внутреннюю запись и то, что получает клиент</h1><p>Клиенту отправляется только согласованный итог и следующий шаг. Внутренние наблюдения остаются в кабинете психолога.</p></div><div class="work-finish-grid"><section class="work-finish-private"><span>ТОЛЬКО ПСИХОЛОГУ</span><label><small>Рабочая гипотеза / внутренняя заметка</small><textarea data-session-field="hypothesis" rows="6">${esc(d.hypothesis)}</textarea></label><label><small>Следующий профессиональный фокус</small><textarea data-session-field="nextFocus" rows="4" placeholder="Что проверить на следующей встрече">${esc(d.nextFocus)}</textarea></label></section><section class="work-finish-shared"><span>УВИДИТ КЛИЕНТ</span><label><small>Что прояснили сегодня</small><textarea data-session-field="sharedSummary" rows="6" placeholder="Коротко и нейтрально: что стало понятнее, без скрытых интерпретаций">${esc(d.sharedSummary)}</textarea></label><label><small>Один шаг до следующей встречи</small><input data-session-field="assignmentTitle" value="${esc(d.assignmentTitle)}" placeholder="Например: Сравнить три реальные вакансии" /></label><label><small>Инструкция</small><textarea data-session-field="assignmentPrompt" rows="4" placeholder="Что сделать и что заметить">${esc(d.assignmentPrompt)}</textarea></label><label><small>Срок</small><input type="date" data-session-field="deadline" value="${esc(d.deadline)}" /></label></section></div><div class="work-session-next"><button class="quiet-button" data-session-stage="during">← Вернуться к заметкам</button><button class="primary-button" data-session-save>Сохранить сессию и отправить шаг →</button></div></section>`;
}
function wireWorkSession(root){
  root.querySelectorAll('[data-session-stage]').forEach(b=>b.addEventListener('click',()=>{captureWorkSessionFields(root);workSessionDraft.stage=b.dataset.sessionStage;renderWorkSession()}));
  root.querySelector('[data-session-close]')?.addEventListener('click',()=>{captureWorkSessionFields(root);closeWorkSession()});
  root.querySelectorAll('[data-session-field]').forEach(el=>el.addEventListener('input',()=>{const k=el.dataset.sessionField;workSessionDraft[k]=el.type==='range'?Number(el.value):el.value;if(el.type==='range')el.nextElementSibling.textContent=el.value;}));
  root.querySelectorAll('[data-copy-question]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copyQuestion);toast('Вопрос скопирован')}catch{toast('Вопрос: '+b.dataset.copyQuestion)}}));
  root.querySelector('[data-session-save]')?.addEventListener('click',()=>{captureWorkSessionFields(root);saveWorkSession()});
}
function captureWorkSessionFields(root){root.querySelectorAll('[data-session-field]').forEach(el=>{workSessionDraft[el.dataset.sessionField]=el.type==='range'?Number(el.value):el.value;});}
function saveWorkSession(){
  const d=workSessionDraft,c=clientById(d.clientId);if(!c)return;
  const theme=d.sharedSummary.trim()?truncate(d.sharedSummary.trim(),180):(latestClientIntake(c.id)?.goal||'Психологическая сессия');
  data.sessions.push({id:uid('session'),clientId:c.id,date:d.date,format:'Онлайн / очно',duration:Number(d.duration)||60,stateBefore:Number(d.stateBefore),stateAfter:Number(d.stateAfter),theme,notes:d.notes.trim(),hypothesis:d.hypothesis.trim(),interventions:d.interventions.trim(),homework:d.assignmentTitle.trim(),sharedSummary:d.sharedSummary.trim(),nextFocus:d.nextFocus.trim()});
  c.formulation=d.hypothesis.trim()||c.formulation;
  if(d.assignmentTitle.trim()) data.assignments.unshift({id:uid('as'),clientId:c.id,title:d.assignmentTitle.trim(),prompt:d.assignmentPrompt.trim()||'Выполните согласованный шаг и коротко зафиксируйте, что получилось и что заметили.',deadline:d.deadline,createdAt:todayISO(),status:'assigned',response:'',completedAt:'',scenario:d.scenario,source:'session'});
  data.preparations.filter(x=>x.clientId===c.id&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  data.clientIntakes.filter(x=>x.clientId===c.id&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  data.assignments.filter(x=>x.clientId===c.id&&x.status==='done'&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  saveData();closeWorkSession();ui.view='client';ui.clientTab='overview';renderView();toast('Сессия сохранена. Клиент видит согласованный итог и следующий шаг.');
}

// Клиентская оболочка: никакого пилота, никакого переключателя ролей.
renderClientShell=function(root,c,content,{stepLabel='',progress=0}={}){
  setPage('Моё пространство',c.name);
  root.innerHTML=`<div class="client-journey-v12 work-client-shell"><header class="cj-header"><div class="cj-brandline"><span class="cj-mark">◎</span><div><strong>Точка опоры</strong><small>ваше пространство психологического сопровождения</small></div></div><div class="cj-person"><span>${esc(c.name)}</span><small>${stepLabel||'Персональный маршрут'}</small><button class="work-client-logout" data-work-client-logout>Выйти</button></div></header>${progress?`<div class="cj-progress"><span style="width:${progress}%"></span></div>`:''}<main class="cj-main">${content}</main><footer class="cj-footer"><span>Ваше пространство</span><p>Здесь показываются только ваши ответы, согласованные итоги встреч и назначенные шаги. Внутренние заметки специалиста недоступны клиенту.</p></footer></div>`;
  wireClientJourney(root,c);root.querySelector('[data-work-client-logout]')?.addEventListener('click',logoutWorkspace);
};

// История клиента показывает именно согласованный итог сессии.
renderClientHistoryView=function(root,c,intake,done,lastS,lastCheck,prep){
  const nav=`<nav class="cj-nav"><button data-cj-view="today">Сейчас</button><button data-cj-view="route">Маршрут</button><button class="active" data-cj-view="history">История</button></nav>`;
  const sessions=clientSessions(c.id).slice(0,8);const qs=questionSets[intake.scenario]||[];const intakeLines=qs.map(q=>`<div class="cj-history-line"><span>${esc(q.title)}</span><strong>${esc(label(intake.scenario,q.key,intake.answers[q.key])||'—')}</strong></div>`).join('');
  renderClientShell(root,c,`${nav}<section class="cj-stage"><div class="cj-kicker">МОИ МАТЕРИАЛЫ</div><h2>Что уже <span>зафиксировано в работе</span></h2><div class="cj-history-grid"><section class="cj-history-card"><header><div><small>Стартовая подготовка</small><strong>${esc(scenarioTitle(intake.scenario))}</strong></div></header><p>${esc(intake.goal||'')}</p><details><summary>Мои ответы</summary>${intakeLines}</details></section><section class="cj-history-card"><header><div><small>Выполненные шаги</small><strong>${done.length}</strong></div></header>${done.length?done.map(a=>`<article class="cj-done-item"><span>✓</span><div><strong>${esc(a.title)}</strong><p>${esc(a.response||'')}</p></div></article>`).join(''):'<p class="muted-copy">Пока нет завершённых шагов.</p>'}</section></div><div class="work-client-session-history">${sessions.length?sessions.map(s=>`<article class="cj-history-card wide"><header><div><small>${shortDate(s.date)}</small><strong>${esc(s.theme||'Итог встречи')}</strong></div></header><p>${esc(s.sharedSummary||s.homework||'Согласованный итог не добавлен.')}</p>${s.nextFocus?`<div class="cj-shared-focus"><small>К чему вернёмся</small><strong>${esc(s.nextFocus)}</strong></div>`:''}</article>`).join(''):'<div class="empty-state"><p>Сохранённых итогов встреч пока нет.</p></div>'}</div><div class="cj-action-row"><button class="quiet-button" data-cj-view="today">← Вернуться</button></div></section>`,{stepLabel:'История работы'});
};

function wireWorkActions(root=document){
  root.querySelectorAll('[data-work-action]').forEach(b=>{
    if(b.dataset.workWired)return;b.dataset.workWired='1';b.addEventListener('click',()=>{
      const a=b.dataset.workAction;if(a==='open-inbox'){ui.view='inbox';renderView();}
      else if(a==='open-client'){const c=clientById(b.dataset.client);if(c){data.activeClientId=c.id;saveData();ui.view='client';ui.clientTab='overview';renderView();}}
      else if(a==='review')markReviewed(b.dataset.type,b.dataset.id);
      else if(a==='access')clientAccessDialog(b.dataset.client);
      else if(a==='start-session')startWorkSession(b.dataset.client);
    });
  });
}

document.getElementById('viewRoot').addEventListener('click',()=>setTimeout(()=>wireWorkActions(document.getElementById('viewRoot')),0));

// В настройках добавляем смену ПИН и сведения о режиме.
const workPrevSettings=renderSettings;
renderSettings=function(root){
  workPrevSettings(root);
  const grid=root.querySelector('.settings-grid');if(grid){const card=document.createElement('section');card.className='settings-card';card.innerHTML=`<h3>Вход специалиста</h3><p>ПИН нужен для разграничения ролей в режиме апробации.</p><label class="work-pin-setting"><span>ПИН</span><input id="workPinInput" value="${esc(data.practiceSettings?.psychPin||'2468')}" maxlength="12"></label><div class="panel-actions"><button class="quiet-button" id="workPinSave">Сохранить ПИН</button></div>`;grid.prepend(card);card.querySelector('#workPinSave').addEventListener('click',()=>{const v=card.querySelector('#workPinInput').value.trim();if(v.length<4){toast('Минимум 4 символа');return;}data.practiceSettings.psychPin=v;saveData();toast('ПИН изменён')});}
  const label=root.querySelector('.page-heading .section-label');if(label)label.textContent='Рабочая версия';
  const desc=root.querySelector('.page-heading p');if(desc)desc.textContent=window.__sharedServerMode?'Данные синхронизируются через локальный сервер апробации.':'Данные сохраняются в этом браузере. Для общей базы запустите комплект через start_server.bat.';
};

// Подсказки психолога оставляем как встроенную методическую библиотеку, но убираем "пилот" из текста.
try{document.querySelector('.privacy-card strong').textContent='Хранение данных';document.querySelector('.privacy-card p').textContent='Режим зависит от способа запуска приложения.';}catch{}

// Обновления из другой вкладки: сохраняем роль текущей вкладки.
window.addEventListener('storage',e=>{if(!window.__TOCHKA_SUPABASE_MODE && e.key===STORAGE&&e.newValue){try{const next=JSON.parse(e.newValue);if(next&&Array.isArray(next.clients)){data=next;normalizeOperationalData(false);renderView();}}catch{}}});

if(!window.__TOCHKA_SUPABASE_MODE) bootWorkspaceAuth(); else document.querySelector('.app-layout')?.classList.add('work-locked');
