/* Точка опоры v15 — native-first UX.
   Клиент говорит человеческим языком; профессиональная сложность остаётся в кабинете психолога. */

// ---------- Профессиональные направления v15 ----------
GENERAL_CATEGORIES.unclear={title:'Неопределённый запрос',icon:'?',text:'Когда человеку трудно назвать одну проблему или всё навалилось одновременно.'};
GENERAL_CATEGORIES.youth={title:'Молодые взрослые 17–30',icon:'✦',text:'Учёба, первый выход на рынок труда, профессия, отношения, самостоятельность и ожидания семьи.'};
GENERAL_CATEGORIES.special={title:'Особые потребности ребёнка',icon:'◈',text:'Семейная нагрузка, развитие, сложное поведение, школа, сиблинги и разногласия взрослых.'};
GENERAL_CATEGORIES.combat={title:'После СВО / боевого опыта',icon:'⌁',text:'Возвращение домой, адаптация к обычной жизни и перестройка семейной системы.'};
GENERAL_CATEGORIES.disability={title:'Инвалидность и ограничения',icon:'◍',text:'Изменения возможностей, самостоятельность, отношения, работа и реальные барьеры среды.'};

function v15Scenario(key,cfg){
  if(scenarios[key]) return;
  GS(key,{
    category:cfg.category,title:cfg.title,short:cfg.short||cfg.title,icon:cfg.icon||'◇',text:cfg.text,
    when:cfg.when,aim:cfg.aim,traps:cfg.traps||[],opening:cfg.opening||[],
    questions:[
      GQ('focus','Фокус',cfg.q1||'Что сейчас труднее всего?','Выберите один участок для начала.',cfg.o1||[['main','Это основная трудность'],['mixed','Трудностей несколько'],['unclear','Трудно определить'],['other','Есть другое']],cfg.listen1||'Уточняйте конкретные эпизоды и влияние на повседневную жизнь.',cfg.ask1||'«Как это выглядит в один конкретный трудный день?»',cfg.caution1||'Не объясняйте ситуацию одной причиной до проверки контекста.'),
      GQ('pattern','Контекст',cfg.q2||'Когда становится особенно трудно?','Ищем повторяющийся контекст, а не ярлык.',cfg.o2||[['alone','Когда остаюсь с этим один(одна)'],['conflict','Во время конфликта или давления'],['task','Когда нужно действовать или решать'],['random','Закономерность пока неясна']],cfg.listen2||'Ищите условия усиления и ослабления трудности.',cfg.ask2||'«Что обычно происходит прямо перед ухудшением?»',cfg.caution2||'Не путайте совпадение по времени с причиной.'),
      GQ('resource','Опора',cfg.q3||'Что хотя бы немного помогает?','Ищем существующие опоры и исключения.',cfg.o3||[['support','Поддержка другого человека'],['structure','Понятный план или структура'],['rest','Отдых / пауза / снижение нагрузки'],['action','Одно конкретное действие'],['none','Пока трудно назвать']],cfg.listen3||'Отмечайте не только исчезновение трудности, но и способность действовать рядом с ней.',cfg.ask3||'«Когда было хотя бы на один пункт легче — что тогда отличалось?»',cfg.caution3||'Не превращайте найденную опору в обязательную универсальную технику.'),
      GQ('next','Проверка',cfg.q4||'Что важнее проверить дальше?','Это рабочая развилка, а не окончательный вывод.',cfg.o4||[['facts','Собрать больше фактов'],['support','Понять, какой поддержки не хватает'],['choice','Прояснить один выбор'],['observe','Пока только наблюдать']],cfg.listen4||'Выбирайте минимальный проверяемый фокус.',cfg.ask4||'«Какой один факт даст нам больше ясности к следующей встрече?»',cfg.caution4||'Не назначайте действие только ради ощущения активности.')
    ],
    result:{headline:cfg.result||'Сначала полезно прояснить контекст и выбрать один проверяемый участок работы.',route:cfg.route||'контекст → рабочая гипотеза → проверка → следующий шаг',steps:{facts:'Зафиксируйте один конкретный эпизод: что было до, что произошло, что вы сделали и что изменилось после.',support:'Отметьте, какой вид поддержки реально уменьшает нагрузку или помогает действовать.',choice:'Сформулируйте один выбор, который сейчас требует ясности, и два критерия, по которым его можно оценивать.',observe:'До следующей встречи только наблюдайте повторяющийся цикл без попытки срочно его исправить.'}}
  });
}

v15Scenario('unclear_start',{category:'unclear',title:'Не знаю, с чего начать',short:'Неясный запрос',icon:'?',text:'Когда человеку плохо, но он не может выделить одну тему.',when:'Клиент говорит «всё навалилось», «мне просто плохо» или затрудняется сформулировать запрос.',aim:'Помочь перейти от глобального неблагополучия к конкретным изменениям в функционировании и одному фокусу.',traps:['Требовать сразу сформулировать цель терапии','Выбирать проблему вместо клиента','Считать «не знаю» отсутствием мотивации'],opening:['Что в обычной жизни изменилось сильнее всего?','Если бы стало легче только в одном месте, где вы заметили бы это первым?']});
v15Scenario('youth_study_direction',{category:'youth',title:'Учёба и выбор направления',short:'Учёба',icon:'🎓',text:'Не справляюсь с учёбой, не понимаю, продолжать ли и зачем нужна специальность.',when:'Учёба не идёт, накопились долги, сомнения в специальности или давление ожиданий.',aim:'Различить перегрузку, страх неудачи, организационные трудности и несоответствие выбранной траектории самому клиенту.',traps:['Называть трудность ленью','Сразу советовать бросить или продолжить','Принимать цель родителей за цель клиента'],opening:['Что именно перестало получаться — и когда это началось?','Если убрать ожидания других, что вы сами хотите от учёбы?']});
v15Scenario('youth_love_loss',{category:'youth',title:'Несчастная любовь / расставание',short:'Расставание',icon:'♡',text:'Не могу отпустить отношения, переживаю отвержение или неразделённые чувства.',when:'После расставания или невзаимных чувств мысли о человеке занимают большую часть внимания.',aim:'Разделить переживание утраты, идеализацию, самоценность, одиночество и способы поддержания связи.',traps:['Сразу учить «отпускать»','Обесценивать интенсивность молодой привязанности','Автоматически объяснять всё низкой самооценкой'],opening:['Что сейчас больнее всего в этой истории?','Что удерживает вас в постоянном возвращении к ней?']});
v15Scenario('youth_no_work',{category:'youth',title:'Нет работы / первый поиск',short:'Нет работы',icon:'💼',text:'Не могу найти работу, не знаю, что искать или боюсь начать.',when:'Человек после учёбы или перерыва не может войти в работу и переживает отставание от сверстников.',aim:'Различить отсутствие направления, барьер действия, слабую стратегию поиска и реальное снижение ресурса.',traps:['Сводить всё к уверенности','Психологизировать реальные барьеры рынка','Давать список вакансий вместо прояснения маршрута'],opening:['Вы знаете, какую работу ищете, или пока неясно само направление?','На каком шаге поиск обычно останавливается?']});
v15Scenario('special_child_overload',{category:'special',title:'Семья ребёнка с особыми потребностями',short:'Особый ребёнок',icon:'◈',text:'Хроническая нагрузка, реабилитация, тревога за будущее и нехватка ресурсов семьи.',when:'Большая часть жизни семьи организована вокруг помощи ребёнку и взрослые истощены.',aim:'Разделить потребности ребёнка, реальные обязательства, родительскую вину и перегрузку системы.',traps:['Советовать «просто больше отдыхать»','Оценивать качество родительства по объёму занятий','Игнорировать других детей и отношения взрослых'],opening:['Что в уходе и сопровождении ребёнка забирает больше всего сил сейчас?','Что из нагрузки действительно обязательно, а что стало обязательным в ощущении семьи?']});
v15Scenario('child_aggression',{category:'special',title:'Агрессивное или опасное поведение ребёнка',short:'Агрессия ребёнка',icon:'!',text:'Ребёнок бьёт, угрожает, разрушает вещи или взрослые начинают его бояться.',when:'Есть повторяющиеся агрессивные эпизоды, риск травмы или резкое усиление поведения.',aim:'Сначала прояснить безопасность, затем функционально описать эпизод: до → поведение → после.',traps:['Объяснять агрессию диагнозом','Сразу советовать жёсткость или наказание','Назначать коммуникационное упражнение до оценки риска'],opening:['Что именно происходит в самый тяжёлый эпизод?','Кто может пострадать и что помогает безопасно завершить эпизод?'],caution1:'При актуальном риске вреда обычная семейная работа вторична до плана безопасности.'});
v15Scenario('return_after_combat',{category:'combat',title:'Адаптация после возвращения с СВО / боевого опыта',short:'Возвращение',icon:'⌁',text:'Сон, напряжение, раздражительность, отношения и возвращение к обычной жизни.',when:'После возвращения человек отмечает, что дома и в обычной жизни всё ощущается иначе.',aim:'Начать с актуального функционирования и безопасности, не требуя подробного рассказа о боевых событиях.',traps:['Автоматически предполагать ПТСР','Требовать описания травматического эпизода','Считать отказ говорить сопротивлением'],opening:['Что в обычной жизни после возвращения оказалось самым трудным?','Что сейчас больше всего мешает: сон, напряжение, отношения, работа или что-то другое?']});
v15Scenario('family_after_combat',{category:'combat',title:'Семья после возвращения участника СВО',short:'Семья после СВО',icon:'⌂',text:'Перестройка ролей, напряжение пары, дети и ожидания после возвращения.',when:'Семья ждала воссоединения, но после возвращения стало трудно снова жить вместе.',aim:'Исследовать изменение ролей и ожиданий всей семейной системы, отдельно отслеживая безопасность.',traps:['Искать одного виноватого','Объяснять все конфликты только боевым опытом','Игнорировать изменения, произошедшие с семьёй за время отсутствия'],opening:['Что оказалось не таким, как вы ожидали от возвращения?','Какие семейные роли за время отсутствия успели измениться?']});
v15Scenario('disability_adjustment',{category:'disability',title:'Инвалидность, ограничения и самостоятельность',short:'Изменение возможностей',icon:'◍',text:'Изменение возможностей, автономия, работа, отношения или реальные барьеры среды.',when:'Инвалидность или ограничения действительно связаны с текущим запросом клиента.',aim:'Разделить изменения идентичности, реальные ограничения среды, зависимость от помощи и доступные зоны самостоятельности.',traps:['Делать инвалидность главной темой любого запроса','Психологизировать объективный барьер','Говорить с сопровождающим вместо самого клиента'],opening:['Что именно в вашей жизни сейчас ограничивает вас сильнее всего?','Где вам нужна помощь, а где вы хотели бы больше собственного выбора?']});

// ---------- Клиентский словарь: человек выбирает жизненную ситуацию, не сценарий ----------
const V15_NATIVE_PATHS={
  unclear:{icon:'?',title:'Мне плохо, но я не понимаю почему',text:'Трудно выделить одну проблему или всё навалилось.',scenario:'unclear_start',suggest:['unclear_start','overload_stress','loss_direction']},
  overload:{icon:'😮‍💨',title:'Нет сил, всё навалилось',text:'Усталость, много обязанностей, раздражение, ощущение «не вывожу».',scenario:'overload_stress',suggest:['overload_stress','emotional_regulation','personal_boundaries']},
  breakup:{icon:'💔',title:'Отношения / расставание',text:'Меня оставили, не могу отпустить или не понимаю, что делать с отношениями.',scenario:'youth_love_loss',suggest:['youth_love_loss','separation_uncertainty','self_criticism']},
  conflict:{icon:'⇄',title:'Мы постоянно ссоримся',text:'Трудно разговаривать, растёт дистанция или повторяется один конфликт.',scenario:'couple_conflict',suggest:['couple_conflict','relationship_boundaries','separation_uncertainty']},
  parenting:{icon:'👨‍👩‍👧',title:'Не справляюсь с детьми / дома',text:'Срываюсь, не понимаю, как реагировать, взрослые спорят о воспитании.',scenario:'parent_overload',suggest:['parent_overload','parent_child_conflict','coparenting_conflict']},
  special:{icon:'◈',title:'Ребёнку нужна особая помощь',text:'Нарушения развития, реабилитация, школа, перегрузка семьи.',scenario:'special_child_overload',suggest:['special_child_overload','parent_overload','coparenting_conflict']},
  aggression:{icon:'!',title:'Ребёнок ведёт себя опасно / агрессивно',text:'Бьёт, угрожает, разрушает вещи, убегает или взрослым становится страшно.',scenario:'child_aggression',suggest:['child_aggression','parent_child_conflict','coparenting_conflict']},
  study:{icon:'🎓',title:'Учёба и будущее',text:'Не справляюсь с учёбой, не понимаю, продолжать ли и кем быть.',scenario:'youth_study_direction',suggest:['youth_study_direction','fear_evaluation','loss_direction']},
  work:{icon:'💼',title:'Работа, деньги, профессия',text:'Нет работы, не знаю что искать, боюсь менять или не понимаю свой путь.',scenario:'youth_no_work',suggest:['youth_no_work','hire','difficult_choice']},
  combat:{icon:'⌁',title:'После СВО / возвращения домой',text:'Трудно привыкнуть к обычной жизни после службы или боевого опыта.',scenario:'return_after_combat',suggest:['return_after_combat','overload_stress','emotional_regulation']},
  combatfamily:{icon:'⌂',title:'Семья после СВО',text:'После возвращения близкого дома стало трудно, роли и отношения изменились.',scenario:'family_after_combat',suggest:['family_after_combat','couple_conflict','parent_child_conflict']},
  disability:{icon:'◍',title:'Изменились здоровье или возможности',text:'Ограничения, самостоятельность, работа, отношения или помощь других.',scenario:'disability_adjustment',suggest:['disability_adjustment','adaptation_change','personal_boundaries']},
  other:{icon:'✎',title:'У меня другое',text:'Не хочу выбирать из списка — лучше коротко расскажу своими словами.',scenario:'unclear_start',suggest:['unclear_start']}
};

const V15_PATH_QUESTIONS={
  unclear:[
    {key:'impact',title:'Что изменилось сильнее всего?',opts:[['energy','😮‍💨','Стало меньше сил'],['mood','😔','Настроение'],['relations','⇄','Отношения с людьми'],['work','💼','Работа / учёба'],['everything','🌪','Всё сразу'],['unknown','?','Трудно понять']]},
    {key:'wish',title:'Если бы стало легче только в одном месте — что бы вы заметили?',opts:[['energy','⚡','Было бы больше сил'],['clarity','🧭','Появился бы понятный план'],['calm','≈','Стало бы спокойнее'],['contact','♡','Стало бы легче с людьми'],['unknown','?','Не знаю']]}
  ],
  overload:[
    {key:'source',title:'Что сейчас больше всего выматывает?',opts:[['tasks','☷','Слишком много дел'],['family','⌂','Всё держится на мне дома'],['work','💼','Работа / ответственность'],['conflict','⇄','Конфликты'],['self','◇','Требую от себя слишком много'],['all','🌪','Всё сразу']]},
    {key:'when',title:'Когда особенно тяжело?',opts:[['morning','☀','С утра'],['evening','☾','К вечеру'],['requests','↳','Когда от меня снова что-то хотят'],['mistake','!','Когда что-то не получается'],['always','≈','Почти постоянно']]},
    {key:'help',title:'Что хотя бы немного помогает?',opts:[['alone','○','Побыть без требований'],['sleep','☾','Сон / отдых'],['support','♡','Практическая помощь'],['finish','✓','Закончить одно конкретное дело'],['none','—','Пока ничего']]}
  ],
  breakup:[
    {key:'pain',title:'Что сейчас болит сильнее всего?',opts:[['return','↺','Хочу вернуть человека'],['thoughts','∞','Постоянно думаю о нём / ней'],['compare','≠','Сравниваю себя с другим человеком'],['alone','○','Боюсь остаться один(одна)'],['why','?','Не понимаю, почему это произошло'],['pain','♡','Просто очень больно']]},
    {key:'function',title:'Чему это больше всего мешает?',opts:[['sleep','☾','Спать'],['work','💼','Работать / учиться'],['people','⇄','Общаться'],['daily','⌂','Обычным делам'],['none','○','Жизнь в целом идёт']]},
    {key:'contact',title:'Контакт с человеком сейчас…',opts:[['none','—','Нет контакта'],['rare','·','Иногда общаемся'],['often','↔','Часто общаемся'],['checking','⌕','Я постоянно проверяю его / её'],['complicated','?','Всё сложно']]}
  ],
  conflict:[
    {key:'main',title:'Что происходит чаще всего?',opts:[['criticism','!','Претензии и критика'],['distance','—','Молчание / холодность'],['jealousy','⌕','Недоверие / ревность'],['roles','⌂','Споры о быте / деньгах'],['other','?','Другое']]},
    {key:'response',title:'Когда начинается напряжение, вы чаще…',opts:[['attack','↑','Давлю / доказываю'],['withdraw','←','Замолкаю / ухожу'],['please','✓','Соглашаюсь, хотя не хочу'],['explain','…','Долго объясняю'],['unknown','?','Не замечал(а)']]}
  ],
  parenting:[
    {key:'hard',title:'Что сейчас тяжелее всего дома?',opts:[['tired','😮‍💨','Я очень устал(а)'],['anger','!','Часто срываюсь'],['behavior','↯','Не понимаю поведение ребёнка'],['partner','⇄','Спорим с партнёром'],['time','⌛','Нет времени на себя'],['all','🌪','Всё сразу']]},
    {key:'moment',title:'Когда труднее всего?',opts:[['morning','☀','Сборы / утро'],['homework','✎','Учёба / домашние задания'],['no','!','Когда ребёнок отказывается'],['evening','☾','Вечером'],['public','👥','При других людях']]}
  ],
  special:[
    {key:'load',title:'Что сейчас забирает больше всего сил?',opts:[['care','⌂','Постоянный уход / контроль'],['specialists','✚','Занятия и специалисты'],['school','🎓','Школа / детский сад'],['future','→','Страх за будущее'],['family','⇄','Разногласия в семье'],['siblings','👥','Не хватает внимания другим детям']]},
    {key:'feeling',title:'Что вы чаще чувствуете в этой ситуации?',opts:[['guilt','◇','Вину'],['fear','≈','Тревогу'],['anger','!','Злость / раздражение'],['tired','😮‍💨','Истощение'],['shame','○','Стыд'],['mixed','🌪','Всё смешалось']]}
  ],
  aggression:[
    {key:'behavior',title:'Что именно происходит?',multi:true,opts:[['hits','!','Бьёт / толкает'],['throws','↯','Бросает / ломает вещи'],['threats','⚠','Угрожает'],['runs','→','Убегает / исчезает'],['self','◇','Причиняет вред себе'],['other','?','Другое']]},
    {key:'risk',title:'Бывало ли, что вы реально боялись, что кто-то пострадает?',opts:[['no','✓','Нет'],['sometimes','≈','Иногда возникает такой страх'],['yes','!','Да'],['skip','○','Не хочу отвечать здесь']]},
    {key:'before',title:'Что часто бывает прямо перед эпизодом?',opts:[['demand','↳','Просьба / требование'],['stop','×','Нужно прекратить приятное занятие'],['overload','≈','Шум / усталость / перегрузка'],['conflict','⇄','Конфликт'],['unknown','?','Не вижу закономерности']]}
  ],
  study:[
    {key:'problem',title:'Что ближе всего?',opts:[['cant','✎','Не справляюсь с учёбой'],['why','?','Не понимаю, зачем учусь здесь'],['drop','↺','Думаю бросить / сменить'],['fear','!','Боюсь провала / отчисления'],['parents','⌂','Сильное давление родителей']]},
    {key:'stuck',title:'На каком шаге обычно застреваете?',opts:[['start','▶','Трудно начать'],['focus','⌕','Не могу сосредоточиться'],['finish','✓','Не довожу до конца'],['choice','🧭','Не могу выбрать направление'],['all','🌪','Всё сразу']]}
  ],
  work:[
    {key:'workstate',title:'Что сейчас происходит с работой?',opts:[['none','—','Работы нет'],['search','⌕','Ищу, но без результата'],['dontknow','?','Не знаю, что искать'],['change','↺','Работа есть, хочу менять'],['return','↗','Возвращаюсь после перерыва']]},
    {key:'barrier',title:'Что сильнее всего останавливает?',opts:[['direction','🧭','Неясно направление'],['fear','!','Страх отказа / ошибки'],['skills','✦','Не вижу своих сильных сторон'],['market','⌂','Мало реальных возможностей'],['energy','😮‍💨','Нет сил начать'],['unknown','?','Не знаю']]}
  ],
  combat:[
    {key:'hard',title:'Что после возвращения мешает больше всего?',opts:[['sleep','☾','Сон'],['tension','≈','Не могу расслабиться'],['anger','!','Раздражительность'],['people','⇄','Трудно с близкими'],['work','💼','Трудно вернуться к делам'],['thoughts','∞','Тяжёлые мысли / воспоминания']]},
    {key:'talk',title:'Насколько хочется говорить о пережитом?',opts:[['ok','↔','Могу говорить'],['little','·','Только понемногу'],['no','—','Не хочу сейчас рассказывать'],['unknown','?','Не знаю']]},
    {key:'cope',title:'Что помогает отключиться или выдерживать?',opts:[['people','♡','Люди / семья'],['routine','⌂','Режим / дела'],['movement','→','Движение / работа'],['alcohol','!','Алкоголь / вещества'],['nothing','—','Пока ничего']]}
  ],
  combatfamily:[
    {key:'change',title:'Что изменилось дома сильнее всего?',opts:[['distance','—','Стало больше дистанции'],['conflict','⇄','Больше конфликтов'],['roles','⌂','Непонятно, кто за что отвечает'],['children','👥','Изменились отношения с детьми'],['fear','!','Я стараюсь не злить / не задевать'],['mixed','🌪','Всё сразу']]},
    {key:'talk',title:'Получается спокойно обсуждать трудные вещи?',opts:[['yes','✓','Да'],['sometimes','≈','Иногда'],['rare','—','Почти нет'],['avoid','←','Стараюсь вообще не начинать'],['fear','!','Мне небезопасно это обсуждать']]}
  ],
  disability:[
    {key:'main',title:'Что сейчас связано с изменением возможностей сильнее всего?',opts:[['independence','↗','Самостоятельность'],['work','💼','Работа / деньги'],['family','⌂','Контроль / помощь семьи'],['relations','♡','Отношения / близость'],['loss','↺','Потеря привычной роли / жизни'],['barrier','▦','Недоступная среда / реальные барьеры']]},
    {key:'support',title:'Где помощь нужна, а где хочется больше собственного выбора?',opts:[['daily','⌂','Быт'],['movement','→','Передвижение'],['money','💼','Деньги / работа'],['decisions','🧭','Решения о своей жизни'],['communication','⇄','Общение с близкими'],['other','?','Другое']]}
  ],
  other:[
    {key:'area',title:'Что ближе хотя бы примерно?',opts:[['thoughts','🧠','Мысли / переживания'],['people','⇄','Отношения'],['energy','😮‍💨','Силы / усталость'],['choice','🧭','Нужно принять решение'],['work','💼','Работа / учёба'],['unknown','?','Пока не знаю']]}
  ]
};

const V15_SAFETY_Q={key:'safety',title:'Есть ли сейчас что-то, из-за чего вы боитесь за свою безопасность или безопасность другого человека?',opts:[['no','✓','Нет'],['unsure','≈','Трудно сказать'],['yes','!','Да'],['skip','○','Не хочу отвечать здесь']]};

const V15_COMPOSER_HINTS={
  default:['Последнее время…','Больше всего меня беспокоит…','Я хочу понять…','Я уже пробовал(а)…','Я боюсь, что…','Важно учесть…','Не хочу пока подробно обсуждать…'],
  breakup:['После того как отношения изменились…','Я чаще всего думаю о…','Больше всего боюсь…'],
  overload:['Сильнее всего я устаю, когда…','Кажется, что всё держится на мне, потому что…','Если стало бы легче, я бы…'],
  parenting:['Сложнее всего с ребёнком, когда…','Обычно я реагирую так…','Мне нужна помощь с…'],
  special:['Больше всего сил уходит на…','Я переживаю за будущее, потому что…','Семье сейчас не хватает…'],
  aggression:['Самый тяжёлый эпизод выглядел так…','Перед этим обычно…','Мне важно сначала сделать безопаснее…'],
  combat:['После возвращения сильнее всего изменилось…','Я не хочу пока рассказывать подробно о…','Больше всего мешает обычной жизни…'],
  combatfamily:['После возвращения дома изменилось…','Труднее всего нам стало…','Я хотел(а) бы вернуть в семью…'],
  disability:['Сильнее всего моя жизнь изменилась в…','Мне нужна помощь в…, но я хочу сам(а) решать…','Главный внешний барьер сейчас…'],
  study:['В учёбе я застрял(а) на…','Если убрать ожидания других, мне хочется…','Больше всего я боюсь…'],
  work:['Сейчас с работой у меня…','Я хочу понять, в какую сторону…','Меня останавливает…']
};

function v15Draft(c){
  const d=clientDraft(c.id);
  if(!d.v15){d.v15={screen:'welcome',path:'',qIndex:0,answers:{},note:'',selectedPhrases:[]};}
  return d.v15;
}
function v15PathQuestions(path){const base=[...(V15_PATH_QUESTIONS[path]||V15_PATH_QUESTIONS.other)];if(base.length<2)base.push({key:'impact2',title:'Где это мешает заметнее всего?',opts:[['daily','⌂','В обычных делах'],['people','⇄','В отношениях'],['work','💼','В работе / учёбе'],['inside','≈','Внутри много напряжения'],['unknown','?','Трудно сказать']]});return [...base,V15_SAFETY_Q]}
function v15AnswerText(q,value){
  if(Array.isArray(value)) return value.map(v=>v15AnswerText(q,v)).filter(Boolean).join(', ');
  const hit=q?.opts?.find(o=>o[0]===value);return hit?hit[2]:String(value||'');
}
function v15Suggested(path,answers){
  const base=[...(V15_NATIVE_PATHS[path]?.suggest||['unclear_start'])];
  if(path==='work' && answers.workstate==='return') base.unshift('return');
  if(path==='work' && answers.workstate==='change') base.unshift('hire');
  if(path==='breakup' && answers.function==='daily') base.unshift('separation_uncertainty');
  return [...new Set(base)].filter(k=>scenarios[k]).slice(0,3);
}
function v15SafetyFlags(path,answers){
  const flags=[];
  if(answers.safety==='yes') flags.push('Клиент отметил опасение за безопасность — прояснить до обычной сценарной работы.');
  if(answers.safety==='unsure') flags.push('Клиент затрудняется оценить безопасность — мягко уточнить на встрече.');
  if(path==='aggression' && (answers.risk==='yes'||answers.risk==='sometimes')) flags.push('Есть страх, что во время агрессивного эпизода кто-то может пострадать.');
  if(path==='combatfamily' && answers.talk==='fear') flags.push('Клиент отметил, что обсуждать трудные темы дома может быть небезопасно.');
  if(path==='combat' && answers.cope==='alcohol') flags.push('Клиент отметил алкоголь/вещества как способ справляться — требуется отдельное уточнение контекста.');
  return flags;
}
function v15SelectedSummary(path,answers){
  return v15PathQuestions(path).filter(q=>answers[q.key]).map(q=>({q:q.title,a:v15AnswerText(q,answers[q.key])}));
}
function v15GoalText(path,note){
  const title=V15_NATIVE_PATHS[path]?.title||'Хочу обсудить ситуацию';
  return note?.trim()?`${title}. ${note.trim()}`:title;
}

// ---------- Клиент: v15 native-first ----------
renderClientStartFlow=function(root,c){
  const d=v15Draft(c); const screens=['welcome','situation','questions','compose'];
  const idx=Math.max(0,screens.indexOf(d.screen)); const progress=[8,25,48,86][idx]||8;
  if(d.screen==='situation') return v15RenderSituation(root,c,d,progress);
  if(d.screen==='questions') return v15RenderQuestion(root,c,d,progress);
  if(d.screen==='compose') return v15RenderCompose(root,c,d,progress);
  const first=clientFirstName(c);
  renderClientShell(root,c,`<section class="cj-welcome v15-welcome"><div class="cj-kicker">ПЕРЕД ВСТРЕЧЕЙ · ОКОЛО 3 МИНУТ</div><h2>${first?`${first}, `:''}не нужно заранее знать, <span>как называется ваша проблема</span></h2><p class="cj-lead">Просто выберите то, что больше похоже на вашу жизнь сейчас. Дальше будет несколько коротких вопросов. Правильных ответов нет.</p><div class="v15-welcome-visual"><div class="v15-flow-pill"><b>1</b><span>Узнать свою ситуацию</span></div><i>→</i><div class="v15-flow-pill"><b>2</b><span>Выбрать близкие ответы</span></div><i>→</i><div class="v15-flow-pill"><b>3</b><span>Отправить психологу</span></div></div><div class="cj-action-row"><button class="primary-button cj-primary v15-big-cta" data-v15-action="start">Начать →</button><span>Можно остановиться и продолжить позже.</span></div><div class="v15-soft-note"><span>?</span><p><strong>Не знаете, что выбрать?</strong> В следующем экране есть варианты «всё сразу» и «у меня другое».</p></div></section>`,{stepLabel:'Подготовка к встрече',progress});
  v15WireClient(root,c);
};

function v15RenderSituation(root,c,d,progress){
  const order=['unclear','overload','breakup','conflict','parenting','special','aggression','study','work','combat','combatfamily','disability','other'];
  const cards=order.map(k=>{const p=V15_NATIVE_PATHS[k];return `<button class="v15-life-card ${d.path===k?'selected':''}" data-v15-path="${k}"><span class="v15-life-icon">${p.icon}</span><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div><i>${d.path===k?'✓':'→'}</i></button>`}).join('');
  renderClientShell(root,c,`<section class="cj-stage v15-stage"><button class="cj-back" data-v15-action="back-welcome">← Назад</button><div class="cj-kicker">ШАГ 1 ИЗ 3</div><h2>Что сейчас <span>тяжелее всего?</span></h2><p class="cj-lead small">Не ищите идеальный вариант. Нажмите на тот, который ближе всего. Психолог сможет изменить рабочий маршрут.</p><div class="v15-life-grid">${cards}</div></section>`,{stepLabel:'Шаг 1 · Что происходит',progress});
  v15WireClient(root,c);
}

function v15RenderQuestion(root,c,d,progress){
  if(!d.path){d.screen='situation';saveData();return renderClientStartFlow(root,c)}
  const qs=v15PathQuestions(d.path), q=qs[Math.min(d.qIndex||0,qs.length-1)], cur=d.answers[q.key];
  const multi=!!q.multi; const selected=Array.isArray(cur)?cur:cur?[cur]:[];
  const opts=q.opts.map(([v,icon,text])=>`<button class="v15-answer ${selected.includes(v)?'selected':''}" data-v15-answer="${esc(v)}" data-v15-multi="${multi?'1':'0'}"><span>${icon}</span><strong>${esc(text)}</strong><i>${selected.includes(v)?'✓':''}</i></button>`).join('');
  const pct=30+Math.round(((d.qIndex+1)/qs.length)*45);
  renderClientShell(root,c,`<section class="cj-stage cj-question-stage v15-stage"><div class="cj-question-meta"><button class="cj-back" data-v15-action="question-back">← Назад</button><span>${d.qIndex+1} / ${qs.length}</span></div><div class="cj-kicker">ШАГ 2 ИЗ 3</div><h2>${esc(q.title)}</h2><p class="cj-lead small">${q.key==='safety'?'Можно не отвечать здесь — это тоже допустимый выбор.':'Выберите наиболее близкий вариант'+(multi?' — можно несколько.':'.')}</p><div class="v15-answer-grid">${opts}</div><div class="cj-action-row between"><small>${multi?'Можно выбрать несколько вариантов.':'Не нужно объяснять ответ текстом.'}</small><button class="primary-button cj-primary" data-v15-action="question-next" ${selected.length?'':'disabled'}>${d.qIndex===qs.length-1?'Дальше →':'Следующий вопрос →'}</button></div></section>`,{stepLabel:`Шаг 2 · Вопрос ${d.qIndex+1} из ${qs.length}`,progress:pct});
  v15WireClient(root,c);
}

function v15RenderCompose(root,c,d,progress){
  const path=V15_NATIVE_PATHS[d.path]||V15_NATIVE_PATHS.other; const summary=v15SelectedSummary(d.path,d.answers);
  const hints=[...(V15_COMPOSER_HINTS[d.path]||[]),...V15_COMPOSER_HINTS.default].slice(0,8);
  const preview=summary.map(x=>`<div class="v15-preview-line"><span>${esc(x.q)}</span><strong>${esc(x.a)}</strong></div>`).join('');
  renderClientShell(root,c,`<section class="cj-stage v15-stage"><button class="cj-back" data-v15-action="compose-back">← К вопросам</button><div class="cj-kicker">ШАГ 3 ИЗ 3</div><h2>Если хотите — добавьте <span>пару слов</span></h2><p class="cj-lead small">Писать необязательно. Можно нажимать на готовые начала фраз — они появятся в поле ниже.</p><section class="v15-selected-card"><span>${path.icon}</span><div><small>Вы выбрали</small><strong>${esc(path.title)}</strong></div></section><div class="v15-phrase-chips">${hints.map(h=>`<button type="button" data-v15-phrase="${esc(h)}">＋ ${esc(h)}</button>`).join('')}</div><label class="v15-compose-box"><span>Что ещё важно знать психологу?</span><textarea id="v15ClientNote" rows="5" placeholder="Можно оставить пустым. Или нажмите на подсказку выше.">${esc(d.note||'')}</textarea></label><details class="v15-send-preview"><summary>Посмотреть, что ещё отправится психологу</summary>${preview}</details><div class="v15-send-row"><div><strong>Готово к отправке</strong><p>Психолог увидит ваши выборы и только тот текст, который вы решили добавить.</p></div><button class="primary-button cj-primary v15-big-cta" data-v15-action="send">Отправить психологу →</button></div></section>`,{stepLabel:'Шаг 3 · Вашими словами',progress});
  v15WireClient(root,c);
}

function v15WireClient(root,c){
  root.querySelector('[data-v15-action="start"]')?.addEventListener('click',()=>{const d=v15Draft(c);d.screen='situation';saveData();renderClientStartFlow(root,c)});
  root.querySelector('[data-v15-action="back-welcome"]')?.addEventListener('click',()=>{const d=v15Draft(c);d.screen='welcome';saveData();renderClientStartFlow(root,c)});
  root.querySelectorAll('[data-v15-path]').forEach(b=>b.addEventListener('click',()=>{const d=v15Draft(c);d.path=b.dataset.v15Path;d.qIndex=0;d.answers={};d.note='';d.screen='questions';saveData();renderClientStartFlow(root,c)}));
  root.querySelectorAll('[data-v15-answer]').forEach(b=>b.addEventListener('click',()=>{const d=v15Draft(c),qs=v15PathQuestions(d.path),q=qs[d.qIndex],v=b.dataset.v15Answer;if(!q)return;if(b.dataset.v15Multi==='1'){let arr=Array.isArray(d.answers[q.key])?[...d.answers[q.key]]:[];arr=arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];d.answers[q.key]=arr;}else d.answers[q.key]=v;saveData();renderClientStartFlow(root,c)}));
  root.querySelector('[data-v15-action="question-back"]')?.addEventListener('click',()=>{const d=v15Draft(c);if(d.qIndex>0)d.qIndex--;else d.screen='situation';saveData();renderClientStartFlow(root,c)});
  root.querySelector('[data-v15-action="question-next"]')?.addEventListener('click',()=>{const d=v15Draft(c),qs=v15PathQuestions(d.path),q=qs[d.qIndex],a=d.answers[q.key];if(!a||(Array.isArray(a)&&!a.length))return;if(d.qIndex<qs.length-1)d.qIndex++;else d.screen='compose';saveData();renderClientStartFlow(root,c)});
  root.querySelector('[data-v15-action="compose-back"]')?.addEventListener('click',()=>{const d=v15Draft(c);const qs=v15PathQuestions(d.path);d.note=(root.querySelector('#v15ClientNote')?.value||d.note||'').trim();d.screen='questions';d.qIndex=Math.max(0,qs.length-1);saveData();renderClientStartFlow(root,c)});
  root.querySelectorAll('[data-v15-phrase]').forEach(b=>b.addEventListener('click',()=>{const ta=root.querySelector('#v15ClientNote');if(!ta)return;const phrase=b.dataset.v15Phrase;const current=ta.value.trim();ta.value=current?`${current}\n${phrase}`:phrase;ta.focus();const d=v15Draft(c);d.note=ta.value;saveData();}));
  root.querySelector('#v15ClientNote')?.addEventListener('input',e=>{const d=v15Draft(c);d.note=e.target.value;saveData();});
  root.querySelector('[data-v15-action="send"]')?.addEventListener('click',()=>v15SendIntake(root,c));
}

function v15SendIntake(root,c){
  const d=v15Draft(c), path=d.path||'other', primary=V15_NATIVE_PATHS[path]?.scenario||'unclear_start';
  const suggested=v15Suggested(path,d.answers), flags=v15SafetyFlags(path,d.answers), summary=v15SelectedSummary(path,d.answers);
  const note=(root.querySelector('#v15ClientNote')?.value||d.note||'').trim();
  data.clientIntakes=data.clientIntakes.filter(x=>x.clientId!==c.id);
  data.clientIntakes.unshift({id:uid('intake'),clientId:c.id,date:todayISO(),category:scenarioCategory(primary),scenario:primary,nativePath:path,nativeTitle:V15_NATIVE_PATHS[path]?.title||'Другое',nativeAnswers:{...d.answers},nativeSummary:summary,suggestedScenarios:suggested,safetyFlags:flags,goal:v15GoalText(path,note),tried:'',concern:summary.slice(0,3).map(x=>x.a).join(' · '),preserve:note,clientNote:note,answers:{...d.answers}});
  delete data.clientDrafts[c.id];saveData();clientJourneyView='today';renderClientPortal(root);toast('Готово — психолог получил подготовку');
}

// ---------- После отправки: визуальная помощь с текущим шагом и подготовкой ----------
const V15_prevActionSpace=renderClientActionSpace;
renderClientActionSpace=function(root,c,intake){
  V15_prevActionSpace(root,c,intake);
  const ta=root.querySelector('#cjTaskResponse');
  if(ta && !root.querySelector('.v15-task-helper')){
    const helper=document.createElement('div');helper.className='v15-task-helper';helper.innerHTML=`<small>Не знаете, что написать? Нажмите на начало:</small><div>${['Получилось так…','Самым трудным было…','Я заметил(а), что…','Не получилось, потому что…','Хочу обсудить на встрече…'].map(x=>`<button type="button" data-v15-fill-task="${x}">＋ ${x}</button>`).join('')}</div>`;ta.parentElement.insertBefore(helper,ta);
    helper.querySelectorAll('[data-v15-fill-task]').forEach(b=>b.onclick=()=>{ta.value=(ta.value.trim()?ta.value.trim()+'\n':'')+b.dataset.v15FillTask;ta.focus();});
  }
};

const V15_prevPrep=renderClientPrepView;
renderClientPrepView=function(root,c,intake,prep,lastCheck){
  V15_prevPrep(root,c,intake,prep,lastCheck);
  const form=root.querySelector('#cjPrepForm');if(!form)return;
  const labels=[...form.querySelectorAll('textarea')];
  const chipSets=[['Стало легче…','Стало тяжелее…','Почти без изменений…'],['Попробовал(а)…','Удалось один раз…','Не получилось начать…'],['Застрял(а), когда…','Не понимаю…','Боюсь…'],['Хочу обсудить…','Нужна ясность про…','Не знаю, с чего начать…'],['Больше всего влияет…']];
  labels.forEach((ta,i)=>{if(ta.previousElementSibling?.classList?.contains('v15-inline-chips'))return;const box=document.createElement('div');box.className='v15-inline-chips';box.innerHTML=(chipSets[i]||chipSets.at(-1)).map(x=>`<button type="button" data-v15-prep-chip="${x}">${x}</button>`).join('');ta.parentElement.insertBefore(box,ta);box.querySelectorAll('button').forEach(b=>b.onclick=()=>{ta.value=(ta.value.trim()?ta.value.trim()+' ':'')+b.dataset.v15PrepChip;ta.focus();});});
};

// ---------- Психолог: карточка клиента как рабочая карта ----------
appendOperationalClientOverview=function(c){
  const root=document.getElementById('clientTabRoot');if(!root)return;
  root.querySelectorAll('.pilot-between,.work-client-console,.v15-client-map').forEach(x=>x.remove());
  const intake=latestClientIntake(c.id),prep=clientPreparations(c.id)[0],check=clientCheckins(c.id)[0],done=unreviewedAssignments(c.id);
  const suggestions=(intake?.suggestedScenarios?.length?intake.suggestedScenarios:[currentScenarioFor(c)].filter(Boolean)).filter(k=>scenarios[k]);
  const flags=intake?.safetyFlags||[];
  const summary=intake?.nativeSummary||[];
  const block=document.createElement('section');block.className='v15-client-map';block.innerHTML=`
    <header class="v15-map-head"><div><span class="section-label">Клиентская карта v15</span><h2>Что происходит с ${esc(c.name)}</h2><p>Слова клиента → возможные маршруты → решение психолога. Сценарий не является диагнозом.</p></div><div class="work-client-tools"><button class="quiet-button" data-work-action="access" data-client="${c.id}">Пригласить клиента</button><button class="primary-button" data-work-action="start-session" data-client="${c.id}">Начать встречу →</button></div></header>
    ${flags.length?`<section class="v15-safety-flag"><strong>⚠ Сначала прояснить</strong>${flags.map(f=>`<p>${esc(f)}</p>`).join('')}</section>`:''}
    <div class="v15-map-grid">
      <section class="v15-map-card primary"><small>Как клиент назвал ситуацию</small><h3>${esc(intake?.nativeTitle||intake?.goal||'Подготовка ещё не отправлена')}</h3><p>${esc(intake?.clientNote||intake?.preserve||'')}</p>${summary.length?`<div class="v15-answer-badges">${summary.slice(0,6).map(x=>`<span><b>${esc(x.q)}</b>${esc(x.a)}</span>`).join('')}</div>`:''}</section>
      <section class="v15-map-card"><small>Возможные рабочие маршруты</small>${suggestions.length?suggestions.map((k,i)=>`<button class="v15-route-suggestion ${i===0?'active':''}" data-v15-route="${k}"><b>${i+1}</b><span><strong>${esc(scenarios[k].title)}</strong><small>${esc(SCENARIO_GUIDE[k]?.when||scenarios[k].text||'')}</small></span></button>`).join(''):'<p>Сценарий пока не определён — можно начать без него.</p>'}<button class="v15-no-route" data-v15-route="">Работать без сценария</button></section>
      <section class="v15-map-card"><small>Перед встречей</small><h3>${esc(prep?.focus||'Нет новой подготовки')}</h3><p>${esc(prep?.stuck||prep?.changed||'')}</p>${check?`<div class="v15-check-row"><span>Ясность <b>${check.clarity}/10</b></span><span>Напряжение <b>${check.tension}/10</b></span></div>`:''}</section>
      <section class="v15-map-card"><small>Между встречами</small><h3>${done.length?`${done.length} результат(а) ждут разбора`:'Новых результатов нет'}</h3><p>${esc(done[0]?.response||'')}</p></section>
    </div>`;
  root.prepend(block);wireWorkActions(root);
  block.querySelectorAll('[data-v15-route]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.v15Route;if(intake){intake.psychSelectedScenario=key; if(key) intake.scenario=key; saveData();}block.querySelectorAll('[data-v15-route]').forEach(x=>x.classList.toggle('active',x===b));toast(key?'Рабочий маршрут выбран':'Можно работать без сценария');}));
};

// ---------- Рабочая сессия: visual second brain ----------
startWorkSession=function(clientId){
  const c=clientById(clientId);if(!c)return;data.activeClientId=c.id;saveData();
  const prep=clientPreparations(c.id)[0],intake=latestClientIntake(c.id),last=latestSession(c.id);const scenario=(intake&&Object.prototype.hasOwnProperty.call(intake,'psychSelectedScenario'))?intake.psychSelectedScenario:(currentScenarioFor(c)||'unclear_start');
  workSessionDraft={clientId:c.id,scenario,stage:'before',notes:'',clarified:'',hypothesis:c.formulation||'',altHypothesis:'',interventions:'',sharedSummary:'',nextFocus:last?.nextFocus||'',assignmentType:'observe',assignmentTitle:'',assignmentPrompt:'',deadline:isoOffset(3),stateBefore:5,stateAfter:6,date:todayISO(),duration:60};
  const overlay=document.getElementById('workSessionOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderWorkSession();
};

renderSessionBefore=function(c,prep,intake,last,done,guide){
  const flags=intake?.safetyFlags||[], suggestions=(intake?.suggestedScenarios||[]).filter(k=>scenarios[k]);
  return `<section class="work-session-before v15-before"><div class="work-session-title"><span class="section-label">Перед разговором · 60 секунд</span><h1>Не готовое объяснение, а карта внимания</h1><p>Сначала слова клиента и безопасность. Затем — рабочий маршрут, который можно изменить в любой момент.</p></div>${flags.length?`<div class="v15-safety-flag"><strong>⚠ Приоритет перед обычной работой</strong>${flags.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}<div class="work-before-grid"><section class="work-session-card"><small>Слова клиента</small><h3>${esc(intake?.nativeTitle||prep?.focus||intake?.goal||'Фокус не указан')}</h3><p>${esc(intake?.clientNote||prep?.stuck||intake?.concern||'')}</p></section><section class="work-session-card"><small>Что изменилось</small><h3>${esc(prep?.changed||'Новых данных пока нет')}</h3><p>${esc(prep?.worked||'')}</p></section><section class="work-session-card"><small>Последняя гипотеза</small><h3>${esc(c.formulation||last?.hypothesis||'Пока не сформулирована')}</h3><p>Ищите данные, которые могут её не только подтвердить, но и опровергнуть.</p></section><section class="work-session-card accent"><small>Рабочая опора</small><h3>${esc(scenarios[workSessionDraft.scenario]?.title||'Без сценария')}</h3><p>${esc(guide?.aim||'Начните с конкретного эпизода и одного проверяемого фокуса.')}</p><div class="work-opening">${(guide?.opening||[]).slice(0,3).map(x=>`<button data-copy-question="${esc(x)}">${esc(x)}</button>`).join('')}</div></section></div><div class="v15-route-strip">${suggestions.map(k=>`<button data-v15-session-route="${k}" class="${workSessionDraft.scenario===k?'active':''}">${esc(scenarios[k].title)}</button>`).join('')}<button data-v15-session-route="">Без сценария</button></div><div class="work-session-next"><button class="primary-button" data-session-stage="during">Перейти к встрече →</button></div></section>`;
};

renderSessionDuring=function(c,intake,guide,qs,d){
  const hints=qs.slice(0,5).map((q,i)=>{const h=PSYCH_HINTS[d.scenario]?.[q.key];return `<article class="v15-rail-card"><div><b>${i+1}</b><strong>${esc(q.title)}</strong></div><p>${esc(h?.listen||q.help||'')}</p>${h?.ask?`<button data-copy-question="${esc(h.ask)}">💬 ${esc(h.ask)}</button>`:''}${h?.caution?`<small>⚠ ${esc(h.caution)}</small>`:''}</article>`}).join('');
  const markers=['перегрузка','страх оценки','избегание','утрата','конфликт потребностей','семейные ожидания','внешний барьер','ресурс обнаружен','пока неясно'];
  return `<section class="work-during-layout v15-during"><aside class="work-method-panel v15-right-rail"><span class="section-label">РАБОЧАЯ ОПОРА</span><h2>${esc(scenarios[d.scenario]?.title||'Без сценария')}</h2><p>${esc(guide?.aim||'Используйте свободную гипотезу и конкретные эпизоды.')}</p><div class="work-hints-scroll">${hints||'<div class="v15-empty-rail">Сценарий не выбран. Слушайте конкретный эпизод → контекст → реакцию → последствия → исключения.</div>'}</div></aside><main class="work-live-notes"><div class="work-session-title compact"><span class="section-label">Во время встречи</span><h1>Факты → гипотеза → альтернатива</h1></div><label><span>Ключевые слова / наблюдения</span><textarea data-session-field="notes" rows="6" placeholder="Формулировки клиента, конкретные эпизоды, противоречия…">${esc(d.notes)}</textarea></label><div class="v15-psych-chips"><small>Что сейчас проявилось?</small>${markers.map(x=>`<button type="button" data-v15-hyp-chip="${x}">${x}</button>`).join('')}</div><label><span>Рабочая гипотеза <small>— версия, которую нужно проверить</small></span><textarea data-session-field="hypothesis" rows="4" placeholder="Возможно, трудность поддерживается…">${esc(d.hypothesis)}</textarea></label><label><span>Альтернативная гипотеза / что может опровергнуть первую</span><textarea data-session-field="altHypothesis" rows="3" placeholder="Другая версия или факт, который не укладывается в текущую гипотезу…">${esc(d.altHypothesis)}</textarea></label><div class="work-state-row"><label><span>Состояние до</span><input type="range" min="0" max="10" value="${d.stateBefore}" data-session-field="stateBefore"><output>${d.stateBefore}</output></label><label><span>Состояние после</span><input type="range" min="0" max="10" value="${d.stateAfter}" data-session-field="stateAfter"><output>${d.stateAfter}</output></label></div><div class="work-session-next"><button class="quiet-button" data-session-stage="before">← Контекст</button><button class="primary-button" data-session-stage="finish">Сформировать итог →</button></div></main></section>`;
};

renderSessionFinish=function(c,d){
  const types=[['observe','👀','Наблюдать'],['record','📝','Зафиксировать'],['test','🧪','Проверить'],['talk','💬','Поговорить'],['action','→','Одно действие'],['stabilize','◌','Стабилизация'],['none','—','Без задания']];
  return `<section class="work-finish-layout v15-finish"><div class="work-session-title"><span class="section-label">Завершение встречи · краткий режим</span><h1>Четыре смысловых блока — без CRM-перегруза</h1><p>Внутренние версии остаются у психолога. Клиент получает только согласованный итог и следующий шаг.</p></div><div class="work-finish-grid"><section class="work-finish-private"><span>ТОЛЬКО ПСИХОЛОГУ</span><label><small>Что сегодня стало понятнее</small><textarea data-session-field="clarified" rows="3" placeholder="Факт или изменение понимания…">${esc(d.clarified||'')}</textarea></label><label><small>Рабочая гипотеза</small><textarea data-session-field="hypothesis" rows="3">${esc(d.hypothesis)}</textarea></label><label><small>Альтернатива / что ещё проверить</small><textarea data-session-field="altHypothesis" rows="3">${esc(d.altHypothesis||'')}</textarea></label><label><small>Следующий профессиональный фокус</small><textarea data-session-field="nextFocus" rows="2">${esc(d.nextFocus)}</textarea></label></section><section class="work-finish-shared"><span>УВИДИТ КЛИЕНТ</span><label><small>Что прояснили сегодня</small><textarea data-session-field="sharedSummary" rows="4" placeholder="Коротко и нейтрально…">${esc(d.sharedSummary)}</textarea></label><div class="v15-assignment-types"><small>Следующий шаг</small>${types.map(([k,ic,l])=>`<button type="button" data-v15-assignment-type="${k}" class="${d.assignmentType===k?'active':''}"><span>${ic}</span>${l}</button>`).join('')}</div><label><small>Формулировка шага</small><input data-session-field="assignmentTitle" value="${esc(d.assignmentTitle)}" placeholder="Можно оставить пустым при «без задания»"></label><label><small>Как выполнить / что заметить</small><textarea data-session-field="assignmentPrompt" rows="3">${esc(d.assignmentPrompt)}</textarea></label><label><small>Срок</small><input type="date" data-session-field="deadline" value="${esc(d.deadline)}"></label></section></div><div class="work-session-next"><button class="quiet-button" data-session-stage="during">← Вернуться</button><button class="primary-button" data-session-save>Сохранить сессию →</button></div></section>`;
};

const V15_prevWireWorkSession=wireWorkSession;
wireWorkSession=function(root){
  V15_prevWireWorkSession(root);
  root.querySelectorAll('[data-v15-session-route]').forEach(b=>b.addEventListener('click',()=>{workSessionDraft.scenario=b.dataset.v15SessionRoute||'';renderWorkSession();}));
  root.querySelectorAll('[data-v15-hyp-chip]').forEach(b=>b.addEventListener('click',()=>{const ta=root.querySelector('[data-session-field="hypothesis"]');if(!ta)return;const phrase=b.dataset.v15HypChip;ta.value=ta.value.trim()?`${ta.value.trim()}; ${phrase}`:`Возможно, важно проверить: ${phrase}`;workSessionDraft.hypothesis=ta.value;ta.focus();}));
  root.querySelectorAll('[data-v15-assignment-type]').forEach(b=>b.addEventListener('click',()=>{workSessionDraft.assignmentType=b.dataset.v15AssignmentType;const presets={observe:['Наблюдать один повторяющийся эпизод','Ничего специально не менять. Отметить: что было до → что вы сделали → что произошло после.'],record:['Зафиксировать 3 эпизода','Коротко записать ситуацию, свою реакцию и результат.'],test:['Проверить одну гипотезу','Сделать небольшой безопасный эксперимент и отметить фактический результат.'],talk:['Один конкретный разговор','Обсудить один вопрос в согласованном формате и заметить, что изменилось.'],action:['Сделать одно действие','Выбрать минимальный реальный шаг и отметить, что помогло или помешало.'],stabilize:['Поддержать базовую устойчивость','Сосредоточиться на одном согласованном способе восстановления или снижении нагрузки.'],none:['','']};const p=presets[workSessionDraft.assignmentType]||['',''];workSessionDraft.assignmentTitle=p[0];workSessionDraft.assignmentPrompt=p[1];renderWorkSession();}));
};

saveWorkSession=function(){
  const d=workSessionDraft,c=clientById(d.clientId);if(!c)return;
  const theme=d.sharedSummary.trim()?truncate(d.sharedSummary.trim(),180):(latestClientIntake(c.id)?.nativeTitle||latestClientIntake(c.id)?.goal||'Психологическая сессия');
  data.sessions.push({id:uid('session'),clientId:c.id,date:d.date,format:'Онлайн / очно',duration:Number(d.duration)||60,stateBefore:Number(d.stateBefore),stateAfter:Number(d.stateAfter),theme,notes:d.notes.trim(),clarified:(d.clarified||'').trim(),hypothesis:d.hypothesis.trim(),altHypothesis:(d.altHypothesis||'').trim(),interventions:d.interventions?.trim?.()||'',homework:d.assignmentType==='none'?'':d.assignmentTitle.trim(),sharedSummary:d.sharedSummary.trim(),nextFocus:d.nextFocus.trim(),scenario:d.scenario||''});
  c.formulation=d.hypothesis.trim()||c.formulation;
  if(d.assignmentType!=='none' && d.assignmentTitle.trim()) data.assignments.unshift({id:uid('as'),clientId:c.id,title:d.assignmentTitle.trim(),prompt:d.assignmentPrompt.trim()||'Выполните согласованный шаг и коротко отметьте, что получилось.',deadline:d.deadline,createdAt:todayISO(),status:'assigned',response:'',completedAt:'',scenario:d.scenario||'',source:'session'});
  data.preparations.filter(x=>x.clientId===c.id&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  data.clientIntakes.filter(x=>x.clientId===c.id&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  data.assignments.filter(x=>x.clientId===c.id&&x.status==='done'&&!x.reviewedAt).forEach(x=>x.reviewedAt=new Date().toISOString());
  saveData();closeWorkSession();ui.view='client';ui.clientTab='overview';renderView();toast('Сессия сохранена. Клиент видит только согласованный итог и шаг.');
};

// ---------- История клиента: показываем человеческий язык ----------
renderClientHistoryView=function(root,c,intake,done,lastS,lastCheck,prep){
  const nav=`<nav class="cj-nav"><button data-cj-view="today">Сейчас</button><button data-cj-view="route">Маршрут</button><button class="active" data-cj-view="history">История</button></nav>`;
  const items=(intake.nativeSummary||[]).map(x=>`<div class="cj-history-line"><span>${esc(x.q)}</span><strong>${esc(x.a)}</strong></div>`).join('');
  const sessions=clientSessions(c.id).slice(0,8);
  renderClientShell(root,c,`${nav}<section class="cj-stage"><div class="cj-kicker">МОИ МАТЕРИАЛЫ</div><h2>Что уже <span>зафиксировано</span></h2><div class="cj-history-grid"><section class="cj-history-card"><header><div><small>Стартовая подготовка</small><strong>${esc(intake.nativeTitle||'Моя ситуация')}</strong></div></header><p>${esc(intake.clientNote||'')}</p>${items?`<details><summary>Мои ответы</summary>${items}</details>`:''}</section><section class="cj-history-card"><header><div><small>Выполненные шаги</small><strong>${done.length}</strong></div></header>${done.length?done.map(a=>`<article class="cj-done-item"><span>✓</span><div><strong>${esc(a.title)}</strong><p>${esc(a.response||'')}</p></div></article>`).join(''):'<p class="muted-copy">Пока нет завершённых шагов.</p>'}</section></div><div class="work-client-session-history">${sessions.length?sessions.map(s=>`<article class="cj-history-card wide"><header><div><small>${shortDate(s.date)}</small><strong>${esc(s.theme||'Итог встречи')}</strong></div></header><p>${esc(s.sharedSummary||'Согласованный итог не добавлен.')}</p>${s.homework?`<div class="cj-shared-focus"><small>Следующий шаг</small><strong>${esc(s.homework)}</strong></div>`:''}</article>`).join(''):'<div class="empty-state"><p>Сохранённых итогов встреч пока нет.</p></div>'}</div><div class="cj-action-row"><button class="quiet-button" data-cj-view="today">← Вернуться</button></div></section>`,{stepLabel:'История работы'});
};

// ---------- Обновляем тексты продукта ----------
try{
  document.querySelector('.brand-copy small').textContent='рабочая система психолога';
  document.querySelector('.mobile-brand strong').textContent='Точка опоры';
  document.title='Точка опоры v15 — психолог + клиент';
}catch{}

