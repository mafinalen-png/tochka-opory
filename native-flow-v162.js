/* Точка опоры v16.2 — нативная навигация по клиентскому маршруту.
   Без MutationObserver и без перехвата renderView.
   Панель пересобирается только после пользовательских действий. */
(function(){
  'use strict';

  const STAGES=[
    {id:'profile',label:'Профиль',short:'Профиль'},
    {id:'assessment',label:'Разбор запроса',short:'Разбор'},
    {id:'session',label:'Встреча',short:'Встреча'},
    {id:'plan',label:'Следующий шаг',short:'Шаг'},
    {id:'dynamics',label:'Изменения',short:'Изменения'}
  ];

  function E(v=''){
    if(typeof esc==='function')return esc(v);
    return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function client(){
    try{if(typeof activeClient==='function'){const c=activeClient();if(c)return c;}}catch(e){}
    try{
      if(typeof data!=='undefined'&&Array.isArray(data.clients)){
        return data.clients.find(function(x){return x.id===data.activeClientId;})||data.clients.find(function(x){return x.status==='active';})||data.clients[0]||null;
      }
    }catch(e){}
    return null;
  }
  function view(){try{return (typeof ui!=='undefined'&&ui.view)||'dashboard';}catch(e){return'dashboard';}}
  function stageIndex(){
    const v=view();
    if(v==='client'){
      const tab=(typeof ui!=='undefined'&&ui.clientTab)||'overview';
      if(tab==='assessment')return 1;
      if(tab==='sessions')return 2;
      if(tab==='plan')return 3;
      if(tab==='dynamics')return 4;
      return 0;
    }
    if(v==='assessment'||v==='inbox')return 1;
    if(v==='sessions')return 2;
    if(v==='plan')return 3;
    if(v==='dynamics')return 4;
    return -1;
  }
  function setClientTab(tab){
    const c=client();if(!c)return;
    try{if(typeof data!=='undefined')data.activeClientId=c.id;}catch(e){}
    try{if(typeof ui!=='undefined')ui.clientTab=tab;}catch(e){}
    if(typeof setView==='function')setView('client');
  }
  function goProfile(){setClientTab('overview');}
  function goHome(){if(typeof setView==='function')setView('dashboard');}
  function goClients(){if(typeof setView==='function')setView('clients');}
  function openAssessment(){
    const c=client();if(!c){goClients();return;}
    try{if(typeof startAssessment==='function'){startAssessment(c.id);return;}}catch(e){}
    if(typeof setView==='function')setView('assessment');
  }
  function openMeeting(){
    const c=client();if(!c){goClients();return;}
    /* Используем штатный action приложения, чтобы не дублировать логику модального окна. */
    const b=document.createElement('button');
    b.type='button';b.dataset.action='add-session';b.dataset.client=c.id;b.hidden=true;
    document.body.appendChild(b);b.click();b.remove();
  }
  function goStage(n){
    const c=client();
    if(!c&&n>=0){goClients();return;}
    if(n<=0){goProfile();return;}
    if(n===1){openAssessment();return;}
    if(n===2){openMeeting();return;}
    if(n===3){setClientTab('plan');return;}
    setClientTab('dynamics');
  }
  function goBack(){
    const s=stageIndex();
    if(s<0){goHome();return;}
    if(s===0){goHome();return;}
    if(s===1){goProfile();return;}
    if(s===2){setClientTab('assessment');return;}
    if(s===3){setClientTab('sessions');return;}
    if(s===4){setClientTab('plan');return;}
  }
  function goNext(){
    const s=stageIndex();
    if(s<0){const c=client();c?goProfile():goClients();return;}
    if(s===0){openAssessment();return;}
    if(s===1){openMeeting();return;}
    if(s===2){setClientTab('plan');return;}
    if(s===3){setClientTab('dynamics');return;}
    goProfile();
  }
  function nextLabel(){
    const s=stageIndex();
    if(s<0)return client()?'Профиль клиента':'Клиенты';
    if(s===0)return'Разбор';
    if(s===1)return'Встреча';
    if(s===2)return'Следующий шаг';
    if(s===3)return'Изменения';
    return'К профилю';
  }

  function ensureAssessmentLinks(){
    const header=document.querySelector('.assessment-header');if(!header||header.querySelector('.native-assessment-links'))return;
    const links=document.createElement('div');links.className='native-assessment-links';
    links.innerHTML='<button type="button" data-native-assessment-home>⌂ Начало</button><button type="button" data-native-assessment-profile>👤 Профиль клиента</button>';
    header.appendChild(links);
  }
  function closeAssessmentThen(fn){
    const close=document.getElementById('closeAssessment');
    if(close)close.click();
    setTimeout(fn,0);
  }

  function ensureNav(){
    ensureAssessmentLinks();
    const root=document.getElementById('viewRoot');
    if(!root||!root.children.length)return;
    root.querySelector('.native-flow-nav')?.remove();
    const c=client(),s=stageIndex(),v=view();
    const nav=document.createElement('nav');nav.className='native-flow-nav';nav.setAttribute('aria-label','Навигация по работе с клиентом');
    const stages=STAGES.map(function(st,i){
      const disabled=!c?'disabled':'';
      const active=s===i?'active':'';
      const done=s>i?'done':'';
      return '<button type="button" class="native-stage '+active+' '+done+'" data-native-stage="'+i+'" '+disabled+'><span>'+(i+1)+'</span><b>'+E(st.label)+'</b></button>';
    }).join('');
    nav.innerHTML='<div class="native-flow-main">'+
      '<button type="button" class="native-nav-button native-back" data-native-back aria-label="Назад">← <span>Назад</span></button>'+
      '<button type="button" class="native-nav-button" data-native-home>⌂ <span>Начало</span></button>'+
      '<button type="button" class="native-client-button" data-native-profile '+(!c?'disabled':'')+'><span class="native-client-icon">👤</span><span><small>Клиент</small><strong>'+(c?E(c.name):'не выбран')+'</strong></span></button>'+
      '<button type="button" class="native-nav-button native-next" data-native-next><span>'+E(nextLabel())+'</span> →</button>'+
      '</div>'+
      '<div class="native-stage-row" '+(!c?'aria-hidden="true"':'')+'>'+stages+'</div>'+
      '<div class="native-mobile-status"><small>'+(s>=0?'Шаг '+(s+1)+' из 5':v==='dashboard'?'Начало':'Навигация')+'</small><strong>'+(s>=0?E(STAGES[s].label):(c?E(c.name):'Точка опоры'))+'</strong></div>';
    root.insertBefore(nav,root.firstChild);
  }

  document.addEventListener('click',function(e){
    const t=e.target.closest('[data-native-back],[data-native-home],[data-native-profile],[data-native-next],[data-native-stage],[data-native-assessment-home],[data-native-assessment-profile]');
    if(t){
      e.preventDefault();
      if(t.hasAttribute('data-native-back'))goBack();
      else if(t.hasAttribute('data-native-home'))goHome();
      else if(t.hasAttribute('data-native-profile'))goProfile();
      else if(t.hasAttribute('data-native-next'))goNext();
      else if(t.hasAttribute('data-native-stage'))goStage(Number(t.dataset.nativeStage));
      else if(t.hasAttribute('data-native-assessment-home'))closeAssessmentThen(goHome);
      else if(t.hasAttribute('data-native-assessment-profile'))closeAssessmentThen(goProfile);
      setTimeout(ensureNav,30);
      return;
    }
    /* После штатного клика приложение может сменить экран синхронно. */
    setTimeout(ensureNav,40);
  },true);
  document.addEventListener('submit',function(){setTimeout(ensureNav,80);},true);

  ensureAssessmentLinks();ensureNav();
  setTimeout(ensureNav,180);
  setTimeout(ensureNav,900);
})();
