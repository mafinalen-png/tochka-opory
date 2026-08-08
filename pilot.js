/* Точка опоры v12 — пилот реального рабочего цикла психолог ↔ клиент.
   Расширяет v8, не ломая существующую клиентскую базу. */

const PILOT_STAGES = [
  {n:1,title:'Где я сейчас',result:'Рабочее описание ситуации без преждевременного решения'},
  {n:2,title:'Что удерживает',result:'Ведущий барьер и цена сохранения текущего положения'},
  {n:3,title:'Что уже есть',result:'Опыт, компетенции и опоры, которые нельзя обнулить'},
  {n:4,title:'Куда можно двигаться',result:'2–3 реалистичных направления вместо одного «идеального» ответа'},
  {n:5,title:'Что стоит проверить',result:'Одна проверяемая рабочая гипотеза'},
  {n:6,title:'Эксперимент на 72 часа',result:'Маленькое обратимое действие и критерий наблюдения'},
  {n:7,title:'План на 30 дней',result:'Последовательность проверок, а не обещание окончательного выбора'}
];

const SCENARIO_GUIDE = {
  hire:{
    when:'Клиент уже работает в найме и думает о смене роли, компании, формата или уходе.',
    aim:'Отделить проблему профессии от проблемы места работы и не превращать неудовлетворённость в автоматическое «увольняться».',
    traps:['Поляризация «остаться или уйти»','Сравнение вакансий до определения обязательных условий','Игнорирование финансовой цены перехода'],
    opening:['Если убрать один самый тяжёлый фактор нынешней работы, вы бы всё равно хотели уйти?','Что вы хотите изменить, а что обязательно сохранить?']
  },
  return:{
    when:'Возвращение после декрета, ухода за близкими, переезда, болезни, длительного перерыва или выпадения из рынка.',
    aim:'Вернуть профессиональную субъектность в темпе, который выдерживает реальная жизнь.',
    traps:['Требование сразу выйти на прежний уровень','Обесценивание опыта, полученного до перерыва','Бесплатная работа как способ «заслужить право вернуться»'],
    opening:['Что для вас сейчас важнее: доход, профессиональная идентичность или понимание направления?','Какой темп возвращения не разрушит остальную жизнь?']
  },
  freelance:{
    when:'Фрилансер, частный практик или специалист с проектной занятостью: мало заказов, низкая цена, перегрузка, размытые границы.',
    aim:'Найти одно системное узкое место, а не лечить всю практику одновременно.',
    traps:['Совет «больше продвигаться» без диагностики узкого места','Цена без расчёта времени','Смешение страха отказа и реальных требований клиента'],
    opening:['Где именно теряются деньги или силы: до сделки, во время работы или после?','Что в проектах повторяется настолько часто, что уже похоже на систему?']
  },
  experienced:{
    when:'Опытный специалист, в том числе 45+, меняет формат, сферу или роль и не хочет обнулить профессиональный капитал.',
    aim:'Перенести опыт в новый контекст без возрастных стереотипов и без резкого падения дохода/статуса.',
    traps:['Объяснять трудности возрастом без фактов','Начинать с переобучения до инвентаризации капитала','Предлагать долгую траекторию при коротком финансовом горизонте'],
    opening:['Что из вашего опыта должно перейти с вами в следующий этап?','Что в новой роли должно стать легче, а не просто «современнее»?']
  },
  expert:{
    when:'Эксперт, консультант или практик хочет упаковать опыт в услугу, программу, группу или пилот.',
    aim:'Перевести знания в наблюдаемый результат для конкретного клиента и проверить спрос малым пилотом.',
    traps:['Создавать продукт до подтверждения проблемы','Обещать результат шире имеющихся кейсов','Автоматизировать то, что ещё не стало повторяемым'],
    opening:['За какой конкретный результат вам уже платили или благодарили?','Что можно проверить вручную до создания курса или приложения?']
  }
};

const PSYCH_HINTS = {
  hire:{
    problem:{listen:'Слышит ли клиент проблему в профессии, роли, компании или условиях — это разные маршруты.',ask:'«Если этот фактор исчезнет завтра, что останется причиной для смены?»',caution:'Не подтверждайте решение об увольнении до проверки альтернатив.'},
    tried:{listen:'Какие попытки были реальными экспериментами, а какие — только размышлениями.',ask:'«Что именно вы сделали и какой наблюдаемый результат получили?»',caution:'Не повторяйте совет, который уже был проверен без эффекта.'},
    protect:{listen:'Это фактическое ограничение или тревожный сценарий, который можно уточнить цифрами.',ask:'«Какой минимум здесь действительно обязателен?»',caution:'Не предлагайте шаг, нарушающий базовую безопасность клиента.'},
    preserve:{listen:'Что клиент хочет забрать с собой из текущей работы — это часть будущего решения.',ask:'«Что из нынешней работы вы бы сохранили даже в идеальном варианте?»',caution:'Не обнуляйте весь опыт вместе с недовольством.'},
    time:{listen:'Размер шага должен соответствовать энергии, времени и напряжению.',ask:'«Что вы точно сможете сделать, даже если неделя окажется тяжёлой?»',caution:'Лучше маленький завершённый эксперимент, чем большой план без действия.'}
  },
  return:{
    priority:{listen:'Главная потребность: деньги, идентичность, социальный контакт или выбор направления.',ask:'«Что должно измениться в ближайшие две недели, чтобы вы сказали: я возвращаюсь?»',caution:'Не подменяйте запрос клиента социальной нормой «пора выходить».'},
    time:{listen:'Реальный ритм дня, а не желаемая продуктивность.',ask:'«Какие окна времени повторяются хотя бы три раза в неделю?»',caution:'План, который не помещается в режим семьи, почти наверняка станет источником вины.'},
    protect:{listen:'Что делает возвращение безопасным и устойчивым.',ask:'«Что нельзя принести в жертву ради работы?»',caution:'Не романтизируйте перегрузку как доказательство мотивации.'},
    resource:{listen:'Называет ли клиент результаты и компетенции или только обязанности.',ask:'«Где вы уже решали похожую задачу, даже если это было давно?»',caution:'Не принимайте «у меня ничего нет» как факт — исследуйте доказательства.'},
    step:{listen:'Готовность к контакту с рынком без чрезмерной ставки.',ask:'«Какой шаг даст информацию, но не потребует сразу принять решение?»',caution:'Первый эксперимент должен быть обратимым.'}
  },
  freelance:{
    stage:{listen:'Есть ли уже доказанный спрос и повторяемость.',ask:'«Сколько оплаченных проектов было за последние 3 месяца?»',caution:'Не давайте советы по масштабированию до определения стадии.'},
    bottleneck:{listen:'Где теряется результат: лиды, продажа, цена, производство, повторные клиенты или границы.',ask:'«Если исправить только одно место, что сильнее всего повлияет на доход или нагрузку?»',caution:'Не лечите маркетингом проблему низкой цены или размытых границ.'},
    duration:{listen:'Фактическая, а не декларируемая себестоимость времени.',ask:'«Что ещё входит в заказ кроме основной работы: переписка, правки, подготовка?»',caution:'Цена без времени даёт ложное ощущение экономики.'},
    repeat:{listen:'Повторяющийся клиент, задача или результат — потенциальная специализация.',ask:'«За чем к вам возвращаются чаще всего?»',caution:'Не упаковывайте случайный заказ как устойчивую нишу.'},
    experiment:{listen:'Готовность проверить одно изменение без полной перестройки бизнеса.',ask:'«Какой результат через 72 часа будет считаться полезной информацией?»',caution:'Эксперимент должен проверять гипотезу, а не доказывать самоценность специалиста.'}
  },
  experienced:{
    reason:{listen:'Что запускает переход: внешнее событие, истощение, потолок, интерес или жизненные изменения.',ask:'«Что будет происходить, если ничего не менять ещё год?»',caution:'Возраст сам по себе не является объяснением трудности.'},
    horizon:{listen:'Сколько времени есть до необходимости стабильного дохода.',ask:'«Какой финансовый срок нельзя пересечь?»',caution:'Долгая переподготовка может быть несовместима с горизонтом клиента.'},
    protect:{listen:'Профессиональный капитал, который должен пережить переход.',ask:'«Что вы не готовы доказывать заново с нуля?»',caution:'Не предлагайте «начать сначала», если можно перенести капитал.'},
    tech:{listen:'Конкретный цифровой разрыв, а не стереотип о поколении.',ask:'«Какой инструмент реально мешает выполнять нужную работу?»',caution:'Не превращайте цифровую неуверенность в общую оценку компетентности.'},
    format:{listen:'Нагрузка, автономия, здоровье, график и социальная роль.',ask:'«Как должен выглядеть обычный рабочий вторник в подходящем варианте?»',caution:'Название должности менее важно, чем жизнеспособный формат.'}
  },
  expert:{
    stage:{listen:'Есть ли практика, повторяемость и реальный клиентский запрос.',ask:'«Что уже происходит без продукта — за чем к вам приходят сейчас?»',caution:'Не начинайте с платформы, курса или AI, если не проверена услуга.'},
    paid:{listen:'За какой результат люди фактически обменивали деньги или обязательство.',ask:'«Что изменилось у клиента после вашей работы?»',caution:'Оплата за время не всегда показывает, какой результат ценится.'},
    evidence:{listen:'Повторяемость результата и качество доказательств.',ask:'«Какие 2–3 кейса действительно похожи друг на друга?»',caution:'Не расширяйте обещание за пределы фактов.'},
    audience:{listen:'Есть ли доступ к людям, у которых можно проверить проблему.',ask:'«Кому можно написать сегодня без рекламы и сложной воронки?»',caution:'Без аудитории пилот превращается в разработку в вакууме.'},
    manual:{listen:'Какая доля ручной работы нужна для качества и безопасности.',ask:'«Что вы пока не готовы отдавать алгоритму или шаблону?»',caution:'Не автоматизируйте профессиональное решение, которое требует контекста.'}
  }
};

function normalizePilotData(){
  if(!Array.isArray(data.assignments)) data.assignments=[];
  if(!Array.isArray(data.checkins)) data.checkins=[];
  if(!Array.isArray(data.preparations)) data.preparations=[];
  if(!Array.isArray(data.clientIntakes)) data.clientIntakes=[];
  if(!data.clientDrafts || typeof data.clientDrafts!=='object') data.clientDrafts={};
  if(data.clientFlowVersion!==12){data.assignments=data.assignments.filter(a=>!(a.source==='demo'&&a.clientId==='client_anna'&&a.title==='Два интервью без продажи'));data.clientFlowVersion=12;saveData();}
  if(!data.pilotSeeded){
    const anna=clientById('client_anna'), olga=clientById('client_olga');
    if(olga) data.assignments.push({id:uid('as'),clientId:olga.id,title:'Три доказательства опыта',prompt:'Опишите три ситуации по схеме: задача → что сделали → что изменилось. Не редактируйте под резюме, пока просто собираем факты.',deadline:isoOffset(6),createdAt:todayISO(),status:'done',response:'Нашла три случая: конфликт с родителями ученика, запуск нового кружка и адаптация программы для слабой группы. Увидела, что везде была не просто «обязанность», а решение.',completedAt:todayISO(),scenario:'return',source:'demo'});
    data.pilotSeeded=true;
    saveData();
  }
}
normalizePilotData();

function activeAssignments(clientId){return data.assignments.filter(a=>a.clientId===clientId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));}
function clientCheckins(clientId){return data.checkins.filter(x=>x.clientId===clientId).sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
function clientPreparations(clientId){return data.preparations.filter(x=>x.clientId===clientId).sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
function latestAssessment(clientId){return clientAssessments(clientId)[0]||null;}
function latestSession(clientId){return clientSessions(clientId)[0]||null;}
function currentPilotStage(c){const completed=activeAssignments(c.id).filter(a=>a.status==='done').length;const intake=data.clientIntakes?.find(x=>x.clientId===c.id);if(!intake||!latestAssessment(c.id))return 1;return Math.max(2,Math.min(7,2+completed));}

// --- UI injection: role switch, guide nav, assignment modal ---
(function injectPilotUI(){
  const nav=document.querySelector('.main-nav');
  if(nav&&!nav.querySelector('[data-view="guide"]')){
    const btn=document.createElement('button');btn.dataset.view='guide';btn.innerHTML='<span class="nav-icon">?</span><span>Подсказки психолога</span>';nav.appendChild(btn);
    btn.addEventListener('click',()=>{pilotRole='psychologist';ui.view='guide';renderView();window.scrollTo({top:0,behavior:'smooth'});});
  }
  const actions=document.querySelector('.topbar-actions');
  if(actions&&!document.getElementById('pilotRoleSwitch')){
    const role=document.createElement('div');role.id='pilotRoleSwitch';role.className='role-switch';role.innerHTML='<button id="psychRoleButton" class="active">Психолог</button><button id="clientRoleButton">Клиент</button>';
    actions.insertBefore(role,actions.firstChild);
  }
  const modal=document.createElement('div');modal.className='modal';modal.id='assignmentModal';modal.setAttribute('aria-hidden','true');modal.innerHTML=`
    <div class="modal-backdrop" data-pilot-close></div>
    <section class="modal-dialog medium" role="dialog" aria-modal="true" aria-labelledby="assignmentModalTitle">
      <button class="modal-close" data-pilot-close aria-label="Закрыть">×</button>
      <span class="section-label">Между сессиями</span><h2 id="assignmentModalTitle">Назначить клиенту шаг</h2>
      <form id="assignmentForm" class="form-grid">
        <input type="hidden" name="clientId" /><input type="hidden" name="scenario" />
        <label class="full"><span>Название</span><input name="title" required maxlength="180" placeholder="Например: Проверить одну рабочую гипотезу" /></label>
        <label class="full"><span>Инструкция клиенту</span><textarea name="prompt" rows="5" maxlength="1800" required placeholder="Что сделать, на что обратить внимание и что принести на следующую встречу"></textarea></label>
        <label><span>Срок</span><input name="deadline" type="date" /></label>
        <label><span>Связано со сценарием</span><input name="scenarioLabel" disabled /></label>
        <div class="form-actions full"><button type="button" class="quiet-button" data-pilot-close>Отмена</button><button class="primary-button" type="submit">Назначить</button></div>
      </form>
    </section>`;
  document.body.appendChild(modal);
  document.querySelectorAll('[data-pilot-close]').forEach(b=>b.addEventListener('click',()=>closeModal('#assignmentModal')));
})();

function openAssignmentForm(clientId=activeClient()?.id,prefill={}){
  const c=clientById(clientId);if(!c){toast('Сначала выберите клиента');return;}
  const f=document.getElementById('assignmentForm');f.reset();
  f.elements.clientId.value=c.id;f.elements.scenario.value=prefill.scenario||'';
  f.elements.scenarioLabel.value=prefill.scenario?(scenarios[prefill.scenario]?.title||''):'Без сценария';
  f.elements.title.value=prefill.title||'';f.elements.prompt.value=prefill.prompt||'';f.elements.deadline.value=prefill.deadline||isoOffset(3);
  document.getElementById('assignmentModalTitle').textContent=`Шаг для ${c.name}`;openModal('#assignmentModal');
}

document.getElementById('assignmentForm').addEventListener('submit',e=>{
  e.preventDefault();const fd=Object.fromEntries(new FormData(e.currentTarget));
  data.assignments.unshift({id:uid('as'),clientId:fd.clientId,title:fd.title.trim(),prompt:fd.prompt.trim(),deadline:fd.deadline,createdAt:todayISO(),status:'assigned',response:'',completedAt:'',scenario:fd.scenario||'',source:'psychologist'});
  saveData();closeModal('#assignmentModal');toast('Шаг появился в кабинете клиента');renderView();
});

// --- Role switch ---
let pilotRole='psychologist';
function setPilotRole(role){
  pilotRole=role==='client'?'client':'psychologist';
  document.body.classList.toggle('client-mode',pilotRole==='client');
  document.getElementById('psychRoleButton')?.classList.toggle('active',pilotRole==='psychologist');
  document.getElementById('clientRoleButton')?.classList.toggle('active',pilotRole==='client');
  if(pilotRole==='client'){ui.view='clientPortal';renderView();}
  else {if(ui.view==='clientPortal')ui.view='client';renderView();}
}
document.getElementById('psychRoleButton')?.addEventListener('click',()=>setPilotRole('psychologist'));
document.getElementById('clientRoleButton')?.addEventListener('click',()=>setPilotRole('client'));

// --- Extend core renderers ---
const _refreshChrome=refreshChrome;
refreshChrome=function(){
  _refreshChrome();
  document.body.classList.toggle('client-mode',pilotRole==='client');
  if(pilotRole==='client'){
    document.getElementById('pageEyebrow').textContent='Моё пространство';
    document.getElementById('globalSearch').closest('.topbar-search')?.classList.add('pilot-hidden');
    document.getElementById('quickAddSession')?.classList.add('pilot-hidden');
    document.getElementById('quickAddClient')?.classList.add('pilot-hidden');
  } else {
    document.getElementById('globalSearch').closest('.topbar-search')?.classList.remove('pilot-hidden');
    document.getElementById('quickAddSession')?.classList.remove('pilot-hidden');
    document.getElementById('quickAddClient')?.classList.remove('pilot-hidden');
  }
};

const _renderView=renderView;
renderView=function(){
  if(ui.view==='clientPortal') renderClientPortal(document.getElementById('viewRoot'));
  else if(ui.view==='guide') renderPsychologistGuide(document.getElementById('viewRoot'));
  else _renderView();
  refreshChrome();
};

const _renderDashboard=renderDashboard;
renderDashboard=function(root){_renderDashboard(root);appendPilotDashboard(root);};

const _renderClientTab=renderClientTab;
renderClientTab=function(c,sessions,goals,assess){_renderClientTab(c,sessions,goals,assess);if(ui.clientTab==='overview')appendBetweenSessions(c);if(ui.clientTab==='plan')appendAssignmentsToPlan(c);};

function appendPilotDashboard(root){
  const completed=data.assignments.filter(a=>a.status==='done').sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||'')).slice(0,4);
  const preps=[...data.preparations].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const section=document.createElement('section');section.className='pilot-workflow';section.innerHTML=`
    <div class="panel pilot-onboarding"><div class="panel-head"><div><span class="section-label">Пилотный прогон</span><h2>Проверьте полный цикл за 10 минут</h2></div><span class="pilot-chip">v10</span></div>
      <div class="pilot-steps"><button data-pilot-action="open-demo"><b>1</b><span>Откройте демо-клиента</span></button><button data-pilot-action="demo-assessment"><b>2</b><span>Проведите 5 вопросов</span></button><button data-pilot-action="client-preview"><b>3</b><span>Посмотрите кабинет клиента</span></button><button data-pilot-action="guide"><b>4</b><span>Откройте подсказки</span></button></div>
      <p class="pilot-footnote">Для пилота используйте обезличенные данные. Эта версия проверяет рабочий сценарий и интерфейс; это ещё не защищённая серверная медицинская/психологическая информационная система.</p>
    </div>
    <div class="dashboard-lower pilot-feed-grid">
      <section class="panel"><div class="panel-head"><div><span class="section-label">Между сессиями</span><h2>Ответы клиентов</h2></div></div>${completed.length?completed.map(a=>{const c=clientById(a.clientId);return `<article class="pilot-feed-item"><div><strong>${esc(c?.name||'Клиент')}</strong><p>${esc(a.title)}</p><small>${esc(truncate(a.response||'Задание отмечено выполненным',150))}</small></div><button class="text-button" data-pilot-action="open-client" data-client="${a.clientId}">Открыть</button></article>`}).join(''):'<div class="empty-state"><p>Здесь появятся выполненные задания клиента.</p></div>'}</section>
      <section class="panel"><div class="panel-head"><div><span class="section-label">Перед встречей</span><h2>Что клиент хочет обсудить</h2></div></div>${preps.length?preps.map(p=>{const c=clientById(p.clientId);return `<article class="pilot-feed-item"><div><strong>${esc(c?.name||'Клиент')}</strong><p>${esc(p.focus||'Фокус не указан')}</p><small>${esc(truncate(p.stuck||p.changed||'',150))}</small></div><button class="text-button" data-pilot-action="open-client" data-client="${p.clientId}">Карточка</button></article>`}).join(''):'<div class="empty-state"><p>Подготовка клиента к сессии появится здесь.</p></div>'}</section>
    </div>`;
  root.appendChild(section);
}

function appendBetweenSessions(c){
  const root=document.getElementById('clientTabRoot');if(!root)return;
  const assignments=activeAssignments(c.id),check=clientCheckins(c.id)[0],prep=clientPreparations(c.id)[0],intake=data.clientIntakes?.find(x=>x.clientId===c.id)||null;
  const box=document.createElement('section');box.className='panel between-panel';
  const intakeBlock=intake?`<section class="pilot-intake-card"><div class="pilot-intake-head"><div><small>СТАРТОВАЯ ПОДГОТОВКА КЛИЕНТА</small><strong>${esc(scenarios[intake.scenario]?.title||'Ситуация не выбрана')}</strong></div><button class="primary-button compact" data-pilot-action="start-intake-assessment" data-scenario="${intake.scenario}" data-client="${c.id}">Провести сессию по этому сценарию</button></div><div class="pilot-intake-grid"><article><span>Что хочет изменить</span><p>${esc(intake.goal||'—')}</p></article><article><span>Что уже пробовал(а)</span><p>${esc(intake.tried||'—')}</p></article><article><span>Что мешает / тревожит</span><p>${esc(intake.concern||'—')}</p></article><article><span>Что важно сохранить</span><p>${esc(intake.preserve||'—')}</p></article></div><details class="pilot-intake-details"><summary>Предварительные ответы клиента на 5 вопросов</summary>${(questionSets[intake.scenario]||[]).map(q=>`<div><span>${esc(q.title)}</span><strong>${esc(label(intake.scenario,q.key,intake.answers[q.key])||'—')}</strong></div>`).join('')}</details></section>`:`<div class="pilot-intake-empty"><strong>Клиент ещё не прошёл стартовую подготовку.</strong><p>Откройте его пространство и пройдите первый вход глазами клиента.</p></div>`;
  box.innerHTML=`
    <div class="panel-head"><div><span class="section-label">Данные от клиента</span><h2>Что клиент принёс в работу</h2><p>Стартовая подготовка, выполненные шаги и предсессионные ответы — без внутренних заметок психолога.</p></div><div class="panel-actions"><button class="quiet-button" data-pilot-action="assign" data-client="${c.id}">＋ Назначить шаг</button><button class="primary-button" data-pilot-action="client-preview" data-client="${c.id}">Открыть глазами клиента</button></div></div>
    ${intakeBlock}
    <div class="pilot-summary-grid"><article><small>Задания</small><strong>${assignments.filter(a=>a.status==='done').length}/${assignments.length}</strong><p>${assignments[0]?esc(truncate(assignments[0].title,80)):'Пока нет'}</p></article><article><small>Последний check-in</small><strong>${check?`ясность ${check.clarity}/10`:'—'}</strong><p>${check?`энергия ${check.energy} · уверенность ${check.confidence} · напряжение ${check.tension}`:'Клиент ещё не заполнял'}</p></article><article><small>К следующей встрече</small><strong>${prep?esc(truncate(prep.focus||'Есть подготовка',55)):'—'}</strong><p>${prep?esc(truncate(prep.stuck||prep.changed||'',95)):'Подготовка ещё не заполнена'}</p></article></div>
    ${assignments.slice(0,4).map(a=>`<article class="assignment-row ${a.status==='done'?'done':''}"><span>${a.status==='done'?'✓':'○'}</span><div><strong>${esc(a.title)}</strong><p>${esc(a.prompt)}</p>${a.response?`<blockquote>${esc(a.response)}</blockquote>`:''}</div><small>${a.deadline?shortDate(a.deadline):'без срока'}</small></article>`).join('')||'<div class="empty-state"><p>Назначьте первый маленький проверяемый шаг.</p></div>'}`;
  root.appendChild(box);
}

function appendAssignmentsToPlan(c){
  const root=document.getElementById('clientTabRoot');if(!root)return;const list=activeAssignments(c.id);
  const sec=document.createElement('section');sec.className='panel sessions-panel';sec.style.marginTop='14px';sec.innerHTML=`<div class="panel-head"><div><span class="section-label">Клиентская часть</span><h2>Задания между сессиями</h2></div><button class="primary-button" data-pilot-action="assign" data-client="${c.id}">＋ Назначить</button></div>${list.length?list.map(a=>`<article class="assignment-row ${a.status==='done'?'done':''}"><span>${a.status==='done'?'✓':'○'}</span><div><strong>${esc(a.title)}</strong><p>${esc(a.prompt)}</p>${a.response?`<blockquote>${esc(a.response)}</blockquote>`:''}</div><small>${a.deadline?shortDate(a.deadline):'—'}</small></article>`).join(''):'<div class="empty-state"><p>Заданий пока нет.</p></div>'}`;root.appendChild(sec);
}

// --- Assessment: psychologist cue on every question ---
const _renderAssessmentOverlay=renderAssessmentOverlay;
renderAssessmentOverlay=function(){
  _renderAssessmentOverlay();
  const d=ui.assessmentDraft;if(!d||d.step<0||d.result)return;
  const q=questionSets[d.scenario]?.[d.step],hint=PSYCH_HINTS[d.scenario]?.[q?.key];if(!q||!hint)return;
  const content=document.querySelector('#assessmentBody .assessment-content');if(!content||content.querySelector('.psych-cue-card'))return;
  const chosen=d.answers[q.key];const chosenLabel=chosen?label(d.scenario,q.key,chosen):'';
  const cue=document.createElement('aside');cue.className='psych-cue-card';cue.innerHTML=`<div class="psych-cue-title"><span>Подсказка психологу</span>${chosen?`<b>выбрано: ${esc(chosenLabel)}</b>`:''}</div><div class="psych-cue-grid"><div><small>Слушайте</small><p>${esc(hint.listen)}</p></div><div><small>Уточните</small><p>${esc(hint.ask)}</p></div><div><small>Не спешите</small><p>${esc(hint.caution)}</p></div></div>${chosen?`<div class="answer-reflection"><strong>После выбранного ответа</strong><p>Не интерпретируйте вариант как готовый вывод. Попросите один конкретный пример из последних 3–6 месяцев и проверьте, совпадает ли формулировка клиента с выбранной категорией.</p></div>`:''}`;
  content.appendChild(cue);
};

const _renderAssessmentResult=renderAssessmentResult;
renderAssessmentResult=function(){
  _renderAssessmentResult();const d=ui.assessmentDraft;if(!d?.result)return;
  const actions=document.querySelector('#assessmentBody .panel-actions');if(!actions||document.getElementById('saveAssignAssessment'))return;
  const btn=document.createElement('button');btn.id='saveAssignAssessment';btn.className='primary-button';btn.textContent='Сохранить и назначить шаг клиенту';actions.appendChild(btn);
  btn.addEventListener('click',()=>{
    const item={id:uid('assessment'),clientId:d.clientId,date:todayISO(),scenario:d.scenario,answers:{...d.answers},result:{...d.result},comment:document.getElementById('assessmentComment')?.value.trim()||''};
    data.assessments.push(item);saveData();const pre={scenario:d.scenario,title:`Шаг на 72 часа · ${scenarios[d.scenario].short}`,prompt:d.result.step,deadline:isoOffset(3)};const clientId=d.clientId;closeAssessment();data.activeClientId=clientId;saveData();openAssignmentForm(clientId,pre);ui.view='client';ui.clientTab='assessment';renderView();
  });
};

// --- Psychologist guide ---
function renderPsychologistGuide(root){
  setPage('Методический навигатор','Подсказки психолога');
  const c=activeClient();const last=c?latestAssessment(c.id):null;const activeScenario=last?.scenario||'hire';
  root.innerHTML=`<div class="page-heading"><div><span class="section-label">Не скрипт, а опора для разговора</span><h2>Навигатор психологической сессии</h2><p>Подсказки помогают удерживать логику: ситуация → барьер → ресурс → гипотеза → маленькая проверка. Решение остаётся за психологом и клиентом.</p></div>${c?`<button class="primary-button" data-pilot-action="client-preview" data-client="${c.id}">Посмотреть кабинет ${esc(c.name)}</button>`:''}</div>
    <section class="panel guide-panel"><div class="panel-head"><div><span class="section-label">7 этапов</span><h2>Базовый маршрут «Точка опоры»</h2></div></div><div class="stage-guide">${PILOT_STAGES.map(s=>`<article><b>${s.n}</b><div><strong>${s.title}</strong><p>${s.result}</p></div></article>`).join('')}</div></section>
    <section class="panel guide-panel"><div class="panel-head"><div><span class="section-label">5 разработанных сценариев</span><h2>Выберите рабочий контекст</h2></div></div><div class="guide-scenarios">${Object.entries(scenarios).map(([k,s])=>`<button class="guide-scenario ${k===activeScenario?'active':''}" data-guide-scenario="${k}"><span class="scenario-icon">${s.icon}</span><strong>${esc(s.title)}</strong><p>${esc(SCENARIO_GUIDE[k].when)}</p></button>`).join('')}</div><div id="guideScenarioDetail"></div></section>`;
  renderGuideScenarioDetail(activeScenario);
  root.querySelectorAll('[data-guide-scenario]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-guide-scenario]').forEach(x=>x.classList.toggle('active',x===b));renderGuideScenarioDetail(b.dataset.guideScenario)}));
}

function renderGuideScenarioDetail(key){
  const box=document.getElementById('guideScenarioDetail');if(!box)return;const g=SCENARIO_GUIDE[key],qs=questionSets[key];
  box.innerHTML=`<div class="guide-detail"><div class="guide-aim"><small>Задача психолога</small><strong>${esc(g.aim)}</strong><div class="opening-questions">${g.opening.map(x=>`<span>«${esc(x)}»</span>`).join('')}</div></div><div class="guide-traps"><small>Типичные ловушки</small>${g.traps.map(x=>`<p>→ ${esc(x)}</p>`).join('')}</div></div><div class="guide-question-list">${qs.map((q,i)=>{const h=PSYCH_HINTS[key][q.key];return `<article><b>${i+1}</b><div><strong>${esc(q.title)}</strong><p>${esc(h.listen)}</p><details><summary>Подсказка к вопросу</summary><p><em>Уточнить:</em> ${esc(h.ask)}</p><p><em>Не спешить:</em> ${esc(h.caution)}</p></details></div></article>`}).join('')}</div><div class="panel-actions"><button class="primary-button" data-pilot-action="start-guide-assessment" data-scenario="${key}">Провести этот сценарий с выбранным клиентом</button></div>`;
}

// --- Client journey v12: action-first, not dashboard-first ---
let clientJourneyView='today';

function clientIntake(clientId){return data.clientIntakes.find(x=>x.clientId===clientId)||null;}
function clientDraft(clientId){
  if(!data.clientDrafts[clientId]) data.clientDrafts[clientId]={screen:'welcome',scenario:'',qIndex:0,answers:{},changed:'',tried:'',concern:'',goal:''};
  return data.clientDrafts[clientId];
}
function resetClientDraft(clientId){data.clientDrafts[clientId]={screen:'welcome',scenario:'',qIndex:0,answers:{},changed:'',tried:'',concern:'',goal:''};saveData();}
function scenarioTitle(key){return scenarios[key]?.title||'Персональный маршрут';}
function scenarioShort(key){return scenarios[key]?.short||scenarioTitle(key);}
function clientFirstName(c){return esc((c?.name||'').split(' ')[0]||'');}
function clientNextDate(c){return c.nextSession?fmtDate(c.nextSession):'Дата встречи уточняется';}

function renderClientPortal(root){
  const c=activeClient();if(!c){pilotRole='psychologist';ui.view='clients';_renderView();return;}
  const intake=clientIntake(c.id);
  if(!intake){renderClientStartFlow(root,c);return;}
  renderClientActionSpace(root,c,intake);
}

function renderClientShell(root,c,content,{stepLabel='',progress=0,back=false}={}){
  setPage('Моё пространство',c.name);
  root.innerHTML=`<div class="client-journey-v12">
    <header class="cj-header">
      <div class="cj-brandline"><span class="cj-mark">◎</span><div><strong>Точка опоры</strong><small>ваше пространство психологического сопровождения</small></div></div>
      <div class="cj-person"><span>${esc(c.name)}</span><small>${stepLabel||'Персональный маршрут'}</small></div>
    </header>
    ${progress?`<div class="cj-progress"><span style="width:${progress}%"></span></div>`:''}
    <main class="cj-main">${content}</main>
    <footer class="cj-footer"><span>Пилот</span><p>В тестовой версии данные сохраняются только в этом браузере. Не используйте чувствительные персональные данные.</p></footer>
  </div>`;
  wireClientJourney(root,c);
}

function renderClientStartFlow(root,c){
  const d=clientDraft(c.id);
  const screens=['welcome','scenario','questions','reflection','review'];
  const idx=Math.max(0,screens.indexOf(d.screen));
  const progress=[8,24,42,76,94][idx]||8;
  if(d.screen==='scenario') return renderClientScenarioChoice(root,c,d,progress);
  if(d.screen==='questions') return renderClientSelfCheck(root,c,d,progress);
  if(d.screen==='reflection') return renderClientReflection(root,c,d,progress);
  if(d.screen==='review') return renderClientReview(root,c,d,progress);
  const first=clientFirstName(c);
  renderClientShell(root,c,`<section class="cj-welcome">
      <div class="cj-kicker">ПЕРВЫЙ ВХОД · 5–7 МИНУТ</div>
      <h2>${first?`${first}, `:''}начнём с того, <span>что происходит сейчас</span></h2>
      <p class="cj-lead">Здесь не нужно сразу принимать большое решение. Вы коротко опишете ситуацию, выберете то, что ближе, и подготовите материал для первой встречи с психологом.</p>
      <div class="cj-promise-grid">
        <article><b>01</b><div><strong>Выберете ситуацию</strong><p>Не диагноз — просто контекст, с которого удобнее начать.</p></div></article>
        <article><b>02</b><div><strong>Ответите на 5 вопросов</strong><p>Чтобы психолог не тратил встречу на сбор базовой информации.</p></div></article>
        <article><b>03</b><div><strong>Сформулируете свой запрос</strong><p>Что хочется изменить, что уже пробовали и чего важно не потерять.</p></div></article>
      </div>
      <div class="cj-action-row"><button class="primary-button cj-primary" data-cj-action="start">Начать подготовку →</button><span>Можно остановиться и вернуться позже.</span></div>
      <div class="cj-privacy"><span>◇</span><p><strong>Что увидит психолог:</strong> только ваши ответы, выбранную ситуацию и то, что вы сами отправите. Внутренние заметки психолога в клиентское пространство не выводятся.</p></div>
    </section>`,{stepLabel:'Подготовка к первой встрече',progress});
}

function renderClientScenarioChoice(root,c,d,progress){
  const cards=Object.entries(scenarios).map(([key,s])=>`<button class="cj-scenario-card ${d.scenario===key?'selected':''}" data-cj-scenario="${key}">
    <span class="cj-scenario-icon">${s.icon}</span><div><strong>${esc(s.title)}</strong><p>${esc(SCENARIO_GUIDE[key]?.when||'')}</p></div><i>${d.scenario===key?'✓':'→'}</i>
  </button>`).join('');
  renderClientShell(root,c,`<section class="cj-stage">
    <button class="cj-back" data-cj-action="back-welcome">← Назад</button>
    <div class="cj-kicker">ШАГ 1 ИЗ 3</div><h2>Что сейчас <span>ближе всего к вашей ситуации?</span></h2>
    <p class="cj-lead small">Выберите один вариант. Если подходят два, отметьте тот, который важнее обсудить первым.</p>
    <div class="cj-scenario-list">${cards}</div>
    <div class="cj-action-row end"><button class="primary-button cj-primary" data-cj-action="scenario-next" ${d.scenario?'':'disabled'}>Продолжить →</button></div>
  </section>`,{stepLabel:'Шаг 1 · Ситуация',progress});
}

function renderClientSelfCheck(root,c,d,progress){
  const qs=questionSets[d.scenario]||[];
  if(!qs.length){d.screen='scenario';saveData();return renderClientStartFlow(root,c);}
  const q=qs[Math.min(d.qIndex,qs.length-1)],current=d.answers[q.key]||'';
  const opts=q.options.map(o=>{const value=o[0],text=o[1];return `<button class="cj-answer ${current===value?'selected':''}" data-cj-answer="${esc(value)}"><span>${current===value?'●':'○'}</span><div><strong>${esc(text)}</strong></div></button>`}).join('');
  const pct=30+Math.round(((d.qIndex+1)/qs.length)*34);
  renderClientShell(root,c,`<section class="cj-stage cj-question-stage">
    <div class="cj-question-meta"><button class="cj-back" data-cj-action="question-back">← Назад</button><span>${d.qIndex+1} / ${qs.length}</span></div>
    <div class="cj-kicker">ШАГ 2 ИЗ 3 · ${esc(scenarioShort(d.scenario)).toUpperCase()}</div>
    <h2>${esc(q.title)}</h2>${q.help?`<p class="cj-lead small">${esc(q.help)}</p>`:''}
    <div class="cj-answer-list">${opts}</div>
    <div class="cj-action-row between"><small>Нет «правильного» ответа. Выберите наиболее близкий.</small><button class="primary-button cj-primary" data-cj-action="question-next" ${current?'':'disabled'}>${d.qIndex===qs.length-1?'К своим словам →':'Дальше →'}</button></div>
  </section>`,{stepLabel:`Шаг 2 · Вопрос ${d.qIndex+1} из ${qs.length}`,progress:pct});
}

function renderClientReflection(root,c,d,progress){
  renderClientShell(root,c,`<section class="cj-stage">
    <button class="cj-back" data-cj-action="reflection-back">← К вопросам</button>
    <div class="cj-kicker">ШАГ 3 ИЗ 3</div><h2>Теперь — <span>вашими словами</span></h2>
    <p class="cj-lead small">Коротко. Эти ответы психолог увидит до встречи.</p>
    <form id="cjReflectionForm" class="cj-reflection-form">
      <label><span>Что вы хотите изменить в ближайшие 1–3 месяца?</span><textarea name="goal" rows="3" placeholder="Например: понять, оставаться ли в найме или начинать частную практику">${esc(d.goal||'')}</textarea></label>
      <label><span>Что уже пробовали?</span><textarea name="tried" rows="3" placeholder="Разговоры, поиск вакансий, обучение, пауза, попытка брать клиентов…">${esc(d.tried||'')}</textarea></label>
      <label><span>Что больше всего мешает или тревожит сейчас?</span><textarea name="concern" rows="3" placeholder="Деньги, неуверенность, время, страх ошибки, отсутствие вариантов…">${esc(d.concern||'')}</textarea></label>
      <label><span>Что важно сохранить при любых изменениях?</span><textarea name="changed" rows="3" placeholder="Доход, график, здоровье, статус, время с семьёй, интерес к работе…">${esc(d.changed||'')}</textarea></label>
      <div class="cj-action-row end"><button class="primary-button cj-primary" type="submit">Проверить перед отправкой →</button></div>
    </form>
  </section>`,{stepLabel:'Шаг 3 · Ваш запрос',progress});
}

function renderClientReview(root,c,d,progress){
  const qs=questionSets[d.scenario]||[];
  const answers=qs.map(q=>`<div class="cj-review-line"><span>${esc(q.title)}</span><strong>${esc(label(d.scenario,q.key,d.answers[q.key])||'—')}</strong></div>`).join('');
  renderClientShell(root,c,`<section class="cj-stage">
    <button class="cj-back" data-cj-action="review-back">← Изменить</button>
    <div class="cj-kicker">ГОТОВО К ОТПРАВКЕ</div><h2>Проверьте, <span>что увидит психолог</span></h2>
    <div class="cj-review-grid">
      <section class="cj-review-card primary"><small>Ваша ситуация</small><strong>${esc(scenarioTitle(d.scenario))}</strong><p>${esc(d.goal||'Цель пока не сформулирована')}</p></section>
      <section class="cj-review-card"><small>Что уже пробовали</small><p>${esc(d.tried||'—')}</p></section>
      <section class="cj-review-card"><small>Что мешает / тревожит</small><p>${esc(d.concern||'—')}</p></section>
      <section class="cj-review-card"><small>Что важно сохранить</small><p>${esc(d.changed||'—')}</p></section>
    </div>
    <details class="cj-review-details"><summary>Посмотреть ответы на 5 вопросов</summary>${answers}</details>
    <div class="cj-send-box"><div><strong>Следующий шаг</strong><p>После отправки психолог увидит подготовку в вашей карточке. На встрече ответы можно уточнить или изменить — это не заключение и не тест.</p></div><button class="primary-button cj-primary" data-cj-action="send-intake">Отправить психологу →</button></div>
  </section>`,{stepLabel:'Проверка перед отправкой',progress});
}

function renderClientActionSpace(root,c,intake){
  const assignments=activeAssignments(c.id),pending=assignments.find(a=>a.status!=='done')||null,done=assignments.filter(a=>a.status==='done');
  const latestA=latestAssessment(c.id),lastS=latestSession(c.id),lastCheck=clientCheckins(c.id)[0],prep=clientPreparations(c.id)[0];
  const stage=currentPilotStage(c),stageInfo=PILOT_STAGES.find(s=>s.n===stage)||PILOT_STAGES[0],progress=Math.round(stage/7*100);
  if(clientJourneyView==='route') return renderClientRouteView(root,c,intake,stage,stageInfo,progress,assignments,latestA);
  if(clientJourneyView==='history') return renderClientHistoryView(root,c,intake,done,lastS,lastCheck,prep);
  if(clientJourneyView==='prep') return renderClientPrepView(root,c,intake,prep,lastCheck);
  const topNav=`<nav class="cj-nav"><button class="active" data-cj-view="today">Сейчас</button><button data-cj-view="route">Маршрут</button><button data-cj-view="history">История</button></nav>`;
  if(pending){
    renderClientShell(root,c,`${topNav}<section class="cj-today-grid">
      <main class="cj-task-focus">
        <div class="cj-kicker">СЕЙЧАС · ОДИН ШАГ</div><h2>${esc(pending.title)}</h2><p class="cj-task-prompt">${esc(pending.prompt)}</p>
        <div class="cj-task-meta"><span>Назначено психологом</span><strong>${pending.deadline?`до ${shortDate(pending.deadline)}`:'без жёсткого срока'}</strong></div>
        <label class="cj-task-answer"><span>Что получилось? Что заметили?</span><textarea id="cjTaskResponse" rows="6" placeholder="Не нужен идеальный отчёт. Зафиксируйте факты, неожиданности и то, где стало сложно."></textarea></label>
        <div class="cj-action-row between"><button class="quiet-button" data-cj-view="route">Зачем этот шаг?</button><button class="primary-button cj-primary" data-cj-action="complete-current" data-id="${pending.id}">Сохранить результат →</button></div>
      </main>
      <aside class="cj-side-stack">
        <section class="cj-side-card"><small>Где вы сейчас</small><strong>Этап ${stage} из 7</strong><p>${esc(stageInfo.title)}</p><div class="cj-mini-progress"><span style="width:${progress}%"></span></div></section>
        <section class="cj-side-card"><small>Следующая встреча</small><strong>${esc(clientNextDate(c))}</strong><p>${c.nextSessionTime?`в ${esc(c.nextSessionTime)}`:'время уточняется'}</p><button class="quiet-button full" data-cj-view="prep">Подготовиться</button></section>
      </aside>
    </section>`,{stepLabel:scenarioShort(intake.scenario),progress});
    return;
  }
  const waiting=!latestA && !lastS;
  renderClientShell(root,c,`${topNav}<section class="cj-state-center">
    <div class="cj-state-icon">${waiting?'✓':'◎'}</div>
    <div class="cj-kicker">${waiting?'ПОДГОТОВКА ОТПРАВЛЕНА':'МЕЖДУ ШАГАМИ'}</div>
    <h2>${waiting?'На сейчас всё готово':'Следующий шаг появится после встречи'}</h2>
    <p>${waiting?'Психолог уже может посмотреть вашу стартовую подготовку. На встрече вы вместе уточните, что действительно важно исследовать первым.':'Вы выполнили назначенные действия. Зафиксируйте состояние или подготовьте то, что важно обсудить дальше.'}</p>
    <div class="cj-state-actions"><button class="primary-button cj-primary" data-cj-view="prep">${waiting?'Что подготовить к встрече':'Подготовиться к встрече'} →</button><button class="quiet-button" data-cj-view="history">Мои ответы</button></div>
    <div class="cj-next-meeting"><span>Следующая встреча</span><strong>${esc(clientNextDate(c))}${c.nextSessionTime?` · ${esc(c.nextSessionTime)}`:''}</strong></div>
  </section>`,{stepLabel:scenarioShort(intake.scenario),progress});
}

function renderClientRouteView(root,c,intake,stage,stageInfo,progress,assignments,latestA){
  const nav=`<nav class="cj-nav"><button data-cj-view="today">Сейчас</button><button class="active" data-cj-view="route">Маршрут</button><button data-cj-view="history">История</button></nav>`;
  const route=PILOT_STAGES.map(s=>`<article class="cj-route-step ${s.n<stage?'done':s.n===stage?'active':''}"><b>${s.n<stage?'✓':s.n}</b><div><small>${s.n===stage?'СЕЙЧАС':s.n<stage?'ПРОЙДЕНО':'ПОЗЖЕ'}</small><strong>${esc(s.title)}</strong><p>${esc(s.result)}</p></div></article>`).join('');
  renderClientShell(root,c,`${nav}<section class="cj-stage"><div class="cj-kicker">ВАШ МАРШРУТ</div><h2>Не выбрать всё сразу, а <span>последовательно получить ясность</span></h2><p class="cj-lead small">Маршрут можно менять вместе с психологом. Это рабочая карта, а не обязательная программа.</p><div class="cj-route-list">${route}</div>${latestA?.result?.route?`<div class="cj-route-note"><small>Текущий смысловой фокус</small><strong>${esc(latestA.result.route)}</strong></div>`:''}<div class="cj-action-row"><button class="quiet-button" data-cj-view="today">← Вернуться к текущему шагу</button></div></section>`,{stepLabel:`Этап ${stage} из 7`,progress});
}

function renderClientHistoryView(root,c,intake,done,lastS,lastCheck,prep){
  const nav=`<nav class="cj-nav"><button data-cj-view="today">Сейчас</button><button data-cj-view="route">Маршрут</button><button class="active" data-cj-view="history">История</button></nav>`;
  const qs=questionSets[intake.scenario]||[];
  const intakeLines=qs.map(q=>`<div class="cj-history-line"><span>${esc(q.title)}</span><strong>${esc(label(intake.scenario,q.key,intake.answers[q.key])||'—')}</strong></div>`).join('');
  renderClientShell(root,c,`${nav}<section class="cj-stage"><div class="cj-kicker">МОИ МАТЕРИАЛЫ</div><h2>То, что <span>уже зафиксировано</span></h2>
    <div class="cj-history-grid"><section class="cj-history-card"><header><div><small>Стартовая подготовка</small><strong>${esc(scenarioTitle(intake.scenario))}</strong></div><button class="text-button" data-cj-action="edit-intake">Изменить</button></header><p>${esc(intake.goal||'')}</p><details><summary>Ответы на 5 вопросов</summary>${intakeLines}</details></section>
    <section class="cj-history-card"><header><div><small>Выполненные шаги</small><strong>${done.length}</strong></div></header>${done.length?done.map(a=>`<article class="cj-done-item"><span>✓</span><div><strong>${esc(a.title)}</strong><p>${esc(a.response||'')}</p></div></article>`).join(''):'<p class="muted-copy">Пока нет завершённых шагов.</p>'}</section></div>
    ${lastS?`<section class="cj-history-card wide"><header><div><small>Последняя встреча</small><strong>${esc(lastS.theme||'Итог встречи')}</strong></div><span>${shortDate(lastS.date)}</span></header><p>${esc(lastS.homework||'')}</p>${lastS.nextFocus?`<div class="cj-shared-focus"><small>К чему вернёмся</small><strong>${esc(lastS.nextFocus)}</strong></div>`:''}</section>`:''}
    <div class="cj-action-row"><button class="quiet-button" data-cj-view="today">← Вернуться</button></div></section>`,{stepLabel:'История работы'});
}

function renderClientPrepView(root,c,intake,prep,lastCheck){
  const v=lastCheck||{clarity:5,energy:5,confidence:5,tension:5};
  renderClientShell(root,c,`<section class="cj-stage"><button class="cj-back" data-cj-view="today">← Сейчас</button><div class="cj-kicker">ПЕРЕД СЛЕДУЮЩЕЙ ВСТРЕЧЕЙ</div><h2>Что психологу важно знать <span>до разговора</span></h2><p class="cj-lead small">Заполнение занимает 2–3 минуты. Можно сохранить только то, что считаете важным.</p>
    <form id="cjPrepForm" class="cj-prep-v12">
      <div class="cj-prep-questions"><label><span>Что изменилось с прошлой встречи?</span><textarea name="changed" rows="3">${esc(prep?.changed||'')}</textarea></label><label><span>Что удалось попробовать?</span><textarea name="worked" rows="3">${esc(prep?.worked||'')}</textarea></label><label><span>Где вы застряли?</span><textarea name="stuck" rows="3">${esc(prep?.stuck||'')}</textarea></label><label><span>Что важнее всего обсудить?</span><textarea name="focus" rows="3">${esc(prep?.focus||'')}</textarea></label></div>
      <section class="cj-checkin-v12"><small>Короткий check-in</small><strong>Как вы сейчас?</strong>${[['clarity','Ясность'],['energy','Энергия'],['confidence','Уверенность'],['tension','Напряжение']].map(([k,l])=>`<label><span>${l}</span><input type="range" name="${k}" min="0" max="10" value="${v[k]}" oninput="this.nextElementSibling.textContent=this.value"><output>${v[k]}</output></label>`).join('')}<label class="note"><span>Что сильнее всего влияет на состояние?</span><textarea name="note" rows="3"></textarea></label></section>
      <div class="cj-action-row end"><button class="primary-button cj-primary" type="submit">Сохранить для психолога →</button></div>
    </form></section>`,{stepLabel:'Подготовка к встрече'});
}

function wireClientJourney(root,c){
  root.querySelectorAll('[data-cj-view]').forEach(b=>b.addEventListener('click',()=>{clientJourneyView=b.dataset.cjView;renderClientPortal(root);window.scrollTo({top:0,behavior:'smooth'});}));
  root.querySelectorAll('[data-cj-scenario]').forEach(b=>b.addEventListener('click',()=>{const d=clientDraft(c.id);d.scenario=b.dataset.cjScenario;saveData();renderClientStartFlow(root,c);}));
  root.querySelectorAll('[data-cj-answer]').forEach(b=>b.addEventListener('click',()=>{const d=clientDraft(c.id),q=questionSets[d.scenario]?.[d.qIndex];if(!q)return;d.answers[q.key]=b.dataset.cjAnswer;saveData();renderClientStartFlow(root,c);}));
  root.querySelector('[data-cj-action="start"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);d.screen='scenario';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="back-welcome"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);d.screen='welcome';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="scenario-next"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);if(!d.scenario)return;d.screen='questions';d.qIndex=0;saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="question-back"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);if(d.qIndex>0)d.qIndex--;else d.screen='scenario';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="question-next"]')?.addEventListener('click',()=>{const d=clientDraft(c.id),qs=questionSets[d.scenario]||[],q=qs[d.qIndex];if(!q||!d.answers[q.key])return;if(d.qIndex<qs.length-1)d.qIndex++;else d.screen='reflection';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="reflection-back"]')?.addEventListener('click',()=>{const d=clientDraft(c.id),qs=questionSets[d.scenario]||[];d.screen='questions';d.qIndex=Math.max(0,qs.length-1);saveData();renderClientStartFlow(root,c);});
  root.querySelector('#cjReflectionForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.currentTarget)),d=clientDraft(c.id);d.goal=(fd.goal||'').trim();d.tried=(fd.tried||'').trim();d.concern=(fd.concern||'').trim();d.changed=(fd.changed||'').trim();if(!d.goal){toast('Коротко напишите, что хотите изменить');return;}d.screen='review';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="review-back"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);d.screen='reflection';saveData();renderClientStartFlow(root,c);});
  root.querySelector('[data-cj-action="send-intake"]')?.addEventListener('click',()=>{const d=clientDraft(c.id);data.clientIntakes=data.clientIntakes.filter(x=>x.clientId!==c.id);data.clientIntakes.unshift({id:uid('intake'),clientId:c.id,date:todayISO(),scenario:d.scenario,answers:{...d.answers},goal:d.goal,tried:d.tried,concern:d.concern,preserve:d.changed});delete data.clientDrafts[c.id];saveData();clientJourneyView='today';renderClientPortal(root);toast('Подготовка сохранена — психолог увидит её в карточке');});
  root.querySelector('[data-cj-action="complete-current"]')?.addEventListener('click',e=>{const a=data.assignments.find(x=>x.id===e.currentTarget.dataset.id),ta=root.querySelector('#cjTaskResponse');const response=(ta?.value||'').trim();if(!a)return;if(!response){toast('Напишите хотя бы короткий результат шага');return;}a.response=response;a.status='done';a.completedAt=todayISO();saveData();clientJourneyView='today';renderClientPortal(root);toast('Результат сохранён — психолог увидит его в карточке');});
  root.querySelector('[data-cj-action="edit-intake"]')?.addEventListener('click',()=>{const intake=clientIntake(c.id);if(!intake)return;data.clientDrafts[c.id]={screen:'reflection',scenario:intake.scenario,qIndex:0,answers:{...intake.answers},goal:intake.goal||'',tried:intake.tried||'',concern:intake.concern||'',changed:intake.preserve||''};data.clientIntakes=data.clientIntakes.filter(x=>x.clientId!==c.id);saveData();renderClientStartFlow(root,c);});
  root.querySelector('#cjPrepForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.currentTarget)),clientId=c.id;data.preparations=data.preparations.filter(x=>!(x.clientId===clientId&&x.date===todayISO()));data.preparations.unshift({id:uid('prep'),clientId,date:todayISO(),changed:(fd.changed||'').trim(),worked:(fd.worked||'').trim(),stuck:(fd.stuck||'').trim(),focus:(fd.focus||'').trim()});data.checkins.unshift({id:uid('check'),clientId,date:todayISO(),clarity:Number(fd.clarity),energy:Number(fd.energy),confidence:Number(fd.confidence),tension:Number(fd.tension),note:(fd.note||'').trim()});saveData();clientJourneyView='today';renderClientPortal(root);toast('Подготовка сохранена — психолог увидит её до встречи');});
}

// --- Pilot events ---
document.getElementById('viewRoot').addEventListener('click',e=>{
  const b=e.target.closest('[data-pilot-action]');if(!b)return;const a=b.dataset.pilotAction;
  if(a==='assign')openAssignmentForm(b.dataset.client||activeClient()?.id);
  else if(a==='client-preview'){if(b.dataset.client&&clientById(b.dataset.client)){data.activeClientId=b.dataset.client;saveData();}setPilotRole('client');}
  else if(a==='open-client'){if(clientById(b.dataset.client)){data.activeClientId=b.dataset.client;saveData();pilotRole='psychologist';ui.view='client';ui.clientTab='overview';renderView();}}
  else if(a==='open-demo'){data.activeClientId=clientById('client_anna')?'client_anna':data.clients[0]?.id;saveData();ui.view='client';ui.clientTab='overview';renderView();}
  else if(a==='demo-assessment'){const id=clientById('client_anna')?'client_anna':activeClient()?.id;if(id){data.activeClientId=id;saveData();startAssessment(id,'hire');}}
  else if(a==='guide'){ui.view='guide';renderView();}
  else if(a==='start-guide-assessment'){if(activeClient())startAssessment(activeClient().id,b.dataset.scenario);}
  else if(a==='start-intake-assessment'){const id=b.dataset.client||activeClient()?.id;if(id)startAssessment(id,b.dataset.scenario||'hire');}
});

// Keep two tabs in sync during a pilot on the same hosted origin.
window.addEventListener('storage',e=>{if(!window.__TOCHKA_SUPABASE_MODE && e.key===STORAGE&&e.newValue){try{const next=JSON.parse(e.newValue);if(next&&Array.isArray(next.clients)){data=next;normalizePilotData();renderView();toast('Данные обновились в другой вкладке');}}catch{}}});

// Initial chrome after extension is ready.
refreshChrome();renderView();
