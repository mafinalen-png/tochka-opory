/*
  Точка опоры v15.3 — GitHub Pages + Supabase
  ------------------------------------------------------------
  Роли:
  - психолог: Supabase Auth (email + password), RLS разделяет аккаунты;
  - клиент: персональная ссылка ?client=<secret-token>, регистрации нет.
  Внутренние записи психолога клиентская RPC-функция не возвращает.
*/
(function(){
  'use strict';

  const CFG = window.TOCHKA_SUPABASE || {};
  const configured = /^https:\/\/.+\.supabase\.co\/?$/.test(String(CFG.url||'')) && /^sb_publishable_/.test(String(CFG.publishableKey||''));
  const SB = configured && window.supabase?.createClient
    ? window.supabase.createClient(CFG.url, CFG.publishableKey, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
    : null;
  window.__tochkaSB = SB;
  window.__sharedServerMode = !!SB;

  const TOKEN_STORE='tochka_opory_client_tokens_v153';
  const REMOTE_CACHE=new Map();
  let hydrating=false, syncTimer=null, clientToken='', clientRevision=null, psychPolling=null, clientPolling=null, psychSyncPromise=null;
  const CREATE_LOCK=new Map();

  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
  function tokenMap(){try{return JSON.parse(localStorage.getItem(TOKEN_STORE)||'{}')}catch{return {}}}
  function rememberToken(id,token){const m=tokenMap();m[id]=token;localStorage.setItem(TOKEN_STORE,JSON.stringify(m));}
  function rememberedToken(id){return tokenMap()[id]||''}
  function forgetToken(id){const m=tokenMap();delete m[id];localStorage.setItem(TOKEN_STORE,JSON.stringify(m));}
  function strip(obj, keys=[]){const x={...(obj||{})};keys.forEach(k=>delete x[k]);return x;}
  function onlyClient(arr,id){return (arr||[]).filter(x=>x.clientId===id);}
  function rowForClient(c){return c?.cloudId ? REMOTE_CACHE.get(c.cloudId) : null;}
  function nowIso(){return new Date().toISOString();}

  function emptyData(){return {
    version:1, activeClientId:'', clients:[], sessions:[], goals:[], assessments:[],
    assignments:[],checkins:[],preparations:[],clientIntakes:[],clientDrafts:{},
    activityLog:[],sharedNotes:[],practiceSettings:{practiceName:'Точка опоры'},
    workspaceVersion:15,clientFlowVersion:12,pilotSeeded:true
  }}

  function reviewedMaps(clientId){
    const map={intakes:{},preparations:{},assignments:{},selectedScenario:{}};
    onlyClient(data.clientIntakes,clientId).forEach(x=>{if(x.reviewedAt)map.intakes[x.id]=x.reviewedAt;if(Object.prototype.hasOwnProperty.call(x,'psychSelectedScenario'))map.selectedScenario[x.id]=x.psychSelectedScenario;});
    onlyClient(data.preparations,clientId).forEach(x=>{if(x.reviewedAt)map.preparations[x.id]=x.reviewedAt;});
    onlyClient(data.assignments,clientId).forEach(x=>{if(x.reviewedAt)map.assignments[x.id]=x.reviewedAt;});
    return map;
  }

  function packInternal(c){
    const client=strip(c,['cloudId','accessCode']);
    return {
      client,
      isTest:!!c.isTest,
      sessions:onlyClient(data.sessions,c.id),
      goals:onlyClient(data.goals,c.id),
      assessments:onlyClient(data.assessments,c.id),
      sharedNotes:onlyClient(data.sharedNotes,c.id),
      activityLog:onlyClient(data.activityLog,c.id),
      professional:reviewedMaps(c.id),
      savedAt:nowIso()
    };
  }

  function packShared(c){
    const assignments=onlyClient(data.assignments,c.id).map(a=>({
      id:a.id,title:a.title||'',prompt:a.prompt||'',deadline:a.deadline||'',createdAt:a.createdAt||'',scenario:a.scenario||'',source:a.source||'psychologist'
    }));
    const sessions=onlyClient(data.sessions,c.id).map(s=>({
      id:s.id,date:s.date||'',theme:s.theme||'Итог встречи',sharedSummary:s.sharedSummary||'',homework:s.homework||''
    })).filter(s=>s.sharedSummary||s.homework);
    return {assignments,sessions,clientMeta:{nextSession:c.nextSession||'',nextSessionTime:c.nextSessionTime||''},savedAt:nowIso()};
  }

  function packClientOwned(c){
    const intakes=onlyClient(data.clientIntakes,c.id).map(x=>strip(x,['reviewedAt','psychSelectedScenario']));
    const preparations=onlyClient(data.preparations,c.id).map(x=>strip(x,['reviewedAt']));
    const checkins=onlyClient(data.checkins,c.id);
    const assignmentResponses=onlyClient(data.assignments,c.id).map(a=>({id:a.id,status:a.status||'assigned',response:a.response||'',completedAt:a.completedAt||''}));
    const draft=data.clientDrafts?.[c.id]||null;
    return {intakes,preparations,checkins,assignmentResponses,draft,savedAt:nowIso()};
  }

  function hydratePsychRows(rows){
    const next=emptyData();
    for(const row of rows||[]){
      REMOTE_CACHE.set(row.id,row);
      const internal=row.internal_payload||{}, shared=row.shared_payload||{}, owned=row.client_payload||{};
      const base=internal.client||{};
      const localId=base.id||`client_${row.id}`;
      const c={...base,id:localId,cloudId:row.id,name:base.name||row.display_name||'Клиент',status:row.status||base.status||'active',isTest:!!(internal.isTest||base.isTest),accessCode:''};
      next.clients.push(c);
      const pro=internal.professional||{};
      (owned.intakes||[]).forEach(raw=>{const x={...raw,clientId:localId};if(pro.intakes?.[x.id])x.reviewedAt=pro.intakes[x.id];if(pro.selectedScenario&&Object.prototype.hasOwnProperty.call(pro.selectedScenario,x.id)){x.psychSelectedScenario=pro.selectedScenario[x.id];if(pro.selectedScenario[x.id])x.scenario=pro.selectedScenario[x.id];}next.clientIntakes.push(x);});
      (owned.preparations||[]).forEach(raw=>{const x={...raw,clientId:localId};if(pro.preparations?.[x.id])x.reviewedAt=pro.preparations[x.id];next.preparations.push(x);});
      (owned.checkins||[]).forEach(raw=>next.checkins.push({...raw,clientId:localId}));
      if(owned.draft)next.clientDrafts[localId]=owned.draft;
      const resp=Object.fromEntries((owned.assignmentResponses||[]).map(x=>[x.id,x]));
      (shared.assignments||[]).forEach(core=>{const r=resp[core.id]||{};next.assignments.push({...core,clientId:localId,status:r.status||'assigned',response:r.response||'',completedAt:r.completedAt||'',reviewedAt:pro.assignments?.[core.id]||''});});
      (internal.sessions||[]).forEach(x=>next.sessions.push({...x,clientId:localId}));
      (internal.goals||[]).forEach(x=>next.goals.push({...x,clientId:localId}));
      (internal.assessments||[]).forEach(x=>next.assessments.push({...x,clientId:localId}));
      (internal.sharedNotes||[]).forEach(x=>next.sharedNotes.push({...x,clientId:localId}));
      (internal.activityLog||[]).forEach(x=>next.activityLog.push({...x,clientId:localId}));
    }
    next.activeClientId=next.clients[0]?.id||'';
    return next;
  }

  function hydrateClientWorkspace(ws){
    const next=emptyData();
    const owned=ws.client_payload||{}, shared=ws.shared_payload||{};
    const localId=`client_remote_${ws.id}`;
    const c={id:localId,cloudId:ws.id,name:ws.display_name||'Клиент',status:ws.status||'active',request:'',context:'',formulation:'',resources:'',constraints:'',attention:'',nextSession:shared.clientMeta?.nextSession||'',nextSessionTime:shared.clientMeta?.nextSessionTime||'',createdAt:todayISO(),accessCode:''};
    next.clients=[c];next.activeClientId=localId;
    (owned.intakes||[]).forEach(x=>next.clientIntakes.push({...x,clientId:localId}));
    (owned.preparations||[]).forEach(x=>next.preparations.push({...x,clientId:localId}));
    (owned.checkins||[]).forEach(x=>next.checkins.push({...x,clientId:localId}));
    if(owned.draft)next.clientDrafts[localId]=owned.draft;
    const resp=Object.fromEntries((owned.assignmentResponses||[]).map(x=>[x.id,x]));
    (shared.assignments||[]).forEach(core=>{const r=resp[core.id]||{};next.assignments.push({...core,clientId:localId,status:r.status||'assigned',response:r.response||'',completedAt:r.completedAt||''});});
    (shared.sessions||[]).forEach(s=>next.sessions.push({...s,clientId:localId,notes:'',hypothesis:'',interventions:'',nextFocus:'',stateBefore:0,stateAfter:0,duration:0,format:''}));
    next.workspaceVersion=15;next.clientFlowVersion=12;return next;
  }

  async function ensureRemoteClient(c){
    if(c.cloudId)return c.cloudId;
    if(CREATE_LOCK.has(c.id))return CREATE_LOCK.get(c.id);
    const job=(async()=>{
      const {data:res,error}=await SB.rpc('psych_create_client',{p_display_name:c.name||'Клиент'});
      if(error)throw error;
      const item=Array.isArray(res)?res[0]:res;
      if(!item?.client_id)throw new Error('Supabase не вернул id клиента');
      c.cloudId=item.client_id;
      if(item.client_token)rememberToken(c.cloudId,item.client_token);
      return c.cloudId;
    })();
    CREATE_LOCK.set(c.id,job);
    try{return await job}finally{CREATE_LOCK.delete(c.id)}
  }

  async function syncPsychData(){
    if(!SB||hydrating||getWorkSession()?.role!=='psychologist')return;
    if(psychSyncPromise)return psychSyncPromise;
    clearTimeout(syncTimer);
    psychSyncPromise=(async()=>{
      const session=(await SB.auth.getSession()).data.session;if(!session)return;
      const clients=[...(data.clients||[])];
      for(const c of clients){
        try{
          const id=await ensureRemoteClient(c);
          const payload={display_name:c.name||'Клиент',status:c.status||'active',internal_payload:packInternal(c),shared_payload:packShared(c)};
          const {error}=await SB.from('tochka_workspaces').update(payload).eq('id',id);
          if(error)throw error;
        }catch(err){console.error('syncPsychData',err);showCloudState('Ошибка синхронизации: '+friendly(err));}
      }
      showCloudState('Supabase · данные синхронизированы');
    })();
    try{return await psychSyncPromise}finally{psychSyncPromise=null}
  }

  async function saveClientRemote(){
    if(!SB||hydrating||getWorkSession()?.role!=='client'||!clientToken)return;
    const c=activeClient();if(!c)return;
    try{
      const payload=packClientOwned(c);
      const {data:res,error}=await SB.rpc('client_save_workspace',{p_token:clientToken,p_client_payload:payload,p_expected_revision:clientRevision});
      if(error){
        if(/изменились|revision|repeat/i.test(error.message||'')){await loadClientByToken(clientToken,true);toast('Данные обновились. Повторите действие ещё раз.');return;}
        throw error;
      }
      clientRevision=res?.revision??clientRevision;showCloudState('Supabase · сохранено');
    }catch(err){console.error('saveClientRemote',err);showCloudState('Не удалось сохранить: '+friendly(err));}
  }

  const priorSave=saveData;
  saveData=function(){
    priorSave();
    if(hydrating||!SB)return;
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{getWorkSession()?.role==='client'?saveClientRemote():syncPsychData();},350);
  };

  function friendly(err){return String(err?.message||err||'неизвестная ошибка').replace('Invalid login credentials','Неверный e-mail или пароль').replace('Email not confirmed','Сначала подтвердите e-mail');}
  function showCloudState(text){const el=document.getElementById('workConnectionState');if(el)el.textContent=text;const mode=document.querySelector('.mode-badge');if(mode)mode.textContent=SB?'Supabase · онлайн':'Не настроено';}

  function authGate(){
    const gate=document.getElementById('workLoginGate');if(!gate)return;
    gate.classList.remove('hidden');document.querySelector('.app-layout')?.classList.add('work-locked');
    gate.innerHTML=`<div class="work-login-shell sb-auth-shell">
      <div class="work-login-brand"><span class="work-login-mark">◎</span><div><strong>Точка опоры</strong><small>рабочее пространство психолога и клиента</small></div></div>
      ${!configured?`<section class="sb-setup-card"><span class="work-login-kicker">НУЖНА ОДНА НАСТРОЙКА</span><h1>Вставьте Publishable key</h1><p>Project URL уже записан. Откройте файл <b>supabase-config.js</b> и замените текст <code>ВСТАВЬТЕ_СЮДА...</code> на скопированный ключ <b>sb_publishable_…</b>.</p><div class="sb-config-preview">${esc(CFG.url||'Project URL не найден')}</div><p class="work-login-help">Secret key / service_role сюда не вставлять.</p></section>`:`<div class="work-login-grid">
        <section class="work-login-card primary-card"><span class="work-login-kicker">СПЕЦИАЛИСТ</span><h1>Кабинет психолога</h1><p>Каждый психолог входит под своим e-mail. Его клиенты отделены правилами доступа Supabase.</p>
          <form id="sbPsychLogin"><label><span>E-mail</span><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label><label><span>Пароль</span><input name="password" type="password" autocomplete="current-password" minlength="6" required></label><button class="primary-button" type="submit">Войти →</button></form>
          <button class="text-button sb-register-toggle" id="sbShowRegister">Первый вход? Создать кабинет психолога</button><small class="work-login-help" id="sbAuthMessage">Клиенту регистрация не нужна — он входит только по персональной ссылке.</small>
        </section>
        <section class="work-login-card"><span class="work-login-kicker">ТЕСТИРОВАНИЕ</span><h2>Вы можете быть и психологом, и клиентом</h2><p>Войдите как психолог → создайте клиента с пометкой 🧪 → нажмите «Открыть как клиент». Для максимально честного теста откройте ссылку в режиме инкогнито или на телефоне.</p><div class="sb-test-mini"><b>Психолог</b><span>обычное окно Chrome</span><b>Клиент</b><span>инкогнито / другой браузер</span></div></section>
      </div>`}
      <div class="work-login-foot"><span id="workConnectionState">${configured?'Supabase · готов к входу':'Подключение не настроено'}</span><p>Для апробации используйте обезличенные данные. Клиент не получает внутренние гипотезы и профессиональные заметки психолога.</p></div>
    </div>`;
    if(!configured)return;
    gate.querySelector('#sbPsychLogin')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);await loginPsych(String(fd.get('email')||'').trim(),String(fd.get('password')||''));});
    gate.querySelector('#sbShowRegister')?.addEventListener('click',()=>showRegister(gate));
  }

  function showRegister(gate){
    const card=gate.querySelector('.primary-card');if(!card)return;
    card.innerHTML=`<span class="work-login-kicker">ПЕРВЫЙ ВХОД</span><h1>Создать кабинет психолога</h1><p>Введите e-mail и пароль. Если Supabase попросит подтвердить e-mail, откройте письмо и затем вернитесь на эту страницу.</p><form id="sbPsychRegister"><label><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label><label><span>Пароль</span><input name="password" type="password" minlength="6" required autocomplete="new-password"></label><button class="primary-button" type="submit">Создать кабинет →</button></form><button class="text-button" id="sbBackLogin">← Уже есть кабинет</button><small class="work-login-help" id="sbAuthMessage">Если после подтверждения письма браузер откроет localhost или пустую страницу — просто вернитесь сюда и войдите.</small>`;
    card.querySelector('#sbBackLogin').addEventListener('click',authGate);
    card.querySelector('#sbPsychRegister').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||'');const msg=card.querySelector('#sbAuthMessage');msg.textContent='Создаём кабинет…';const redirect=location.href.split('?')[0].split('#')[0];const {data:res,error}=await SB.auth.signUp({email,password,options:{emailRedirectTo:redirect}});if(error){msg.textContent=friendly(error);return;}if(res?.session){msg.textContent='Кабинет создан. Загружаем…';await loadPsychData();enterWorkspace({role:'psychologist'});startPsychPolling();}else msg.textContent='Готово. Проверьте почту и подтвердите e-mail, затем вернитесь сюда и нажмите «Войти».';});
  }

  async function loginPsych(email,password){
    const msg=document.getElementById('sbAuthMessage');if(msg)msg.textContent='Входим…';
    const {error}=await SB.auth.signInWithPassword({email,password});
    if(error){if(msg)msg.textContent=friendly(error);return;}
    if(msg)msg.textContent='Загружаем кабинет…';await loadPsychData();enterWorkspace({role:'psychologist'});startPsychPolling();
  }

  async function loadPsychData(silent=false){
    if(!SB)return;
    const {data:rows,error}=await SB.from('tochka_workspaces').select('*').order('created_at',{ascending:true});if(error)throw error;
    hydrating=true;data=hydratePsychRows(rows||[]);normalizePilotData();normalizeOperationalData(false);hydrating=false;
    if(!silent){ui.view=data.clients.length?'dashboard':'clients';renderView();}
    showCloudState('Supabase · '+(rows?.length||0)+' клиентов');
  }

  async function loadClientByToken(token,reRender=false){
    const {data:ws,error}=await SB.rpc('client_get_workspace',{p_token:token});if(error)throw error;
    hydrating=true;data=hydrateClientWorkspace(ws);clientRevision=ws.revision??0;normalizePilotData();normalizeOperationalData(false);hydrating=false;
    if(reRender){ui.view='clientPortal';renderView();}
    showCloudState('Supabase · пространство клиента');
  }

  async function boot(){
    setWorkSession(null);clientToken=(new URL(location.href)).searchParams.get('client')||'';
    if(!configured){authGate();return;}
    try{
      if(clientToken){await loadClientByToken(clientToken);enterWorkspace({role:'client',clientId:data.activeClientId});startClientPolling();return;}
      const {data:s}=await SB.auth.getSession();if(s?.session){await loadPsychData();enterWorkspace({role:'psychologist'});startPsychPolling();return;}
      authGate();
    }catch(err){console.error(err);authGate();const m=document.getElementById('sbAuthMessage');if(m)m.textContent='Ошибка подключения: '+friendly(err);}
  }

  // Hosted logout: client logout does not destroy a psychologist session in another tab.
  const localLogout=logoutWorkspace;
  logoutWorkspace=async function(){
    const role=getWorkSession()?.role;setWorkSession(null);clearInterval(psychPolling);clearInterval(clientPolling);
    if(role==='psychologist'&&SB)try{await SB.auth.signOut()}catch{}
    document.body.classList.remove('work-client-role','work-psych-role','client-mode');authGate();
  };

  async function ensureClientToken(c,rotate=false){
    await syncPsychData();
    if(!c.cloudId)await ensureRemoteClient(c);
    let token=!rotate?rememberedToken(c.cloudId):'';
    if(!token){const {data:t,error}=await SB.rpc('psych_rotate_client_link',{p_client_id:c.cloudId});if(error)throw error;token=t;rememberToken(c.cloudId,token);}
    return token;
  }
  function clientUrl(token){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('client',token);return u.toString();}
  async function copyText(v){try{await navigator.clipboard.writeText(v);toast('Ссылка скопирована')}catch{prompt('Скопируйте ссылку:',v)}}

  // Персональная ссылка вместо старого локального кода.
  clientAccessDialog=async function(clientId){
    const c=clientById(clientId);if(!c)return;
    try{
      toast('Готовим защищённую ссылку…');const token=await ensureClientToken(c,false),link=clientUrl(token);
      let modal=document.getElementById('accessModal');if(!modal){modal=document.createElement('div');modal.id='accessModal';modal.className='modal';modal.setAttribute('aria-hidden','true');modal.innerHTML='<div class="modal-backdrop" data-sb-close></div><section class="modal-dialog medium"><button class="modal-close" data-sb-close>×</button><span class="section-label">Доступ клиента</span><h2 id="accessModalName"></h2><div id="accessModalBody"></div></section>';document.body.appendChild(modal);modal.querySelectorAll('[data-sb-close]').forEach(b=>b.addEventListener('click',()=>closeModal('#accessModal')));}
      document.getElementById('accessModalName').textContent=c.name;
      document.getElementById('accessModalBody').innerHTML=`${c.isTest?'<div class="sb-test-badge">🧪 ТЕСТОВЫЙ КЛИЕНТ</div>':''}<label class="work-link-field"><span>Персональная ссылка</span><input readonly value="${esc(link)}"></label><div class="panel-actions"><button class="primary-button" data-sb-copy>Скопировать ссылку</button><button class="quiet-button" data-sb-open>Открыть как клиент ↗</button></div><button class="text-button" data-sb-rotate>Создать новую ссылку и отключить старую</button><p class="work-access-note"><b>Для собственного теста:</b> психолога держите в обычном окне, а эту ссылку откройте в инкогнито, Edge/Firefox или на телефоне. Так вы увидите продукт именно глазами клиента.</p>`;
      const body=document.getElementById('accessModalBody');body.querySelector('[data-sb-copy]').onclick=()=>copyText(link);body.querySelector('[data-sb-open]').onclick=()=>window.open(link,'_blank','noopener');body.querySelector('[data-sb-rotate]').onclick=async()=>{forgetToken(c.cloudId);closeModal('#accessModal');await clientAccessDialog(c.id)};openModal('#accessModal');
    }catch(err){toast('Не удалось создать ссылку: '+friendly(err));}
  };

  const TEST_PRESETS={
    busy_mom:{name:'ТЕСТ · Замороченная мама',request:'Всё держится на мне, я устала и стала срываться на близких.',context:'Двое детей, много бытовых обязанностей, мало времени на себя.'},
    breakup:{name:'ТЕСТ · После расставания',request:'Меня бросили. Не могу отпустить отношения и постоянно возвращаюсь к этому.',context:'Проверяем эмоционально нагруженный клиентский вход.'},
    unclear:{name:'ТЕСТ · Мне просто плохо',request:'Не могу выделить одну проблему. Всё раздражает, ничего не хочется.',context:'Проверяем неопределённый запрос и возможность выбрать «не знаю».'},
    youth:{name:'ТЕСТ · Молодой человек 23',request:'Учёба не складывается, работы нет, не понимаю, кем хочу быть.',context:'Проверяем учёбу, профессию, сравнение с другими и низкую определённость.'},
    svo_family:{name:'ТЕСТ · Семья после СВО',request:'После возвращения близкого человека дома всё стало иначе и напряжённее.',context:'Не требовать описания боевых событий; проверять актуальную семейную ситуацию.'},
    svo_person:{name:'ТЕСТ · После возвращения',request:'Трудно привыкнуть к обычной жизни, раздражаюсь, плохо сплю.',context:'Травма-информированный вход без автоматического диагноза.'},
    special_child:{name:'ТЕСТ · Мама особого ребёнка',request:'Вся жизнь вокруг ребёнка и специалистов, сил почти нет.',context:'Проверяем хроническую нагрузку, вину и семейную систему.'},
    disability:{name:'ТЕСТ · Человек с инвалидностью',request:'Хочу проверить, не сводит ли система любой мой запрос к инвалидности.',context:'Инвалидность — контекст, а не автоматически психологическая проблема.'}
  };

  function ensureTestModal(){
    if(document.getElementById('sbTestModal'))return;
    const m=document.createElement('div');m.id='sbTestModal';m.className='modal';m.setAttribute('aria-hidden','true');m.innerHTML=`<div class="modal-backdrop" data-test-close></div><section class="modal-dialog large"><button class="modal-close" data-test-close>×</button><span class="section-label">ЛАБОРАТОРИЯ АПРОБАЦИИ</span><h2>Создать тестового клиента</h2><p>Выберите персонажа или создайте своего. Тестовые карточки помечаются и не смешиваются визуально с обычными.</p><div class="sb-preset-grid">${Object.entries(TEST_PRESETS).map(([k,p])=>`<button data-test-preset="${k}"><strong>${p.name.replace('ТЕСТ · ','')}</strong><small>${p.request}</small></button>`).join('')}</div><div class="sb-test-custom"><input id="sbTestName" placeholder="Свой тестовый персонаж"><button class="quiet-button" id="sbCreateCustomTest">Создать своего</button></div></section>`;document.body.appendChild(m);m.querySelectorAll('[data-test-close]').forEach(b=>b.onclick=()=>closeModal('#sbTestModal'));m.querySelectorAll('[data-test-preset]').forEach(b=>b.onclick=()=>createTestClient(b.dataset.testPreset));m.querySelector('#sbCreateCustomTest').onclick=()=>createTestClient('',m.querySelector('#sbTestName').value.trim());
  }
  async function createTestClient(presetKey,customName=''){
    const p=TEST_PRESETS[presetKey]||{name:'ТЕСТ · '+(customName||'Новый персонаж'),request:'',context:''};
    const c={id:uid('client'),name:p.name,age:'',contact:'',status:'active',request:p.request,context:p.context,formulation:'',resources:'',constraints:'',attention:'',nextSession:'',nextSessionTime:'',createdAt:todayISO(),isTest:true};
    data.clients.unshift(c);data.activeClientId=c.id;saveData();closeModal('#sbTestModal');ui.view='client';ui.clientTab='overview';renderView();toast('Тестовый клиент создан');await syncPsychData();
  }

  function injectTestLab(root){
    if(getWorkSession()?.role!=='psychologist'||root.querySelector('.sb-test-lab'))return;
    const sec=document.createElement('section');sec.className='panel sb-test-lab';sec.innerHTML=`<div class="panel-head"><div><span class="section-label">🧪 ЛАБОРАТОРИЯ АПРОБАЦИИ</span><h2>Проверить продукт в обеих ролях</h2><p>Создайте тестового персонажа → откройте его ссылку как клиент → пройдите путь → вернитесь в кабинет психолога и проверьте, что пришло.</p></div><button class="primary-button" data-open-test-lab>＋ Тестовый клиент</button></div><div class="sb-test-flow"><span><b>1</b> Вы — психолог</span><i>→</i><span><b>2</b> Открываете ссылку клиента</span><i>→</i><span><b>3</b> Отвечаете как клиент</span><i>→</i><span><b>4</b> Проверяете входящее</span></div>`;
    root.prepend(sec);sec.querySelector('[data-open-test-lab]').onclick=()=>{ensureTestModal();openModal('#sbTestModal')};
  }

  const prevDashboard=renderDashboard;
  renderDashboard=function(root){prevDashboard(root);injectTestLab(root)};
  const prevClients=renderClients;
  renderClients=function(root){prevClients(root);root.querySelectorAll('.client-card').forEach(card=>{const c=clientById(card.dataset.id);if(c?.isTest){card.classList.add('sb-test-client');const h=card.querySelector('h3');if(h&&!h.querySelector('.sb-inline-test'))h.insertAdjacentHTML('beforeend',' <span class="sb-inline-test">🧪</span>')}})};
  const prevClient=renderClient;
  renderClient=function(root){prevClient(root);const c=activeClient();if(!c||getWorkSession()?.role!=='psychologist')return;const header=root.querySelector('.dossier-header');if(!header)return;const bar=document.createElement('div');bar.className='sb-client-access-bar';bar.innerHTML=`<div><span class="${c.isTest?'sb-test-badge':'sb-live-badge'}">${c.isTest?'🧪 ТЕСТОВЫЙ КЛИЕНТ':'КЛИЕНТСКОЕ ПРОСТРАНСТВО'}</span><small>${c.isTest?'Можно сбрасывать и проходить заново':'Персональная ссылка без регистрации клиента'}</small></div><div><button class="quiet-button" data-sb-card-link>Ссылка клиента</button><button class="primary-button" data-sb-card-open>Открыть как клиент ↗</button>${c.isTest?'<button class="quiet-button danger-soft" data-sb-reset-test>Сбросить тест</button>':''}</div>`;header.after(bar);bar.querySelector('[data-sb-card-link]').onclick=()=>clientAccessDialog(c.id);bar.querySelector('[data-sb-card-open]').onclick=async()=>{const t=await ensureClientToken(c);window.open(clientUrl(t),'_blank','noopener')};bar.querySelector('[data-sb-reset-test]')?.addEventListener('click',()=>resetTestClient(c));};

  async function resetTestClient(c){
    if(!c?.isTest)return;if(!confirm('Сбросить прохождение этого тестового клиента? Карточка останется, ответы, сессии и задания будут очищены.'))return;
    const id=c.id;
    ['sessions','goals','assessments','assignments','checkins','preparations','clientIntakes','sharedNotes','activityLog'].forEach(k=>{if(Array.isArray(data[k]))data[k]=data[k].filter(x=>x.clientId!==id)});if(data.clientDrafts)delete data.clientDrafts[id];c.formulation='';c.resources='';c.constraints='';c.attention='';saveData();
    if(c.cloudId){const {error}=await SB.from('tochka_workspaces').update({client_payload:{},shared_payload:{assignments:[],sessions:[],clientMeta:{nextSession:c.nextSession||'',nextSessionTime:c.nextSessionTime||''}},internal_payload:packInternal(c)}).eq('id',c.cloudId);if(error)console.error(error);}
    ui.view='client';ui.clientTab='overview';renderView();toast('Тестовый клиент сброшен');
  }

  // Помечаем новых обычных клиентов удалённой карточкой автоматически через saveData.
  const prevOpenClientForm=openClientForm;
  openClientForm=function(id=null){prevOpenClientForm(id);const modal=document.getElementById('clientModal');if(modal&&!modal.querySelector('.sb-normal-note')){const note=document.createElement('p');note.className='sb-normal-note';note.textContent='Для тестовых персонажей используйте «Лабораторию апробации». Эта форма создаёт обычного клиента.';modal.querySelector('form')?.prepend(note);}};

  // Облачный статус в верхней панели.
  const prevChrome=updateWorkChrome;
  updateWorkChrome=function(){prevChrome();const mode=document.querySelector('.mode-badge');if(mode)mode.textContent=SB?'Supabase · онлайн':'Supabase · не настроено';};

  function idleForRefresh(){return !document.querySelector('.modal.open')&&!workSessionDraft&&!document.activeElement?.matches?.('input,textarea,select');}
  function startPsychPolling(){clearInterval(psychPolling);psychPolling=setInterval(async()=>{if(document.hidden||!idleForRefresh()||getWorkSession()?.role!=='psychologist')return;try{await syncPsychData();const active=data.activeClientId,view=ui.view,tab=ui.clientTab;await loadPsychData(true);if(data.clients.some(c=>c.id===active))data.activeClientId=active;ui.view=view;ui.clientTab=tab;renderView();}catch(e){console.warn(e)}},15000);}
  function startClientPolling(){clearInterval(clientPolling);clientPolling=setInterval(async()=>{if(document.hidden||!idleForRefresh()||getWorkSession()?.role!=='client')return;try{await loadClientByToken(clientToken,true)}catch(e){console.warn(e)}},20000);}

  // Expose tiny QA hooks for automated/local tests.
  window.__TOCHKA_CLOUD_TEST__={configured,packClientOwned,packInternal,packShared,hydratePsychRows,hydrateClientWorkspace};

  boot();
})();
