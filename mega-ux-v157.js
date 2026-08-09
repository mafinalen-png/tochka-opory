/* Точка опоры v15.7 — мега-аудит UX: искать ситуацию обычными словами, не выбирать терминологию. */
(function(){
  'use strict';

  const QUICK=[
    ['stress','Мне тревожно / не могу отключиться'],
    ['stress','Я вымотан(а), всё на мне'],
    ['relationships','Мы постоянно ссоримся'],
    ['relationships','Тяжело после расставания'],
    ['self','Мне трудно сказать «нет» / боюсь оценки'],
    ['change','Не понимаю, что делать дальше'],
    ['career','Проблемы с работой'],
    ['family','Сложно в семье / с ребёнком'],
    ['habits','Постоянно откладываю / залипаю в телефоне'],
    ['change','Вообще не понимаю, с чего начать']
  ];
  const PUB=[
    ['relationships','Сложно в отношениях'],['stress','Тревожно или очень устал(а)'],
    ['self','Трудно отстоять себя / много самокритики'],['change','Жизнь сильно изменилась / есть потеря'],
    ['career','Проблемы с работой или карьерой'],['family','Трудно в семье или с ребёнком'],
    ['habits','Откладываю важное / телефон мешает'],['other','Не знаю, как это назвать']
  ];
  const escx=(v='')=>typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

  function openCat(root,cat){
    const d=root.querySelector(`.sx-category[data-sx-category="${cat}"]`);if(!d)return;
    root.querySelectorAll('.sx-category').forEach(x=>x.open=x===d);d.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function enhanceScenarioHub(root){
    if(!root?.querySelector('.sx-hub')||root.querySelector('.mega-scenario-entry'))return;
    const head=root.querySelector('.sx-head');if(!head)return;
    const box=document.createElement('section');box.className='mega-scenario-entry';
    box.innerHTML=`<div class="mega-entry-copy"><strong>Можно не знать название проблемы</strong><p>Выберите фразу, похожую на слова клиента, или введите 2–3 слова. Это только помогает найти рабочий маршрут — не ставит диагноз.</p></div>
      <div class="mega-quick-phrases">${QUICK.map(([cat,label])=>`<button type="button" data-mega-cat="${cat}">${escx(label)}</button>`).join('')}</div>
      <label class="mega-scenario-search"><span>Или найдите своими словами</span><div><span>⌕</span><input type="search" placeholder="Например: расставание, начальник, устала, подросток…" autocomplete="off"><button type="button" data-mega-clear hidden>Очистить</button></div></label>
      <div class="mega-search-state" aria-live="polite"></div>`;
    head.insertAdjacentElement('afterend',box);

    const safety=document.createElement('details');safety.className='mega-safety-gate';safety.innerHTML=`<summary><span>!</span><span><strong>Сначала безопасность, если ситуация острая</strong><small>Угроза себе или другим, насилие/контроль, выраженная дезорганизация, острая интоксикация или новый тяжёлый физический симптом — не обычный сценарий.</small></span><i>›</i></summary><div><p>${escx(typeof GENERAL_SAFETY!=='undefined'?GENERAL_SAFETY:'При острой кризисной ситуации специалист действует по своему кризисному протоколу и требованиям своей юрисдикции.')}</p><p><b>Принцип:</b> сначала оценка безопасности и подходящий уровень помощи, только затем обычный рабочий маршрут.</p></div>`;
    box.insertAdjacentElement('afterend',safety);

    box.querySelectorAll('[data-mega-cat]').forEach(b=>b.addEventListener('click',()=>openCat(root,b.dataset.megaCat)));
    const input=box.querySelector('input'),clear=box.querySelector('[data-mega-clear]'),state=box.querySelector('.mega-search-state');
    const allCards=[...root.querySelectorAll('.sx-scenario-card')];
    const filter=()=>{
      const q=input.value.trim().toLocaleLowerCase('ru');clear.hidden=!q;let shown=0;
      root.querySelectorAll('.sx-category').forEach(cat=>{
        let catShown=0;cat.querySelectorAll('.sx-scenario-card').forEach(card=>{
          const id=card.querySelector('[data-scenario]')?.dataset.scenario||'';
          const guide=(typeof SCENARIO_GUIDE!=='undefined'&&SCENARIO_GUIDE[id])?`${SCENARIO_GUIDE[id].when||''} ${(SCENARIO_GUIDE[id].opening||[]).join(' ')}`:'';
          const hay=(card.textContent+' '+guide).toLocaleLowerCase('ru');const ok=!q||hay.includes(q);card.hidden=!ok;if(ok){shown++;catShown++}
        });
        cat.hidden=!!q&&!catShown;if(q&&catShown)cat.open=true;
      });
      state.textContent=q?(shown?`Найдено: ${shown}`:'Ничего точного не найдено. Попробуйте одно простое слово или выберите близкую область выше.'):' ';
    };
    input.addEventListener('input',filter);clear.addEventListener('click',()=>{input.value='';filter();input.focus()});

    allCards.forEach(card=>{
      const id=card.querySelector('[data-scenario]')?.dataset.scenario;if(!id||typeof SCENARIO_GUIDE==='undefined')return;
      const g=SCENARIO_GUIDE[id];if(!g?.when||card.querySelector('.mega-when'))return;
      const det=document.createElement('details');det.className='mega-when';det.innerHTML=`<summary>Когда подходит этот маршрут?</summary><p>${escx(g.when)}</p>`;
      const action=card.querySelector('.sx-open-scenario,.sx-need-client');if(action)card.insertBefore(det,action);else card.appendChild(det);
    });
  }

  if(typeof renderAssessmentHub==='function'){
    const previous=renderAssessmentHub;
    renderAssessmentHub=function(root){const r=previous.apply(this,arguments);enhanceScenarioHub(root);return r};
  }

  function enhancePublicForm(scope=document){
    const form=scope.querySelector?.('#publicInquiryForm');if(!form||form.dataset.mega==='1')return;
    const select=form.querySelector('select[name="topic"]');if(!select)return;form.dataset.mega='1';
    const label=select.closest('label');label.classList.add('mega-hidden-topic');
    const chooser=document.createElement('fieldset');chooser.className='mega-public-topics';chooser.innerHTML=`<legend>Что сейчас ближе всего?</legend><p>Не нужно подбирать психологический термин. Выберите приблизительно — дальше напишите своими словами.</p><div>${PUB.map(([value,text])=>`<button type="button" data-public-topic="${value}">${escx(text)}</button>`).join('')}</div>`;
    label.insertAdjacentElement('afterend',chooser);
    const selectTopic=value=>{select.value=value;chooser.querySelectorAll('[data-public-topic]').forEach(b=>b.classList.toggle('active',b.dataset.publicTopic===value))};
    chooser.querySelectorAll('[data-public-topic]').forEach(b=>b.addEventListener('click',()=>selectTopic(b.dataset.publicTopic)));
    selectTopic(select.value||'other');
    const ta=form.querySelector('textarea[name="message"]');if(ta){ta.placeholder='Напишите 2–5 предложений. Например: «После расставания постоянно возвращаюсь мыслями к отношениям, плохо сплю и не понимаю, как перестать зацикливаться. Хочу обсудить это с психологом». ';}
    const consent=form.querySelector('.public-consent');if(consent){const hint=document.createElement('p');hint.className='mega-public-privacy';hint.textContent='Для первого сообщения не нужны диагнозы, паспортные данные, подробная медицинская история или документы.';consent.insertAdjacentElement('beforebegin',hint)}
  }

  const observer=new MutationObserver(()=>{enhancePublicForm(document);const root=document.getElementById('viewRoot');if(root)enhanceScenarioHub(root)});
  observer.observe(document.body,{subtree:true,childList:true});
  enhancePublicForm(document);enhanceScenarioHub(document.getElementById('viewRoot'));
})();
