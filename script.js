'use strict';
const stats = [ ['Здоровье','так се',38], ['Харизма','100/100',100], ['Толерантность','5/100',5], ['Любовь к котам','167/100',100], ['Умение быть лучшей подругой','∞/100',100] ];
document.querySelector('#stats').innerHTML=stats.map(([name,value,fill])=>`<div class="stat"><div class="stat-label"><span>${name}</span><span>${value}</span></div><div class="stat-track" role="img" aria-label="${name}: ${value}"><div class="stat-fill" data-fill="${fill}"></div></div></div>`).join('');
const items=[
 ['garage','Garage лимонный','RARE','#91aab5','Зелье хорошего настроения. Лучше всего работает в компании своих.'],
 ['medkit','Аптечка на все случаи жизни','LEGENDARY','#c4a17b','Всё для любого поворота сюжета. Подготовленность: максимальная.'],
 ['shark','Игрушка-подушка с помойки','LEGENDARY','#c4a17b','Найдена. Принята. Любима. У каждой легендарной вещи своя история.'],
 ['food','Пауч с кормом для котов','COMMON','#aaa69b','Восстанавливает довольное урчание. Обязательный дар членам команды.'],
 ['paper','Рулон туалетной бумаги','ESSENTIAL','#c0b6a6','Базовый ресурс. Никогда не знаешь, когда начнётся следующий квест.'],
 ['xros','XROS','EPIC','#ad94bd','Карманный артефакт. Заряд: неизвестен. Местоположение: где-то рядом.'],
 ['cap','Кепка','UNIQUE','#b9af83','Таинственный предмет, который снова остался у Алисы.'],
 ['grapes','Виноград','LEGENDARY','#c4a17b','Древний плод. Истинное значение известно лишь избранным.']
];
const grid=document.querySelector('#inventory-grid');
grid.innerHTML=items.map(([icon,name,rarity,color],i)=>`<button class="item" style="--rarity:${color}" data-index="${i}" aria-pressed="false" aria-controls="item-description"><span class="item-picture"><img src="assets/icons/${icon}.svg" alt="" width="64" height="64"></span><span class="item-name">${name}</span><span class="rarity">${rarity}</span></button>`).join('');
let selected=0;
function describe(i){const item=items[i];document.querySelector('#item-description').innerHTML=`<strong>› ${item[1]}</strong><p>${item[4]}</p><span class="inspect">ITEM_${String(i+1).padStart(3,'0')}</span>`;}
function select(i){selected=i;grid.querySelectorAll('button').forEach((button,n)=>{button.classList.toggle('selected',n===i);button.setAttribute('aria-pressed',String(n===i));});describe(i);}
grid.querySelectorAll('button').forEach(button=>{const i=Number(button.dataset.index);button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')describe(i);});button.addEventListener('focus',()=>describe(i));button.addEventListener('click',()=>{select(i);beep(520);});});
grid.addEventListener('pointerleave',()=>describe(selected));grid.addEventListener('focusout',event=>{if(!grid.contains(event.relatedTarget))describe(selected);});select(0);
const achievements=[['manager','Да не нормис я','Стать менеджером эксплуатационно-хозяйственного отдела.'],['doctor','Сам себе врач','Изучить все возможные болезни благодаря ипохондрии.'],['caretaker','Мать всея живого','Стать лучшей крысо- и котомамой.'],['comedian','Я же говорила','Порекомендовать комика и дождаться, пока ценность рекомендации наконец признают.'],['terminal','Жена ChatGPT','Оформить Plus и окончательно принять свою судьбу.'],['wisdom','Хранитель мудрости','Давать лучшие советы.'],['best-friend','Лучший друг','Стать лучшим другом в мире.']];
document.querySelector('#achievement-list').innerHTML=achievements.map(([icon,title,description],i)=>`<article class="achievement ${i===6?'ultra':''}"><div class="achievement-icon"><img src="assets/generated/achievements/${icon}.webp" alt="" width="1024" height="1024" loading="lazy" decoding="async"></div><div><h3>${title}</h3><p>${description}</p></div>${i===6?'<div class="ultra-label">✦ УЛЬТРАРЕДКОЕ<span>ОДНА НА ВЕСЬ МИР</span></div>':'<span class="unlocked" aria-label="Разблокировано">✓</span>'}</article>`).join('');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function fillStats(){document.querySelectorAll('.stat-fill').forEach(bar=>bar.style.width=bar.dataset.fill+'%');}
if('IntersectionObserver' in window){document.documentElement.classList.add('js');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');if(entry.target.classList.contains('profile'))fillStats();observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));}else fillStats();
if(reduceMotion.matches)fillStats();
const links=[...document.querySelectorAll('nav a')];let scrollQueued=false;
function updateNavigation(){let current='character';for(const section of document.querySelectorAll('main>section'))if(section.getBoundingClientRect().top<160)current=section.id;links.forEach(link=>{const active=link.hash==='#'+current;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});scrollQueued=false;}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateNavigation);}},{passive:true});updateNavigation();
let soundEnabled=false,audioContext;
function beep(frequency=440){if(!soundEnabled)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='square';oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);gain.gain.setValueAtTime(.025,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.075);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.08);}catch{soundEnabled=false;updateSound();}}
function updateSound(){const button=document.querySelector('#sound');button.setAttribute('aria-pressed',String(soundEnabled));button.setAttribute('aria-label',soundEnabled?'Выключить игровые звуки':'Включить игровые звуки');button.innerHTML=`♪ <span>ЗВУК: ${soundEnabled?'ВКЛ':'ВЫКЛ'}</span>`;}
document.querySelector('#sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;updateSound();beep(660);});document.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>beep(350)));
document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===document.body&&window.scrollY<100){document.querySelector('.start-button').click();document.querySelector('#profile').setAttribute('tabindex','-1');document.querySelector('#profile').focus({preventScroll:true});}});
