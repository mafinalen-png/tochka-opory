/* Точка опоры v15.8 — кабинет как ассистент психолога.
   Ассистент не ставит диагноз и не принимает решение за специалиста.
   Он собирает рабочий контекст, подсвечивает незавершённое и подбирает 2–3 маршрута из локальной библиотеки. */
(function(){
  'use strict';
  if(typeof scenarios==='undefined'||typeof data==='undefined')return;

  const STOP=new Set('и в во на с со к ко от до по за из у о об про для что это как не но а я мы вы он она они его ее их уже еще или если то же бы был была были есть нет тут там сейчас очень просто мне меня мой моя клиент клиента клиенту человек человека хочет хочу трудно стало может можно нужно после перед при между через без где когда который которая которые такой такая'.split(' '));
  const RULES=[
    [/расстав|бывш|разрыв отнош/i,'breakup_recovery'],[/одинок|нет близк|трудно сбли/i,'loneliness_connection'],
    [/увол|сокращ|потер.{0,10}работ|без работ/i,'job_loss_recovery'],[/началь|руководител|коллег|конфликт.{0,15}работ/i,'workplace_conflict'],
    [/приступ.{0,10}тревог|паник|сердцеби|не хватает воздуха|боюсь потерять контроль/i,'strong_anxiety_episode'],
    [/ухаж|забот.{0,15}близк|болеет.{0,10}(мама|папа|муж|жена|близк)|все на мне/i,'caregiver_overload'],
    [/самокрит|ругаю себя|ненавижу себя|ничего не умею/i,'self_criticism'],[/что обо мне подума|боюсь оцен|страх оцен|стыдно показ|боюсь показаться/i,'fear_evaluation'],
    [/смерт|умер|умерла|горе|утрат|похорон/i,'grief_loss'],[/переезд|эмигра|миграц|новая стран|новом месте/i,'relocation_adaptation'],
    [/подрост/i,'parent_teen_conflict'],[/особ.{0,8}ребен|особ.{0,8}ребён|реабилитац.{0,10}ребен|диагноз.{0,10}ребен/i,'special_child_parent'],
    [/прокраст|откладыва|не могу начать/i,'procrastination_avoidance'],[/телефон|соцсет|залипа|скрол|интернет.{0,10}(меш|съед)/i,'digital_overuse'],
    [/не понимаю.{0,15}(что|с чего)|все навал|всё навал|просто плохо|не могу сформулиров/i,'unclear_request'],
    [/тревог|неопределенн|неопределённ|переживаю постоянно/i,'anxiety_uncertainty'],[/перегруз|истощ|выгор|нет сил|вымот/i,'overload_stress'],
    [/ссор|конфликт.{0,10}(муж|жен|партнер|партнёр)|ругаемся/i,'couple_conflict'],[/границ|не могу отказ|трудно сказать нет/i,'relationship_boundaries']
  ];
  const SAFETY=[
    {rx:/не хочу жить|не хочется жить|поконч.{0,10}с собой|суицид|убить себя|навредить себе/i,text:'Есть формулировка, которую важно отдельно уточнить на предмет риска для себя.'},
    {rx:/угрожает|преследует|избивает|бьет меня|бьёт меня|насили|боюсь его|боюсь ее|боюсь её/i,text:'Есть формулировка о возможной угрозе или насилии — сначала нужна оценка безопасности.'},
    {rx:/убить (его|ее|её|их)|навредить (ему|ей|им)|угроза другим/i,text:'Есть формулировка, которую важно отдельно уточнить на предмет риска для других.'},
    {rx:/передоз|острая интоксикац|не помню.{0,20}(пил|пила|употреб)/i,text:'Есть формулировка об интоксикации или потере контроля — обычный сценарий может быть не первым шагом.'}
  ];
  const escA=(v='')=>typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>String(v||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();
  const stem=w=>{
    let x=clean(w);if(x.length<5)return x;
    return x.replace(/(иями|ями|ами|ого|ему|ому|ыми|ими|ее|ие|ые|ое|ей|ий|ый|ой|ем|им|ым|ом|их|ых|ую|юю|ая|яя|ою|ею|ам|ям|ах|ях|ов|ев|ами|ями|ать|ять|ить|еть|уть|ться|ется|ются|ого|ому|а|я|ы|и|ь|й|у|ю|е|о)$/,'');
  };
  const toks=text=>clean(text).split(' ').map(stem).filter(x=>x.length>2&&!STOP.has(x));
  const truncate=(v,n=210)=>{const s=String(v||'').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s};
  const day=v=>v?String(v).slice(0,10):'';
  const today=()=>typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);

  function scenarioText(id,s){
    const g=typeof SCENARIO_GUIDE!=='undefined'?SCENARIO_GUIDE[id]:null;
    return [s?.title,s?.short,s?.text,g?.when,...(g?.opening||[])].filter(Boolean).join(' ');
  }
  function matchReasons(text,id){
    const q=[...new Set(toks(text))],doc=[...new Set(toks(scenarioText(id,scenarios[id])))];
    const hits=[];q.forEach(a=>{if(doc.some(b=>a===b||(a.length>4&&b.length>4&&(a.startsWith(b)||b.startsWith(a)))))hits.push(a)});
    return [...new Set(hits)].slice(0,3);
  }
  function suggest(text,limit=3){
    const q=toks(text),qset=new Set(q),out=[];
    Object.entries(scenarios).forEach(([id,s])=>{
      const doc=toks(scenarioText(id,s));let score=0;
      doc.forEach(d=>{if(qset.has(d))score+=4;else if(d.length>4&&q.some(x=>x.length>4&&(x.startsWith(d)||d.startsWith(x))))score+=1.7});
      RULES.forEach(([rx,target])=>{if(target===id&&rx.test(String(text||'')))score+=13});
      const previous=(data.assessments||[]).some(a=>a.clientId===data.activeClientId&&a.scenario===id);if(previous)score+=.4;
      if(score>0)out.push({id,s,score,reasons:matchReasons(text,id)});
    });
    out.sort((a,b)=>b.score-a.score);
    if(!out.length&&scenarios.unclear_request)out.push({id:'unclear_request',s:scenarios.unclear_request,score:1,reasons:[]});
    const seen=new Set();return out.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,limit);
  }
  function safety(text){return SAFETY.filter(x=>x.rx.test(String(text||''))).map(x=>x.text)}
  function sessionsFor(id){return (data.sessions||[]).filter(x=>x.clientId===id).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))}
  function goalsFor(id){return (data.goals||[]).filter(x=>x.clientId===id&&x.status!=='done')}
  function clientContext(c){
    if(!c)return'';const ss=sessionsFor(c.id),last=ss[0];
    let intake=null,prep=null;try{intake=typeof latestClientIntake==='function'?latestClientIntake(c.id):null}catch{}try{prep=typeof clientPreparations==='function'?clientPreparations(c.id)?.[0]:null}catch{}
    return [c.request,c.context,c.formulation,c.attention,last?.theme,last?.notes,last?.hypothesis,last?.nextFocus,intake?.goal,intake?.concern,prep?.focus,prep?.changed,prep?.stuck].filter(Boolean).join(' ');
  }
  function routeReason(item){
    if(item.reasons?.length)return `Совпадают темы: ${item.reasons.join(', ')}.`;
    const g=typeof SCENARIO_GUIDE!=='undefined'?SCENARIO_GUIDE[item.id]:null;
    return g?.when?truncate(g.when,125):'Подходит как стартовая рабочая гипотеза для уточнения.';
  }
  function routeCards(items,c,compact=false){
    if(!items.length)return '<div class="pa-empty">Пока мало данных для подбора. Можно начать с универсального разбора запроса.</div>';
    return items.map((x,i)=>`<article class="pa-route ${i===0?'recommended':''}"><div class="pa-route-num">${i+1}</div><div class="pa-route-copy"><strong>${escA(x.s.title)}</strong><p>${escA(routeReason(x))}</p>${!compact&&typeof SCENARIO_GUIDE!=='undefined'&&SCENARIO_GUIDE[x.id]?.aim?`<details><summary>Зачем рассматривать</summary><p>${escA(SCENARIO_GUIDE[x.id].aim)}</p></details>`:''}</div>${c?`<button class="quiet-button" data-action="start-assessment" data-client="${escA(c.id)}" data-scenario="${escA(x.id)}">Разобрать →</button>`:''}</article>`).join('');
  }
  function questionsFor(items){
    const qs=[];items.forEach(x=>{const g=typeof SCENARIO_GUIDE!=='undefined'?SCENARIO_GUIDE[x.id]:null;(g?.opening||[]).forEach(q=>{if(q&&!qs.includes(q))qs.push(q)})});
    return qs.slice(0,3);
  }
  function lastSessionGaps(c){
    const s=sessionsFor(c.id)[0];if(!s)return ['После первой встречи зафиксировать тему, рабочий фокус и следующий шаг.'];
    const gaps=[];if(!s.notes)gaps.push('ключевые наблюдения');if(!s.hypothesis)gaps.push('рабочая гипотеза');if(!s.homework)gaps.push('договорённость с клиентом');if(!s.nextFocus)gaps.push('что проверить на следующей встрече');
    return gaps.length?[`В последнем протоколе не заполнено: ${gaps.join(', ')}.`]:['Последний протокол завершён: есть наблюдения, гипотеза, договорённость и следующий фокус.'];
  }
  function currentStep(c){
    const goals=goalsFor(c.id);for(const g of goals){const st=(g.steps||[]).find(x=>!x.done);if(st)return st.text}return'';
  }
  function nextAction(c){
    if(!c)return{title:'Добавить первого клиента',text:'Чтобы ассистент мог собирать контекст, нужна хотя бы одна карточка клиента.',html:'<button class="primary-button" data-action="add-client">Добавить клиента →</button>'};
    const inbox=typeof countInbox==='function'?countInbox():0;if(inbox>0)return{title:`Разобрать новые ответы (${inbox})`,text:'Сначала посмотрите, что клиент сообщил между встречами.',html:'<button class="primary-button" data-babkin-view="inbox">Открыть входящие →</button>'};
    const ss=sessionsFor(c.id),last=ss[0],t=today();
    if(c.nextSession&&day(c.nextSession)<=t)return{title:c.nextSession===t?'Сегодня встреча':'Встреча требует уточнения',text:c.nextSession===t?'Подготовьте фокус встречи и вопросы, которые важно проверить.':'Указанная дата встречи уже прошла. Уточните статус или создайте новую встречу.',html:`<button class="primary-button" data-action="add-session" data-client="${escA(c.id)}">Открыть встречу →</button>`};
    if(!last)return{title:'Подготовить первую встречу',text:'Запрос уже есть. Ассистент предложил ниже несколько рабочих маршрутов для проверки.',html:`<button class="primary-button" data-action="add-session" data-client="${escA(c.id)}">Начать первую встречу →</button>`};
    if(!last.homework||!last.nextFocus)return{title:'Дозаполнить итог последней встречи',text:'В протоколе не хватает договорённости или следующего фокуса.',html:`<button class="primary-button" data-action="edit-session" data-id="${escA(last.id)}">Завершить протокол →</button>`};
    const step=currentStep(c);if(step)return{title:'Проверить договорённый шаг',text:step,html:'<button class="primary-button" data-babkin-view="plan">Открыть следующий шаг →</button>'};
    return{title:'Подготовить следующую встречу',text:last.nextFocus||'Откройте клиента и уточните, что изменилось после прошлой встречи.',html:`<button class="primary-button" data-action="open-client" data-id="${escA(c.id)}">Продолжить с клиентом →</button>`};
  }
  function queueItems(){
    const t=today(),rows=[];
    (data.clients||[]).filter(c=>c.status==='active').forEach(c=>{
      if(c.nextSession&&day(c.nextSession)<=t)rows.push({rank:c.nextSession===t?10:9,c,text:c.nextSession===t?'Встреча сегодня':'Дата встречи прошла — уточнить статус'});
      const overdue=goalsFor(c.id).find(g=>g.deadline&&g.deadline<t);if(overdue)rows.push({rank:8,c,text:`Просрочен шаг: ${truncate(overdue.title,80)}`});
      if(!sessionsFor(c.id).length)rows.push({rank:5,c,text:'Ещё не зафиксирована первая встреча'});
      if(!String(c.request||'').trim())rows.push({rank:4,c,text:'Не сформулирован первичный запрос'});
    });
    const seen=new Set();return rows.sort((a,b)=>b.rank-a.rank).filter(x=>{if(seen.has(x.c.id))return false;seen.add(x.c.id);return true}).slice(0,5);
  }
  function patchNav(){
    const g=document.querySelector('.babkin-nav-group[data-group="now"]');if(g){const strong=g.querySelector('.babkin-group-copy strong'),small=g.querySelector('.babkin-group-copy small');if(strong)strong.textContent='Ассистент и клиенты';if(small)small.textContent='что делать сейчас';}
    document.querySelectorAll('.main-nav [data-view="dashboard"] span').forEach((s,i)=>{if(i===1)s.textContent='Ассистент'});
  }

  function renderAssistantDashboard(root){
    if(typeof setPage==='function')setPage('Ассистент психолога','Что требует внимания сейчас');
    const clients=(data.clients||[]),c=(typeof activeClient==='function'?activeClient():null)||clients.find(x=>x.status==='active')||clients[0]||null;
    if(c&&data.activeClientId!==c.id)data.activeClientId=c.id;
    const ctx=clientContext(c),routes=c?suggest(ctx,3):[],flags=c?safety(ctx):[],qs=questionsFor(routes),action=nextAction(c),last=c?sessionsFor(c.id)[0]:null,step=c?currentStep(c):'',queue=queueItems();
    const request=c?truncate(c.request||'Запрос пока не сформулирован.',260):'';
    root.innerHTML=`<div class="pa-dashboard">
      <section class="pa-hero">
        <div class="pa-hero-copy"><span class="section-label">АССИСТЕНТ ПСИХОЛОГА</span><h2>Что сейчас требует вашего решения?</h2><p>Ассистент собирает рабочий контекст и предлагает опоры. Вы проверяете их в разговоре и сами принимаете профессиональное решение.</p></div>
        <div class="pa-public-chip" id="paPublicCount" hidden></div>
      </section>

      ${flags.length?`<section class="pa-safety"><strong>Сначала уточните безопасность</strong>${flags.map(x=>`<p>${escA(x)}</p>`).join('')}<small>Это не автоматический вывод о риске, а причина не пропустить отдельную профессиональную оценку.</small></section>`:''}

      <section class="pa-now-grid">
        <article class="pa-next"><span class="section-label">СЛЕДУЮЩЕЕ ДЕЙСТВИЕ</span><h3>${escA(action.title)}</h3><p>${escA(action.text)}</p><div>${action.html}</div></article>
        <article class="pa-focus"><div class="pa-card-head"><div><span class="section-label">В ФОКУСЕ</span><h3>${c?escA(c.name):'Клиент не выбран'}</h3></div>${c?'<button class="quiet-button" data-action="view-clients">Сменить</button>':''}</div>${c?`<blockquote>${escA(request)}</blockquote><div class="pa-facts"><span>${last?`Последняя встреча: ${escA(typeof fmtDate==='function'?fmtDate(last.date,false):last.date)}`:'Встреч ещё нет'}</span>${step?`<span>Текущий шаг: ${escA(truncate(step,95))}</span>`:''}</div>`:'<p>Добавьте клиента или разберите новое публичное обращение.</p><div class="pa-actions"><button class="primary-button" data-action="add-client">Добавить клиента</button><button class="quiet-button" data-babkin-view="inbox">Открыть входящие</button></div>'}</article>
      </section>

      ${c?`<section class="pa-brief">
        <div class="pa-section-head"><div><span class="section-label">РАБОЧИЙ БРИФ</span><h3>Что стоит рассмотреть по этому запросу</h3><p>Это не диагноз и не «правильный ответ». Ассистент показывает несколько наиболее похожих маршрутов из методической библиотеки.</p></div><button class="quiet-button" data-action="open-client" data-id="${escA(c.id)}">Карточка клиента →</button></div>
        <div class="pa-routes">${routeCards(routes,c)}</div>
        ${qs.length?`<div class="pa-questions"><strong>На встрече полезно уточнить</strong>${qs.map((q,i)=>`<div><span>${i+1}</span><p>${escA(q)}</p></div>`).join('')}</div>`:''}
        <div class="pa-after"><strong>Контроль после встречи</strong>${lastSessionGaps(c).map(x=>`<p>${escA(x)}</p>`).join('')}</div>
      </section>`:''}

      <section class="pa-query">
        <div><span class="section-label">РАЗОБРАТЬ СИТУАЦИЮ</span><h3>Напишите ассистенту 1–2 предложения</h3><p>Например: «После разговора с начальником клиент замыкается и потом несколько дней прокручивает конфликт». Поиск работает по вашей локальной библиотеке сценариев.</p></div>
        <label><span>Что вы хотите разобрать?</span><textarea id="paAssistantQuery" rows="3" placeholder="Опишите ситуацию обычными словами…"></textarea></label>
        <div class="pa-query-actions"><button class="primary-button" type="button" id="paAnalyze">Подобрать рабочие опоры →</button><button class="quiet-button" type="button" id="paClear">Очистить</button></div>
        <div id="paQueryResults" class="pa-query-results" aria-live="polite"></div>
      </section>

      ${queue.length?`<details class="pa-queue"><summary><span><strong>Ещё требует внимания</strong><small>${queue.length} ${queue.length===1?'клиент':'клиента'}</small></span><i>＋</i></summary><div>${queue.map(x=>`<button data-action="open-client" data-id="${escA(x.c.id)}"><strong>${escA(x.c.name)}</strong><span>${escA(x.text)}</span><i>→</i></button>`).join('')}</div></details>`:''}

      <details class="pa-tools"><summary>Все разделы и инструменты</summary><div><button class="quiet-button" data-babkin-view="inbox">Входящие</button><button class="quiet-button" data-babkin-view="assessment">Все сценарии</button><button class="quiet-button" data-babkin-view="plan">Следующие шаги</button><button class="quiet-button" data-babkin-view="dynamics">Динамика</button><button class="quiet-button" data-babkin-view="templates">Формулировки</button></div></details>
    </div>`;

    const analyze=()=>{const input=root.querySelector('#paAssistantQuery'),res=root.querySelector('#paQueryResults');if(!input||!res)return;const text=input.value.trim();if(!text){res.innerHTML='<p class="pa-query-hint">Напишите хотя бы несколько слов о ситуации.</p>';return}const found=suggest(text,3),warn=safety(text);res.innerHTML=`${warn.length?`<div class="pa-mini-safety"><strong>Перед выбором маршрута</strong>${warn.map(x=>`<p>${escA(x)}</p>`).join('')}</div>`:''}<div class="pa-query-routes">${routeCards(found,c,true)}</div>`};
    root.querySelector('#paAnalyze')?.addEventListener('click',analyze);root.querySelector('#paClear')?.addEventListener('click',()=>{const input=root.querySelector('#paAssistantQuery'),res=root.querySelector('#paQueryResults');if(input)input.value='';if(res)res.innerHTML='';});
    root.querySelector('#paAssistantQuery')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')analyze()});
    loadPublicCount(root);
    patchNav();
  }

  async function loadPublicCount(root){
    const chip=root?.querySelector('#paPublicCount');if(!chip)return;
    try{
      const sb=window.__tochkaSB;if(!sb||typeof getWorkSession!=='function'||getWorkSession()?.role!=='psychologist')return;
      const {count,error}=await sb.from('tochka_public_inquiries').select('id',{count:'exact',head:true}).eq('status','new');if(error||!count)return;
      chip.hidden=false;chip.innerHTML=`<span>${count}</span><div><strong>${count===1?'Новое обращение':'Новых обращений'}</strong><button data-babkin-view="inbox">Разобрать →</button></div>`;
    }catch{}
  }

  function clientAssistant(c){
    const ctx=clientContext(c),routes=suggest(ctx,3),flags=safety(ctx),qs=questionsFor(routes),last=sessionsFor(c.id)[0],step=currentStep(c);
    const sec=document.createElement('section');sec.className='pa-client-assistant';sec.dataset.paClient=c.id;
    sec.innerHTML=`<div class="pa-client-head"><div><span class="section-label">АССИСТЕНТ ПО КЛИЕНТУ</span><h2>Что держать в фокусе сейчас</h2><p>Короткая рабочая подсказка поверх карточки. Методические детали можно открыть только при необходимости.</p></div><span class="pa-assistant-mark">A</span></div>
      ${flags.length?`<div class="pa-safety pa-client-safety"><strong>Сначала уточните безопасность</strong>${flags.map(x=>`<p>${escA(x)}</p>`).join('')}</div>`:''}
      <div class="pa-client-grid">
        <div class="pa-client-col"><small>Сейчас известно</small><strong>${escA(truncate(c.request||last?.theme||'Запрос ещё не сформулирован',180))}</strong>${last?.nextFocus?`<p>Следующий фокус: ${escA(truncate(last.nextFocus,150))}</p>`:''}${step?`<p>Договорённый шаг: ${escA(truncate(step,150))}</p>`:''}</div>
        <div class="pa-client-col"><small>Уточнить на встрече</small>${qs.length?qs.slice(0,2).map(q=>`<p>• ${escA(q)}</p>`).join(''):'<p>• Что стало труднее всего и какого первого изменения клиент ждёт?</p>'}</div>
        <div class="pa-client-col"><small>После встречи</small>${lastSessionGaps(c).map(x=>`<p>${escA(x)}</p>`).join('')}</div>
      </div>
      <details class="pa-client-routes"><summary>Какие маршруты ассистент предлагает проверить?</summary><div>${routeCards(routes,c,true)}</div></details>`;
    return sec;
  }
  function injectClientAssistant(root){
    if(!root)return;const c=typeof activeClient==='function'?activeClient():null;if(!c)return;
    root.querySelectorAll('.pa-client-assistant').forEach(x=>x.remove());const header=root.querySelector('.dossier-header');if(!header)return;header.insertAdjacentElement('afterend',clientAssistant(c));
  }

  if(typeof renderDashboard==='function')renderDashboard=renderAssistantDashboard;
  if(typeof renderClient==='function'){
    const prev=renderClient;renderClient=function(root){const r=prev.apply(this,arguments);injectClientAssistant(root);return r};
  }
  const observer=new MutationObserver(()=>patchNav());observer.observe(document.body,{childList:true,subtree:true});
  patchNav();
  if(typeof ui!=='undefined'&&ui?.view==='dashboard'&&typeof renderView==='function')setTimeout(()=>renderView(),0);
})();
