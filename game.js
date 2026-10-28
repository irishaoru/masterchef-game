'use strict';

const ROUND_SECONDS = 300;
const CATEGORIES = [
  ['Protein', [['Chicken','🍗'],['Salmon','🐟'],['Tofu','🧈']]],
  ['Vegetable', [['Carrot','🥕'],['Broccoli','🥦'],['Eggplant','🍆']]],
  ['Starch', [['Potato','🥔'],['Rice','🍚'],['Pasta','🍝']]],
  ['Produce', [['Tomato','🍅'],['Mushroom','🍄'],['Corn','🌽']]],
  ['Wildcard', [['Lemon','🍋'],['Apple','🍎'],['Strawberry','🍓']]],
  ['Finishing touch', [['Cheese','🧀'],['Egg','🥚'],['Avocado','🥑']]],
];
const METHODS = {
  saute: {name:'Sauté', icon:'🍳', description:'A hot pan, a golden finish', station:'stove', ideal:14},
  bake: {name:'Bake', icon:'🥘', description:'Slow heat, rich flavor', station:'oven', ideal:22},
  boil: {name:'Boil', icon:'🫕', description:'Gentle bubbles, tender bites', station:'stove', ideal:18},
  blend: {name:'Blend', icon:'🥣', description:'Silky sauces and purées', station:'mixer', ideal:8},
};
const JUDGES = [
  {name:'Chef Laurent',icon:'👨🏻‍🍳',preference:'The traditionalist',detail:'Balance, seasoning & a complete dish'},
  {name:'Chef Amara',icon:'👩🏾‍🍳',preference:'The creative',detail:'Unexpected pairings & variety'},
  {name:'Chef Kenji',icon:'👨🏻‍🍳',preference:'The technician',detail:'Knife work & precise cooking'},
];
const STATIONS = [
  {id:'prep',name:'Prep board',icon:'🔪',x:5,y:4,w:23,h:19},
  {id:'stove',name:'Stovetop',icon:'🍳',x:38,y:4,w:23,h:19},
  {id:'oven',name:'Oven',icon:'🥘',x:72,y:4,w:23,h:19},
  {id:'pantry',name:'Pantry',icon:'🧂',x:5,y:76,w:23,h:19},
  {id:'mixer',name:'Mixer',icon:'🥣',x:38,y:76,w:23,h:19},
  {id:'plate',name:'Plating counter',icon:'🍽️',x:72,y:76,w:23,h:19},
];
const app = document.querySelector('#app');
let state, timerId, previousFrame;
const keys = new Set();
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const shuffle = list => [...list].sort(() => Math.random()-.5);

function reset() {
  clearInterval(timerId);
  keys.clear();
  state = {screen:'intro',basket:[],choices:[],methods:[],selected:null,position:{x:50,y:70},near:null,remaining:ROUND_SECONDS,jobs:{},seasonings:[],message:'Choose an ingredient, then walk to a station.',dishName:'',finished:false};
  render();
}
function judgesMarkup() {
  return `<div class="judges">${JUDGES.map(j=>`<article class="judge"><div class="avatar">${j.icon}</div><div><span class="tag">${j.preference}</span><br><strong>${j.name}</strong><p>${j.detail}</p></div></article>`).join('')}</div>`;
}
function render() {
  if(state.screen==='intro') renderIntro();
  if(state.screen==='select') renderSelection();
  if(state.screen==='methods') renderMethods();
  if(state.screen==='kitchen') renderKitchen();
  if(state.screen==='results') renderResults();
}
function renderIntro() {
  app.innerHTML = `<section class="hero"><div class="hero-copy"><div class="eyebrow">Six ingredients. Endless possibilities.</div><h1>A little mystery.<br>A lot of <em>possibility.</em></h1><p>Your basket is a surprise. Your dish is up to you. Step into the kitchen, trust your instincts, and make something worth a perfect thirty.</p><div class="hero-actions"><button data-action="start">Enter the kitchen <span aria-hidden="true">↗</span></button><span class="tiny">5 MINUTES · 3 JUDGES · YOU</span></div></div><div class="hero-art" aria-label="A plated meal surrounded by fresh ingredients"><span class="floating f1">🌿</span><div class="big-plate">🥗</div><span class="floating f2">🍅</span><span class="floating f3">✦</span><span class="art-note">MAKE THE UNEXPECTED DELICIOUS</span></div></section><section class="steps" aria-label="How to play"><article><div class="step-num">01</div><h3>Reveal your basket</h3><p>Pick one of three hidden cards, six times. Every ingredient has a place in your story.</p></article><article><div class="step-num">02</div><h3>Make your moves</h3><p>Choose exactly two methods. Move with arrow keys; click ingredients and nearby stations. You have five minutes.</p></article><article><div class="step-num">03</div><h3>Cook, then plate</h3><p>Chop, season, and cook. Collect food in the golden window before it burns. Click or drag food onto a nearby station.</p></article><article><div class="step-num">04</div><h3>Face the judges</h3><p>Press Finish, name your dish, then Serve. Every basket ingredient left off your plate costs 2 points.</p></article></section><div class="judges-title"><h2>Meet your toughest critics.</h2><span class="tiny">THREE PERSPECTIVES. ONE PLATE.</span></div>${judgesMarkup()}`;
}
function beginSelection() {
  state.screen='select';
  state.choices=shuffle(CATEGORIES[0][1]);
  render();
}
function renderSelection() {
  const n=state.basket.length;
  app.innerHTML=`<div class="section-heading"><div><div class="eyebrow">The mystery basket · ${n+1} of 6</div><h1>Pick your ${CATEGORIES[n][0].toLowerCase()}.</h1></div><div class="progress">${CATEGORIES.map((_,i)=>`<span class="${i<n?'done':''}"></span>`).join('')}</div></div><p>Trust your gut. Choose a card to reveal the next ingredient in your basket.</p><div class="selection-layout"><section><div class="cards">${state.choices.map((_,i)=>`<button class="ingredient-card" data-action="pick" data-index="${i}" aria-label="Choose mystery card ${i+1}"><small>MYSTERY INGREDIENT</small><span class="card-number">${i+1}</span><small>CLICK TO REVEAL ↗</small></button>`).join('')}</div><p class="selection-hint">No peeking. Each card hides a different ingredient. The clock starts after you choose your cooking methods.</p></section><aside class="selection-aside"><h3>Your basket</h3><ul class="basket-list">${CATEGORIES.map((c,i)=>`<li class="${i>=n?'empty':''}"><span>${state.basket[i]?.emoji||'○'}</span>${state.basket[i]?.name||c[0]}</li>`).join('')}</ul><div class="notice">Use all six ingredients.<br>Unused ingredients cost <strong>2 points each.</strong></div></aside></div>`;
}
function pick(index) {
  const item=state.choices[index];
  if(!item)return;
  const id=state.basket.length;
  state.basket.push({id,name:item[0],emoji:item[1],chopped:false,plated:false,methods:[],quality:null,cooking:null});
  announce(`${item[0]} added to your basket.`);
  if(state.basket.length===6)state.screen='methods';
  else state.choices=shuffle(CATEGORIES[state.basket.length][1]);
  render();
}
function renderMethods() {
  app.innerHTML=`<div class="section-heading"><div><div class="eyebrow">Your game plan</div><h1>Two methods. Your signature.</h1></div><span class="tiny">${state.methods.length} / 2 SELECTED</span></div><p>These are the cooking methods available this round. Chopping, seasoning, and plating are always available.</p><div class="methods">${Object.entries(METHODS).map(([id,m])=>`<button class="method ${state.methods.includes(id)?'selected':''}" data-action="method" data-id="${id}" aria-pressed="${state.methods.includes(id)}"><span>${m.icon}</span>${m.name}<small>${m.description}</small></button>`).join('')}</div><div class="notice">Your basket: ${state.basket.map(i=>`${i.emoji} ${i.name}`).join(' · ')}</div><div class="judges-title"><h2>Know your audience.</h2></div>${judgesMarkup()}<div class="start-row"><button data-action="cook" ${state.methods.length!==2?'disabled':''}>Start cooking →</button><span class="tiny">Your five-minute timer starts now.</span></div>`;
}
function startKitchen() {
  state.screen='kitchen';
  state.selected=0;
  state.deadline=Date.now()+ROUND_SECONDS*1000;
  render();
  timerId=setInterval(tick,250);
}
function renderKitchen() {
  app.innerHTML=`<div class="game-header"><div><div class="eyebrow">The challenge is on</div><h1>Make it your own.</h1></div><div class="game-status"><div id="timer" class="timer" aria-label="Time remaining">${formatTime(state.remaining)}</div><button data-action="finish">Finish ↗</button></div></div><div class="game-layout"><section class="kitchen-wrap"><div class="kitchen" id="kitchen" tabindex="0" aria-label="Kitchen. Use arrow keys to walk to appliances.">${STATIONS.map(s=>`<button class="station ${stationLocked(s.id)?'locked':''}" data-action="station" data-id="${s.id}" style="left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%" aria-label="${s.name}"><span>${s.icon}</span><small>${s.name}</small><i class="heat-dot" hidden></i></button>`).join('')}<div class="island">🌿 <small>MYSTERY KITCHEN</small></div><div id="chef" class="chef" aria-label="Your chef">👩‍🍳</div></div><div class="kitchen-caption"><span><span class="keys">↑ ↓ ← →</span> MOVE &nbsp; · &nbsp; CLICK TO INTERACT</span><span>Walk close to a station to use it</span></div><div class="mobile-controls" aria-label="Movement controls">${[['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→']].map(([k,label])=>`<button data-move="${k}" aria-label="Move ${k.slice(5).toLowerCase()}">${label}</button>`).join('')}</div><div class="station-action" id="station-action"></div><div class="notice" id="message" role="status">${escapeHTML(state.message)}</div></section><aside class="side-panel"><div class="panel-label">Your mystery basket <span class="tiny">· SELECT AN INGREDIENT</span></div><div id="inventory"></div><div class="panel-label" style="margin-top:22px">Your plate</div><div id="plate-preview" class="plate-preview" aria-label="Your plated ingredients"></div><div id="plate-count" class="tiny" style="text-align:center"></div><div class="panel-label" style="margin-top:22px">Your two methods</div><div class="tiny">${state.methods.map(id=>`${METHODS[id].icon} ${METHODS[id].name}`).join(' &nbsp; + &nbsp; ')}</div><div id="seasonings" class="tiny" style="margin-top:12px"></div></aside></div><section class="game-judges">${judgesMarkup()}</section>`;
  updatePosition();
  renderInventory();
  renderStation();
}
function stationLocked(id) {
  if(id==='oven')return !state.methods.includes('bake');
  if(id==='mixer')return !state.methods.includes('blend');
  if(id==='stove')return !state.methods.some(m=>m==='saute'||m==='boil');
  return false;
}
function itemStatus(i) {
  if(i.plated)return 'On your plate';
  if(i.cooking)return `${METHODS[i.cooking].name} in progress`;
  const status=[];
  if(i.chopped)status.push('Chopped');
  if(i.quality)status.push(i.quality==='perfect'?'Golden':i.quality==='burnt'?'Burnt':'Undercooked');
  if(i.methods.length)status.push(i.methods.map(m=>METHODS[m].name).join(' + '));
  return status.join(' · ')||'Fresh · ready to prep';
}
function renderInventory() {
  document.querySelector('#inventory').innerHTML=state.basket.map(i=>`<div class="ingredient-row ${state.selected===i.id?'selected':''} ${i.plated?'plated':''}" draggable="${!i.plated&&!i.cooking}" data-item="${i.id}"><span class="food" style="${i.quality==='burnt'?'filter:brightness(.35)':i.quality==='perfect'?'filter:sepia(.35)':''}">${i.emoji}</span><div><strong>${i.name}</strong><small>${itemStatus(i)}</small></div><button class="small secondary" data-action="ingredient" data-id="${i.id}" ${i.plated||i.cooking?'disabled':''} aria-label="Select ${i.name}">${i.plated?'✓':state.selected===i.id?'●':'Select'}</button></div>`).join('');
  const plated=state.basket.filter(i=>i.plated);
  document.querySelector('#plate-preview').innerHTML=plated.map(i=>`<span title="${i.name}" style="${i.quality==='burnt'?'filter:brightness(.35)':''}">${i.emoji}</span>`).join('')||'🍽️';
  document.querySelector('#plate-count').textContent=`${plated.length} of 6 ingredients plated · ${2*(6-plated.length)} point waste penalty`;
  document.querySelector('#seasonings').textContent=state.seasonings.length?`Pantry: ${state.seasonings.join(', ')}`:'Pantry: no seasonings yet';
}
function renderStation() {
  const target=document.querySelector('#station-action');
  if(!target)return;
  const station=STATIONS.find(s=>s.id===state.near);
  if(!station){target.innerHTML='<h3>Your kitchen, your rules.</h3><p style="margin:0;font-size:12px">Select a basket ingredient, then walk to a station. The outlined station is within reach.</p>';return;}
  const item=state.basket.find(i=>i.id===state.selected);
  let actions='';
  const job=state.jobs[station.id];
  if(job){
    const elapsed=(Date.now()-job.start)/1000;
    const ideal=METHODS[job.method].ideal;
    const phase=elapsed<ideal?'Cooking':elapsed<ideal+10?'Golden — collect now!':'Burnt — collect your food';
    actions=`<p>${state.basket[job.item].name} · <strong id="cook-phase">${phase}</strong></p><div class="cook-progress"><div id="cook-fill" style="width:${clamp(elapsed/(ideal+10)*100,0,100)}%"></div></div><button class="small" data-action="collect" data-id="${station.id}">Collect food</button><span class="tiny"> Golden at ${ideal}s; burns at ${ideal+10}s. Heat keeps running while you walk.</span>`;
  } else if(stationLocked(station.id)) {
    actions='<p>This appliance is unavailable with your two selected methods.</p>';
  } else if(station.id==='pantry') {
    actions=`<p>Add a finishing touch to your whole dish. Seasonings are optional and never create waste.</p><div class="pantry-items">${['Salt','Pepper','Olive oil','Garlic','Chili','Basil'].map(s=>`<button data-action="season" data-id="${s}" ${state.seasonings.includes(s)?'disabled':''}>${state.seasonings.includes(s)?'✓ ':''}${s}</button>`).join('')}</div>`;
  } else if(!item||item.plated||item.cooking) {
    actions='<p>Select an available ingredient in your basket first.</p>';
  } else if(station.id==='prep') {
    actions=`<div class="action-line"><p>${item.emoji} ${item.name} · ${item.chopped?'Already chopped and ready to go.':'A little knife work goes a long way.'}</p><button class="small" data-action="chop" ${item.chopped?'disabled':''}>Chop ingredient</button></div>`;
  } else if(station.id==='plate') {
    actions=`<div class="action-line"><p>${item.emoji} Add ${item.name.toLowerCase()} to your final dish. Plating is final.</p><button class="small" data-action="plate">Add to plate</button></div>`;
  } else {
    const options=state.methods.filter(m=>METHODS[m].station===station.id);
    actions=`<div class="action-line"><p>${item.emoji} ${item.name} · Cook, then collect in the golden window.</p>${options.map(m=>`<button class="small" data-action="heat" data-id="${m}" ${item.methods.includes(m)?'disabled':''}>${METHODS[m].name} · ${METHODS[m].ideal}s</button>`).join('')}</div>`;
  }
  target.innerHTML=`<h3>${station.icon} ${station.name}</h3>${actions}`;
}
function message(text) {
  state.message=text;
  const el=document.querySelector('#message');
  if(el)el.textContent=text;
  announce(text);
}
function announce(text){document.querySelector('#announcer').textContent=text;}
function formatTime(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}

function updatePosition() {
  const chef=document.querySelector('#chef');
  if(!chef)return;
  chef.style.left=`${state.position.x}%`;
  chef.style.top=`${state.position.y}%`;
  let nearest=null, distance=Infinity;
  for(const s of STATIONS){
    const dx=Math.max(s.x-state.position.x,0,state.position.x-s.x-s.w);
    const dy=Math.max(s.y-state.position.y,0,state.position.y-s.y-s.h);
    const d=Math.hypot(dx,dy);
    if(d<distance&&d<14){nearest=s.id;distance=d;}
  }
  if(state.near!==nearest){state.near=nearest;renderStation();}
  for(const s of STATIONS){
    const el=document.querySelector(`[data-action="station"][data-id="${s.id}"]`);
    el.classList.toggle('near',nearest===s.id);
    el.classList.toggle('active',Boolean(state.jobs[s.id]));
    el.querySelector('.heat-dot').hidden=!state.jobs[s.id];
  }
}
function isBlocked(x,y){
  // The center island and perimeter appliances are solid counters.
  return (x>31&&x<69&&y>37&&y<68)||STATIONS.some(s=>x>s.x-2&&x<s.x+s.w+2&&y>s.y-3&&y<s.y+s.h+3);
}
function moveFrame(now) {
  const delta=Math.min((now-(previousFrame||now))/1000,.05);
  previousFrame=now;
  if(state?.screen==='kitchen'&&!state.finished&&keys.size){
    let dx=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'));
    let dy=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));
    const length=Math.hypot(dx,dy)||1;
    dx=dx/length*delta*30;dy=dy/length*delta*40;
    const x=clamp(state.position.x+dx,4,96);
    const y=clamp(state.position.y+dy,4,96);
    if(!isBlocked(x,state.position.y))state.position.x=x;
    if(!isBlocked(state.position.x,y))state.position.y=y;
    updatePosition();
  }
  requestAnimationFrame(moveFrame);
}
function tick() {
  if(state.screen!=='kitchen'||state.finished)return;
  state.remaining=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  const clock=document.querySelector('#timer');
  clock.textContent=formatTime(state.remaining);
  clock.classList.toggle('urgent',state.remaining<=30);
  const job=state.jobs[state.near];
  if(job){
    const elapsed=(Date.now()-job.start)/1000,ideal=METHODS[job.method].ideal;
    const phase=document.querySelector('#cook-phase'),fill=document.querySelector('#cook-fill');
    if(phase)phase.textContent=elapsed<ideal?`Cooking · ${Math.floor(elapsed)}s` : elapsed<ideal+10?'Golden — collect now!':'Burnt — collect your food';
    if(fill)fill.style.width=`${clamp(elapsed/(ideal+10)*100,0,100)}%`;
  }
  if(!state.remaining)finish(true);
}
function collect(id,silent=false) {
  const job=state.jobs[id];
  if(!job)return;
  const item=state.basket[job.item],elapsed=(Date.now()-job.start)/1000,ideal=METHODS[job.method].ideal;
  const quality=elapsed<ideal?'undercooked':elapsed<ideal+10?'perfect':'burnt';
  item.quality=item.quality==='burnt'?'burnt':quality;
  item.methods.push(job.method);item.cooking=null;
  delete state.jobs[id];
  state.selected=item.id;
  if(!silent)message(`${item.name} collected: ${quality==='perfect'?'beautifully cooked':quality}. ${quality==='burnt'?'Watch the golden window next time.':'Take it to the plating counter when ready.'}`);
}
function finish(timedOut=false) {
  if(state.finished)return;
  clearInterval(timerId);keys.clear();
  state.finished=true;
  for(const id of Object.keys(state.jobs))collect(id,true);
  const overlay=document.createElement('div');
  overlay.className='modal-backdrop';
  overlay.innerHTML=`<form class="modal" id="serve-form" role="dialog" aria-modal="true" aria-labelledby="finish-title"><div class="eyebrow">${timedOut?'Time is up · hands off!':'Hands off · your dish is ready'}</div><h2 id="finish-title">Give it a name.</h2><div class="plate-preview">${state.basket.filter(i=>i.plated).map(i=>i.emoji).join('')||'🍽️'}</div><p>${state.basket.filter(i=>i.plated).length} of 6 ingredients plated. Your cooking is finished.<br>Make your introduction to the judges.</p><label for="dish-name" class="sr-only">Dish name</label><input id="dish-name" maxlength="60" placeholder="e.g. A Sunday in the garden" autocomplete="off"><button type="submit">Serve to the judges →</button><span class="tiny">An empty name becomes “Chef’s Mystery Plate”.</span></form>`;
  document.body.append(overlay);
  overlay.querySelector('input').focus();
  overlay.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();
    state.dishName=overlay.querySelector('input').value.trim()||'Chef’s Mystery Plate';
    overlay.remove();state.screen='results';render();window.scrollTo(0,0);
  });
  overlay.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const input=overlay.querySelector('input'),button=overlay.querySelector('button');
    if(event.shiftKey&&document.activeElement===input){event.preventDefault();button.focus();}
    else if(!event.shiftKey&&document.activeElement===button){event.preventDefault();input.focus();}
  });
}

function scoreDish(basket,seasonings) {
  const plated=basket.filter(i=>i.plated),n=plated.length;
  const cooked=plated.filter(i=>i.methods.length).length;
  const perfect=plated.filter(i=>i.quality==='perfect').length;
  const burnt=plated.filter(i=>i.quality==='burnt').length;
  const chopped=plated.filter(i=>i.chopped).length;
  const methods=new Set(plated.flatMap(i=>i.methods));
  const rawProtein=plated.some(i=>['Chicken','Salmon','Egg'].includes(i.name)&&i.quality!=='perfect');
  const scores=n?[clamp(Math.round(1+n*.75+Math.min(seasonings.length,2)+perfect*.4-burnt-Number(rawProtein)*2),1,10),clamp(Math.round(2+n*.6+methods.size*1.5+Math.min(seasonings.length,3)*.5-burnt*.5),1,10),clamp(Math.round(1+chopped*.5+perfect*.8+methods.size-burnt*1.5-(cooked-perfect-burnt)*.5),1,10)]:[1,1,1];
  const names=plated.map(i=>i.name.toLowerCase());
  const featured=names.slice(0,2).join(' and ')||'an empty plate';
  const comments=[
    n?`The ${featured} ${n>1?'give':'gives'} this dish its foundation. ${seasonings.length?'Your seasoning builds flavor.':'A little salt or a pantry seasoning would bring it together.'} ${rawProtein?'The protein needed careful cooking.':burnt?'Burnt flavors upset the balance.':n>=5?'A generous, complete plate.':'A more complete plate would feel more balanced.'}`:'An empty plate leaves me without a dish to taste. Plate your ingredients before finishing.',
    n?`I see potential in ${featured}. ${methods.size===2?'Using both methods adds welcome contrast.':'Try using both of your chosen methods for more contrast.'} ${n>=5?'You made the mystery basket feel like your own.':'More of the basket would make this idea more adventurous.'}`:'Your basket held six possibilities. Bring them onto the plate so your creativity can shine.',
    n?`${chopped} chopped and ${perfect} perfectly cooked ingredient${perfect===1?'':'s'}. ${burnt?`${burnt} burnt ingredient${burnt===1?' needs':'s need'} closer attention to timing.`:perfect?'You showed a good eye for the golden cooking window.':'Collect your food during the golden window to improve your technique.'}`:'I need plated food to assess your technique. Chop, cook, collect, and then plate next round.',
  ];
  const subtotal=scores.reduce((sum,score)=>sum+score,0),waste=(6-n)*2;
  return {scores,comments,subtotal,waste,total:Math.max(0,subtotal-waste),unused:basket.filter(i=>!i.plated).map(i=>i.name)};
}
function renderResults() {
  const result=scoreDish(state.basket,state.seasonings);
  app.innerHTML=`<div class="results-intro"><div class="eyebrow">The tasting table</div><h1>“${escapeHTML(state.dishName)}”</h1><p>One mystery basket. Three honest opinions. Here’s how your dish landed.</p></div><section class="result-judges">${JUDGES.map((j,i)=>`<article class="result-card"><div class="avatar">${j.icon}</div><div class="tag">${j.preference}</div><h3>${j.name}</h3><p>${result.comments[i]}</p><div class="judge-score">${result.scores[i]}<small> / 10</small></div></article>`).join('')}</section><section class="total-row"><div class="total-math"><div><strong>${result.subtotal} / 30</strong><span class="tiny">JUDGES’ TOTAL</span></div><span>−</span><div><strong>${result.waste}</strong><span class="tiny">WASTE · ${result.unused.length} × 2 POINTS</span></div><span>=</span></div><div class="final-score">${result.total}<small> / 30 FINAL SCORE</small></div></section><div class="notice ${result.waste?'warning':''}">${result.unused.length?`Left out of your dish: ${result.unused.join(', ')}. Each unused basket ingredient costs 2 points. The final score cannot fall below zero.`:'Zero waste. Every ingredient made it onto your plate. Beautifully done.'}</div><div class="results-footer"><p><strong>For your next service:</strong> Laurent rewards a complete, seasoned dish. Amara rewards variety and both cooking methods. Kenji rewards chopping and food collected in the golden window. Only plated ingredients count.</p><button data-action="again">Play again ↗</button></div>`;
}

app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button||button.disabled)return;
  const action=button.dataset.action,id=button.dataset.id;
  if(action==='again'){reset();window.scrollTo(0,0);return;}
  if(action==='start'){beginSelection();return;}
  if(action==='pick'){pick(Number(button.dataset.index));return;}
  if(action==='method'){
    if(state.methods.includes(id))state.methods=state.methods.filter(m=>m!==id);
    else if(state.methods.length<2)state.methods.push(id);
    renderMethods();return;
  }
  if(action==='cook'){if(state.methods.length===2)startKitchen();return;}
  if(state.screen!=='kitchen'||state.finished)return;
  if(action==='finish'){finish();return;}
  if(action==='ingredient'){state.selected=Number(id);renderInventory();renderStation();return;}
  if(action==='station'){
    if(state.near!==id){message(`Walk closer to the ${STATIONS.find(s=>s.id===id).name.toLowerCase()} using the arrow keys.`);return;}
    renderStation();return;
  }
  const item=state.basket.find(i=>i.id===state.selected);
  if(action==='collect'&&state.near===id){collect(id);}
  else if(action==='season'&&state.near==='pantry'){
    if(!state.seasonings.includes(id))state.seasonings.push(id);
    message(`${id} added to your dish.`);
  }
  else if(item&&!item.cooking&&!item.plated){
    if(action==='chop'&&state.near==='prep'){item.chopped=true;message(`${item.name} chopped. Nice knife work!`);}
    if(action==='plate'&&state.near==='plate'){
      item.plated=true;message(`${item.name} plated. ${state.basket.filter(i=>i.plated).length} of 6 ingredients used.`);
      state.selected=state.basket.find(i=>!i.plated&&!i.cooking)?.id??null;
    }
    if(action==='heat'&&state.methods.includes(id)&&state.near===METHODS[id].station&&!state.jobs[state.near]&&!item.methods.includes(id)){
      state.jobs[state.near]={item:item.id,method:id,start:Date.now()};item.cooking=id;
      message(`${METHODS[id].name}: ${item.name}. Collect between ${METHODS[id].ideal} and ${METHODS[id].ideal+10} seconds for a golden finish.`);
      state.selected=state.basket.find(i=>!i.plated&&!i.cooking)?.id??null;
    }
  }
  renderInventory();renderStation();updatePosition();
});
app.addEventListener('dragstart',event=>{
  const row=event.target.closest('[data-item]');
  if(!row||state.finished)return;
  event.dataTransfer.setData('text/plain',row.dataset.item);
  event.dataTransfer.effectAllowed='move';
});
app.addEventListener('dragover',event=>{if(event.target.closest('.station'))event.preventDefault();});
app.addEventListener('drop',event=>{
  const station=event.target.closest('.station');
  if(!station||state.screen!=='kitchen'||state.finished)return;
  event.preventDefault();
  const data=event.dataTransfer.getData('text/plain');
  if(!/^\d+$/.test(data))return;
  const item=state.basket.find(i=>i.id===Number(data));
  if(!item||item.plated||item.cooking)return;
  if(state.near!==station.dataset.id){message('Walk closer to that station before moving an ingredient there.');return;}
  state.selected=item.id;renderInventory();renderStation();
  if(state.near==='plate')document.querySelector('[data-action="plate"]')?.click();
  else if(state.near==='prep')document.querySelector('[data-action="chop"]')?.click();
  else message(`${item.name} is ready at the ${STATIONS.find(s=>s.id===state.near).name.toLowerCase()}. Choose an action below the kitchen.`);
});
window.addEventListener('keydown',event=>{
  if(state.screen==='kitchen'&&!state.finished&&event.key.startsWith('Arrow')){event.preventDefault();keys.add(event.key);}
});
window.addEventListener('keyup',event=>keys.delete(event.key));
window.addEventListener('blur',()=>keys.clear());
app.addEventListener('pointerdown',event=>{
  const button=event.target.closest('[data-move]');
  if(!button)return;
  event.preventDefault();keys.add(button.dataset.move);button.setPointerCapture(event.pointerId);
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])app.addEventListener(name,()=>keys.clear());
reset();
requestAnimationFrame(moveFrame);
