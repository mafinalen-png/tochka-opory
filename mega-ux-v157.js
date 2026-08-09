/* Точка опоры v15.7-safe — простой UX-слой без рискованных перехватов. */
(function(){
  'use strict';
  function E(v){return typeof esc==='function'?esc(v):String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  var QUICK=[
    ['stress','Мне тревожно / не могу отключиться'],['stress','Я вымотан(а), всё на мне'],
    ['relationships','Мы постоянно ссоримся'],['relationships','Тяжело после расставания'],
    ['self','Мне трудно сказать «нет» / боюсь оценки'],['change','Не понимаю, что делать дальше'],
    ['career','Проблемы с работой'],['family','Сложно в семье / с ребёнком'],['habits','Постоянно откладываю / залипаю в телефоне']
  ];

  function enhanceScenarioHub(root){
    if(!root || !root.querySelector('.sx-hub') || root.querySelector('.mega-scenario-entry')) return;
    var head=root.querySelector('.sx-head'); if(!head) return;
    var box=document.createElement('section'); box.className='mega-scenario-entry';
    box.innerHTML='<div class="mega-entry-copy"><strong>Можно не знать название проблемы</strong><p>Выберите близкую формулировку или найдите сценарий обычными словами.</p></div><div class="mega-quick-phrases">'+QUICK.map(function(x){return '<button type="button" data-mega-cat="'+E(x[0])+'">'+E(x[1])+'</button>';}).join('')+'</div><label class="mega-scenario-search"><span>Найти своими словами</span><div><span>⌕</span><input type="search" placeholder="Например: расставание, начальник, устала, подросток…"><button type="button" data-mega-clear hidden>Очистить</button></div></label><div class="mega-search-state" aria-live="polite"></div>';
    head.insertAdjacentElement('afterend',box);
    box.querySelectorAll('[data-mega-cat]').forEach(function(b){b.onclick=function(){var d=root.querySelector('.sx-category[data-sx-category="'+b.dataset.megaCat+'"]');if(d){root.querySelectorAll('.sx-category').forEach(function(x){x.open=x===d;});d.scrollIntoView({behavior:'smooth',block:'start'});}};});
    var input=box.querySelector('input'), clear=box.querySelector('[data-mega-clear]'), state=box.querySelector('.mega-search-state');
    function filter(){
      var q=input.value.trim().toLowerCase(); clear.hidden=!q; var shown=0;
      root.querySelectorAll('.sx-category').forEach(function(cat){
        var n=0;cat.querySelectorAll('.sx-scenario-card').forEach(function(card){var ok=!q||card.textContent.toLowerCase().indexOf(q)!==-1;card.hidden=!ok;if(ok){n++;shown++;}});cat.hidden=!!q&&!n;if(q&&n)cat.open=true;
      });
      state.textContent=q?(shown?'Найдено: '+shown:'Ничего точного не найдено. Попробуйте одно простое слово.'):' ';
    }
    input.oninput=filter;clear.onclick=function(){input.value='';filter();input.focus();};
  }

  function enhancePublicForm(){
    var form=document.querySelector('#publicInquiryForm');if(!form||form.dataset.megaSafe==='1')return;
    var select=form.querySelector('select[name="topic"]');if(!select)return;form.dataset.megaSafe='1';
    var label=select.closest('label');if(label)label.classList.add('mega-hidden-topic');
    var topics=[['relationships','Сложно в отношениях'],['stress','Тревожно или очень устал(а)'],['self','Трудно отстоять себя'],['change','Жизнь сильно изменилась / есть потеря'],['career','Проблемы с работой'],['family','Трудно в семье или с ребёнком'],['habits','Откладываю важное / телефон мешает'],['other','Не знаю, как это назвать']];
    var fs=document.createElement('fieldset');fs.className='mega-public-topics';fs.innerHTML='<legend>Что сейчас ближе всего?</legend><p>Можно выбрать приблизительно и дальше написать своими словами.</p><div>'+topics.map(function(x){return '<button type="button" data-public-topic="'+E(x[0])+'">'+E(x[1])+'</button>';}).join('')+'</div>';
    if(label)label.insertAdjacentElement('afterend',fs);
    fs.querySelectorAll('[data-public-topic]').forEach(function(b){b.onclick=function(){select.value=b.dataset.publicTopic;fs.querySelectorAll('button').forEach(function(x){x.classList.toggle('active',x===b);});};});
  }

  function scan(){enhanceScenarioHub(document.getElementById('viewRoot'));enhancePublicForm();}
  var obs=new MutationObserver(scan);obs.observe(document.body,{subtree:true,childList:true});scan();

  /* Загружаем только проверенный стабильный ассистент v15.9. */
  if(!document.querySelector('link[data-psych-assistant-v159]')){var l=document.createElement('link');l.rel='stylesheet';l.href='psych-assistant-v159.css?v=159';l.dataset.psychAssistantV159='1';document.head.appendChild(l);}
  if(!document.querySelector('script[data-psych-assistant-v159]')){var s=document.createElement('script');s.src='psych-assistant-v159.js?v=159';s.dataset.psychAssistantV159='1';document.body.appendChild(s);}
})();
