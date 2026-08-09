/* Точка опоры v15.5 — доступность + последовательная карточка клиента */
(function(){
  'use strict';

  const PREF_THEME='tochka_theme_v155';
  const PREF_SIZE='tochka_text_size_v155';
  const sizes=['normal','large','xlarge'];
  const sizeLabels={normal:'Обычный',large:'Крупный',xlarge:'Очень крупный'};

  function escSafe(v=''){
    if(typeof esc==='function') return esc(v);
    return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function readPref(key,fallback){
    try{return localStorage.getItem(key)||fallback}catch{return fallback}
  }
  function savePref(key,value){try{localStorage.setItem(key,value)}catch{}}

  function currentTheme(){return document.documentElement.dataset.theme||readPref(PREF_THEME,'dark')}
  function currentSize(){return document.documentElement.dataset.textSize||readPref(PREF_SIZE,'normal')}

  function applyTheme(theme,announce=false){
    const value=theme==='light'?'light':'dark';
    document.documentElement.dataset.theme=value;
    document.documentElement.style.colorScheme=value;
    savePref(PREF_THEME,value);
    const label=document.getElementById('a11yThemeValue');if(label)label.textContent=value==='light'?'Светлая':'Тёмная';
    const icon=document.getElementById('a11yThemeIcon');if(icon)icon.textContent=value==='light'?'☀':'☾';
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===value));
    if(announce)announceA11y(`Тема: ${value==='light'?'светлая':'тёмная'}`);
  }

  function applySize(size,announce=false){
    const value=sizes.includes(size)?size:'normal';
    document.documentElement.dataset.textSize=value;
    savePref(PREF_SIZE,value);
    const label=document.getElementById('a11ySizeValue');if(label)label.textContent=sizeLabels[value];
    document.querySelectorAll('[data-size-choice]').forEach(b=>b.classList.toggle('active',b.dataset.sizeChoice===value));
    if(announce)announceA11y(`Размер текста: ${sizeLabels[value]}`);
  }

  function announceA11y(text){
    let live=document.getElementById('a11yLive');
    if(!live){live=document.createElement('span');live.id='a11yLive';live.className='a11y-sr-only';live.setAttribute('aria-live','polite');document.body.appendChild(live);}
    live.textContent='';setTimeout(()=>live.textContent=text,30);
  }

  function ensureA11yControls(){
    if(document.getElementById('a11yViewControl'))return;
    const wrap=document.createElement('div');
    wrap.id='a11yViewControl';wrap.className='a11y-view-control';
    wrap.innerHTML=`
      <button type="button" class="a11y-view-toggle" id="a11yViewToggle" aria-expanded="false" aria-controls="a11yViewPanel"><span class="a11y-aa">Aa</span><span>Вид</span></button>
      <section class="a11y-view-panel" id="a11yViewPanel" aria-label="Настройки отображения" hidden>
        <div class="a11y-panel-head"><strong>Как вам удобнее?</strong><button type="button" id="a11yViewClose" aria-label="Закрыть">×</button></div>
        <div class="a11y-setting-row"><div><small>Тема</small><strong id="a11yThemeValue">Тёмная</strong></div><div class="a11y-segment"><button type="button" data-theme-choice="light" title="Светлая тема">☀ Светлая</button><button type="button" data-theme-choice="dark" title="Тёмная тема">☾ Тёмная</button></div></div>
        <div class="a11y-setting-row a11y-size-row"><div><small>Размер текста</small><strong id="a11ySizeValue">Обычный</strong></div><div class="a11y-segment three"><button type="button" data-size-choice="normal">A</button><button type="button" data-size-choice="large">A+</button><button type="button" data-size-choice="xlarge">A++</button></div></div>
        <p class="a11y-hint">Крупный режим увеличивает не только текст, но и кнопки, поля и расстояния между элементами.</p>
      </section>`;
    document.body.appendChild(wrap);
    const toggle=wrap.querySelector('#a11yViewToggle'),panel=wrap.querySelector('#a11yViewPanel');
    const setOpen=open=>{panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));wrap.classList.toggle('open',open)};
    toggle.addEventListener('click',()=>setOpen(panel.hidden));
    wrap.querySelector('#a11yViewClose').addEventListener('click',()=>setOpen(false));
    wrap.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeChoice,true)));
    wrap.querySelectorAll('[data-size-choice]').forEach(b=>b.addEventListener('click',()=>applySize(b.dataset.sizeChoice,true)));
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))setOpen(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
    applyTheme(currentTheme());applySize(currentSize());
  }

  function fmt(v){return v?escSafe(v):'Не заполнено'}
  function safeToday(){return typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10)}

  function makeClientJourney(c,sessions,goals){
    const latest=sessions?.[0]||null;
    const intake=(typeof latestClientIntake==='function')?latestClientIntake(c.id):null;
    const preparations=(typeof clientPreparations==='function')?clientPreparations(c.id):[];
    const prep=preparations?.[0]||null;
    const openGoals=(goals||[]).filter(g=>g.status!=='done');
    const goal=openGoals[0]||null;
    const openStep=goal?.steps?.find(s=>!s.done)||null;
    const hasSession=!!latest;
    const today=safeToday();
    const sessionToday=latest?.date===today;
    const openStage=!hasSession?'before':(sessionToday?'during':'after');

    const journey=document.createElement('section');journey.className='client-journey';
    journey.innerHTML=`
      <div class="client-journey-intro"><span class="section-label">РАБОТА С КЛИЕНТОМ</span><h2>Один клиент — три понятных этапа</h2><p>Открывайте только тот этап, на котором вы сейчас. Остальные записи никуда не исчезают.</p></div>
      <div class="client-stage-list">
        <details class="client-stage" data-stage="before" ${openStage==='before'?'open':''}>
          <summary><span class="client-stage-number">1</span><span><strong>До встречи</strong><small>Понять, с чем человек пришёл и что важно не пропустить</small></span><span class="client-stage-arrow">›</span></summary>
          <div class="client-stage-body">
            <div class="client-stage-primary"><small>С чем пришёл</small><p>${fmt(c.request)}</p></div>
            ${prep?`<div class="client-stage-note"><small>Что клиент сообщил перед встречей</small><p>${fmt(prep.focus||prep.changed||prep.stuck)}</p></div>`:''}
            ${intake?`<div class="client-stage-note"><small>Первичная подготовка получена</small><p>${fmt(intake.goal||intake.concern||'Ответы клиента сохранены в карточке.')}</p></div>`:''}
            <div class="client-stage-actions"><button class="primary-button" data-action="start-assessment" data-client="${escSafe(c.id)}">Разобрать запрос →</button><button class="quiet-button" data-action="edit-client" data-id="${escSafe(c.id)}">Уточнить карточку</button></div>
          </div>
        </details>
        <details class="client-stage" data-stage="during" ${openStage==='during'?'open':''}>
          <summary><span class="client-stage-number">2</span><span><strong>На встрече</strong><small>Зафиксировать тему, наблюдения и рабочую гипотезу</small></span><span class="client-stage-arrow">›</span></summary>
          <div class="client-stage-body">
            ${latest?`<div class="client-stage-primary"><small>Последняя встреча · ${typeof fmtDate==='function'?fmtDate(latest.date,false):fmt(latest.date)}</small><p><b>${fmt(latest.theme)}</b></p>${latest.hypothesis?`<p class="client-stage-muted">Рабочий фокус: ${fmt(latest.hypothesis)}</p>`:''}</div>`:`<div class="client-stage-empty"><strong>Встреч ещё нет</strong><p>Создайте первую сессию. В форме останутся только поля, которые нужны для протокола.</p></div>`}
            <div class="client-stage-actions"><button class="primary-button" data-action="add-session" data-client="${escSafe(c.id)}">${latest?'Новая встреча':'Начать первую встречу'} →</button>${latest?`<button class="quiet-button" data-action="session-report" data-id="${escSafe(latest.id)}">Открыть последний протокол</button>`:''}</div>
          </div>
        </details>
        <details class="client-stage" data-stage="after" ${openStage==='after'?'open':''}>
          <summary><span class="client-stage-number">3</span><span><strong>После встречи</strong><small>Оставить один следующий шаг и понять, что проверять дальше</small></span><span class="client-stage-arrow">›</span></summary>
          <div class="client-stage-body">
            ${latest?`<div class="client-stage-primary"><small>Договорённость до следующей встречи</small><p>${fmt(latest.homework||'Пока не зафиксирована')}</p></div><div class="client-stage-note"><small>Следующий фокус психолога</small><p>${fmt(latest.nextFocus||c.attention||'Пока не задан')}</p></div>`:'<div class="client-stage-empty"><strong>Сначала проведите встречу</strong><p>После сохранения протокола здесь появятся договорённость и следующий фокус.</p></div>'}
            ${openStep?`<div class="client-stage-note"><small>Текущий шаг</small><p>${fmt(openStep.text)}</p></div>`:''}
            <div class="client-stage-actions"><button class="primary-button" data-action="add-goal" data-client="${escSafe(c.id)}">Добавить следующий шаг</button>${goal?'<button class="quiet-button" data-action="client-tab" data-tab="plan">Открыть план</button>':''}</div>
          </div>
        </details>
      </div>`;
    journey.querySelectorAll('.client-stage').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;journey.querySelectorAll('.client-stage').forEach(other=>{if(other!==d)other.open=false})}));
    return journey;
  }

  function transformClient(root){
    if(!root||root.querySelector('.client-journey'))return;
    const c=(typeof activeClient==='function')?activeClient():null;if(!c)return;
    const sessions=(typeof clientSessions==='function')?clientSessions(c.id):[];
    const goals=(typeof clientGoals==='function')?clientGoals(c.id):[];
    root.classList.add('client-babkin-mode');
    const header=root.querySelector('.dossier-header');if(!header)return;
    const journey=makeClientJourney(c,sessions,goals);
    const tabs=root.querySelector('.tabs');const tabRoot=root.querySelector('#clientTabRoot');
    const access=root.querySelector('.sb-client-access-bar');
    const more=document.createElement('details');more.className='client-tools-details';
    const summary=document.createElement('summary');summary.innerHTML='<span><strong>Все записи и инструменты</strong><small>История встреч, диагностика, план, динамика и доступ клиента</small></span><span>＋</span>';
    more.appendChild(summary);
    const body=document.createElement('div');body.className='client-tools-body';more.appendChild(body);
    if(access)body.appendChild(access);
    if(tabs)body.appendChild(tabs);
    if(tabRoot)body.appendChild(tabRoot);
    header.insertAdjacentElement('afterend',journey);journey.insertAdjacentElement('afterend',more);
  }

  function clearClientMode(){
    const root=document.getElementById('viewRoot');
    if(root&&(!window.ui||ui.view!=='client'))root.classList.remove('client-babkin-mode');
  }

  const previousRenderClient=typeof renderClient==='function'?renderClient:null;
  if(previousRenderClient){
    renderClient=function(root){
      previousRenderClient(root);
      transformClient(root);
    };
  }

  const previousRenderView=typeof renderView==='function'?renderView:null;
  if(previousRenderView){
    renderView=function(){
      const result=previousRenderView.apply(this,arguments);
      clearClientMode();ensureA11yControls();
      if(typeof ui!=='undefined'&&ui?.view==='client')transformClient(document.getElementById('viewRoot'));
      return result;
    };
  }

  applyTheme(currentTheme());applySize(currentSize());
  ensureA11yControls();
  setTimeout(()=>{ensureA11yControls();if(typeof ui!=='undefined'&&ui?.view==='client')transformClient(document.getElementById('viewRoot'));},120);
})();
