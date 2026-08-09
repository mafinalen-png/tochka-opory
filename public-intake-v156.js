/* Точка опоры v15.6 — публичная страница психолога и первое обращение клиента */
(function(){
  'use strict';
  const TOPICS={
    relationships:'Отношения и конфликты',stress:'Тревога, стресс и перегрузка',self:'Самооценка и границы',
    change:'Перемены и сложные решения',family:'Семья и родительство',career:'Работа и самореализация',habits:'Привычки и саморегуляция',other:'Другое / пока не знаю'
  };
  const params=new URL(location.href).searchParams;
  const psychSlug=(params.get('psych')||'').trim().toLowerCase();
  const hasClientToken=!!params.get('client');
  const SB=()=>window.__tochkaSB||null;
  const e=(v='')=>typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtWhen=v=>{try{return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return ''}};
  const schemaMissing=err=>/relation .*tochka_public_|could not find|does not exist|schema cache/i.test(String(err?.message||err||''));

  function publicUrl(slug){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('psych',slug);return u.toString()}
  function profileMeta(p){
    document.title=`${p.display_name} — ${p.professional_title||'психолог'} | Точка опоры`;
    let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}
    m.content=(p.about||`${p.professional_title||'Психолог'}. Первичное обращение онлайн.`).slice(0,155);
  }

  function ensurePublicOverlay(){
    let x=document.getElementById('publicPsychOverlay');if(x)return x;
    x=document.createElement('section');x.id='publicPsychOverlay';x.className='public-psych-overlay';x.setAttribute('aria-live','polite');document.body.appendChild(x);return x;
  }
  function closePublicOverlay(){document.getElementById('publicPsychOverlay')?.remove();document.body.classList.remove('public-profile-open')}

  async function fetchProfiles(){
    const sb=SB();if(!sb)throw new Error('Подключение ещё загружается');
    const {data,error}=await sb.from('tochka_public_profiles').select('owner_id,slug,display_name,professional_title,about,location,formats,published,accepts_inquiries').eq('published',true).order('display_name',{ascending:true}).limit(40);
    if(error)throw error;return data||[];
  }
  async function fetchProfile(slug){
    const sb=SB();if(!sb)throw new Error('Подключение ещё загружается');
    const {data,error}=await sb.from('tochka_public_profiles').select('owner_id,slug,display_name,professional_title,about,location,formats,published,accepts_inquiries').eq('slug',slug).eq('published',true).maybeSingle();
    if(error)throw error;return data;
  }

  function renderPublicProfile(p){
    const root=ensurePublicOverlay();document.body.classList.add('public-profile-open');profileMeta(p);
    const topics=Object.entries(TOPICS).map(([k,v])=>`<option value="${k}">${e(v)}</option>`).join('');
    root.innerHTML=`<div class="public-profile-shell">
      <header class="public-profile-top"><a href="${e(location.pathname)}" class="public-brand">◎ <strong>Точка опоры</strong></a><button class="a11y-public-view" type="button" onclick="document.getElementById('a11yViewToggle')?.click()">Aa Вид</button></header>
      <main class="public-profile-main">
        <section class="public-profile-card">
          <span class="public-kicker">МОЖНО ОБРАТИТЬСЯ БЕЗ РЕГИСТРАЦИИ</span>
          <h1>${e(p.display_name)}</h1><h2>${e(p.professional_title||'Психолог')}</h2>
          ${p.location||p.formats?`<div class="public-profile-meta">${p.location?`<span>⌖ ${e(p.location)}</span>`:''}${p.formats?`<span>◫ ${e(p.formats)}</span>`:''}</div>`:''}
          <p class="public-about">${e(p.about||'Здесь можно коротко описать, с чем вы хотите обратиться. Для первого контакта не нужно рассказывать всю историю.')}</p>
          ${p.accepts_inquiries?'<button class="primary-button public-main-cta" id="publicGoInquiry">Написать психологу →</button>':'<div class="public-not-accepting">Сейчас новые обращения через форму временно не принимаются.</div>'}
          <p class="public-data-note">Для первого контакта достаточно короткого описания и способа связаться. Не указывайте лишние чувствительные сведения.</p>
        </section>
        ${p.accepts_inquiries?`<section class="public-inquiry-card" id="publicInquiryCard">
          <span class="public-kicker">ПЕРВИЧНОЕ ОБРАЩЕНИЕ</span><h2>С чем вы хотите обратиться?</h2><p>Это не тест и не диагностика. Сообщение нужно только психологу, чтобы понять ваш запрос и ответить.</p>
          <form id="publicInquiryForm">
            <label><span>Как к вам обращаться</span><input name="name" maxlength="100" autocomplete="name" placeholder="Имя или псевдоним"></label>
            <label><span>Тема</span><select name="topic">${topics}</select></label>
            <label class="public-full"><span>Что сейчас происходит?</span><textarea name="message" rows="5" minlength="10" maxlength="1800" required placeholder="Например: последние месяцы часто тревожусь, трудно отдыхать и стало сложнее справляться с работой. Хочу понять, можно ли с этим работать."></textarea><small>Коротко, своими словами. Подробности можно обсудить позже.</small></label>
            <label><span>Как с вами связаться</span><input name="contact" maxlength="180" required autocomplete="email" placeholder="Телефон, e-mail или @мессенджер"></label>
            <label><span>Когда удобнее ответить</span><input name="preferred" maxlength="120" placeholder="Например: после 18:00"></label>
            <label class="public-honeypot" aria-hidden="true">Сайт<input name="website" tabindex="-1" autocomplete="off"></label>
            <label class="public-consent public-full"><input type="checkbox" name="consent" required><span>Я согласен(на) передать эти данные психологу для ответа на моё обращение.</span></label>
            <div class="public-full public-form-actions"><button class="primary-button" type="submit">Отправить психологу →</button><span id="publicInquiryStatus" role="status"></span></div>
          </form>
          <div class="public-crisis-note">Если прямо сейчас есть непосредственная угроза жизни или безопасности, эта форма не подходит для срочной помощи — обратитесь в местную экстренную службу или к доступной очной кризисной помощи.</div>
        </section>`:''}
      </main>
    </div>`;
    root.querySelector('#publicGoInquiry')?.addEventListener('click',()=>root.querySelector('#publicInquiryCard')?.scrollIntoView({behavior:'smooth',block:'start'}));
    const form=root.querySelector('#publicInquiryForm');if(form){const opened=Date.now();form.addEventListener('submit',async ev=>{
      ev.preventDefault();const status=root.querySelector('#publicInquiryStatus'),fd=new FormData(form);
      if(fd.get('website'))return;if(Date.now()-opened<1200){status.textContent='Попробуйте ещё раз через секунду.';return}
      status.textContent='Отправляем…';const button=form.querySelector('button[type="submit"]');button.disabled=true;
      try{
        const sb=SB();if(!sb)throw new Error('Нет соединения');
        const {error}=await sb.rpc('tochka_submit_public_inquiry',{p_slug:p.slug,p_name:String(fd.get('name')||''),p_contact:String(fd.get('contact')||''),p_topic:String(fd.get('topic')||'other'),p_message:String(fd.get('message')||''),p_preferred_contact:String(fd.get('preferred')||'')});
        if(error)throw error;
        form.innerHTML='<div class="public-success"><span>✓</span><h3>Сообщение отправлено</h3><p>Психолог получил ваше обращение. Теперь можно закрыть страницу — повторно ничего отправлять не нужно.</p></div>';
      }catch(err){console.error(err);status.textContent=schemaMissing(err)?'Форма обращений ещё не подключена психологом.':'Не удалось отправить. Проверьте соединение и попробуйте ещё раз.';button.disabled=false}
    })}
  }

  async function openProfile(slug){
    const root=ensurePublicOverlay();document.body.classList.add('public-profile-open');root.innerHTML='<div class="public-loading"><span>◎</span><strong>Открываем страницу психолога…</strong></div>';
    try{const p=await fetchProfile(slug);if(!p)throw new Error('Профиль не найден');renderPublicProfile(p)}catch(err){console.error(err);root.innerHTML=`<div class="public-loading public-error"><strong>Страница психолога пока недоступна</strong><p>${schemaMissing(err)?'Публичные обращения ещё не подключены в Supabase.':'Проверьте ссылку или попробуйте позже.'}</p><a href="${e(location.pathname)}" class="quiet-button">На главную</a></div>`}
  }

  async function openDirectory(){
    const root=ensurePublicOverlay();document.body.classList.add('public-profile-open');root.innerHTML='<div class="public-loading"><span>◎</span><strong>Ищем психологов, принимающих обращения…</strong></div>';
    try{
      const profiles=(await fetchProfiles()).filter(p=>p.accepts_inquiries);root.innerHTML=`<div class="public-directory"><header><button class="quiet-button" id="publicDirectoryBack">← Назад</button><div><span class="public-kicker">ДЛЯ КЛИЕНТА</span><h1>Выберите психолога</h1><p>Откройте профиль и отправьте короткое первичное обращение без регистрации.</p></div></header><div class="public-directory-grid">${profiles.length?profiles.map(p=>`<button class="public-directory-card" data-public-slug="${e(p.slug)}"><strong>${e(p.display_name)}</strong><span>${e(p.professional_title||'Психолог')}</span><p>${e((p.about||p.formats||'Принимает первичные обращения.').slice(0,180))}</p><i>Открыть профиль →</i></button>`).join(''):'<div class="public-empty">Пока нет опубликованных профилей, принимающих новые обращения.</div>'}</div></div>`;
      root.querySelector('#publicDirectoryBack')?.addEventListener('click',closePublicOverlay);root.querySelectorAll('[data-public-slug]').forEach(b=>b.addEventListener('click',()=>{const u=new URL(location.href);u.search='';u.searchParams.set('psych',b.dataset.publicSlug);history.pushState({},'',u);openProfile(b.dataset.publicSlug)}));
    }catch(err){root.innerHTML=`<div class="public-loading public-error"><strong>Раздел для клиентов ещё не подключён</strong><p>${schemaMissing(err)?'Нужно один раз включить публичные профили в Supabase.':'Не удалось загрузить данные.'}</p><button class="quiet-button" id="publicDirectoryClose">Закрыть</button></div>`;root.querySelector('#publicDirectoryClose')?.addEventListener('click',closePublicOverlay)}
  }

  function ensureClientGateEntry(){
    if(hasClientToken||psychSlug)return;
    const gate=document.getElementById('workLoginGate'),shell=gate?.querySelector('.work-login-shell');if(!shell||shell.querySelector('.public-client-entry'))return;
    const sec=document.createElement('section');sec.className='public-client-entry';sec.innerHTML='<span class="work-login-kicker">ДЛЯ КЛИЕНТА</span><h1>Хотите обратиться к психологу?</h1><p>Посмотрите профиль и отправьте короткий запрос без регистрации и без доступа к рабочему кабинету.</p><button class="primary-button" type="button">Найти психолога →</button>';
    const brand=shell.querySelector('.work-login-brand');if(brand)brand.insertAdjacentElement('afterend',sec);else shell.prepend(sec);sec.querySelector('button').addEventListener('click',openDirectory);
    const preview=shell.querySelector('.babkin-preview-intro');if(preview){preview.querySelector('.work-login-kicker')&&(preview.querySelector('.work-login-kicker').textContent='ДЛЯ ПСИХОЛОГА');const h=preview.querySelector('h1');if(h)h.textContent='Посмотреть рабочий кабинет психолога'}
  }

  async function loadOwnProfile(){
    const sb=SB();if(!sb)return {profile:null,user:null,error:new Error('Supabase не подключён')};
    const {data:u,error:ue}=await sb.auth.getUser();if(ue||!u?.user)return {profile:null,user:null,error:ue||new Error('Нет сессии')};
    const {data,error}=await sb.from('tochka_public_profiles').select('*').eq('owner_id',u.user.id).maybeSingle();return {profile:data||null,user:u.user,error};
  }
  function slugify(v){return String(v||'').toLowerCase().trim().replace(/[^a-z0-9а-яё\s-]/gi,'').replace(/[а-яё]/gi,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,45)}

  async function injectPublicProfileSettings(root){
    if(!root||root.querySelector('.public-profile-settings')||typeof getWorkSession!=='function'||getWorkSession()?.role!=='psychologist')return;
    const sec=document.createElement('section');sec.className='settings-card public-profile-settings';sec.innerHTML='<h3>Публичная страница психолога</h3><p>Загружаем настройки…</p>';
    const grid=root.querySelector('.settings-grid');if(grid)grid.prepend(sec);else root.prepend(sec);
    const own=await loadOwnProfile();if(own.error){sec.innerHTML=`<h3>Публичная страница психолога</h3><p>${schemaMissing(own.error)?'Для приёма обращений нужно один раз выполнить файл supabase-public-intake-v156.sql в Supabase SQL Editor. После этого здесь появятся настройки профиля.':'Не удалось загрузить настройки публичной страницы.'}</p>`;return}
    const p=own.profile||{}, defaultSlug=p.slug||`psycholog-${own.user.id.slice(0,6)}`;
    sec.innerHTML=`<h3>Публичная страница психолога</h3><p>Эту страницу можно дать на сайте, в соцсетях или в поиске. Клиент увидит только публичный профиль и форму первого обращения.</p><form class="public-settings-form" id="publicProfileForm">
      <label><span>Имя для клиента</span><input name="display_name" required maxlength="120" value="${e(p.display_name||'Психолог')}"></label>
      <label><span>Профессиональное описание</span><input name="professional_title" maxlength="160" value="${e(p.professional_title||'Психолог')}"></label>
      <label class="public-settings-full"><span>Коротко о работе</span><textarea name="about" rows="4" maxlength="1200" placeholder="С какими запросами работаете и как проходит первый контакт">${e(p.about||'')}</textarea></label>
      <label><span>Город / регион</span><input name="location" maxlength="160" value="${e(p.location||'')}"></label>
      <label><span>Формат</span><input name="formats" maxlength="240" value="${e(p.formats||'Онлайн')}"></label>
      <label><span>Адрес страницы</span><input name="slug" required pattern="[a-z0-9][a-z0-9-]{2,48}" value="${e(defaultSlug)}"><small>Латиница, цифры и дефис.</small></label>
      <div class="public-settings-checks"><label><input type="checkbox" name="published" ${p.published!==false?'checked':''}> Профиль опубликован</label><label><input type="checkbox" name="accepts" ${p.accepts_inquiries!==false?'checked':''}> Принимаю новые обращения</label></div>
      <div class="public-settings-actions public-settings-full"><button class="primary-button" type="submit">Сохранить публичный профиль</button>${p.slug?`<button class="quiet-button" type="button" data-copy-public>Скопировать ссылку</button><button class="quiet-button" type="button" data-open-public>Открыть как клиент ↗</button>`:''}<span class="public-settings-status" role="status"></span></div>
    </form>`;
    const form=sec.querySelector('#publicProfileForm'),status=sec.querySelector('.public-settings-status');
    form.addEventListener('submit',async ev=>{ev.preventDefault();const fd=new FormData(form),slug=slugify(fd.get('slug'));if(slug.length<3){status.textContent='Адрес страницы должен быть не короче 3 символов.';return}status.textContent='Сохраняем…';const row={owner_id:own.user.id,slug,display_name:String(fd.get('display_name')||'Психолог').trim(),professional_title:String(fd.get('professional_title')||'Психолог').trim(),about:String(fd.get('about')||'').trim(),location:String(fd.get('location')||'').trim(),formats:String(fd.get('formats')||'').trim(),published:fd.get('published')==='on',accepts_inquiries:fd.get('accepts')==='on',updated_at:new Date().toISOString()};const {error}=await SB().from('tochka_public_profiles').upsert(row,{onConflict:'owner_id'});if(error){status.textContent=/duplicate key|unique/i.test(error.message||'')?'Такой адрес уже занят. Выберите другой.':'Не удалось сохранить.';return}status.textContent='Сохранено.';injectRefreshSettings()});
    const link=()=>publicUrl(form.elements.slug.value.trim());sec.querySelector('[data-copy-public]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(link());status.textContent='Ссылка скопирована.'}catch{prompt('Скопируйте ссылку:',link())}});sec.querySelector('[data-open-public]')?.addEventListener('click',()=>window.open(link(),'_blank','noopener'));
  }
  function injectRefreshSettings(){if(typeof ui!=='undefined'&&ui.view==='settings'&&typeof renderView==='function')renderView()}

  async function loadPublicInquiries(root){
    if(!root||typeof getWorkSession!=='function'||getWorkSession()?.role!=='psychologist'||!SB())return;
    const {data,error}=await SB().from('tochka_public_inquiries').select('*').in('status',['new','accepted']).order('created_at',{ascending:false}).limit(50);if(error)return;
    const fresh=(data||[]).filter(x=>x.status==='new');const badge=document.getElementById('inboxCountBadge');if(badge){const base=typeof countInbox==='function'?countInbox():0;badge.textContent=base+fresh.length}
    if(!fresh.length)return;
    const sec=document.createElement('section');sec.className='panel public-inquiries-panel';sec.innerHTML=`<div class="panel-head"><div><span class="section-label">НОВЫЕ ОБРАЩЕНИЯ С ПУБЛИЧНОЙ СТРАНИЦЫ</span><h2>${fresh.length} ${fresh.length===1?'новое обращение':'новых обращения'}</h2><p>Это люди, которые ещё не являются клиентами. Сначала решите, хотите ли вы ответить и добавить человека в работу.</p></div></div><div class="public-inquiries-list">${fresh.map(i=>`<article class="public-inquiry-item" data-inquiry-id="${e(i.id)}"><div><span>${e(TOPICS[i.topic]||TOPICS.other)} · ${e(fmtWhen(i.created_at))}</span><strong>${e(i.name||'Имя не указано')}</strong><p>${e(i.message)}</p><small>Контакт: ${e(i.contact)}${i.preferred_contact?` · ${e(i.preferred_contact)}`:''}</small></div><div><button class="primary-button" data-inquiry-accept="${e(i.id)}">Добавить в клиенты</button><button class="quiet-button" data-inquiry-close="${e(i.id)}">Закрыть без добавления</button></div></article>`).join('')}</div>`;
    const target=root.querySelector('.work-inbox-full')||root.firstElementChild;target?.insertAdjacentElement('beforebegin',sec);
    sec.querySelectorAll('[data-inquiry-accept]').forEach(b=>b.addEventListener('click',async()=>{const i=fresh.find(x=>x.id===b.dataset.inquiryAccept);if(!i)return;const c={id:typeof uid==='function'?uid('client'):`client_${Date.now()}`,name:i.name||'Новый клиент',age:'',contact:i.contact,status:'active',request:i.message,context:`Первичное обращение через публичную страницу. Тема: ${TOPICS[i.topic]||TOPICS.other}${i.preferred_contact?`. Удобное время для ответа: ${i.preferred_contact}`:''}`,formulation:'',resources:'',constraints:'',attention:'',nextSession:'',nextSessionTime:'',createdAt:typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10)};data.clients.unshift(c);data.activeClientId=c.id;if(typeof saveData==='function')saveData();await SB().from('tochka_public_inquiries').update({status:'accepted',handled_at:new Date().toISOString()}).eq('id',i.id);ui.view='client';ui.clientTab='overview';renderView()}));
    sec.querySelectorAll('[data-inquiry-close]').forEach(b=>b.addEventListener('click',async()=>{await SB().from('tochka_public_inquiries').update({status:'closed',handled_at:new Date().toISOString()}).eq('id',b.dataset.inquiryClose);b.closest('.public-inquiry-item')?.remove()}));
  }

  if(typeof renderSettings==='function'){const prev=renderSettings;renderSettings=function(root){prev(root);setTimeout(()=>injectPublicProfileSettings(root),0)}}
  if(typeof renderWorkInbox==='function'){const prev=renderWorkInbox;renderWorkInbox=function(root){prev(root);setTimeout(()=>loadPublicInquiries(root),0)}}

  const observer=new MutationObserver(()=>ensureClientGateEntry());observer.observe(document.body,{childList:true,subtree:true});
  if(psychSlug&&!hasClientToken){setTimeout(()=>openProfile(psychSlug),50)}else{ensureClientGateEntry();setTimeout(ensureClientGateEntry,150);setTimeout(ensureClientGateEntry,700)}
  window.addEventListener('popstate',()=>{const slug=(new URL(location.href).searchParams.get('psych')||'').trim().toLowerCase();if(slug)openProfile(slug);else closePublicOverlay()});
})();