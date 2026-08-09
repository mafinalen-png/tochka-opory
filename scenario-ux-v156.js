/* Точка опоры v15.6 — сценарии без горизонтальной ленты и визуального шума */
(function(){
  'use strict';
  if(typeof GENERAL_CATEGORIES==='undefined') return;

  const SHORT={
    career:'Работа и реализация',relationships:'Отношения',stress:'Тревога и перегрузка',
    self:'Самооценка и границы',change:'Перемены и решения',family:'Семья и родители',habits:'Привычки и саморегуляция'
  };
  const ORDER=['career','relationships','stress','self','change','family','habits'];
  const KEY='tochka_scenario_category_v156';
  const read=()=>{try{return sessionStorage.getItem(KEY)||'career'}catch{return 'career'}};
  const save=v=>{try{sessionStorage.setItem(KEY,v)}catch{}};

  function e(v=''){return typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function scenariosFor(cat){return typeof categoryScenarios==='function'?categoryScenarios(cat):Object.entries(scenarios||{}).filter(([,s])=>s.category===cat)}

  function renderReadableScenarioHub(root){
    const c=typeof activeClient==='function'?activeClient():null;
    if(typeof setPage==='function')setPage('Работа с клиентом','Подобрать рабочий маршрут');
    let open=ORDER.includes(read())?read():'career';
    if(typeof generalPsychCategory!=='undefined') generalPsychCategory=open;

    const sections=ORDER.filter(k=>GENERAL_CATEGORIES[k]).map(k=>{
      const cat=GENERAL_CATEGORIES[k], list=scenariosFor(k), isOpen=k===open;
      const cards=list.map(([id,s])=>`<article class="sx-scenario-card">
        <div class="sx-scenario-icon">${e(s.icon||'◇')}</div>
        <div class="sx-scenario-copy"><strong>${e(s.title)}</strong><p>${e(s.text||'')}</p></div>
        ${c?`<button class="primary-button sx-open-scenario" data-action="start-assessment" data-client="${e(c.id)}" data-scenario="${e(id)}">Открыть →</button>`:'<span class="sx-need-client">после выбора клиента</span>'}
      </article>`).join('');
      return `<details class="sx-category" data-sx-category="${k}" ${isOpen?'open':''}>
        <summary><span class="sx-category-icon">${e(cat.icon)}</span><span class="sx-category-copy"><strong>${e(SHORT[k]||cat.title)}</strong><small>${e(cat.text)}</small></span><span class="sx-category-count">${list.length}</span><span class="sx-category-arrow">›</span></summary>
        <div class="sx-scenario-list">${cards}</div>
      </details>`;
    }).join('');

    root.innerHTML=`<div class="sx-hub">
      <section class="sx-head">
        <span class="section-label">РАБОЧИЕ СЦЕНАРИИ</span>
        <h2>${c?`Что сейчас важнее для ${e(c.name)}?`:'Сначала выберите клиента'}</h2>
        <p>${c?'Выберите одну область. Откроются только подходящие рабочие сценарии — без длинной ленты и лишних вариантов.':'Сценарий сохраняется в карточке клиента, поэтому сначала нужно выбрать человека, с которым вы работаете.'}</p>
        <div class="sx-head-actions">${c?`<button class="quiet-button" data-action="view-clients">Сменить клиента</button>`:'<button class="primary-button" data-action="view-clients">Выбрать клиента →</button>'}</div>
      </section>
      <section class="sx-categories" aria-label="Области работы">${sections}</section>
      <details class="sx-professional-note"><summary>Профессиональная граница</summary><p>${e(typeof GENERAL_SAFETY!=='undefined'?GENERAL_SAFETY:'Сценарий — рабочая опора для обсуждения, а не автоматическое заключение.')}</p></details>
    </div>`;

    root.querySelectorAll('.sx-category').forEach(d=>d.addEventListener('toggle',()=>{
      if(!d.open)return;
      open=d.dataset.sxCategory;save(open);
      if(typeof generalPsychCategory!=='undefined')generalPsychCategory=open;
      root.querySelectorAll('.sx-category').forEach(other=>{if(other!==d)other.open=false});
    }));
  }

  if(typeof renderAssessmentHub==='function') renderAssessmentHub=renderReadableScenarioHub;
})();