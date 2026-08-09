/* Точка опоры v16.1 — Бабкин-тест + встроенный ассистент психолога.
   ВАЖНО: ассистент встроен прямо в существующий dashboard.
   Здесь нет MutationObserver, динамической загрузки модулей и каскадных renderView. */
(function(){
  'use strict';

  const GROUPS=[
    {id:'now',number:'1',title:'Ассистент и клиенты',hint:'что важно сейчас',views:['dashboard','clients','inbox','sessions']},
    {id:'next',number:'2',title:'Что делать дальше',hint:'разбор и следующий шаг',views:['assessment','plan']},
    {id:'result',number:'3',title:'Результат и материалы',hint:'изменения и записи',views:['dynamics','templates','settings']}
  ];
  const LABELS={
    dashboard:'Ассистент',clients:'Клиенты',inbox:'Ответы клиентов',sessions:'Встречи',
    assessment:'Разбор запроса',plan:'Следующие шаги',dynamics:'Изменения',templates:'Формулировки',settings:'Настройки'
  };

  const ASSIST_RULES=[
    [/расстав|бывш|разрыв отнош/i,'breakup_recovery','Есть тема расставания или незавершённости отношений.'],
    [/одинок|трудно сбли|нет близк/i,'loneliness_connection','Есть тема одиночества или трудности сближаться.'],
    [/увол|сокращ|без работ|потер.{0,10}работ/i,'job_loss_recovery','Есть потеря работы или риск увольнения.'],
    [/началь|руководител|коллег|конфликт.{0,15}работ/i,'workplace_conflict','Есть рабочий конфликт или напряжение с руководителем/коллегами.'],
    [/паник|приступ.{0,10}тревог|сердцеби|не хватает воздуха/i,'strong_anxiety_episode','Есть эпизоды резкой тревоги или телесного напряжения.'],
    [/тревог|неопредел|переживаю постоянно/i,'anxiety_uncertainty','Заметна тревога или неопределённость.'],
    [/перегруз|истощ|выгор|нет сил|вымот|все на мне|всё на мне/i,'overload_stress','Есть перегрузка, истощение или избыток ответственности.'],
    [/ухаж|забот.{0,12}близк|болеет.{0,12}(мама|папа|муж|жена|близк)/i,'caregiver_overload','Есть длительная нагрузка, связанная с заботой о близком.'],
    [/самокрит|ругаю себя|ничего не умею|ненавижу себя/i,'self_criticism','Есть выраженная самокритика или обесценивание себя.'],
    [/боюсь оцен|что обо мне подума|страх оцен|стыдно показ/i,'fear_evaluation','Есть страх чужой оценки или проявления себя.'],
    [/границ|не могу отказ|трудно сказать нет/i,'relationship_boundaries','Есть трудность с отказом или личными границами.'],
    [/ссор|ругаемся|конфликт.{0,12}(муж|жен|партнер|партнёр)/i,'couple_conflict','Есть повторяющийся конфликт в близких отношениях.'],
    [/смерт|умер|горе|утрат|похорон/i,'grief_loss','Есть утрата или процесс горевания.'],
    [/переезд|эмигра|миграц|новая стран|новом месте/i,'relocation_adaptation','Есть адаптация после переезда или смены среды.'],
    [/подрост/i,'parent_teen_conflict','Есть напряжение в отношениях с подростком.'],
    [/особ.{0,8}ребен|особ.{0,8}ребён|реабилитац.{0,10}ребен|реабилитац.{0,10}ребён/i,'special_child_parent','Есть хроническая родительская нагрузка вокруг особых потребностей ребёнка.'],
    [/прокраст|откладыва|не могу начать/i,'procrastination_avoidance','Есть повторяющееся откладывание важных действий.'],
    [/телефон|соцсет|залипа|скрол|интернет.{0,10}(меш|съед)/i,'digital_overuse','Есть цифровой автоматизм, который мешает другим задачам.'],
    [/не понимаю.{0,15}(что|с чего)|все навал|всё навал|просто плохо|не могу сформулиров/i,'unclear_request','Запрос пока трудно сформулировать — нужен первичный маршрут прояснения.']
  ];
  const SAFETY_RULES=[
    /не хочу жить|не хочется жить|суицид|поконч.{0,10}с собой|навредить себе|убить себя/i,
    /угрожает|преследует|избивает|бьет меня|бьёт меня|насили|боюсь его|боюсь её|боюсь ее/i,
    /убить (его|ее|её|их)|навредить (ему|ей|им)/i,
    /передоз|острая интоксикац/i
  ];

  function E(v=''){return typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function relabelButton(btn,view){
    if(!btn)return;
    const spans=btn.querySelectorAll('span');
    if(spans.length>1)spans[1].textContent=LABELS[view]||spans[1].textContent;
    else if(view==='settings')btn.innerHTML='<span>⚙</span><span>Настройки</span>';
  }

  function buildProgressiveNav(){
    const nav=document.querySelector('.main-nav');
    if(!nav||nav.classList.contains('babkin-progressive-nav'))return;
    const map=new Map();
    nav.querySelectorAll('button[data-view]').forEach(btn=>map.set(btn.dataset.view,btn));
    const settings=document.querySelector('.settings-link[data-view="settings"]');
    if(settings)map.set('settings',settings);
    nav.innerHTML='';nav.classList.add('babkin-progressive-nav');
    GROUPS.forEach(group=>{
      const section=document.createElement('section');section.className='babkin-nav-group';section.dataset.group=group.id;
      const toggle=document.createElement('button');toggle.type='button';toggle.className='babkin-group-toggle';
      toggle.innerHTML=`<span class="babkin-group-number">${group.number}</span><span class="babkin-group-copy"><strong>${group.title}</strong><small>${group.hint}</small></span><span class="babkin-group-chevron">›</span>`;
      const body=document.createElement('div');body.className='babkin-group-body';
      group.views.forEach(view=>{const btn=map.get(view);if(btn){relabelButton(btn,view);body.appendChild(btn);}});
      toggle.addEventListener('click',()=>{
        const wasOpen=section.classList.contains('open');
        nav.querySelectorAll('.babkin-nav-group').forEach(x=>x.classList.remove('open'));
        if(!wasOpen)section.classList.add('open');
      });
      section.append(toggle,body);nav.appendChild(section);
    });
    updateProgressiveNav();
  }

  function updateProgressiveNav(){
    const nav=document.querySelector('.main-nav.babkin-progressive-nav');if(!nav)return;
    const view=(typeof ui!=='undefined'&&ui?.view)||'dashboard';
    let activeGroup=null;GROUPS.forEach(g=>{if(g.views.includes(view))activeGroup=g.id;});if(view==='client')activeGroup='now';
    if(!nav.querySelector('.babkin-nav-group.open'))nav.querySelector(`[data-group="${activeGroup||'now'}"]`)?.classList.add('open');
    else if(activeGroup)nav.querySelectorAll('.babkin-nav-group').forEach(x=>x.classList.toggle('open',x.dataset.group===activeGroup));
  }

  function transformGate(){
    const gate=document.getElementById('workLoginGate');
    if(!gate||gate.querySelector('.babkin-preview-intro'))return;
    const shell=gate.querySelector('.work-login-shell.sb-auth-shell');if(!shell)return;
    document.body.classList.remove('babkin-preview-mode');
    const intro=document.createElement('section');intro.className='babkin-preview-intro';
    intro.innerHTML=`<span class="work-login-kicker">СНАЧАЛА ПОСМОТРИТЕ</span><h1>Откройте кабинет психолога без регистрации</h1><p>Никакого пароля для знакомства с системой. Откроется демонстрационный кабинет с обезличенными примерами.</p><div class="babkin-preview-actions"><button class="primary-button" type="button" id="babkinOpenPreview">Открыть демо-кабинет →</button><span class="work-login-help">Демо-изменения остаются только в этом браузере.</span></div>`;
    const brand=shell.querySelector('.work-login-brand');if(brand)brand.insertAdjacentElement('afterend',intro);else shell.prepend(intro);
    intro.querySelector('#babkinOpenPreview')?.addEventListener('click',()=>{try{enterWorkspace({role:'psychologist',preview:true});document.body.classList.add('babkin-preview-mode');afterRender();}catch(err){console.error(err);}});
    const grid=shell.querySelector('.work-login-grid'),setup=shell.querySelector('.sb-setup-card');
    if(grid){grid.classList.add('babkin-login-grid');const d=document.createElement('details');d.className='babkin-login-details';d.innerHTML='<summary>Войти для сохранения своих клиентов</summary>';d.appendChild(grid);intro.insertAdjacentElement('afterend',d);}
    else if(setup){setup.classList.add('babkin-setup-secondary');const d=document.createElement('details');d.className='babkin-login-details';d.innerHTML='<summary>Техническая настройка облачного сохранения</summary>';d.appendChild(setup);intro.insertAdjacentElement('afterend',d);}
  }

  function ensurePreviewControls(){
    const actions=document.querySelector('.topbar-actions');if(!actions)return;
    const session=typeof getWorkSession==='function'?getWorkSession():null;const isPreview=!!session?.preview;
    document.body.classList.toggle('babkin-preview-mode',isPreview);
    actions.querySelector('#babkinDemoBadge')?.remove();actions.querySelector('#babkinLoginButton')?.remove();if(!isPreview)return;
    const badge=document.createElement('span');badge.id='babkinDemoBadge';badge.className='babkin-demo-badge';badge.textContent='● Демо';
    const login=document.createElement('button');login.id='babkinLoginButton';login.type='button';login.className='quiet-button babkin-login-button';login.textContent='Войти для сохранения';login.addEventListener('click',()=>{try{logoutWorkspace();}catch(err){console.error(err);}});
    actions.prepend(badge);actions.appendChild(login);
  }

  function clientSessionsSafe(id){return (typeof data!=='undefined'&&Array.isArray(data.sessions)?data.sessions:[]).filter(x=>x.clientId===id).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));}
  function clientGoalsSafe(id){return (typeof data!=='undefined'&&Array.isArray(data.goals)?data.goals:[]).filter(x=>x.clientId===id&&x.status!=='done');}
  function contextOf(c){if(!c)return'';const last=clientSessionsSafe(c.id)[0]||{};return [c.request,c.context,c.formulation,c.attention,last.theme,last.notes,last.hypothesis,last.nextFocus].filter(Boolean).join(' ');}
  function hasSafety(text){return SAFETY_RULES.some(rx=>rx.test(String(text||'')));}
  function recommend(text){
    const t=String(text||'');const out=[];
    ASSIST_RULES.forEach(([rx,id,reason])=>{if(rx.test(t)&&typeof scenarios!=='undefined'&&scenarios[id]&&!out.some(x=>x.id===id))out.push({id,title:scenarios[id].title,reason});});
    const fallback=['unclear_request','anxiety_uncertainty','overload_stress','couple_conflict','relationship_boundaries','hire'];
    fallback.forEach(id=>{if(out.length<3&&typeof scenarios!=='undefined'&&scenarios[id]&&!out.some(x=>x.id===id))out.push({id,title:scenarios[id].title,reason:id==='unclear_request'?'Подходит как универсальный старт, если запрос пока неясен.':'Альтернативное направление, которое можно проверить вопросами.'});});
    return out.slice(0,3);
  }
  function questionsFor(items){
    const out=[];items.forEach(item=>{try{const g=typeof SCENARIO_GUIDE!=='undefined'?SCENARIO_GUIDE[item.id]:null;(g?.opening||[]).forEach(q=>{if(q&&!out.includes(q))out.push(q);});}catch(e){}});
    if(!out.length)out.push('Что сейчас мешает клиенту сильнее всего в обычной жизни?','Что изменилось по сравнению с периодом, когда было легче?','Какого первого небольшого изменения клиент ждёт от работы?');
    return out.slice(0,3);
  }
  function nextAction(c,inbox){
    if(!c)return{title:'Добавьте первого клиента',text:'Или сразу разберите короткую ситуацию ниже — карточку можно создать позже.',button:'<button class="primary-button" data-action="view-clients">Добавить клиента →</button>'};
    if(inbox>0)return{title:`Посмотрите новые ответы (${inbox})`,text:'Сначала прочитайте, что клиент сообщил между встречами.',button:'<button class="primary-button" data-babkin-view="inbox">Открыть ответы →</button>'};
    const last=clientSessionsSafe(c.id)[0]||null;
    if(!last)return{title:'Подготовьте первую встречу',text:'Ниже уже предложены несколько направлений для проверки.',button:`<button class="primary-button" data-action="add-session" data-client="${E(c.id)}">Начать встречу →</button>`};
    if(!last.homework||!last.nextFocus)return{title:'Завершите итог прошлой встречи',text:'Не хватает договорённости с клиентом или следующего фокуса.',button:`<button class="primary-button" data-action="edit-session" data-id="${E(last.id)}">Дозаполнить →</button>`};
    let step='';clientGoalsSafe(c.id).some(g=>{const s=(g.steps||[]).find(x=>!x.done);if(s){step=s.text;return true;}return false;});
    if(step)return{title:'Проверьте договорённый шаг',text:step,button:'<button class="primary-button" data-babkin-view="plan">Открыть план →</button>'};
    return{title:'Подготовьте следующую встречу',text:last.nextFocus||'Уточните, что изменилось после предыдущей встречи.',button:`<button class="primary-button" data-action="open-client" data-id="${E(c.id)}">Открыть клиента →</button>`};
  }
  function routeHtml(items,c){return items.map((x,i)=>`<article class="babkin-assist-route"><span>${i+1}</span><div><strong>${E(x.title)}</strong><p>${E(x.reason)}</p></div>${c?`<button class="quiet-button" data-action="start-assessment" data-client="${E(c.id)}" data-scenario="${E(x.id)}">Проверить</button>`:''}</article>`).join('');}

  function bindAssistant(root,c){
    const ta=root.querySelector('#babkinCaseText'),btn=root.querySelector('#babkinAnalyzeCase'),clear=root.querySelector('#babkinClearCase'),res=root.querySelector('#babkinCaseResult');
    if(btn&&ta&&res)btn.onclick=()=>{
      const text=ta.value.trim();if(!text){res.innerHTML='<p class="babkin-assist-note">Напишите 1–2 предложения о ситуации.</p>';return;}
      const items=recommend(text),qs=questionsFor(items),danger=hasSafety(text);
      res.innerHTML=`${danger?'<div class="babkin-assist-safety"><strong>Сначала проверьте безопасность</strong><p>В тексте есть формулировка, которую нельзя обрабатывать как обычный сценарий без отдельной оценки риска.</p></div>':''}<div class="babkin-assist-routes">${routeHtml(items,c)}</div><div class="babkin-assist-questions"><strong>Что уточнить</strong>${qs.map(q=>`<p>• ${E(q)}</p>`).join('')}</div>`;
    };
    if(clear&&ta&&res)clear.onclick=()=>{ta.value='';res.innerHTML='';ta.focus();};
  }

  function assistantDashboard(root){
    if(typeof setPage==='function')setPage('Ассистент психолога','Сегодня в работе');
    const clients=(typeof data!=='undefined'&&Array.isArray(data.clients))?data.clients:[];
    const c=(typeof activeClient==='function'&&activeClient())||clients.find(x=>x.status==='active')||clients[0]||null;
    const inbox=(typeof countInbox==='function')?countInbox():0;
    const context=contextOf(c),items=recommend(context),qs=questionsFor(items),action=nextAction(c,inbox),danger=hasSafety(context),last=c?clientSessionsSafe(c.id)[0]:null;

    root.innerHTML=`<div class="babkin-dashboard babkin-assistant-dashboard">
      <section class="babkin-assistant-hero">
        <div><span class="section-label">АССИСТЕНТ ПСИХОЛОГА</span><h2>Что сейчас требует внимания?</h2><p>Не ищите нужный раздел. Ассистент собирает рабочий контекст и показывает ближайшее действие. Профессиональное решение остаётся за психологом.</p></div>
      </section>

      ${danger?'<section class="babkin-assist-safety"><strong>Сначала проверьте безопасность</strong><p>В записях есть формулировка, которую важно отдельно оценить до выбора обычного рабочего сценария.</p></section>':''}

      <section class="babkin-assistant-grid">
        <article class="babkin-assistant-card babkin-assistant-next"><span class="section-label">СЛЕДУЮЩЕЕ ДЕЙСТВИЕ</span><h3>${E(action.title)}</h3><p>${E(action.text)}</p><div>${action.button}</div></article>
        <article class="babkin-assistant-card"><span class="section-label">${c?'СЕЙЧАС В ФОКУСЕ':'НАЧАЛО РАБОТЫ'}</span><h3>${c?E(c.name):'Клиент пока не выбран'}</h3><p>${c&&c.request?E(c.request):'Можно добавить клиента или сначала быстро разобрать ситуацию ниже.'}</p>${c?`<div class="babkin-assistant-actions"><button class="quiet-button" data-action="open-client" data-id="${E(c.id)}">Карточка клиента</button><button class="quiet-button" data-action="view-clients">Сменить</button></div>`:''}</article>
      </section>

      ${c?`<section class="babkin-assistant-card babkin-assistant-routes-card"><div class="babkin-assistant-heading"><div><span class="section-label">РАБОЧИЕ ГИПОТЕЗЫ</span><h3>Что стоит проверить</h3><p>Не диагноз и не готовый ответ — 2–3 направления для уточнения в разговоре.</p></div><button class="quiet-button" data-babkin-view="assessment">Все сценарии</button></div><div class="babkin-assist-routes">${routeHtml(items,c)}</div><div class="babkin-assist-questions"><strong>На встрече полезно спросить</strong>${qs.map(q=>`<p>• ${E(q)}</p>`).join('')}</div></section>`:''}

      ${c?`<section class="babkin-assistant-card babkin-assistant-after"><span class="section-label">ПОСЛЕ ВСТРЕЧИ</span><h3>${last?'Что осталось зафиксировать':'После первой встречи'}</h3><p>${last?(last.homework?`Договорённость: ${E(last.homework)}`:'Договорённость с клиентом пока не зафиксирована.'):'Зафиксируйте тему, наблюдения, рабочую гипотезу и один следующий шаг.'}</p><p>${last&&last.nextFocus?`Следующий фокус: ${E(last.nextFocus)}`:'Следующий фокус пока не указан.'}</p></section>`:''}

      <section class="babkin-assistant-card babkin-case-analyzer">
        <span class="section-label">БЫСТРЫЙ РАЗБОР</span><h3>Опишите ситуацию своими словами</h3><p>Напишите 1–2 предложения. Анализ выполняется локально по библиотеке сценариев и не является диагнозом.</p>
        <textarea id="babkinCaseText" placeholder="Например: после разговора с начальником клиент замыкается и несколько дней прокручивает конфликт."></textarea>
        <div class="babkin-assistant-actions"><button class="primary-button" id="babkinAnalyzeCase">Предложить, что проверить →</button><button class="quiet-button" id="babkinClearCase">Очистить</button></div>
        <div id="babkinCaseResult"></div>
      </section>

      <details class="babkin-more"><summary>Все инструменты</summary><div class="babkin-more-links"><button class="quiet-button" data-action="view-clients">Клиенты</button><button class="quiet-button" data-babkin-view="sessions">Встречи</button><button class="quiet-button" data-babkin-view="assessment">Сценарии</button><button class="quiet-button" data-babkin-view="plan">Следующие шаги</button><button class="quiet-button" data-babkin-view="dynamics">Изменения</button></div></details>
    </div>`;
    bindAssistant(root,c);
  }

  if(typeof renderDashboard==='function')renderDashboard=assistantDashboard;

  const priorRender=typeof renderView==='function'?renderView:null;
  if(priorRender){renderView=function(){const result=priorRender.apply(this,arguments);afterRender();return result;};}

  function afterRender(){buildProgressiveNav();updateProgressiveNav();ensurePreviewControls();const add=document.getElementById('quickAddClient');if(add)add.textContent='Добавить клиента';}

  document.addEventListener('click',e=>{const b=e.target.closest('[data-babkin-view]');if(!b)return;const view=b.dataset.babkinView;if(typeof setView==='function')setView(view);});

  /* Без MutationObserver: только несколько безопасных запусков после старта. */
  transformGate();afterRender();
  setTimeout(()=>{transformGate();afterRender();},150);
  setTimeout(()=>{transformGate();afterRender();},900);
})();
