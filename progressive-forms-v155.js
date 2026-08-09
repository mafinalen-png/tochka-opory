/* Точка опоры v15.5 — формы по шагам вместо полотна полей */
(function(){
  'use strict';

  function field(form,name){return form.querySelector(`[name="${name}"]`)?.closest('label')||null}
  function makeStep(number,title,hint){
    const details=document.createElement('details');details.className='progressive-form-step';details.dataset.formStep=String(number);
    details.innerHTML=`<summary><span class="progressive-form-number">${number}</span><span><strong>${title}</strong><small>${hint}</small></span><span class="progressive-form-arrow">›</span></summary><div class="progressive-form-body"></div>`;
    return details;
  }

  function progressiveForm(formId,groups){
    const form=document.getElementById(formId);if(!form||form.dataset.progressive==='1')return;
    form.dataset.progressive='1';
    const anchor=form.querySelector('input[type="hidden"]');
    const steps=groups.map((g,i)=>{
      const step=makeStep(i+1,g.title,g.hint);const body=step.querySelector('.progressive-form-body');
      g.fields.forEach(name=>{const node=field(form,name);if(node)body.appendChild(node)});
      return step;
    });
    steps.forEach((step,i)=>{if(i===0)step.open=true;form.insertBefore(step,form.querySelector('.form-actions'));});
    steps.forEach(step=>step.addEventListener('toggle',()=>{if(!step.open)return;steps.forEach(other=>{if(other!==step)other.open=false})}));
    if(anchor)anchor.insertAdjacentElement('afterend',steps[0]);
    /* insertBefore выше мог уже поставить первый шаг — возвращаем правильный порядок без дубликатов */
    steps.forEach((step,i)=>{const actions=form.querySelector('.form-actions');form.insertBefore(step,actions);});
  }

  progressiveForm('clientForm',[
    {title:'Кто клиент',hint:'Только базовые данные',fields:['name','age','contact','status']},
    {title:'С чем пришёл',hint:'Запрос и важный контекст',fields:['request','context']},
    {title:'Следующая встреча',hint:'Можно заполнить позже',fields:['nextSession','nextSessionTime']}
  ]);

  progressiveForm('sessionForm',[
    {title:'Начало встречи',hint:'Кто, когда и исходное состояние',fields:['clientId','date','format','duration','stateBefore']},
    {title:'Что происходило',hint:'Тема, слова клиента и ваши действия',fields:['theme','notes','interventions']},
    {title:'Чем закончили',hint:'Гипотеза, состояние и один следующий шаг',fields:['stateAfter','hypothesis','homework','nextFocus']}
  ]);
})();
