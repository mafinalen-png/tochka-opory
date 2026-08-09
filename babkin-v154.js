/* Точка опоры v15.4 — Бабкин-тест
   Цель: психолог сначала понимает рабочий цикл, а не архитектуру приложения.
   Демо можно открыть без регистрации; сохранение в Supabase остаётся за авторизацией. */
(function(){
  'use strict';

  const GROUPS=[
    {id:'now',number:'1',title:'Сейчас с клиентом',hint:'клиент, ответы, встреча',views:['dashboard','clients','inbox','sessions']},
    {id:'next',number:'2',title:'Что делать дальше',hint:'разбор запроса и следующий шаг',views:['assessment','plan']},
    {id:'result',number:'3',title:'Результат и материалы',hint:'изменения, формулировки, настройки',views:['dynamics','templates','settings']}
  ];
  const LABELS={
    dashboard:'Начало',clients:'Клиенты',inbox:'Ответы клиентов',sessions:'Встречи',
    assessment:'Разбор запроса',plan:'Следующие шаги',dynamics:'Изменения',templates:'Готовые формулировки',settings:'Настройки'
  };

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
    nav.innerHTML='';
    nav.classList.add('babkin-progressive-nav');

    GROUPS.forEach(group=>{
      const section=document.createElement('section');
      section.className='babkin-nav-group';
      section.dataset.group=group.id;
      const toggle=document.createElement('button');
      toggle.type='button';toggle.className='babkin-group-toggle';
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
    let activeGroup=null;
    GROUPS.forEach(g=>{if(g.views.includes(view))activeGroup=g.id;});
    if(view==='client')activeGroup='now';
    if(!nav.querySelector('.babkin-nav-group.open')){
      nav.querySelector(`[data-group="${activeGroup||'now'}"]`)?.classList.add('open');
    }else if(activeGroup){
      nav.querySelectorAll('.babkin-nav-group').forEach(x=>x.classList.toggle('open',x.dataset.group===activeGroup));
    }
  }

  function transformGate(){
    const gate=document.getElementById('workLoginGate');
    if(!gate||gate.querySelector('.babkin-preview-intro'))return;
    const shell=gate.querySelector('.work-login-shell');if(!shell)return;
    document.body.classList.remove('babkin-preview-mode');

    const intro=document.createElement('section');
    intro.className='babkin-preview-intro';
    intro.innerHTML=`<span class="work-login-kicker">СНАЧАЛА ПОСМОТРИТЕ</span><h1>Откройте кабинет психолога без регистрации</h1><p>Никакого пароля для знакомства с системой. Откроется демонстрационный кабинет с обезличенными примерами. Можно нажимать, пробовать сценарии и проходить рабочий цикл.</p><div class="babkin-preview-actions"><button class="primary-button" type="button" id="babkinOpenPreview">Открыть демо-кабинет →</button><span class="work-login-help">Демо-изменения остаются только в этом браузере.</span></div>`;
    const brand=shell.querySelector('.work-login-brand');
    if(brand)brand.insertAdjacentElement('afterend',intro);else shell.prepend(intro);
    intro.querySelector('#babkinOpenPreview')?.addEventListener('click',()=>{
      try{enterWorkspace({role:'psychologist',preview:true});document.body.classList.add('babkin-preview-mode');afterRender();}catch(err){console.error('preview mode',err);}
    });

    const grid=shell.querySelector('.work-login-grid');
    const setup=shell.querySelector('.sb-setup-card');
    if(grid){
      grid.classList.add('babkin-login-grid');
      const details=document.createElement('details');details.className='babkin-login-details';
      details.innerHTML='<summary>Войти для сохранения своих клиентов</summary>';
      details.appendChild(grid);intro.insertAdjacentElement('afterend',details);
    }else if(setup){
      setup.classList.add('babkin-setup-secondary');
      const details=document.createElement('details');details.className='babkin-login-details';
      details.innerHTML='<summary>Техническая настройка облачного сохранения</summary>';
      details.appendChild(setup);intro.insertAdjacentElement('afterend',details);
    }
  }

  function ensurePreviewControls(){
    const actions=document.querySelector('.topbar-actions');if(!actions)return;
    const session=typeof getWorkSession==='function'?getWorkSession():null;
    const isPreview=!!session?.preview;
    document.body.classList.toggle('babkin-preview-mode',isPreview);
    actions.querySelector('#babkinDemoBadge')?.remove();
    actions.querySelector('#babkinLoginButton')?.remove();
    if(!isPreview)return;
    const badge=document.createElement('span');badge.id='babkinDemoBadge';badge.className='babkin-demo-badge';badge.textContent='● Демо без регистрации';
    const login=document.createElement('button');login.id='babkinLoginButton';login.type='button';login.className='quiet-button babkin-login-button';login.textContent='Войти для сохранения';
    login.addEventListener('click',()=>{try{logoutWorkspace();}catch(err){console.error(err);}});
    actions.prepend(badge);actions.appendChild(login);
  }

  function simplifiedDashboard(root){
    if(typeof setPage==='function')setPage('Рабочий кабинет','Сегодня в работе');
    const clients=(typeof data!=='undefined'&&Array.isArray(data.clients))?data.clients:[];
    const c=(typeof activeClient==='function'&&activeClient())||clients.find(x=>x.status==='active')||clients[0]||null;
    const inbox=(typeof countInbox==='function')?countInbox():0;
    const request=c?.request?String(c.request):'';
    root.innerHTML=`<div class="babkin-dashboard">
      <section class="babkin-start-card">
        <span class="section-label">РАБОЧИЙ ЦИКЛ</span>
        <h2>Начните с одного клиента. Остальное откроется по ходу работы.</h2>
        <p>Не нужно заранее разбираться в сценариях, динамике и шаблонах. Сначала выберите клиента, проведите встречу и зафиксируйте следующий шаг.</p>
        <div class="babkin-main-action">
          ${c?`<button class="primary-button" data-action="open-client" data-id="${c.id}">Продолжить с ${typeof esc==='function'?esc(c.name):c.name} →</button>`:'<button class="primary-button" data-action="view-clients">Добавить первого клиента →</button>'}
          <button class="quiet-button" data-action="view-clients">Все клиенты</button>
        </div>
      </section>

      <section class="babkin-flow" aria-label="Три шага работы">
        <article class="babkin-flow-step"><small>Шаг 1</small><strong>Клиент</strong><p>Кто перед вами, с чем пришёл и что сейчас важно.</p></article>
        <article class="babkin-flow-step"><small>Шаг 2</small><strong>Встреча</strong><p>Открываете одну рабочую сессию и ведёте её по ситуации.</p></article>
        <article class="babkin-flow-step"><small>Шаг 3</small><strong>Итог</strong><p>Фиксируете договорённость, следующий шаг и то, что проверить.</p></article>
      </section>

      ${c?`<section class="babkin-current-client"><div><span class="section-label">СЕЙЧАС В ФОКУСЕ${inbox?` · ${inbox} НОВЫХ ОТВЕТОВ`:''}</span><h3>${typeof esc==='function'?esc(c.name):c.name}</h3><p>${request?(typeof esc==='function'?esc(request):request):'Откройте карточку клиента и продолжите с текущего этапа.'}</p></div><div class="babkin-current-actions"><button class="primary-button compact" data-action="open-client" data-id="${c.id}">Открыть клиента</button><button class="quiet-button" data-action="add-session" data-client="${c.id}">Новая встреча</button></div></section>`:''}

      <details class="babkin-more"><summary>Дополнительные инструменты — только когда понадобятся</summary><div class="babkin-more-links"><button class="quiet-button" data-babkin-view="assessment">Разбор запроса</button><button class="quiet-button" data-babkin-view="plan">Следующие шаги</button><button class="quiet-button" data-babkin-view="dynamics">Изменения</button><button class="quiet-button" data-babkin-view="templates">Готовые формулировки</button></div></details>
    </div>`;
  }

  /* Переписываем только обзор. Остальные рабочие функции не ломаем. */
  if(typeof renderDashboard==='function')renderDashboard=simplifiedDashboard;

  const priorRender=typeof renderView==='function'?renderView:null;
  if(priorRender){
    renderView=function(){
      const result=priorRender.apply(this,arguments);
      afterRender();
      return result;
    };
  }

  function afterRender(){
    buildProgressiveNav();updateProgressiveNav();ensurePreviewControls();
    const add=document.getElementById('quickAddClient');if(add)add.textContent='Добавить клиента';
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-babkin-view]');if(!b)return;
    const view=b.dataset.babkinView;
    if(typeof setView==='function')setView(view);
  });

  const observer=new MutationObserver(()=>{transformGate();buildProgressiveNav();});
  observer.observe(document.body,{childList:true,subtree:true});
  transformGate();afterRender();
  setTimeout(()=>{transformGate();afterRender();},120);
  setTimeout(()=>{transformGate();afterRender();},700);
})();
