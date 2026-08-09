/* Точка опоры v16.0 SAFE RECOVERY
   Аварийный слой после RESULT_CODE_HUNG.
   Здесь намеренно НЕТ MutationObserver, динамической загрузки ассистента,
   перехватов renderView и автоматических повторных рендеров.
   Основное приложение продолжает работать на своих стабильных слоях. */
(function(){
  'use strict';
  try{
    document.documentElement.setAttribute('data-safe-recovery','160');
    console.info('Точка опоры: safe recovery v16.0');
  }catch(e){}
})();
