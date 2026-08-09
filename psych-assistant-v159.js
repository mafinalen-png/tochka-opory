/* Точка опоры v15.9 — устойчивый главный экран «Ассистент психолога».
   Не ставит диагнозов; предлагает рабочие маршруты для проверки специалистом. */
(function(){
  'use strict';

  function init(){
    if(typeof data==='undefined' || typeof ui==='undefined' || typeof renderDashboard==='undefined') return;

    var RULES=[
      [/расстав|бывш|разрыв/, 'breakup_recovery', 'В запросе есть тема расставания или незавершённости отношений.'],
      [/одинок|сближ|нет близк/, 'loneliness_connection', 'Есть тема одиночества или трудности сближаться.'],
      [/увол|сокращ|без работ|потер.{0,10}работ/, 'job_loss_recovery', 'Есть потеря работы или риск увольнения.'],
      [/началь|руководител|коллег|конфликт.{0,12}работ/, 'workplace_conflict', 'Есть рабочий конфликт или напряжение с руководителем/коллегами.'],
      [/паник|приступ.{0,8}тревог|сердцеби|не хватает воздуха/, 'strong_anxiety_episode', 'Есть эпизоды резкой тревоги и телесного напряжения.'],
      [/тревог|неопредел|переживаю постоянно/, 'anxiety_uncertainty', 'В запросе заметна тревога или неопределённость.'],
      [/перегруз|истощ|выгор|нет сил|вымот|все на мне|всё на мне/, 'overload_stress', 'Есть перегрузка, истощение или избыток ответственности.'],
      [/ухаж|забот.{0,12}близк|болеет.{0,12}(мама|папа|муж|жена|близк)/, 'caregiver_overload', 'Есть длительная нагрузка, связанная с заботой о близком.'],
      [/самокрит|ругаю себя|ничего не умею|ненавижу себя/, 'self_criticism', 'Есть выраженная самокритика или обесценивание себя.'],
      [/боюсь оцен|что обо мне подума|страх оцен|стыдно показ/, 'fear_evaluation', 'Есть страх чужой оценки или проявления себя.'],
      [/границ|не могу отказ|трудно сказать нет/, 'relationship_boundaries', 'Есть трудность с отказом и личными границами.'],
      [/ссор|ругаемся|конфликт.{0,12}(муж|жен|партнер|партнёр)/, 'couple_conflict', 'Есть повторяющийся конфликт в отношениях.'],
      [/смерт|умер|горе|утрат|похорон/, 'grief_loss', 'Есть утрата или процесс горевания.'],
      [/переезд|эмигра|миграц|новая стран|новом месте/, 'relocation_adaptation', 'Есть адаптация после переезда или смены среды.'],
      [/подрост/, 'parent_teen_conflict', 'Есть конфликт или напряжение в отношениях с подростком.'],
      [/особ.{0,8}ребен|особ.{0,8}ребён|реабилитац.{0,10}ребен|реабилитац.{0,10}ребён/, 'special_child_parent', 'Есть хроническая родительская нагрузка вокруг особых потребностей ребёнка.'],
      [/прокраст|откладыва|не могу начать/, 'procrastination_avoidance', 'Есть повторяющееся откладывание важных действий.'],
      [/телефон|соцсет|залипа|скрол|интернет.{0,10}(меш|съед)/, 'digital_overuse', 'Есть автоматическое цифровое поведение, которое мешает другим задачам.'],
      [/не понимаю.{0,12}(что|с чего)|все навал|всё навал|просто плохо|не могу сформулиров/, 'unclear_request', 'Запрос пока трудно сформулировать — полезен универсальный первичный маршрут.']
    ];

    var SAFETY=[
      /не хочу жить|не хочется жить|суицид|поконч.{0,10}с собой|навредить себе|убить себя/,
      /угрожает|преследует|избивает|бьет меня|бьёт меня|насили|боюсь его|боюсь её|боюсь ее/,
      /убить (его|ее|её|их)|навредить (ему|ей|им)/,
      /передоз|острая интоксикац/
    ];

    function E(v){
      if(typeof esc==='function') return esc(v==null?'':v);
      return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
    }
    function clients(){ return Array.isArray(data.clients)?data.clients:[]; }
    function active(){
      var c=null;
      try{ if(typeof activeClient==='function') c=activeClient(); }catch(e){}
      return c || clients().filter(function(x){return x.status==='active';})[0] || clients()[0] || null;
    }
    function sessionsFor(id){
      return (Array.isArray(data.sessions)?data.sessions:[]).filter(function(x){return x.clientId===id;}).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));});
    }
    function goalsFor(id){
      return (Array.isArray(data.goals)?data.goals:[]).filter(function(x){return x.clientId===id && x.status!=='done';});
    }
    function contextOf(c){
      if(!c) return '';
      var s=sessionsFor(c.id)[0]||{};
      return [c.request,c.context,c.formulation,c.attention,s.theme,s.notes,s.hypothesis,s.nextFocus].filter(Boolean).join(' ');
    }
    function safetyFlag(text){
      var t=String(text||'').toLowerCase();
      return SAFETY.some(function(rx){return rx.test(t);});
    }
    function recommendations(text){
      var t=String(text||'').toLowerCase();
      var out=[];
      RULES.forEach(function(r){
        if(r[0].test(t) && typeof scenarios!=='undefined' && scenarios[r[1]] && !out.some(function(x){return x.id===r[1];})){
          out.push({id:r[1], title:scenarios[r[1]].title, reason:r[2]});
        }
      });
      if(out.length<3 && typeof scenarios!=='undefined'){
        var fallback=['unclear_request','anxiety_uncertainty','overload_stress','couple_conflict','relationship_boundaries','hire'];
        fallback.forEach(function(id){
          if(out.length>=3) return;
          if(scenarios[id] && !out.some(function(x){return x.id===id;})){
            out.push({id:id,title:scenarios[id].title,reason:id==='unclear_request'?'Подходит как универсальный старт, если запрос пока неясен.':'Можно рассмотреть как альтернативную рабочую гипотезу.'});
          }
        });
      }
      return out.slice(0,3);
    }
    function questions(items){
      var out=[];
      items.forEach(function(item){
        try{
          var g=(typeof SCENARIO_GUIDE!=='undefined')?SCENARIO_GUIDE[item.id]:null;
          (g&&Array.isArray(g.opening)?g.opening:[]).forEach(function(q){if(q && out.indexOf(q)===-1) out.push(q);});
        }catch(e){}
      });
      if(!out.length){
        out=['Что сейчас мешает клиенту сильнее всего в обычной жизни?','Что изменилось по сравнению с периодом, когда было легче?','Какого первого небольшого изменения клиент ждёт от работы?'];
      }
      return out.slice(0,3);
    }
    function nextAction(c){
      if(!c) return {title:'Добавить первого клиента',text:'После этого ассистент сможет собирать запрос, встречи и следующие шаги в одну рабочую картину.',button:'<button class="primary-button" data-action="add-client">Добавить клиента →</button>'};
      var ss=sessionsFor(c.id), last=ss[0]||null;
      var inbox=0;try{if(typeof countInbox==='function') inbox=countInbox();}catch(e){}
      if(inbox>0) return {title:'Посмотреть новые ответы клиента',text:'Есть новые материалы или ответы, которые стоит прочитать до следующего действия.',button:'<button class="primary-button" data-babkin-view="inbox">Открыть ответы →</button>'};
      if(!last) return {title:'Подготовить первую встречу',text:'Запрос уже есть. Ниже ассистент предлагает несколько направлений, которые стоит проверить, а не принимать как готовый вывод.',button:'<button class="primary-button" data-action="add-session" data-client="'+E(c.id)+'">Начать встречу →</button>'};
      if(!last.homework || !last.nextFocus) return {title:'Завершить протокол последней встречи',text:'Не хватает договорённости с клиентом или следующего фокуса.',button:'<button class="primary-button" data-action="edit-session" data-id="'+E(last.id)+'">Дозаполнить →</button>'};
      var gs=goalsFor(c.id), step='';
      gs.some(function(g){var s=(g.steps||[]).filter(function(x){return !x.done;})[0];if(s){step=s.text;return true;}return false;});
      if(step) return {title:'Проверить следующий шаг',text:step,button:'<button class="primary-button" data-babkin-view="plan">Открыть план →</button>'};
      return {title:'Подготовить следующую встречу',text:last.nextFocus||'Уточнить, что изменилось после предыдущей встречи.',button:'<button class="primary-button" data-action="open-client" data-id="'+E(c.id)+'">Открыть клиента →</button>'};
    }
    function routeHtml(items,c){
      return items.map(function(x,i){
        return '<article class="pa9-route">'+
          '<span class="pa9-num">'+(i+1)+'</span><div><strong>'+E(x.title)+'</strong><p>'+E(x.reason)+'</p></div>'+
          (c?'<button class="quiet-button" data-action="start-assessment" data-client="'+E(c.id)+'" data-scenario="'+E(x.id)+'">Проверить →</button>':'')+
          '</article>';
      }).join('');
    }
    function bind(root,c){
      var btn=root.querySelector('#pa9Analyze');
      var ta=root.querySelector('#pa9Text');
      var res=root.querySelector('#pa9Result');
      if(btn&&ta&&res){
        btn.onclick=function(){
          var text=ta.value.trim();
          if(!text){res.innerHTML='<p class="pa9-note">Напишите 1–2 предложения о ситуации клиента.</p>';return;}
          var rec=recommendations(text), qs=questions(rec), danger=safetyFlag(text);
          res.innerHTML=(danger?'<div class="pa9-safety"><strong>Сначала уточните безопасность</strong><p>В тексте есть формулировка, которую нельзя обрабатывать как обычный сценарий без отдельной профессиональной оценки риска.</p></div>':'')+
            '<div class="pa9-routes">'+routeHtml(rec,c)+'</div>'+
            '<div class="pa9-questions"><strong>Что уточнить</strong>'+qs.map(function(q){return '<p>• '+E(q)+'</p>';}).join('')+'</div>';
        };
      }
      var clear=root.querySelector('#pa9Clear');
      if(clear&&ta&&res){clear.onclick=function(){ta.value='';res.innerHTML='';ta.focus();};}
    }

    function assistantDashboard(root){
      try{ if(typeof setPage==='function') setPage('Ассистент психолога','Что требует внимания сейчас'); }catch(e){}
      var c=active(), ctx=contextOf(c), rec=recommendations(ctx), qs=questions(rec), action=nextAction(c), danger=safetyFlag(ctx);
      var last=c?sessionsFor(c.id)[0]:null;
      root.innerHTML='<div class="pa9-dashboard">'+
        '<section class="pa9-hero"><span class="section-label">АССИСТЕНТ ПСИХОЛОГА</span><h2>Что требует внимания сейчас?</h2><p>Ассистент собирает рабочий контекст и предлагает, что проверить. Решение и профессиональная оценка остаются за психологом.</p></section>'+
        (danger?'<section class="pa9-safety"><strong>Сначала проверьте безопасность</strong><p>В записях есть формулировка, которую важно отдельно оценить до выбора обычного рабочего сценария.</p></section>':'')+
        '<section class="pa9-grid">'+
          '<article class="pa9-card pa9-next"><span class="section-label">СЛЕДУЮЩЕЕ ДЕЙСТВИЕ</span><h3>'+E(action.title)+'</h3><p>'+E(action.text)+'</p>'+action.button+'</article>'+
          '<article class="pa9-card"><span class="section-label">СЕЙЧАС В ФОКУСЕ</span><h3>'+(c?E(c.name):'Клиент не выбран')+'</h3><p>'+(c&&c.request?E(c.request):'Выберите или добавьте клиента, чтобы ассистент собрал рабочую картину.')+'</p>'+(c?'<div class="pa9-actions"><button class="quiet-button" data-action="open-client" data-id="'+E(c.id)+'">Карточка клиента</button><button class="quiet-button" data-action="view-clients">Сменить клиента</button></div>':'')+'</article>'+
        '</section>'+
        (c?'<section class="pa9-card"><div class="pa9-heading"><div><span class="section-label">РАБОЧИЕ ГИПОТЕЗЫ</span><h3>Какие маршруты стоит проверить</h3><p>Это не диагноз и не готовое решение. Ассистент показывает 2–3 направления, которые лучше уточнить в разговоре.</p></div><button class="quiet-button" data-babkin-view="assessment">Все сценарии</button></div><div class="pa9-routes">'+routeHtml(rec,c)+'</div><div class="pa9-questions"><strong>На встрече полезно уточнить</strong>'+qs.map(function(q){return '<p>• '+E(q)+'</p>';}).join('')+'</div></section>':'')+
        (c?'<section class="pa9-card pa9-after"><span class="section-label">ПОСЛЕ ПОСЛЕДНЕЙ ВСТРЕЧИ</span><h3>'+(last?'Проверьте, что осталось незавершённым':'После первой встречи')+'</h3><p>'+(last?(last.homework?'Договорённость: '+E(last.homework):'Договорённость с клиентом пока не зафиксирована.'):'Зафиксируйте тему, наблюдения, рабочую гипотезу и один следующий шаг.')+'</p><p>'+(last&&last.nextFocus?'Следующий фокус: '+E(last.nextFocus):'Следующий фокус пока не указан.')+'</p></section>':'')+
        '<section class="pa9-card pa9-analyze"><span class="section-label">БЫСТРЫЙ РАЗБОР</span><h3>Опишите ситуацию своими словами</h3><p>1–2 предложения. Текст анализируется локально по библиотеке сценариев и никуда не отправляется.</p><textarea id="pa9Text" placeholder="Например: после разговора с начальником клиент замыкается, долго прокручивает конфликт и боится снова поднимать тему."></textarea><div class="pa9-actions"><button class="primary-button" id="pa9Analyze">Предложить, что проверить →</button><button class="quiet-button" id="pa9Clear">Очистить</button></div><div id="pa9Result"></div></section>'+
        '<details class="pa9-tools"><summary>Все инструменты</summary><div><button class="quiet-button" data-action="view-clients">Клиенты</button><button class="quiet-button" data-babkin-view="sessions">Встречи</button><button class="quiet-button" data-babkin-view="assessment">Сценарии</button><button class="quiet-button" data-babkin-view="plan">Следующие шаги</button><button class="quiet-button" data-babkin-view="dynamics">Изменения</button></div></details>'+
      '</div>';
      bind(root,c);
    }

    renderDashboard=assistantDashboard;

    try{
      var nav=document.querySelector('.babkin-nav-group[data-group="now"] .babkin-group-copy strong');
      if(nav) nav.textContent='Ассистент и клиенты';
      var dash=document.querySelector('[data-view="dashboard"] span:nth-child(2)');
      if(dash) dash.textContent='Ассистент';
    }catch(e){}

    try{ if(ui.view==='dashboard' && typeof renderView==='function') renderView(); }catch(e){ console.error('Assistant dashboard render failed',e); }
  }

  try{ init(); }catch(e){ console.error('Psychologist assistant init failed',e); }
})();
