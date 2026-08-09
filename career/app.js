(function(){
'use strict';

const STORAGE='career_psychologist_demo_v1';
const ROLE_STORAGE='career_psychologist_role_v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const QUESTIONS=[
 {id:'situation',title:'Что сейчас больше всего похоже на вашу ситуацию?',help:'Не нужно искать точную формулировку. Выберите ближайший вариант.',options:[
  ['old','Прежняя работа больше не подходит, но новой дороги пока не видно','compass'],
  ['income','Работа есть, но доход или роль меня больше не устраивают','constraints'],
  ['break','Возвращаюсь после перерыва и не понимаю, на что теперь опираться','scattered'],
  ['many','У меня много разного опыта, но я не могу собрать его в одну понятную роль','scattered'],
  ['fear','Понимаю, что хочу перемен, но боюсь ошибиться и потерять устойчивость','blocked']
 ]},
 {id:'hardest',title:'Что делает следующий шаг особенно трудным?',help:'Выбираем не «главную проблему жизни», а то, что сильнее мешает двигаться сейчас.',options:[
  ['direction','Не понимаю, какие направления вообще рассматривать','compass'],
  ['value','Мне кажется, что мой опыт слишком обычный и в нём нет ценности','scattered'],
  ['risk','Страшно потерять доход, статус или привычную устойчивость','blocked'],
  ['limits','Есть реальные ограничения: время, семья, здоровье, место, деньги','constraints'],
  ['many','Слишком много вариантов, и от этого я не выбираю ни один','compass']
 ]},
 {id:'experience',title:'Где лучше всего видно, что ваш опыт уже имеет ценность?',help:'Не достижения «для резюме», а реальные доказательства того, что вы умеете делать.',options:[
  ['people','Люди регулярно обращаются ко мне за советом или помощью','scattered'],
  ['result','Я могу назвать конкретные задачи, которые доводил(а) до результата','scattered'],
  ['adapt','Я умею разбираться в новом и собирать решение из разных областей','scattered'],
  ['responsibility','Мне доверяют сложные или ответственные участки работы','scattered'],
  ['hard','Мне трудно сейчас назвать такие примеры','blocked']
 ]},
 {id:'limits',title:'Что нельзя игнорировать при выборе новой профессиональной дороги?',help:'Хороший маршрут должен выдерживать реальную жизнь, а не только вдохновлять.',options:[
  ['money','Нельзя надолго терять доход','constraints'],
  ['time','Мало свободного времени на обучение и эксперименты','constraints'],
  ['family','Есть семейные обязанности и зависимость от графика','constraints'],
  ['health','Нужно учитывать ресурс, здоровье или уровень нагрузки','constraints'],
  ['location','Есть ограничения по месту или формату работы','constraints'],
  ['flex','Есть пространство для осторожной проверки вариантов','compass']
 ]},
 {id:'pattern',title:'Что вы чаще делаете вместо реальной проверки нового направления?',help:'Этот вопрос помогает увидеть, где маршрут останавливается.',options:[
  ['learn','Ещё учусь и готовлюсь, но почти ничего не проверяю снаружи','blocked'],
  ['think','Много думаю и сравниваю варианты','compass'],
  ['devalue','Обесцениваю идеи ещё до проверки','blocked'],
  ['busy','Ухожу в текущие дела — на переход не остаётся сил','constraints'],
  ['random','Пробую разное без ясного критерия, поэтому не понимаю результат','compass']
 ]},
 {id:'want',title:'Какой первый результат был бы для вас действительно полезен?',help:'Не «найти дело всей жизни», а ближайшая ясность, которая позволит двигаться.',options:[
  ['role','Понять, как назвать свою профессиональную роль','scattered'],
  ['directions','Собрать 2–3 направления для проверки','compass'],
  ['evidence','Увидеть ценность накопленного опыта на фактах','scattered'],
  ['safe','Понять, как менять работу без резкого обнуления','constraints'],
  ['move','Наконец сделать маленький внешний шаг, а не ещё раз всё обдумать','blocked']
 ]},
 {id:'time',title:'Сколько времени вы реально готовы дать первой проверке в ближайшие 72 часа?',help:'Эксперимент должен помещаться в вашу жизнь.',options:[
  ['20','20 минут','constraints'],
  ['40','30–40 минут','compass'],
  ['60','Около часа','scattered'],
  ['talk','Могу найти время на один разговор с человеком','blocked']
 ]}
];

const TYPE_COPY={
 compass:{title:'Сейчас важнее вернуть критерии направления',text:'Похоже, вариантов либо не видно, либо их слишком много. Полезнее не выбирать профессию навсегда, а сначала определить, по каким признакам вы будете отличать подходящее направление от неподходящего.',resource:'У вас уже есть готовность исследовать варианты без обязательства сразу принимать большое решение.',experiment:'Выберите 3 возможных направления и для каждого запишите по три пункта: что в нём подходит вашей жизни, что вызывает сомнение, какой факт нужно проверить. Ограничьте работу 30–40 минутами.'},
 scattered:{title:'Сейчас важнее собрать доказательства собственного опыта',text:'Похоже, проблема не в отсутствии опыта, а в том, что он пока не собран в понятную профессиональную конструкцию. Сначала нужно увидеть повторяющиеся задачи, результаты и то, за чем к вам приходят другие.',resource:'В ответах уже есть признаки накопленного практического капитала — его можно переводить на профессиональный язык, не придумывая новую биографию.',experiment:'Возьмите 5 эпизодов из работы или жизни и заполните для каждого: задача → что именно сделали вы → какой получился результат → что здесь повторяется. 20–40 минут достаточно.'},
 blocked:{title:'Сейчас важнее вернуть внешний шаг вместо бесконечной подготовки',text:'Похоже, движение останавливается в момент проверки: идея ещё не успела встретиться с реальностью, а уже кажется слишком рискованной или недостаточно хорошей.',resource:'Вы уже видите необходимость перемен. Следующий полезный результат — не уверенность, а новые данные из безопасной проверки.',experiment:'Выберите одну профессиональную гипотезу и покажите её одному безопасному человеку: бывшему коллеге, потенциальному клиенту или знакомому из сферы. Задача — задать 2 вопроса и собрать факты, а не получить одобрение.'},
 constraints:{title:'Сейчас важнее спроектировать маршрут вокруг реальных ограничений',text:'Похоже, перемены нельзя строить так, будто у вас нет обязательств, финансовой планки и ограниченного ресурса. Значит, сначала нужно определить допустимый риск и формат проверки, который не разрушает текущую устойчивость.',resource:'Вы хорошо видите условия реальной жизни. Это не помеха маршруту, а исходные данные для его проектирования.',experiment:'Составьте две колонки: «нельзя потерять» и «можно менять». Затем выберите один тест нового направления, который не требует увольнения, больших затрат или долгого обучения. Ограничьте его 20–40 минутами.'}
};

const ROUTE=[
 ['where','Где я сейчас?','Карта исходной ситуации'],
 ['barrier','Что удерживает меня на месте?','Рабочая гипотеза карьерного барьера'],
 ['experience','Что у меня уже есть?','Карта опыта, навыков и результатов'],
 ['conditions','Какая работа подходит моей жизни?','Критерии, ограничения и допустимый риск'],
 ['hypotheses','Какие направления можно проверить?','2–3 профессиональные гипотезы'],
 ['experiment','Какой шаг я сделаю первым?','Профессиональный эксперимент'],
 ['map','Моя карта профессионального маршрута','Собранный итог и план действий']
];

const ROUTE_PROMPTS={
 where:['Что в прежней профессиональной ситуации перестало вас устраивать?','Что вы хотите сохранить из текущей жизни и работы?'],
 barrier:['В какой момент движение обычно останавливается?','Какой вывод о себе вы делаете, когда думаете о переменах?'],
 experience:['Назовите 3–5 задач, которые вы умеете решать лучше, чем вам кажется.','Какие конкретные результаты, отзывы или повторные обращения подтверждают это?'],
 conditions:['Какие условия работы для вас обязательны?','Какой риск сейчас допустим, а какой — нет?'],
 hypotheses:['Какие 2–3 направления логично проверить, если опираться на факты опыта и условия жизни?','Что именно нужно узнать о каждом направлении до решения?'],
 experiment:['Какой маленький внешний эксперимент даст новые данные?','Что будет считаться полезным результатом, даже если гипотеза не подтвердится?'],
 map:['Что вы теперь знаете о своём опыте, критериях и направлениях?','Какой следующий шаг вы готовы назначить себе и когда его проверите?']
};

const DEFAULT_STATE={role:'client',screen:'home',q:0,answers:{},result:null,routeStage:0,routeAnswers:{},sent:false,psychView:'attention',selectedClient:null};
let state=load();

function load(){try{return Object.assign({},DEFAULT_STATE,JSON.parse(localStorage.getItem(STORAGE)||'{}'),{role:localStorage.getItem(ROLE_STORAGE)||'client'});}catch(e){return {...DEFAULT_STATE};}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state));localStorage.setItem(ROLE_STORAGE,state.role);}
function resetClient(){state={...DEFAULT_STATE,role:'client'};save();render();}
function scoreResult(){const score={compass:0,scattered:0,blocked:0,constraints:0};QUESTIONS.forEach(q=>{const a=state.answers[q.id];const opt=q.options.find(o=>o[0]===a);if(opt)score[opt[2]]++;});const type=Object.keys(score).sort((a,b)=>score[b]-score[a])[0]||'compass';const copy=TYPE_COPY[type];state.result={type,...copy,createdAt:new Date().toISOString()};state.screen='result';save();}
function currentRouteStep(){return ROUTE[state.routeStage]||ROUTE[0];}
function toast(text){const t=document.createElement('div');t.className='toast';t.textContent=text;document.body.appendChild(t);setTimeout(()=>t.remove(),2200);}
function setRole(role){state.role=role;state.screen=role==='client'?(state.result?'today':'home'):'psych';save();render();}
function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem('career_theme',theme);}
function cycleText(){const order=['normal','large','xlarge'];const cur=document.documentElement.dataset.text||'normal';document.documentElement.dataset.text=order[(order.indexOf(cur)+1)%order.length];localStorage.setItem('career_text',document.documentElement.dataset.text);}
function initAppearance(){document.documentElement.dataset.theme=localStorage.getItem('career_theme')||'light';document.documentElement.dataset.text=localStorage.getItem('career_text')||'normal';}

function shell(content,title,eyebrow='Виртуальный карьерный психолог'){
 const clientNav=[['today','Сегодня'],['route','Мой маршрут'],['result','Моя карта']];
 const psychNav=[['attention','Нужно внимание'],['clients','Клиенты'],['archive','Архив']];
 const nav=state.role==='client'?clientNav:psychNav;
 return `<div class="app"><aside class="sidebar"><div class="brand"><div class="brand-mark">↗</div><div><strong>Профессиональный маршрут</strong><small>виртуальный карьерный психолог</small></div></div><div class="side-block"><div class="side-title">${state.role==='client'?'Моя работа':'Кабинет психолога'}</div><nav class="side-nav">${nav.map(([id,label])=>`<button data-nav="${id}" class="${isNavActive(id)?'active':''}">${label}</button>`).join('')}</nav></div>${state.role==='client'?routeMini():psychMini()}<div class="sidebar-foot"><div class="role-switch"><button data-role="client" class="${state.role==='client'?'active':''}">Клиент</button><button data-role="psychologist" class="${state.role==='psychologist'?'active':''}">Психолог</button></div><small style="color:var(--muted);padding:0 6px">Демо-режим: данные хранятся только в этом браузере.</small></div></aside><div class="workspace"><header class="topbar"><div><small>${esc(eyebrow)}</small><h1>${esc(title)}</h1></div><div class="top-actions"><button class="view-btn" data-role="${state.role==='client'?'psychologist':'client'}">${state.role==='client'?'Кабинет психолога':'Путь клиента'}</button><button class="icon-btn" data-theme-toggle title="Светлая/тёмная тема">◐</button><button class="icon-btn" data-text-toggle title="Размер текста">Aa</button></div></header><main class="main">${routeBar()}${content}</main></div></div>${mobileNav()}`;
}
function isNavActive(id){if(state.role==='client'){return (id==='today'&&['home','today','screening'].includes(state.screen))||(id==='route'&&state.screen==='route')||(id==='result'&&state.screen==='result');}return state.psychView===id;}
function routeMini(){return `<div class="side-block"><div class="side-title">Маршрут</div><div class="route-list">${ROUTE.slice(0,4).map((r,i)=>`<div class="route-step ${state.routeStage===i?'active':''} ${state.routeStage>i?'done':''}"><span class="num">${state.routeStage>i?'✓':i+1}</span><div><strong>${esc(r[1])}</strong><small>${esc(r[2])}</small></div></div>`).join('')}</div></div>`;}
function psychMini(){const count=attentionItems().length;return `<div class="side-block"><div class="side-title">Сегодня</div><div class="card" style="padding:14px;border:0;background:transparent"><strong style="font-size:28px">${count}</strong><p>${count===1?'ситуация требует':'ситуации требуют'} внимания</p></div></div>`;}
function routeBar(){if(state.role!=='client'||state.screen==='home')return'';const idx=state.screen==='route'?state.routeStage:state.screen==='result'?6:0;return `<div class="routebar"><div class="route-actions"><button class="secondary" data-back>← Назад</button><button class="secondary" data-home>⌂ Сегодня</button></div><div class="route-progress">${ROUTE.map((_,i)=>`<span class="dot ${i<idx?'done':''} ${i===idx?'active':''}"></span>`).join('')}</div><button class="text-btn" data-route-open>Мой маршрут</button></div>`;}
function mobileNav(){if(state.role!=='client')return `<nav class="mobile-bottom"><button data-psych-nav="attention" class="${state.psychView==='attention'?'active':''}"><span>!</span>Сегодня</button><button data-psych-nav="clients" class="${state.psychView==='clients'?'active':''}"><span>◫</span>Клиенты</button><button data-role="client"><span>↗</span>Клиент</button><button data-theme-toggle><span>◐</span>Вид</button></nav>`;return `<nav class="mobile-bottom"><button data-back><span>←</span>Назад</button><button data-home class="${state.screen==='today'?'active':''}"><span>⌂</span>Сегодня</button><button data-route-open class="${state.screen==='route'?'active':''}"><span>◎</span>Маршрут</button><button data-next><span>→</span>Дальше</button></nav>`;}

function clientHome(){return shell(`<section class="panel hero"><div><div class="eyebrow">Профессиональный переход без обнуления опыта</div><h2>Когда прежняя профессиональная дорога больше не подходит, а новая пока не видна.</h2><p>За несколько минут разберите, где сейчас остановилось движение, на что уже можно опереться и какой маленький шаг даст новые данные без необходимости сразу увольняться и начинать жизнь с нуля.</p><div class="hero-actions"><button class="primary" data-start-screening>Начать короткий разбор →</button><button class="secondary" data-show-how>Как это работает</button></div></div><aside class="hero-card"><div><strong>Не тест на профессию</strong><p>Система не решает, кем вам быть. Она помогает собрать факты опыта, увидеть ограничения и сформировать проверяемый следующий шаг.</p></div><small style="color:var(--muted)">7 вопросов · один вопрос на экране · без регистрации до результата</small></aside></section><section class="section" id="how"><div class="section-head"><div><h3>Что вы получите</h3><p>Не тип личности и не список случайных профессий.</p></div></div><div class="grid3"><article class="card"><div class="meta">1</div><h4>Карту текущей остановки</h4><p>Что сейчас мешает движению — без ярлыка и диагноза.</p></article><article class="card"><div class="meta">2</div><h4>Одну профессиональную опору</h4><p>Факт из вашего опыта, на который уже можно опереться.</p></article><article class="card"><div class="meta">3</div><h4>Эксперимент на 72 часа</h4><p>Небольшую проверку на 20–40 минут вместо большого решения.</p></article></div></section>`,`Виртуальный карьерный психолог`,'Психолог профессионального пути');}

function screening(){const q=QUESTIONS[state.q];const selected=state.answers[q.id];const progress=((state.q+1)/QUESTIONS.length)*100;return shell(`<div class="question-shell"><div class="progressline"><span style="width:${progress}%"></span></div><section class="panel question-card"><div class="step-caption"><span>Короткий разбор</span><span>${state.q+1} из ${QUESTIONS.length}</span></div><h2>${esc(q.title)}</h2><p>${esc(q.help)}</p><div class="options">${q.options.map((o,i)=>`<button class="option ${selected===o[0]?'selected':''}" data-answer="${o[0]}"><span class="option-index">${i+1}</span><span>${esc(o[1])}</span></button>`).join('')}</div><div class="question-footer"><button class="secondary" data-q-back ${state.q===0?'disabled':''}>← Назад</button><button class="primary" data-q-next ${selected?'':'disabled'}>${state.q===QUESTIONS.length-1?'Получить карту →':'Дальше →'}</button></div></section></div>`,`Разбираем вашу ситуацию`);}

function result(){if(!state.result)return clientHome();const r=state.result;return shell(`<section class="panel result-hero"><span class="result-label">Предварительная карта</span><h2>${esc(r.title)}</h2><p>${esc(r.text)}</p><div class="hero-actions"><button class="primary" data-full-route>Продолжить полный маршрут →</button><button class="secondary" data-send-psych>${state.sent?'Сводка передана психологу ✓':'Передать карьерному психологу'}</button></div></section><div class="result-grid"><section class="panel result-block"><div class="eyebrow">На что уже можно опереться</div><h3>Одна опора из ваших ответов</h3><p>${esc(r.resource)}</p></section><section class="panel result-block experiment"><div class="eyebrow" style="color:var(--success)">Ближайшие 72 часа</div><h3>Не решение, а проверка</h3><p>${esc(r.experiment)}</p></section></div><section class="section"><div class="section-head"><div><h3>Что дальше</h3><p>Полный маршрут постепенно собирает опыт, ограничения, гипотезы и внешний эксперимент.</p></div></div>${fullRouteList()}</section>`,`Ваша первая карта`);}

function today(){if(!state.result)return clientHome();const r=state.result;const stage=currentRouteStep();return shell(`<section class="panel hero"><div><div class="eyebrow">Сегодня</div><h2>${state.routeStage===0?'Продолжите с того места, где уже появилась ясность.':esc(stage[1])}</h2><p>${state.routeStage===0?esc(r.title)+'. Теперь можно перейти от короткого скрининга к фактам опыта и реальной проверке.':esc(stage[2])+'. Остальное откроется по ходу маршрута.'}</p><div class="hero-actions"><button class="primary" data-route-continue>${state.routeStage===0?'Продолжить маршрут →':'Продолжить этот шаг →'}</button><button class="secondary" data-view-result>Посмотреть первую карту</button></div></div><aside class="hero-card"><div><strong>Ваш ориентир сейчас</strong><p>${esc(r.title)}</p></div><small style="color:var(--muted)">Следующий шаг: ${esc(stage[1])}</small></aside></section><section class="section"><div class="grid2"><article class="card"><div class="meta">Последний результат</div><h4>${esc(r.title)}</h4><p>${esc(r.resource)}</p></article><article class="card experiment"><div class="meta" style="color:var(--success)">Эксперимент</div><h4>Проверка вместо большого решения</h4><p>${esc(r.experiment)}</p></article></div></section><section class="section"><div class="section-head"><div><h3>Мой маршрут</h3><p>Система показывает текущий этап, а не заставляет разбираться в меню.</p></div></div>${fullRouteList()}</section>`,`Сегодня`);}

function fullRouteList(){return `<div class="route-list">${ROUTE.map((r,i)=>`<div class="route-step ${state.routeStage===i?'active':''} ${state.routeStage>i?'done':''}" data-open-route="${i}"><span class="num">${state.routeStage>i?'✓':i+1}</span><div><strong>${esc(r[1])}</strong><small>${esc(r[2])}</small></div><span>${state.routeStage===i?'→':''}</span></div>`).join('')}</div>`;}

function routeScreen(){if(!state.result)return clientHome();const r=currentRouteStep();const prompts=ROUTE_PROMPTS[r[0]]||[];const vals=state.routeAnswers[r[0]]||['',''];return shell(`<section class="panel form-card"><div class="step-caption"><span>Этап ${state.routeStage+1} из ${ROUTE.length}</span><span>${esc(r[2])}</span></div><h2>${esc(r[1])}</h2><p>Не нужно писать красиво. Нужны факты, ограничения и формулировки, которые можно проверить.</p>${prompts.map((p,i)=>`<label class="field"><span>${esc(p)}</span><textarea data-route-field="${i}" placeholder="Запишите коротко, своими словами">${esc(vals[i]||'')}</textarea></label>`).join('')}<div class="question-footer"><button class="secondary" data-route-prev ${state.routeStage===0?'disabled':''}>← Предыдущий этап</button><button class="primary" data-route-save>${state.routeStage===ROUTE.length-1?'Собрать карту →':'Сохранить и дальше →'}</button></div></section>`,`Мой профессиональный маршрут`);}

function psychDashboard(){const items=attentionItems();return shell(`<div class="summary-strip"><div class="metric"><small>Нужно внимание</small><strong>${items.length}</strong></div><div class="metric"><small>Ближайшие разборы</small><strong>2</strong></div><div class="metric"><small>Идут по маршруту</small><strong>7</strong></div><div class="metric"><small>На внешней проверке</small><strong>3</strong></div></div><section class="section"><div class="section-head"><div><h3>Кому нужно внимание</h3><p>Не список всех клиентов, а ситуации, где требуется решение специалиста.</p></div><button class="secondary" data-psych-nav="clients">Все клиенты</button></div><div class="grid2">${items.map(renderAttention).join('')}</div></section><section class="section"><div class="section-head"><div><h3>Ближайшие консультации</h3><p>Короткая подготовка вместо просмотра всей истории.</p></div></div><div class="grid2"><article class="card attention success"><div class="meta">Сегодня · 17:00</div><h4>Анна К.</h4><p>Фокус: собрать 2–3 профессиональные гипотезы. С прошлого раза выделила 5 повторяющихся задач и получила внешний отклик от бывшей коллеги.</p><div class="card-actions"><button class="secondary" data-client="anna">Открыть подготовку →</button></div></article><article class="card"><div class="meta">Завтра · 11:30</div><h4>Елена М.</h4><p>Фокус: возвращение после перерыва. Нужна проверка ограничений по графику и допустимому уровню риска.</p><div class="card-actions"><button class="secondary" data-client="elena">Открыть подготовку →</button></div></article></div></section>`,`Сегодня в работе`,'Кабинет карьерного психолога');}

function attentionItems(){const list=[
 {id:'olga',kind:'warn',meta:'4 дня без отметки',name:'Ольга С.',text:'Эксперимент был назначен, но результата пока нет. Стоит понять: не подошёл шаг, не хватило ресурса или вмешались реальные ограничения.',action:'Посмотреть контекст'},
 {id:'irina',kind:'',meta:'Новый разбор',name:'Ирина П.',text:'Завершила короткий скрининг. Ведущая тема — опыт трудно собрать в понятную роль. Есть готовность к персональному разбору.',action:'Открыть сводку'}
 ];
 if(state.sent&&state.result)list.unshift({id:'demo-user',kind:'success',meta:'Только что',name:'Новое обращение из публичного маршрута',text:state.result.title+' '+state.result.resource,action:'Открыть сводку'});
 return list;
}
function renderAttention(x){return `<article class="card attention ${x.kind||''}"><div class="meta">${esc(x.meta)}</div><h4>${esc(x.name)}</h4><p>${esc(x.text)}</p><div class="card-actions"><button class="secondary" data-client="${x.id}">${esc(x.action)} →</button></div></article>`;}

function psychClients(){const cards=[
 ['anna','Анна К.','В работе','Собирает профессиональные гипотезы · консультация сегодня'],
 ['olga','Ольга С.','Нужно внимание','Эксперимент без отметки 4 дня'],
 ['irina','Ирина П.','Новый разбор','Опыт трудно собрать в понятную роль'],
 ['elena','Елена М.','В работе','Возвращение после перерыва · консультация завтра']
 ];return shell(`<section class="section" style="margin-top:0"><div class="section-head"><div><h3>Клиенты</h3><p>Полный список — вторичный слой. Главный рабочий экран остаётся очередью внимания.</p></div></div><div class="grid2">${cards.map(c=>`<article class="card"><div class="meta">${esc(c[2])}</div><h4>${esc(c[1])}</h4><p>${esc(c[3])}</p><div class="card-actions"><button class="secondary" data-client="${c[0]}">Профиль →</button></div></article>`).join('')}</div></section>`,`Клиенты`,'Кабинет карьерного психолога');}

function clientBrief(id){let name='Клиент',request='Профессиональный тупик',summary='';let resource='';let next='';let questions=[];
 if(id==='demo-user'&&state.result){name='Новое обращение';request=state.result.title;summary=state.result.text;resource=state.result.resource;next=state.result.experiment;questions=['Что изменилось в профессиональной ситуации за последние 6–12 месяцев?','Какой риск человек считает недопустимым?','Какой факт опыта сильнее всего противоречит его негативному выводу о себе?'];}
 else if(id==='anna'){name='Анна К.';request='Хочу понять, как назвать новую профессиональную роль без обнуления прошлого опыта.';summary='Собрала 5 повторяющихся задач из разных проектов. Внешняя обратная связь подтверждает сильную сторону: структурировать сложный материал и доводить до понятного результата.';resource='Есть повторяющийся тип задач и подтверждение от другого человека.';next='На встрече собрать 2–3 гипотезы роли и определить, что нужно проверить по каждой.';questions=['Какие задачи повторяются независимо от места работы?','Что в этих задачах приносит энергию, а что истощает?','Какой рынок/контекст даст быструю внешнюю проверку?'];}
 else if(id==='olga'){name='Ольга С.';request='Хочу сменить работу, но постоянно откладываю реальные проверки.';summary='Выбрала внешний эксперимент, но 4 дня нет отметки. До этого много училась и сравнивала направления.';resource='Есть готовая гипотеза для проверки, но шаг не состоялся.';next='Не усиливать давление. Выяснить функцию откладывания и уменьшить эксперимент до безопасного размера.';questions=['Что произошло в момент, когда нужно было сделать внешний шаг?','Какой исход эксперимента кажется наиболее неприятным?','Можно ли уменьшить проверку до 15–20 минут без потери смысла?'];}
 else if(id==='irina'){name='Ирина П.';request='Много опыта, но не понимаю, что из этого вообще можно продавать или предлагать.';summary='В коротком разборе несколько раз обесценила задачи, которые другие считают сложными. Есть богатый разнородный опыт.';resource='Люди регулярно обращаются к ней за помощью в организации и объяснении сложного.';next='Собрать факты опыта до разговора о названиях профессий.';questions=['За какими задачами к вам приходят повторно?','Какие результаты можно подтвердить фактами?','Что вы считаете «слишком простым», хотя другим это даётся трудно?'];}
 else {name='Елена М.';request='Возвращаюсь к работе после перерыва и боюсь не выдержать прежний темп.';summary='Есть профессиональный опыт, но маршрут ограничен графиком и ресурсом. Важно не подталкивать к старому формату работы как единственной норме.';resource='Хорошо видит реальные ограничения и может описать допустимый формат.';next='Сформировать критерии подходящей работы и один безопасный тест рынка.';questions=['Какой график реалистичен сейчас?','Что из прежнего опыта хочется сохранить?','Какой минимальный внешний тест не требует полной готовности?'];}
 return shell(`<section class="panel client-brief"><div class="brief-top"><div><div class="eyebrow">Краткая сводка</div><h2>${esc(name)}</h2><p>${esc(request)}</p></div><button class="secondary" data-psych-home>← К очереди внимания</button></div><div class="brief-grid"><div class="brief-box"><strong>Что сейчас происходит</strong><p>${esc(summary)}</p></div><div class="brief-box"><strong>На что можно опереться</strong><p>${esc(resource)}</p></div><div class="brief-box"><strong>Что уточнить на встрече</strong><p>${questions.map((q,i)=>`${i+1}. ${esc(q)}`).join('<br>')}</p></div><div class="brief-box"><strong>Следующий профессиональный шаг</strong><p>${esc(next)}</p></div></div><div class="hero-actions" style="margin-top:18px"><button class="primary" data-toast="Фокус встречи зафиксирован">Подготовить встречу →</button><button class="secondary" data-toast="Клиент оставлен в очереди контроля">Оставить на контроле</button></div></section>`,`Профиль клиента`,'Кабинет карьерного психолога');}

function psychArchive(){return shell(`<section class="panel empty"><h2>Архив — вторичный слой</h2><p>Здесь будут завершённые и поставленные на паузу маршруты. В рабочем MVP архив не конкурирует с экраном «Кому нужно внимание».</p><button class="secondary" data-psych-home>Вернуться сегодня</button></section>`,`Архив`,'Кабинет карьерного психолога');}

function render(){let html='';if(state.role==='client'){if(state.screen==='home')html=clientHome();else if(state.screen==='screening')html=screening();else if(state.screen==='result')html=result();else if(state.screen==='route')html=routeScreen();else html=today();}else{if(state.selectedClient)html=clientBrief(state.selectedClient);else if(state.psychView==='clients')html=psychClients();else if(state.psychView==='archive')html=psychArchive();else html=psychDashboard();}$('#app').innerHTML=html;bind();window.scrollTo({top:0,behavior:'instant'});}

function bind(){
 document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
 document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.onclick=()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
 document.querySelectorAll('[data-text-toggle]').forEach(b=>b.onclick=cycleText);
 document.querySelectorAll('[data-start-screening]').forEach(b=>b.onclick=()=>{state.screen='screening';state.q=0;save();render();});
 const how=$('[data-show-how]');if(how)how.onclick=()=>$('#how')?.scrollIntoView({behavior:'smooth'});
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const q=QUESTIONS[state.q];state.answers[q.id]=b.dataset.answer;save();render();});
 const qnext=$('[data-q-next]');if(qnext)qnext.onclick=()=>{const q=QUESTIONS[state.q];if(!state.answers[q.id])return;if(state.q<QUESTIONS.length-1){state.q++;save();render();}else{scoreResult();render();}};
 const qback=$('[data-q-back]');if(qback)qback.onclick=()=>{if(state.q>0){state.q--;save();render();}else{state.screen='home';save();render();}};
 document.querySelectorAll('[data-full-route],[data-route-continue],[data-route-open]').forEach(b=>b.onclick=()=>{state.screen='route';save();render();});
 const viewResult=$('[data-view-result]');if(viewResult)viewResult.onclick=()=>{state.screen='result';save();render();};
 const send=$('[data-send-psych]');if(send)send.onclick=()=>{state.sent=true;save();toast('Краткая сводка добавлена в очередь внимания психолога');render();};
 document.querySelectorAll('[data-open-route]').forEach(x=>x.onclick=()=>{state.routeStage=Number(x.dataset.openRoute)||0;state.screen='route';save();render();});
 document.querySelectorAll('[data-route-field]').forEach(x=>x.oninput=()=>{const key=currentRouteStep()[0];state.routeAnswers[key]=state.routeAnswers[key]||['',''];state.routeAnswers[key][Number(x.dataset.routeField)]=x.value;save();});
 const rprev=$('[data-route-prev]');if(rprev)rprev.onclick=()=>{if(state.routeStage>0){state.routeStage--;save();render();}};
 const rsave=$('[data-route-save]');if(rsave)rsave.onclick=()=>{if(state.routeStage<ROUTE.length-1){state.routeStage++;state.screen='route';save();render();}else{state.screen='today';save();toast('Карта маршрута сохранена');render();}};
 document.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>{state.screen=state.result?'today':'home';save();render();});
 document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{if(state.screen==='screening'){if(state.q>0)state.q--;else state.screen='home';}else if(state.screen==='route'){if(state.routeStage>0)state.routeStage--;else state.screen='result';}else if(state.screen==='result')state.screen='today';else state.screen='home';save();render();});
 document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{if(!state.result){state.screen='screening';}else if(state.screen==='result'||state.screen==='today'){state.screen='route';}else if(state.screen==='route'&&state.routeStage<ROUTE.length-1){state.routeStage++;}else{state.screen='today';}save();render();});
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{const id=b.dataset.nav;if(state.role==='client'){state.screen=id==='today'?(state.result?'today':'home'):id==='route'?'route':'result';}else state.psychView=id;state.selectedClient=null;save();render();});
 document.querySelectorAll('[data-psych-nav]').forEach(b=>b.onclick=()=>{state.psychView=b.dataset.psychNav;state.selectedClient=null;save();render();});
 document.querySelectorAll('[data-client]').forEach(b=>b.onclick=()=>{state.selectedClient=b.dataset.client;save();render();});
 document.querySelectorAll('[data-psych-home]').forEach(b=>b.onclick=()=>{state.selectedClient=null;state.psychView='attention';save();render();});
 document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.toast));
}

initAppearance();render();
})();