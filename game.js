'use strict';

const ROUND_SECONDS = 300;
const CATEGORIES = [
  ['Protein', ['Chicken','Salmon','Tofu']],
  ['Vegetable', ['Carrot','Broccoli','Eggplant']],
  ['Starch', ['Potato','Rice','Pasta']],
  ['Produce', ['Tomato','Mushroom','Corn']],
  ['Wildcard', ['Lemon','Apple','Strawberry']],
  ['Finishing touch', ['Cheese','Egg','Avocado']],
];
// How each ingredient behaves. cook: seconds to a perfect finish when whole at full heat (prepped food cooks faster).
// prep: what the knife does, or null when there is nothing to cut. raw: pleasant and safe uncooked. classic: what a traditionalist expects.
const INGREDIENTS = {
  Chicken:{color:'#dda36c',prep:['Dice','Diced'],cook:16,raw:false,classic:['saute','bake']},
  Salmon:{color:'#f18c72',prep:['Portion','Portioned'],cook:12,raw:true,classic:['saute','bake']},
  Tofu:{color:'#f4e4b4',prep:['Cube','Cubed'],cook:10,raw:true,classic:['saute','boil']},
  Carrot:{color:'#ee892e',prep:['Slice','Sliced'],cook:14,raw:true,classic:['saute','bake','boil']},
  Broccoli:{color:'#44884a',prep:['Cut florets','Cut into florets'],cook:10,raw:true,classic:['saute','boil','bake']},
  Eggplant:{color:'#733f87',prep:['Cube','Cubed'],cook:14,raw:false,classic:['bake','saute']},
  Potato:{color:'#c89d5f',prep:['Dice','Diced'],cook:20,raw:false,classic:['bake','boil','saute']},
  Rice:{color:'#f2e9cf',prep:null,cook:16,raw:false,classic:['boil']},
  Pasta:{color:'#e8bf60',prep:null,cook:12,raw:false,classic:['boil']},
  Tomato:{color:'#dc4d36',prep:['Dice','Diced'],cook:8,raw:true,classic:['saute','bake','blend']},
  Mushroom:{color:'#bca58b',prep:['Slice','Sliced'],cook:8,raw:true,classic:['saute','bake']},
  Corn:{color:'#edc64b',prep:['Cut kernels','Cut off the cob'],cook:10,raw:true,classic:['boil','saute','bake']},
  Lemon:{color:'#f4d647',prep:['Slice','Sliced'],cook:8,raw:true,classic:['blend','bake']},
  Apple:{color:'#d9503b',prep:['Slice','Sliced'],cook:14,raw:true,classic:['bake','blend']},
  Strawberry:{color:'#db4c52',prep:['Halve','Halved'],cook:6,raw:true,classic:['blend']},
  Cheese:{color:'#ecc45f',prep:['Grate','Grated'],cook:6,raw:true,classic:['bake']},
  Egg:{color:'#f9edcf',prep:['Crack','Cracked'],cook:9,raw:false,classic:['boil','saute']},
  Avocado:{color:'#7b9d48',prep:['Slice','Sliced'],cook:6,raw:true,classic:['blend']},
};
// rate: cooking speed at full heat. warm: seconds for the appliance to come up to temperature. dry: browns the food.
const METHODS = {
  saute:{name:'Sauté',past:'Sautéed',description:'A hot pan, a golden sear',station:'stove',vessel:'pan',rate:1.25,warm:2,dry:true},
  boil:{name:'Boil',past:'Boiled',description:'Rolling water, tender bites',station:'stove',vessel:'pot',rate:1,warm:4,dry:false},
  bake:{name:'Bake',past:'Baked',description:'Dry heat, deep roasting',station:'oven',vessel:'oven',rate:.8,warm:5,dry:true},
  blend:{name:'Blend',past:'Blended',description:'Silky sauces and purées',station:'mixer',vessel:'mixer',rate:0,warm:0,dry:false},
};
const VESSELS = {pan:'saute',pot:'boil',oven:'bake',mixer:'blend'};
const VESSEL_NAMES = {pan:'pan',pot:'pot',oven:'oven',mixer:'mixer'};
const PLACES = {hand:'IN HAND',board:'ON BOARD',pan:'IN PAN',pot:'IN POT',oven:'IN OVEN',mixer:'BLENDING',plate:'PLATED'};
const QUALITY = {fresh:'Fresh',raw:'Raw',warm:'Lightly cooked',undercooked:'Undercooked',perfect:'Perfectly cooked',overcooked:'Overcooked',burnt:'Burnt'};
const CAPACITY = 3, PREP_SECONDS = 2.2, BLEND_SECONDS = 4;
const JUDGES = [
  {name:'Chef Laurent',preference:'The traditionalist',detail:'Classic pairings, seasoning & food cooked through'},
  {name:'Chef Amara',preference:'The creative',detail:'Unexpected pairings & ingredients cooked together'},
  {name:'Chef Kenji',preference:'The technician',detail:'Knife work & hitting the perfect doneness'},
];
const STATIONS = [
  {id:'prep',name:'Prep board',x:5,y:4,w:23,h:19},
  {id:'stove',name:'Stovetop',x:38,y:4,w:23,h:19},
  {id:'oven',name:'Oven',x:72,y:4,w:23,h:19},
  {id:'pantry',name:'Pantry',x:5,y:76,w:23,h:19},
  {id:'mixer',name:'Mixer',x:38,y:76,w:23,h:19},
  {id:'plate',name:'Plating counter',x:72,y:76,w:23,h:19},
];
const SEASONINGS = [['Salt','#f1efe6'],['Pepper','#3b322a'],['Olive oil','#b6a446'],['Garlic','#e9dcc0'],['Chili','#c4462b'],['Basil','#5b8a3c']];
const app = document.querySelector('#app');
let state, timerId, previousFrame;
const keys = new Set();
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const shuffle = list => [...list].sort(() => Math.random()-.5);
const list = words => words.length<2?words.join(''):`${words.slice(0,-1).join(', ')} and ${words.at(-1)}`;
const ing = phrase => phrase.replace(/^\w+/,w=>w==='Cut'?'Cutting':w.replace(/e$/,'')+'ing');
const itemsIn = where => state.basket.filter(i=>i.where===where);
const held = () => state.basket.find(i=>i.where==='hand');
const stationOf = where => where==='board'?'prep':where==='plate'?'plate':VESSELS[where]?METHODS[VESSELS[where]].station:null;
const vesselsAt = station => Object.keys(VESSELS).filter(v=>METHODS[VESSELS[v]].station===station&&state.methods.includes(VESSELS[v]));
const setText = (el,text) => {if(el&&el.textContent!==text)el.textContent=text;};

function reset() {
  clearInterval(timerId);
  keys.clear();
  app.classList.remove('hands-off');
  document.querySelector('.modal-backdrop')?.remove?.();
  state = {screen:'intro',basket:[],choices:[],revealing:false,methods:[],position:{x:50,y:70},velocity:{x:0,y:0},facing:0,walking:false,near:null,remaining:ROUND_SECONDS,heat:{pan:0,pot:0,oven:0,mixer:0},on:{pan:false,pot:false,oven:false,mixer:false},board:null,seasonings:[],message:'Click an ingredient on the table to pick it up, then walk to any station.',dishName:'',finished:false};
  render();
}
function newItem(id,name) {
  return {id,name,form:'whole',where:'table',done:0,sear:0,blend:0,exposure:{},partners:[]};
}

// ---------- Illustrations: food, judges, methods. Everything is inline SVG so the game needs no assets. ----------
const WHOLE_ART = {
  Chicken:'<path d="M63 48l18 18 6-3 6 7-8 10-8-5-2-7-17-10" fill="#f8e8cb"/><path d="M19 20C40 4 72 19 72 42S48 71 28 61 4 34 19 20Z"/>',
  Salmon:'<path d="M14 28Q44 8 85 31L78 73Q43 57 15 76Z"/><path d="M27 27l-3 37m20-41-3 37m20-35-3 36m18-31-4 34" fill="none" stroke="#ffe3bc" stroke-width="4"/>',
  Tofu:'<path d="M14 30l50-15 23 20-10 46-59-6Z"/><path d="M14 30l53 10 20-5M67 40l-4 38" fill="none" stroke="#c5b178" stroke-width="3"/>',
  Carrot:'<path d="M31 27Q49 17 62 35L39 86Q34 93 31 83Z"/><path d="M43 28L26 11m19 17L48 6m-3 22L66 12" stroke="#4d8542" stroke-width="9"/><path d="M34 43l12 3m-11 11 8 2" stroke="#bd571d" stroke-width="3"/>',
  Broccoli:'<path d="M44 42h15l8 44H37Z" fill="#8cac56"/><circle cx="30" cy="39" r="21"/><circle cx="53" cy="26" r="23"/><circle cx="74" cy="44" r="20"/><circle cx="48" cy="46" r="23"/><path d="M30 31l6-4m13-10 6 3m14 20 6 3" stroke="#78a75b" stroke-width="5"/>',
  Eggplant:'<path d="M61 22C93 43 70 88 32 86S16 48 46 31Z"/><path d="M49 32l-3-20 14 9 14-6-8 20-10-6Z" fill="#698747"/><path d="M31 54q-9 19 1 24" stroke="#a87eb6" stroke-width="5" fill="none"/>',
  Potato:'<path d="M24 19C48 7 84 24 83 51S62 88 35 80 4 41 24 19Z"/><path d="M28 33h3m23-9h3M67 53h3m-35 9h3" stroke="#947345" stroke-linecap="round" stroke-width="5"/>',
  Rice:'<ellipse cx="50" cy="58" rx="35" ry="24" fill="#d6cbb8"/><path d="M15 54Q18 17 50 20T85 54Z"/><path d="M29 40l5-6m8 3 4-7m8 10 5-6m5 12 4-6m-29 5 4-6" stroke="#cfc5aa" stroke-width="3"/>',
  Pasta:'<path d="M21 32q18-30 23 1t22 1 16 13M16 47q13-30 24 2t22 1 17 10M22 64q15-26 24-1t26-3" fill="none" stroke="#e8bf60" stroke-width="9" stroke-linecap="round"/>',
  Tomato:'<circle cx="50" cy="55" r="34"/><path d="M49 29l-16-9 16 2 8-16 2 18 19 3-19 6-10 12Z" fill="#547b37"/><path d="M28 49q-5 9 0 17" fill="none" stroke="#f88b6a" stroke-width="5"/>',
  Mushroom:'<path d="M41 46h20l7 37q-20 9-33 0Z" fill="#f1deba"/><path d="M10 51C12 4 85 2 91 51Q51 71 10 51Z"/><circle cx="35" cy="32" r="6" fill="#dfcfb1"/><circle cx="65" cy="30" r="8" fill="#dfcfb1"/>',
  Corn:'<path d="M26 77Q9 44 29 22l13 42Z" fill="#658242"/><ellipse cx="52" cy="46" rx="21" ry="37"/><path d="M40 22h24M34 35h36M33 48h38M36 61h30M46 12v66m12-65v64" stroke="#c39b30" stroke-width="2"/><path d="M51 87Q75 64 83 33 49 49 39 81Z" fill="#719849"/>',
  Lemon:'<path d="M14 48Q17 20 49 19L69 18 86 46Q85 75 54 79L32 81Z"/><path d="M29 37q8-10 23-9" stroke="#fff09a" stroke-width="5" fill="none"/>',
  Apple:'<path d="M51 27C15 4 7 47 23 74s31 13 32 8C90 97 98 19 69 22Z"/><path d="M52 28l2-18" stroke="#6e4b2c" stroke-width="6"/><path d="M57 19q4-20 24-10-7 16-24 10" fill="#6a943f"/>',
  Strawberry:'<path d="M16 34Q49 10 85 35L62 84Q50 98 38 80Z"/><path d="M49 33L25 17l24 5 7-15 7 16 22-5-19 19Z" fill="#609342"/><path d="M32 43l3 5m17-4 1 5m17-5-3 5m-25 9 3 5m14-6-2 5m-6 11 1 4" stroke="#f9d98b" stroke-width="3"/>',
  Cheese:'<path d="M14 45l62-29 10 62-72 6Z"/><path d="M14 45l72 8M76 16l10 37" stroke="#be8c36" stroke-width="3" fill="none"/><circle cx="38" cy="61" r="6" fill="#cf9c3b"/><circle cx="67" cy="68" r="8" fill="#cf9c3b"/>',
  Egg:'<path d="M50 10C69 10 87 49 82 68S25 94 18 66 31 10 50 10Z"/><path d="M36 30q6-10 14-11" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round"/>',
  Avocado:'<path d="M49 9C68 3 69 28 81 47S86 91 52 93 12 74 22 51 33 14 49 9Z" fill="#456638"/><path d="M50 17C63 13 63 35 74 51S77 85 52 86 21 71 30 53 39 21 50 17Z" fill="#bfd475"/><circle cx="52" cy="62" r="18" fill="#98633c"/><circle cx="48" cy="58" r="10" fill="#ad7846"/>',
};
// What each ingredient looks like after the knife: [piece shape, main colour, accent colour].
const PIECES = {
  Chicken:['cube','#f1d3b1','#d39159'],Salmon:['fillet','#f18c72','#ffe3bc'],Tofu:['cube','#f8ecc6','#dcc68a'],
  Carrot:['round','#ee892e','#f7b46a'],Broccoli:['floret','#44884a','#8cac56'],Eggplant:['cube','#efe2b8','#5c2f6e'],
  Potato:['cube','#f1d995','#b88c52'],Tomato:['cube','#e2513a','#b4321f'],Mushroom:['mush','#efe0c4','#a88c6c'],
  Corn:['kernel','#f2cc4f','#c99b2c'],Lemon:['wheel','#f4d647','#fbeea0'],Apple:['crescent','#f6ecc9','#d9503b'],
  Strawberry:['half','#db4c52','#f6b9b2'],Cheese:['grated','#ecc45f','#d3a540'],Egg:['cracked','#fbf7ec','#efb63d'],Avocado:['crescent','#cbdc80','#456638'],
};
const SPOTS = [[32,34,-12],[62,30,18],[74,58,-25],[47,56,8],[26,66,30],[56,78,-8]];
function piecesArt(name) {
  const [kind,a,b]=PIECES[name];
  const at=([x,y,r],body)=>`<g transform="translate(${x} ${y}) rotate(${r})">${body}</g>`;
  const piece={
    cube:`<rect x="-9" y="-9" width="18" height="18" rx="3" fill="${a}" stroke="${b}" stroke-width="3"/>`,
    round:`<circle r="11" fill="${a}"/><circle r="5.5" fill="${b}"/>`,
    wheel:`<circle r="13" fill="${a}"/><circle r="10" fill="${b}"/><path d="M0-10V10M-10 0H10M-7-7l14 14M7-7-7 7" stroke="${a}" stroke-width="1.5"/>`,
    floret:`<path d="M-3 2h6l2 12h-10Z" fill="#8cac56"/><circle cx="-6" cy="-2" r="7" fill="${a}"/><circle cx="6" cy="-2" r="7" fill="${a}"/><circle cy="-8" r="7" fill="${a}"/>`,
    mush:`<path d="M-13 0C-13-14 13-14 13 0Z" fill="${a}" stroke="${b}" stroke-width="2"/><path d="M-4 0h8v11h-8Z" fill="${a}" stroke="${b}" stroke-width="2"/>`,
    crescent:`<path d="M-15 4Q0-17 15 4Q0-6-15 4Z" fill="${a}" stroke="${b}" stroke-width="3" stroke-linejoin="round"/>`,
    half:`<path d="M0 13C-14 3-14-10-8-12Q0-14 8-12C14-10 14 3 0 13Z" fill="${a}"/><path d="M0 9C-8 2-8-7-4-8Q0-9 4-8C8-7 8 2 0 9Z" fill="${b}"/>`,
    fillet:`<rect x="-15" y="-10" width="30" height="20" rx="4" fill="${a}"/><path d="M-7-9-9 9M1-10-1 10M9-9 7 9" stroke="${b}" stroke-width="2.5"/>`,
  };
  if(kind==='kernel')return Array.from({length:16},(_,i)=>at([24+(i%4)*16+(Math.floor(i/4)%2)*5,27+Math.floor(i/4)*15,i*23%40-20],`<rect x="-5" y="-5.5" width="10" height="11" rx="4" fill="${a}" stroke="${b}"/>`)).join('');
  if(kind==='grated')return `<path d="M18 76Q50 58 82 76Q76 48 50 32Q24 48 18 76Z" fill="${b}" opacity=".35"/>`+Array.from({length:24},(_,i)=>`<path d="M${24+i*41%52} ${38+i*29%36}l${8-i%3*5} ${-6+i%4*4}" stroke="${a}" stroke-width="3.5" stroke-linecap="round"/>`).join('');
  if(kind==='cracked')return `<path d="M18 50C14 26 46 16 62 24S92 46 82 66 50 88 34 80 20 64 18 50Z" fill="${a}"/><circle cx="50" cy="51" r="13" fill="${b}"/><ellipse cx="46" cy="47" rx="4" ry="3" fill="#ffdc78"/>`;
  return SPOTS.slice(0,kind==='fillet'?3:6).map(s=>at(s,piece[kind])).join('');
}
function pureeArt(color) {
  return `<circle cx="50" cy="50" r="36" fill="${color}"/><path d="M50 22a28 28 0 1 1-26 18M50 36a14 14 0 1 1-12 8" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>`;
}
function foodLabel(item) {
  const info=INGREDIENTS[item.name];
  if(item.form==='puree')return `${item.name} purée`;
  return item.form==='prepped'?`${info.prep[1]} ${item.name.toLowerCase()}`:item.name;
}
// Browning follows dry heat (sear); boiled food softens instead (done without sear).
function foodLook(item) {
  const sear=item.sear||0,done=item.done||0;
  return `--brown:${clamp(sear/1.2,0,1).toFixed(2)};--char:${clamp((sear-1.4)/.6,0,1).toFixed(2)};--soft:${clamp((done-sear-.9)/.8,0,1).toFixed(2)}`;
}
function foodArt(item,{track=false}={}) {
  const form=item.form||'whole';
  const shape=form==='puree'?pureeArt(INGREDIENTS[item.name].color):form==='prepped'?piecesArt(item.name):WHOLE_ART[item.name];
  return `<svg class="food-art food-${form}" viewBox="0 0 100 100" ${track?`data-food="${item.id}"`:''} ${item.id!=null?`data-paint="${item.id}"`:''} style="${foodLook(item)}" role="img" aria-label="${escapeHTML(foodLabel(item))}" fill="${INGREDIENTS[item.name].color}">${shape}</svg>`;
}
function plateMarkup(items,seasonings=[],track=false) {
  const sauces=items.filter(i=>i.form==='puree'),solids=items.filter(i=>i.form!=='puree');
  const specks=seasonings.map((name,s)=>Array.from({length:5},(_,i)=>`<i style="--c:${SEASONINGS.find(x=>x[0]===name)[1]};left:${18+(i*37+s*23)%64}%;top:${20+(i*53+s*31)%60}%"></i>`).join('')).join('');
  return `${sauces.map((i,n)=>`<span class="sauce sauce-${n}" style="--sauce:${INGREDIENTS[i.name].color}" ${track?`data-food="${i.id}"`:''} role="img" aria-label="${escapeHTML(foodLabel(i))}"></span>`).join('')}${solids.map(i=>foodArt(i,{track})).join('')}${specks?`<span class="seasoning" aria-hidden="true">${specks}</span>`:''}`;
}
const LOOKS = [
  {skin:'#eebf9c',jacket:'#f2ede2',trim:'#c7bfae',hair:'<path d="M31 42q-1-24 19-24t19 24q-4-11-19-12-15 1-19 12Z" fill="#d4cec3"/>',face:'<path d="M40 61q10-6 20 0-10 5-20 0Z" fill="#d8d1c6"/>'},
  {skin:'#7b4a2e',jacket:'#c96b32',trim:'#e9a15c',hair:'<g fill="#1f1611"><circle cx="34" cy="33" r="10"/><circle cx="45" cy="24" r="11"/><circle cx="58" cy="24" r="11"/><circle cx="68" cy="34" r="10"/><circle cx="30" cy="47" r="8"/><circle cx="71" cy="48" r="8"/></g>',face:'<circle cx="31" cy="59" r="2.6" fill="#f1c35d"/><circle cx="69" cy="59" r="2.6" fill="#f1c35d"/>'},
  {skin:'#e5bf98',jacket:'#262321',trim:'#5c554d',hair:'<path d="M32 45q-3-27 18-27t18 27q-5-13-18-15-11 2-18 15Z" fill="#141313"/>',face:'<g fill="none" stroke="#211d1a" stroke-width="2"><circle cx="43" cy="47" r="5.5"/><circle cx="57" cy="47" r="5.5"/><path d="M48.5 47h3"/></g>'},
];
function judgeArt(index) {
  const look=LOOKS[index];
  return `<svg class="judge-art" viewBox="0 0 100 100" aria-hidden="true"><clipPath id="judge-clip-${index}"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#judge-clip-${index})"><rect width="100" height="100" fill="#3a2e24"/><path d="M10 106q2-32 40-34 38 2 40 34Z" fill="${look.jacket}"/><path d="M50 72l-9 12 9 16 9-16Z" fill="${look.trim}"/><rect x="43" y="58" width="14" height="16" rx="5" fill="${look.skin}"/><ellipse cx="50" cy="46" rx="18" ry="21" fill="${look.skin}"/>${look.hair}<g fill="#2a1d15"><circle cx="43" cy="47" r="2"/><circle cx="57" cy="47" r="2"/></g><path d="M44 58q6 4 12 0" stroke="#7a3f2c" stroke-width="2" fill="none" stroke-linecap="round"/>${look.face}</g></svg>`;
}
const METHOD_ART = {
  saute:'<path d="M44 30l18-6" stroke="#3b3631" stroke-width="6" stroke-linecap="round"/><circle cx="28" cy="36" r="21" fill="#2b2e2a" stroke="#6f746c" stroke-width="3"/><rect x="17" y="31" width="8" height="7" rx="2" fill="#e1a04b"/><rect x="30" y="39" width="8" height="7" rx="2" fill="#7fa04f"/><rect x="28" y="26" width="7" height="7" rx="2" fill="#d9583d"/>',
  boil:'<rect x="3" y="28" width="9" height="8" rx="2" fill="#5d625c"/><rect x="52" y="28" width="9" height="8" rx="2" fill="#5d625c"/><circle cx="32" cy="32" r="22" fill="#c3cbc1"/><circle cx="32" cy="32" r="17" fill="#6fa3b3"/><g fill="none" stroke="#d9eef3" stroke-width="1.5"><circle cx="26" cy="28" r="3"/><circle cx="38" cy="36" r="2.5"/><circle cx="33" cy="23" r="2"/></g>',
  bake:'<rect x="8" y="10" width="48" height="46" rx="4" fill="#b8bfb4"/><rect x="14" y="22" width="36" height="26" rx="3" fill="#d9822f"/><rect x="18" y="32" width="28" height="4" fill="#ffd27a" opacity=".7"/><circle cx="18" cy="16" r="2.5" fill="#3b3f3a"/><circle cx="28" cy="16" r="2.5" fill="#3b3f3a"/><rect x="38" y="14" width="12" height="4" rx="1" fill="#1c1f1b"/>',
  blend:'<path d="M12 56h34" stroke="#5d625c" stroke-width="4" stroke-linecap="round"/><path d="M16 10h16q8 0 8 8v6H22v30h-6Z" fill="#c4583a"/><path d="M28 30h28l-4 20H32Z" fill="#c7cfc4"/><path d="M33 34h18l-2 12H35Z" fill="#e9b75b"/><path d="M40 24v14" stroke="#55605a" stroke-width="2"/>',
};
const methodArt = id => `<svg class="method-art" viewBox="0 0 64 64" aria-hidden="true">${METHOD_ART[id]}</svg>`;
const SPRIG = '<svg class="sprig" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 34Q20 20 34 6" stroke="#3f6b35" stroke-width="2" fill="none"/><g fill="#5b8f45"><ellipse cx="14" cy="24" rx="6" ry="3" transform="rotate(-50 14 24)"/><ellipse cx="22" cy="20" rx="6" ry="3" transform="rotate(30 22 20)"/><ellipse cx="24" cy="12" rx="6" ry="3" transform="rotate(-50 24 12)"/><ellipse cx="31" cy="11" rx="5" ry="2.6" transform="rotate(25 31 11)"/></g></svg>';
const STEAM = '<div class="steam"><i></i><i></i><i></i></div>';
// Side-view silhouette for the line cooks walking behind the title screen's back counter.
const CREW_CHEF = '<svg viewBox="0 0 60 120" aria-hidden="true"><path d="M17 18q-8-14 6-16 7-6 14 0 14 2 6 16Z" fill="#e9dcc4"/><rect x="18" y="16" width="24" height="7" rx="2" fill="#d6c7ad"/><ellipse cx="30" cy="32" rx="10" ry="11" fill="#2a1d16"/><path d="M12 120V58q0-14 18-15 18 1 18 15v62Z" fill="#e6d9c2"/><path d="M30 46v74" stroke="#bfae92" stroke-dasharray="2 6" stroke-width="3"/><path d="M14 60q-8 18 4 34" stroke="#d9cab0" stroke-width="9" fill="none" stroke-linecap="round" class="crew-arm"/></svg>';

function judgesMarkup() {
  return `<div class="judges">${JUDGES.map((j,i)=>`<article class="judge"><div class="avatar">${judgeArt(i)}</div><div><span class="tag">${j.preference}</span><br><strong>${j.name}</strong><p>${j.detail}</p></div></article>`).join('')}</div>`;
}
function render() {
  const changed=app.dataset.screen!==state.screen;
  app.dataset.screen=state.screen;
  if(state.screen==='intro') renderIntro();
  if(state.screen==='select') renderSelection();
  if(state.screen==='methods') renderMethods();
  if(state.screen==='kitchen') renderKitchen();
  if(state.screen==='results') renderResults();
  if(changed){app.classList.remove('screen-in');void app.offsetWidth;app.classList.add('screen-in');}
}

// ---------- Title screen: a living studio kitchen behind the logo ----------
function renderIntro() {
  const jars=['#c4462b','#e9dcc0','#5b8a3c','#b6a446','#7b4f2c'].map(c=>`<i style="--jar:${c}"></i>`).join('');
  const floaters=['Tomato','Lemon','Mushroom','Carrot','Strawberry','Broccoli'].map((name,i)=>`<span class="floater floater-${i}">${foodArt({name})}</span>`).join('');
  app.innerHTML = `<section class="title-screen" id="title-screen"><div class="studio" aria-hidden="true"><div class="layer layer-wall"><div class="pendants">${'<i><b></b></i>'.repeat(5)}</div><div class="shelf shelf-left">${jars}</div><div class="shelf shelf-right">${jars}</div></div><div class="layer layer-crew"><div class="walker walker-1"><div class="bob">${CREW_CHEF}</div></div><div class="walker walker-2"><div class="bob"><span class="tray"></span>${CREW_CHEF}</div></div><div class="walker walker-3"><div class="bob">${CREW_CHEF}</div></div></div><div class="layer layer-line"><div class="back-line"><div class="line-group"><div class="line-unit"><div class="flames"><i></i><i></i><i></i><i></i></div><div class="line-pot"></div>${STEAM}</div><div class="line-unit"><div class="flames"><i></i><i></i><i></i><i></i></div><div class="line-pan"><span class="toss"><i></i><i></i><i></i><i></i></span></div></div><div class="line-oven"><i></i></div></div><div class="line-group"><div class="line-oven"><i></i></div><div class="line-unit"><div class="flames"><i></i><i></i><i></i><i></i></div><div class="line-pan pan-two"><span class="toss"><i></i><i></i><i></i></span></div></div><div class="line-unit"><div class="flames"><i></i><i></i><i></i><i></i></div><div class="line-pot"></div>${STEAM}</div></div></div></div><div class="embers">${Array.from({length:16},(_,i)=>`<i style="left:${8+i*53%84}%;animation-delay:${-(i*.83).toFixed(2)}s;--drift:${(i%5-2)*16}px"></i>`).join('')}</div><div class="layer layer-float">${floaters}</div><div class="set-counter counter-left"><div class="set-board"></div></div><div class="set-counter counter-right"><div class="set-hob"></div></div></div><div class="title-content"><div class="eyebrow">THE MYSTERY BOX CHALLENGE</div><div class="show-emblem" aria-hidden="true">m<span>◦</span></div><h1>MYSTERY<span>KITCHEN</span></h1><p>Six ingredients. Five minutes. One shot to impress.</p><button class="play-button" data-action="start">START COOKING <span>▶</span></button><button class="menu-link" data-action="instructions" aria-expanded="false">HOW TO PLAY</button><div class="title-meta"><span>06 <small>INGREDIENTS</small></span><i></i><span>03 <small>JUDGES</small></span><i></i><span>30 <small>POINTS TO CHASE</small></span></div></div><div class="studio-sign">THE KITCHEN IS YOURS.</div></section><section class="instructions-drawer" id="instructions" hidden><div class="section-heading"><h2>Your first service</h2><button class="secondary small" data-action="instructions">Close ✕</button></div><div class="steps"><article><b>01 / THE BASKET</b><h3>Trust your instincts.</h3><p>Choose one of three hidden cards six times. Then select exactly two cooking methods: sauté, boil, bake or blend.</p></article><article><b>02 / THE KITCHEN</b><h3>Cook your way.</h3><p>Walk with the arrow keys. Click food on the table to pick it up, then click a nearby station to use it. Do things in any order: knife work is optional, pots and pans hold three ingredients, and food can go back on the heat.</p></article><article><b>03 / THE HEAT</b><h3>Watch the colour.</h3><p>Pans and ovens heat up, and water has to come to a boil. Food browns as it cooks. Take it out in the golden window before it overcooks or burns. Prepped food cooks faster.</p></article><article><b>04 / THE VERDICT</b><h3>Make every bite count.</h3><p>Season at the pantry, plate at the counter, then Finish, name your dish and Serve. Each basket ingredient left off the plate costs two points. At five minutes, cooking stops.</p></article></div>${judgesMarkup()}</section>`;
}

// ---------- Basket selection ----------
function beginSelection() {
  state.screen='select';
  state.choices=shuffle(CATEGORIES[0][1]);
  render();
}
function renderSelection() {
  const n=state.basket.length;
  app.innerHTML=`<div class="section-heading"><div><div class="eyebrow">The mystery basket · ${n+1} of 6</div><h1>Pick your ${CATEGORIES[n][0].toLowerCase()}.</h1></div><div class="progress">${CATEGORIES.map((_,i)=>`<span class="${i<n?'done':''}"></span>`).join('')}</div></div><p>Trust your gut. Choose a card to reveal the next ingredient in your basket.</p><div class="selection-layout"><section><div class="cards">${state.choices.map((_,i)=>`<button class="ingredient-card" data-action="pick" data-index="${i}" style="--i:${i}" aria-label="Choose mystery card ${i+1}"><span class="card-inner"><span class="card-back"><small>MYSTERY INGREDIENT</small><span class="card-number">${i+1}</span><small>CLICK TO REVEAL ↗</small></span><span class="card-front"></span></span></button>`).join('')}</div><p class="selection-hint">No peeking. Each card hides a different ingredient. The clock starts after you choose your cooking methods.</p></section><aside class="selection-aside"><h3>Your basket</h3><ul class="basket-list">${CATEGORIES.map((c,i)=>`<li id="basket-${i}" class="${i>=n?'empty':''}">${basketSlot(state.basket[i],c[0])}</li>`).join('')}</ul><div class="notice">Use all six ingredients.<br>Unused ingredients cost <strong>2 points each.</strong></div></aside></div>`;
}
function basketSlot(item,category) {
  return item?`<span class="basket-art">${foodArt(item)}</span>${item.name}`:`<span class="basket-art"></span>${category}`;
}
function pick(index) {
  const name=state.choices[index];
  if(!name||state.revealing)return;
  const n=state.basket.length,item=newItem(n,name);
  state.basket.push(item);
  state.revealing=true;
  announce(`${name} added to your basket.`);
  const card=document.querySelector(`[data-action="pick"][data-index="${index}"]`);
  if(card){
    card.querySelector('.card-front').innerHTML=`${foodArt(item)}<strong>${name}</strong><small>${CATEGORIES[n][0].toUpperCase()}</small>`;
    card.classList.add('flipped');
    document.querySelector('.cards')?.classList.add('revealing');
  }
  const slot=document.querySelector(`#basket-${n}`);
  if(slot){slot.innerHTML=basketSlot(item);slot.classList.remove('empty');slot.classList.add('filled');}
  setTimeout(advanceSelection,1250);
}
function advanceSelection() {
  if(state.screen!=='select'||!state.revealing)return;
  state.revealing=false;
  if(state.basket.length===6)state.screen='methods';
  else state.choices=shuffle(CATEGORIES[state.basket.length][1]);
  render();
}

// ---------- Cooking methods ----------
function renderMethods() {
  app.innerHTML=`<div class="section-heading"><div><div class="eyebrow">Your game plan</div><h1>Two methods. Your signature.</h1></div><span class="tiny" id="method-count">${state.methods.length} / 2 SELECTED</span></div><p>These are the cooking methods available this round. Knife work, seasoning and plating are always available.</p><div class="methods">${Object.entries(METHODS).map(([id,m])=>`<button class="method" data-action="method" data-id="${id}" aria-pressed="false">${methodArt(id)}${m.name}<small>${m.description}</small></button>`).join('')}</div><div class="notice basket-notice">Your basket: ${state.basket.map(i=>`<span>${foodArt(i)}${i.name}</span>`).join('')}</div><div class="judges-title"><h2>Know your audience.</h2></div>${judgesMarkup()}<div class="start-row"><button data-action="cook" id="start-cooking">Start cooking →</button><span class="tiny">Your five-minute timer starts now.</span></div>`;
  updateMethods();
}
function updateMethods() {
  for(const el of document.querySelectorAll('[data-action="method"]')){
    const on=state.methods.includes(el.dataset.id);
    el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));
  }
  setText(document.querySelector('#method-count'),`${state.methods.length} / 2 SELECTED`);
  const start=document.querySelector('#start-cooking');
  if(start)start.disabled=state.methods.length!==2;
}

// ---------- Kitchen ----------
function startKitchen() {
  state.screen='kitchen';
  state.deadline=Date.now()+ROUND_SECONDS*1000;
  render();
  timerId=setInterval(tick,250);
}
function stationScene(id) {
  const uses=m=>state.methods.includes(m);
  if(id==='prep')return `<div class="cutting-board" id="board"><div class="board-food" id="hold-board"></div><div class="knife"><i></i></div><span class="crumbs"><i></i><i></i><i></i></span>${SPRIG}</div>`;
  if(id==='stove')return `<div class="hob"><i class="burner burner-one" id="burner-pan"></i><i class="burner burner-two" id="burner-pot"></i>${uses('saute')?`<div class="cookware pan" id="vessel-pan" data-vessel="pan"><div class="oil"></div><div class="vessel-food" id="hold-pan"></div>${STEAM}</div>`:''}${uses('boil')?`<div class="cookware pot" id="vessel-pot" data-vessel="pot"><div class="water"></div><div class="vessel-food" id="hold-pot"></div><div class="bubbles"><i></i><i></i><i></i><i></i><i></i></div>${STEAM}</div>`:''}</div>`;
  if(id==='oven')return `<div class="oven-top" id="vessel-oven" data-vessel="oven"><div class="oven-window"><div class="baking-tray" id="hold-oven"></div>${STEAM}</div><div class="oven-controls"><i></i><span id="oven-temp">OFF</span><i></i></div></div>`;
  if(id==='mixer')return `<div class="mixer-machine" id="vessel-mixer" data-vessel="mixer"><div class="mixer-arm"></div><div class="mixing-bowl"><div class="blender-food" id="hold-mixer"></div><div class="whisk"></div></div><i class="mixer-switch"></i></div>`;
  if(id==='pantry')return `<div class="spice-rack">${SEASONINGS.map(([name,color])=>`<span class="spice-jar" style="--spice:${color}"><i></i><small>${name.split(' ').pop().toUpperCase()}</small></span>`).join('')}</div>`;
  return `<div class="serving-plate plate-art" id="hold-plate"></div>${SPRIG}`;
}
function renderKitchen() {
  app.innerHTML=`<div class="game-header"><div><div class="eyebrow">MYSTERY BOX · ROUND 01</div><h1>The kitchen is yours.</h1></div><div class="game-status"><div class="method-chips">${state.methods.map(id=>`<span>${methodArt(id)}${METHODS[id].name}</span>`).join('')}</div><div class="clock-wrap"><small>TIME REMAINING</small><div id="timer" class="timer" aria-label="Time remaining">${formatTime(state.remaining)}</div></div><button data-action="finish">FINISH ↗</button></div></div><div class="game-layout"><section class="kitchen-wrap"><div class="room-label"><span>STUDIO 01 / YOUR WORKSTATION</span><span>OVERHEAD VIEW</span></div><div class="kitchen" id="kitchen" tabindex="0" aria-label="Overhead kitchen. Use arrow keys to walk to appliances."><div class="floor-mark floor-mark-left">01</div><div class="floor-mark floor-mark-right">MK</div>${STATIONS.map(s=>`<button class="station station-${s.id} ${stationLocked(s.id)?'locked':''}" data-action="station" data-id="${s.id}" style="left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%" aria-label="${s.name}"><span class="station-label">${s.name}<i class="heat-dot" hidden></i></span><div class="station-scene">${stationScene(s.id)}</div><span class="station-prompt" id="prompt-${s.id}"></span><span class="station-badge" id="badge-${s.id}"></span></button>`).join('')}<div class="island"><div class="table-edge-label">YOUR MYSTERY BASKET · CLICK FOOD TO PICK IT UP</div><div id="inventory" class="table-ingredients"></div></div><div id="chef" class="chef" aria-label="Your chef"><div class="chef-turn"><span class="chef-shadow"></span><span class="chef-arm arm-left"></span><span class="chef-arm arm-right"></span><span class="chef-body"></span><span id="carried-food" class="carried-food"></span><span class="chef-head"></span><span class="chef-hat"></span></div></div></div><div class="kitchen-caption"><span><span class="keys">↑ ↓ ← →</span> WALK <span class="caption-dot">·</span> CLICK FOOD TO PICK IT UP <span class="caption-dot">·</span> CLICK A NEARBY STATION TO USE IT</span><div class="mobile-controls" aria-label="Movement controls">${[['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→']].map(([k,label])=>`<button data-move="${k}" aria-label="Move ${k.slice(5).toLowerCase()}">${label}</button>`).join('')}</div></div><div class="service-console"><div class="station-action" id="station-action"></div><div class="service-info"><div class="panel-label">SERVICE CHECK</div><div id="plate-count"></div><div id="seasonings"></div></div></div><div class="notice" id="message" role="status">${escapeHTML(state.message)}</div></section></div><section class="game-judges">${judgesMarkup()}</section>`;
  syncKitchen();updatePosition();paintKitchen();
}
function stationLocked(id) {
  if(['stove','oven','mixer'].includes(id))return !vesselsAt(id).length;
  return false;
}
function quality(item) {
  const info=INGREDIENTS[item.name];
  if(item.sear>1.9)return 'burnt';
  if(item.done>1.45)return 'overcooked';
  if(item.done>=.85)return 'perfect';
  if(item.done>=.3)return info.raw?'warm':'undercooked';
  return info.raw?'fresh':'raw';
}
// A method only counts once food has spent real time in it; blending counts once it is a purée.
function methodsOf(item) {
  return Object.keys(METHODS).filter(m=>m==='blend'?item.form==='puree':(item.exposure[m]||0)>=2);
}
function itemStatus(item) {
  const info=INGREDIENTS[item.name],parts=[];
  parts.push(item.form==='puree'?'Puréed':item.form==='prepped'?info.prep[1]:'Whole');
  const methods=methodsOf(item).filter(m=>m!=='blend');
  if(methods.length)parts.push(methods.map(m=>METHODS[m].past).join(' + '));
  parts.push(QUALITY[quality(item)]);
  return parts.join(' · ');
}
// Advance every appliance and the food inside it. Called once per animation frame with the elapsed seconds.
function simulate(dt) {
  for(const vessel of Object.keys(VESSELS)){
    const method=VESSELS[vessel],info=METHODS[method],food=itemsIn(vessel);
    if(vessel==='mixer')state.on.mixer=food.length>0;
    state.heat[vessel]=info.warm?clamp(state.heat[vessel]+(state.on[vessel]?1:-.5)*dt/info.warm,0,1):Number(state.on[vessel]);
    const heat=state.heat[vessel];
    for(const item of food){
      if(vessel==='mixer'){item.blend+=dt;if(item.blend>=BLEND_SECONDS)item.form='puree';continue;}
      const amount=dt*info.rate*heat*heat/(INGREDIENTS[item.name].cook*(item.form==='whole'?1:.65));
      item.done+=amount;
      if(info.dry)item.sear+=amount;
      item.exposure[method]=(item.exposure[method]||0)+dt*heat;
    }
    if(food.length>1&&heat>.5)for(const a of food)for(const b of food)if(a!==b&&!a.partners.includes(b.id))a.partners.push(b.id);
  }
  if(state.board&&state.near==='prep'){
    state.board.progress+=dt/PREP_SECONDS;
    if(state.board.progress>=1)completePrep();
  }
}

// Keyed DOM updates: markup is only rebuilt when what it shows has changed, so running animations are never restarted.
function setHTML(selector,key,build) {
  const el=document.querySelector(selector);
  if(el&&el.dataset.key!==key){el.innerHTML=build();el.dataset.key=key;}
}
function syncKitchen() {
  if(state.screen!=='kitchen')return;
  setHTML('#inventory',JSON.stringify(state.basket.map(i=>[i.where,i.form,quality(i)])),inventoryMarkup);
  for(const where of ['board','pan','pot','oven','mixer'])setHTML(`#hold-${where}`,JSON.stringify(itemsIn(where).map(i=>[i.id,i.form])),()=>itemsIn(where).map(i=>foodArt(i,{track:true})).join(''));
  const plated=itemsIn('plate');
  setHTML('#hold-plate',JSON.stringify([plated.map(i=>[i.id,i.form]),state.seasonings]),()=>plateMarkup(plated,state.seasonings,true));
  const hand=held();
  setHTML('#carried-food',JSON.stringify(hand?[hand.id,hand.form,quality(hand)]:null),()=>hand?foodArt(hand,{track:true}):'');
  setText(document.querySelector('#plate-count'),`${plated.length} / 6 plated · ${2*(6-plated.length)} waste points`);
  setText(document.querySelector('#seasonings'),state.seasonings.length?`Seasoned with ${state.seasonings.join(', ').toLowerCase()}`:'Visit the pantry to season your dish.');
  renderStation();
}
function inventoryMarkup() {
  return state.basket.map(i=>{
    const here=i.where==='table',inHand=i.where==='hand';
    return `<button class="ingredient-plate ${inHand?'selected':''} ${!here&&!inHand?'away':''}" draggable="${here}" data-item="${i.id}" data-action="ingredient" data-id="${i.id}" ${here||inHand?'':'disabled'} aria-label="${inHand?'Put back':here?'Pick up':''} ${i.name}: ${itemStatus(i)}"><span class="food-dish">${here?foodArt(i,{track:true}):`<span class="dish-away">${PLACES[i.where]}</span>`}</span><strong>${i.name}</strong><small>${inHand?'Click to put back':itemStatus(i)}</small></button>`;
  }).join('');
}

// The one-click action for a station, also shown as a floating prompt when the chef is close.
function primaryAction(stationId,vessel) {
  const item=held(),name=item?.name.toLowerCase();
  if(stationLocked(stationId))return null;
  if(stationId==='prep'){
    const prep=item&&INGREDIENTS[item.name].prep;
    return prep&&item.form==='whole'&&!state.board?[`${prep[0]} ${name}`,()=>startPrep(item)]:null;
  }
  if(stationId==='plate')return item?[`Plate ${name}`,()=>plateItem(item)]:null;
  const vessels=vesselsAt(stationId);
  if(!vessels.length)return null;
  if(item){
    const target=vessels.includes(vessel)?vessel:vessels.find(v=>INGREDIENTS[item.name].classic.includes(VESSELS[v])&&itemsIn(v).length<CAPACITY)||vessels.find(v=>itemsIn(v).length<CAPACITY)||vessels[0];
    return [`Add ${name} to ${VESSEL_NAMES[target]}`,()=>addTo(target,item)];
  }
  const inside=(vessels.includes(vessel)?[vessel]:vessels).flatMap(itemsIn).sort((a,b)=>b.done-a.done);
  return inside.length?[`Take out ${inside[0].name.toLowerCase()}`,()=>grab(inside[0])]:null;
}
function runPrimary(stationId,vessel) {
  const action=primaryAction(stationId,vessel);
  if(action)action[1]();
  else if(stationLocked(stationId))message('That appliance is not one of your two methods this round.');
  else if(stationId==='prep'&&held())message(INGREDIENTS[held().name].prep?`The ${held().name.toLowerCase()} is already prepped.`:`${held().name} doesn't need any knife work. Take it straight to the heat.`);
  else if(stationId!=='pantry')message('Pick up an ingredient from the table first.');
}
function renderStation() {
  const target=document.querySelector('#station-action');
  if(!target)return;
  const item=held(),station=STATIONS.find(s=>s.id===state.near);
  const key=JSON.stringify([state.near,item?.id,item?.form,state.board?.item,['board','pan','pot','oven','mixer','plate'].map(w=>itemsIn(w).map(i=>[i.id,i.form])),state.on,state.seasonings,state.finished]);
  if(target.dataset.key===key)return;
  target.dataset.key=key;
  for(const s of STATIONS){
    const action=s.id===state.near&&primaryAction(s.id);
    const prompt=document.querySelector(`#prompt-${s.id}`);
    setText(prompt,action?action[0]:'');
  }
  if(!station){
    target.innerHTML=item?`<h3>Carrying ${escapeHTML(foodLabel(item).toLowerCase())}</h3><p>Walk to any station to prep, cook, blend or plate it, in any order you like.</p>`:'<h3>Your kitchen, your rules.</h3><p>Click an ingredient on the table to pick it up, then walk to a station. The outlined station is within reach.</p>';
    return;
  }
  let body;
  if(stationLocked(station.id))body='<p>This appliance is unavailable with your two selected methods.</p>';
  else if(station.id==='prep')body=prepPanel(item);
  else if(station.id==='pantry')body=`<p>Season the whole dish. Pantry items are optional and never count as waste.</p><div class="pantry-items">${SEASONINGS.map(([name,color])=>{const on=state.seasonings.includes(name);return `<button class="${on?'on':''}" data-action="season" data-id="${name}" aria-pressed="${on}"><i style="background:${color}"></i>${name}</button>`;}).join('')}</div>`;
  else if(station.id==='plate'){
    const plated=itemsIn('plate');
    body=`${plated.length?`<ul class="tray-items">${plated.map(i=>`<li>${foodArt(i)}<span>${escapeHTML(foodLabel(i))}</span><button class="small secondary" data-action="take" data-id="${i.id}">Take back</button></li>`).join('')}</ul>`:'<p>Nothing plated yet. Bring food here when it is ready. You can take it back off until you finish.</p>'}${item?`<button class="small" data-action="plate">Plate ${escapeHTML(foodLabel(item).toLowerCase())}</button>`:''}`;
  }
  else body=`<div class="vessels">${vesselsAt(station.id).map(v=>vesselPanel(v,item)).join('')}</div>`;
  target.innerHTML=`<h3>${station.name}</h3>${body}`;
  paintMeters();
}
function prepPanel(item) {
  if(state.board){
    const food=state.basket[state.board.item];
    return `<p>${ing(INGREDIENTS[food.name].prep[0])} the ${food.name.toLowerCase()}… stay at the board until the knife finishes.</p><div class="meter prep-meter"><i id="prep-meter"></i></div><button class="small secondary" data-action="take" data-id="${food.id}">Take it off the board</button>`;
  }
  if(!item)return '<p>Bring an ingredient here to dice, slice or crack it. Knife work is optional, and prepped food cooks faster.</p>';
  const prep=INGREDIENTS[item.name].prep;
  if(!prep)return `<p>${item.name} doesn't need any knife work. Take it straight to the heat.</p>`;
  if(item.form!=='whole')return `<p>The ${escapeHTML(foodLabel(item).toLowerCase())} is ready to cook.</p>`;
  return `<div class="action-line"><p>${item.name} · ${prep[0].toLowerCase()} it for faster, more even cooking.</p><button class="small" data-action="prep">${prep[0]} ${item.name.toLowerCase()}</button></div>`;
}
function vesselPanel(vessel,item) {
  const food=itemsIn(vessel);
  return `<div class="vessel-panel"><div class="vessel-head"><strong>${METHODS[VESSELS[vessel]].name}</strong><span class="heat-readout" data-heat="${vessel}"></span>${vessel==='mixer'?'':`<button class="small secondary" data-action="power" data-id="${vessel}">${state.on[vessel]?'Turn off':vessel==='oven'?'Preheat':'Turn on'}</button>`}</div><ul class="vessel-items">${food.map(i=>`<li>${foodArt(i)}<div class="item-meter"><b>${escapeHTML(foodLabel(i))}</b><span class="doneness" data-qual="${i.id}"></span><div class="meter ${vessel==='mixer'?'blend-meter':''}"><i data-meter="${i.id}"></i></div></div><button class="small" data-action="take" data-id="${i.id}">Take out</button></li>`).join('')||'<li class="empty">Empty</li>'}</ul>${item?`<button class="small" data-action="add" data-id="${vessel}" ${food.length>=CAPACITY?'disabled':''}>${food.length>=CAPACITY?'Full':`Add ${escapeHTML(item.name.toLowerCase())}`}</button>`:''}</div>`;
}
function heatLabel(vessel) {
  if(vessel==='mixer')return itemsIn('mixer').length?'Running':'Idle';
  const heat=state.heat[vessel];
  if(!state.on[vessel])return heat>.05?'Cooling down':'Off';
  if(heat<.95)return vessel==='pot'?'Coming to a boil…':vessel==='oven'?`Preheating · ${Math.round(20+heat*160)}°`:'Heating up…';
  return vessel==='pot'?'Rolling boil':vessel==='oven'?'180° · ready':'Sizzling hot';
}
function cookLabel(item) {
  if(item.where==='mixer')return item.form==='puree'?'Silky smooth':'Blending…';
  const q=quality(item);
  if(q==='perfect')return 'Perfect. Take it out!';
  if(item.sear>1.55&&q!=='burnt')return 'Starting to smoke!';
  return QUALITY[q];
}
function paintMeters() {
  for(const item of state.basket){
    const meter=document.querySelector(`[data-meter="${item.id}"]`);
    if(!meter?.style)continue;
    meter.style.setProperty('--pos',clamp(item.where==='mixer'?item.blend/BLEND_SECONDS:item.done/2.2,0,1).toFixed(3));
    setText(document.querySelector(`[data-qual="${item.id}"]`),cookLabel(item));
  }
  for(const vessel of Object.keys(VESSELS))setText(document.querySelector(`[data-heat="${vessel}"]`),heatLabel(vessel));
  document.querySelector('#prep-meter')?.style?.setProperty('--pos',(state.board?.progress||0).toFixed(3));
}
function stationBadge(id) {
  if(stationLocked(id))return ['NOT SELECTED',''];
  if(id==='prep')return state.board?[state.near==='prep'?`${ing(INGREDIENTS[state.basket[state.board.item].name].prep[0]).toUpperCase()}…`:'WAITING FOR YOU','']:['',''];
  if(id==='plate'){const n=itemsIn('plate').length;return n?[`${n} ON THE PLATE`,'']:['',''];}
  if(id==='pantry')return state.seasonings.length?[`${state.seasonings.length} SEASONING${state.seasonings.length>1?'S':''}`,'']:['',''];
  const vessels=vesselsAt(id),food=vessels.flatMap(itemsIn);
  if(id==='mixer')return food.length?food.every(i=>i.form==='puree')?['SMOOTH','golden']:['BLENDING','']:['',''];
  if(!food.length)return vessels.some(v=>state.on[v])?vessels.some(v=>state.on[v]&&state.heat[v]>.95)?['HOT · READY','']:['HEATING UP','']:['',''];
  if(food.some(i=>quality(i)==='burnt'))return ['BURNT','burnt'];
  if(food.some(i=>i.sear>1.55))return ['SMOKING!','burnt'];
  if(food.some(i=>quality(i)==='perfect'))return ['PERFECT · TAKE OUT','golden'];
  if(vessels.includes('pot')&&itemsIn('pot').length&&state.heat.pot<.7)return ['COMING TO A BOIL',''];
  return ['COOKING',''];
}
function paintKitchen() {
  syncKitchen();
  const kitchen=document.querySelector('#kitchen'),chef=document.querySelector('#chef');
  if(kitchen?.clientWidth&&chef){
    state.aspect=kitchen.clientWidth/kitchen.clientHeight;
    chef.style.transform=`translate(${state.position.x/100*kitchen.clientWidth}px,${state.position.y/100*kitchen.clientHeight}px)`;
    chef.style.setProperty('--turn',`${state.facing.toFixed(1)}deg`);
    chef.classList.toggle('walking',state.walking);
    chef.classList.toggle('carrying',Boolean(held()));
  }
  for(const item of state.basket)if(VESSELS[item.where])for(const el of document.querySelectorAll(`[data-paint="${item.id}"]`))el.setAttribute('style',foodLook(item));
  for(const vessel of Object.keys(VESSELS)){
    const el=document.querySelector(`#vessel-${vessel}`),food=itemsIn(vessel),heat=state.heat[vessel];
    if(!el?.style)continue;
    el.style.setProperty('--heat',heat.toFixed(2));
    el.classList.toggle('on',state.on[vessel]);
    el.classList.toggle('busy',food.length>0);
    el.classList.toggle('boiling',vessel==='pot'&&state.on.pot&&heat>.7);
    el.classList.toggle('sizzling',vessel==='pan'&&heat>.5&&food.length>0);
    el.classList.toggle('smoking',food.some(i=>i.sear>1.55));
    document.querySelector(`#burner-${vessel}`)?.style?.setProperty('--heat',heat.toFixed(2));
  }
  setText(document.querySelector('#oven-temp'),state.heat.oven>.02?`${Math.round(20+state.heat.oven*160)}°`:'OFF');
  const mix=document.querySelector('#hold-mixer'),blending=itemsIn('mixer');
  if(mix?.style){
    mix.style.setProperty('--blend',clamp(Math.max(0,...blending.map(i=>i.blend))/BLEND_SECONDS,0,1).toFixed(2));
    if(blending.length)mix.style.setProperty('--puree',INGREDIENTS[blending[0].name].color);
  }
  const board=document.querySelector('#board');
  board?.classList.toggle('chopping',Boolean(state.board&&state.near==='prep'));
  for(const s of STATIONS){
    const [text,tone]=stationBadge(s.id),badge=document.querySelector(`#badge-${s.id}`);
    setText(badge,text);
    if(badge&&badge.className!==`station-badge ${tone}`)badge.className=`station-badge ${tone}`;
    const active=s.id==='prep'?Boolean(state.board):vesselsAt(s.id).some(v=>state.on[v]);
    const el=document.querySelector(`[data-action="station"][data-id="${s.id}"]`);
    el?.classList.toggle('active',active);
    const dot=el?.querySelector?.('.heat-dot');
    if(dot)dot.hidden=!active;
  }
  paintMeters();
}

// Moving food: every move animates a copy of the food from where it was to where it lands.
function rectOf(id) {
  return document.querySelector(`[data-food="${id}"]`)?.getBoundingClientRect?.();
}
function flyFrom(id,from) {
  const to=document.querySelector(`[data-food="${id}"]`);
  if(!from?.width||!to?.animate)return;
  const end=to.getBoundingClientRect();
  if(!end.width)return;
  const ghost=to.cloneNode(true),dx=from.left-end.left,dy=from.top-end.top,scale=from.width/end.width;
  ghost.removeAttribute('data-food');ghost.removeAttribute('data-paint');
  ghost.classList.add('flying');
  Object.assign(ghost.style,{left:`${end.left}px`,top:`${end.top}px`,width:`${end.width}px`,height:`${end.height}px`});
  document.body.append(ghost);
  to.style.visibility='hidden';
  const land=()=>{ghost.remove();to.style.visibility='';};
  ghost.animate([{transform:`translate(${dx}px,${dy}px) scale(${scale})`},{transform:`translate(${dx/2}px,${dy/2-Math.min(60,Math.abs(dx)/3+20)}px) scale(${(scale+1)/2*1.15})`,offset:.5},{transform:'none'}],{duration:420,easing:'cubic-bezier(.35,.1,.3,1)'}).onfinish=land;
  setTimeout(land,700);  // background tabs may never finish the animation
}
function relocate(item,where) {
  const from=rectOf(item.id);
  item.where=where;
  syncKitchen();
  flyFrom(item.id,from);
}
function grab(item) {
  if(!item||item.where==='hand'||state.finished)return;
  const station=stationOf(item.where);
  if(station&&station!==state.near){message(`Walk to the ${STATIONS.find(s=>s.id===station).name.toLowerCase()} to take the ${item.name.toLowerCase()} back.`);return;}
  if(state.board?.item===item.id)state.board=null;
  const current=held();
  if(current)relocate(current,'table');
  const from=item.where;
  relocate(item,'hand');
  message(VESSELS[from]&&from!=='mixer'?`${foodLabel(item)} out of the ${VESSEL_NAMES[from]}: ${QUALITY[quality(item)].toLowerCase()}.`:`Holding ${foodLabel(item).toLowerCase()}. Walk it to any station.`);
}
function startPrep(item) {
  const prep=INGREDIENTS[item.name].prep;
  if(state.near!=='prep'||state.board||!prep||item.form!=='whole')return;
  relocate(item,'board');
  state.board={item:item.id,progress:0};
  message(`${ing(prep[0])} the ${item.name.toLowerCase()}. Stay at the board until the knife finishes.`);
}
function completePrep() {
  const item=state.basket[state.board.item];
  item.form='prepped';
  state.board=null;
  relocate(item,held()?'table':'hand');
  message(`${foodLabel(item)}, ready for the heat. Prepped food cooks about a third faster.`);
}
function addTo(vessel,item) {
  const method=VESSELS[vessel];
  if(!state.methods.includes(method)||state.near!==METHODS[method].station)return;
  if(itemsIn(vessel).length>=CAPACITY){message(`The ${VESSEL_NAMES[vessel]} is full. Take something out first.`);return;}
  const heat=state.heat[vessel],company=itemsIn(vessel).map(i=>i.name.toLowerCase());
  state.on[vessel]=true;
  relocate(item,vessel);
  const name=foodLabel(item).toLowerCase();
  const hints={pan:heat>.8?`${name} hits the hot pan. Listen to that sizzle.`:`${name} into the pan. It is still heating up.`,pot:heat>.7?`${name} into the boiling water.`:`${name} into the pot. The water still has to come to a boil.`,oven:heat>.9?`${name} into a hot oven.`:`${name} into the oven. It is still preheating.`,mixer:`${name} into the mixer. Give it a few seconds to turn silky.`};
  message(`${hints[vessel][0].toUpperCase()}${hints[vessel].slice(1)}${company.length&&vessel!=='mixer'?` Cooking alongside the ${list(company)}.`:''}`);
}
function plateItem(item) {
  if(state.near!=='plate')return;
  relocate(item,'plate');
  message(`${foodLabel(item)} plated. ${itemsIn('plate').length} of 6 ingredients on the plate.`);
}
function togglePower(vessel) {
  if(state.near!==METHODS[VESSELS[vessel]].station)return;
  state.on[vessel]=!state.on[vessel];
  message(state.on[vessel]?`${vessel==='oven'?'Oven preheating':vessel==='pot'?'Water heating':'Pan heating up'}. Food cooks fastest once it is fully hot.`:`The ${VESSEL_NAMES[vessel]} is off. Food inside stops cooking as it cools.`);
}
function message(text) {
  state.message=text;
  const el=document.querySelector('#message');
  if(el){el.textContent=text;el.classList?.remove('flash');void el.offsetWidth;el.classList?.add('flash');}
  announce(text);
}
function announce(text){document.querySelector('#announcer').textContent=text;}
function formatTime(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}

function updatePosition() {
  let nearest=null, distance=Infinity;
  for(const s of STATIONS){
    const dx=Math.max(s.x-state.position.x,0,state.position.x-s.x-s.w);
    const dy=Math.max(s.y-state.position.y,0,state.position.y-s.y-s.h);
    const d=Math.hypot(dx,dy);
    if(d<distance&&d<14){nearest=s.id;distance=d;}
  }
  if(state.near!==nearest){
    state.near=nearest;
    for(const s of STATIONS)document.querySelector(`[data-action="station"][data-id="${s.id}"]`)?.classList.toggle('near',nearest===s.id);
    renderStation();
  }
}
function isBlocked(x,y){
  // The center island and perimeter appliances are solid counters.
  return (x>21&&x<79&&y>38&&y<66)||STATIONS.some(s=>x>s.x-2&&x<s.x+s.w+2&&y>s.y-3&&y<s.y+s.h+3);
}
// The chef accelerates and slows down rather than snapping, and turns to face where they walk.
function moveChef(dt) {
  const ix=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'));
  const iy=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));
  const length=Math.hypot(ix,iy)||1,v=state.velocity,ease=Math.min(1,dt*10);
  v.x+=(ix/length*30-v.x)*ease;v.y+=(iy/length*40-v.y)*ease;
  if(Math.hypot(v.x,v.y)<.3){v.x=0;v.y=0;}
  if(!v.x&&!v.y){state.walking=false;return;}
  const x=clamp(state.position.x+v.x*dt,4,96),y=clamp(state.position.y+v.y*dt,4,96);
  if(!isBlocked(x,state.position.y))state.position.x=x;else v.x=0;
  if(!isBlocked(state.position.x,y))state.position.y=y;else v.y=0;
  state.walking=Math.hypot(v.x,v.y)>3;
  if(state.walking){
    const target=Math.atan2(v.y,v.x*(state.aspect||2)*.75)*180/Math.PI-90;
    const turn=((target-state.facing)%360+540)%360-180;
    state.facing+=clamp(turn,-dt*720,dt*720);
  }
  updatePosition();
}
function frame(now) {
  const dt=Math.min((now-(previousFrame||now))/1000,.1);
  previousFrame=now;
  if(state?.screen==='kitchen'&&!state.finished){moveChef(dt);simulate(dt);paintKitchen();}
  requestAnimationFrame(frame);
}
function tick() {
  if(state.screen!=='kitchen'||state.finished)return;
  state.remaining=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  const clock=document.querySelector('#timer');
  setText(clock,formatTime(state.remaining));
  clock.classList.toggle('urgent',state.remaining<=30);
  if(!state.remaining)finish(true);
}
function finish(timedOut=false) {
  if(state.finished)return;
  clearInterval(timerId);keys.clear();
  state.finished=true;state.walking=false;
  if(state.board){state.basket[state.board.item].where='table';state.board=null;}
  const hand=held();
  if(hand)hand.where='table';
  app.classList.add('hands-off');
  const plated=itemsIn('plate');
  const overlay=document.createElement('div');
  overlay.className='modal-backdrop';
  overlay.innerHTML=`<form class="modal" id="serve-form" role="dialog" aria-modal="true" aria-labelledby="finish-title"><div class="eyebrow">${timedOut?'Time is up · hands off!':'Hands off · your dish is ready'}</div><h2 id="finish-title">Give it a name.</h2><div class="plate-preview plate-art">${plateMarkup(plated,state.seasonings)}</div><p>${plated.length} of 6 ingredients plated. Your cooking is finished.<br>Make your introduction to the judges.</p><label for="dish-name" class="sr-only">Dish name</label><input id="dish-name" maxlength="60" placeholder="e.g. A Sunday in the garden" autocomplete="off"><button type="submit">Serve to the judges →</button><span class="tiny">An empty name becomes “Chef’s Mystery Plate”.</span></form>`;
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

// ---------- Judging ----------
function scoreDish(basket,seasonings) {
  const plated=basket.filter(i=>i.where==='plate'),n=plated.length;
  const dish=plated.map(item=>({item,info:INGREDIENTS[item.name],quality:quality(item),methods:methodsOf(item)}));
  const pick=test=>dish.filter(test);
  const name=d=>d.item.name.toLowerCase();
  const perfect=pick(d=>d.quality==='perfect'),burnt=pick(d=>d.quality==='burnt'),over=pick(d=>d.quality==='overcooked');
  const unsafe=pick(d=>d.quality==='raw'||d.quality==='undercooked');
  const classic=pick(d=>d.methods.some(m=>d.info.classic.includes(m)));
  const daring=pick(d=>d.methods.some(m=>!d.info.classic.includes(m))&&['perfect','fresh','warm'].includes(d.quality));
  const shared=pick(d=>d.item.partners.some(id=>plated.some(p=>p.id===id)));
  const handled=pick(d=>!d.info.prep||d.item.form!=='whole');
  const methods=new Set(dish.flatMap(d=>d.methods));
  const scores=n?[
    1+n*.6+Math.min(seasonings.length,2)*.75+classic.length*.5+perfect.length*.25-burnt.length*1.2-over.length*.5-unsafe.length*2,
    1.5+n*.5+methods.size*.9+daring.length*.6+shared.length*.35+Math.min(seasonings.length,2)*.35-burnt.length*.7,
    1+handled.length*.55+perfect.length*.75+methods.size*.5-burnt.length*1.5-over.length*.75-unsafe.length*.75,
  ].map(s=>clamp(Math.round(s),1,10)):[1,1,1];
  const classicPick=classic.find(d=>d.quality==='perfect')||classic[0],daringPick=daring[0],sharedPick=shared[0];
  const partner=sharedPick&&plated.find(p=>sharedPick.item.partners.includes(p.id));
  const flawed=burnt[0]||over[0];
  const comments=n?[
    `${classicPick?`${METHODS[classicPick.methods.find(m=>classicPick.info.classic.includes(m))].past} ${name(classicPick)}: that is how it should be done.`:'I do not recognise a single classic preparation on this plate.'} ${unsafe.length?`But the ${list(unsafe.map(name))} ${unsafe.length>1?'are':'is'} not cooked through. I cannot eat that.`:burnt.length?`The burnt ${name(burnt[0])} overpowers everything.`:seasonings.length?`The ${seasonings[0].toLowerCase()} pulls it together.`:'It is crying out for salt.'} ${n>=5?'A generous, complete plate.':'A fuller plate would feel more balanced.'}`,
    `${daringPick?`${METHODS[daringPick.methods.find(m=>!daringPick.info.classic.includes(m))].past} ${name(daringPick)}? I did not see that coming, and it works.`:'Every choice here is very by-the-book.'} ${partner?`Cooking the ${name(sharedPick)} together with the ${partner.name.toLowerCase()} lets the flavours mingle.`:'Next time, cook ingredients together so they borrow from each other.'} ${methods.size>=2?'Two techniques give lovely contrast.':'Use both of your methods for more contrast.'}`,
    `${handled.length} of ${n} ingredient${n>1?'s':''} handled with the right knife work. ${perfect.length?`The ${list(perfect.slice(0,2).map(name))} hit the perfect doneness.`:'Nothing reached the perfect doneness window.'} ${flawed?`The ${name(flawed)} went past perfect into ${flawed.quality}.`:unsafe.length?`The ${name(unsafe[0])} came off the heat too early.`:'Precise, controlled cooking.'}`,
  ]:['An empty plate leaves me without a dish to taste. Plate your ingredients before finishing.','Your basket held six possibilities. Bring them onto the plate so your creativity can shine.','I need plated food to assess your technique. Prep, cook and plate next round.'];
  const subtotal=scores.reduce((sum,score)=>sum+score,0),waste=(6-n)*2;
  return {scores,comments,subtotal,waste,total:Math.max(0,subtotal-waste),unused:basket.filter(i=>i.where!=='plate').map(i=>i.name)};
}
function describe(item) {
  const methods=methodsOf(item);
  const partners=item.partners.map(id=>state.basket[id].name.toLowerCase());
  return [item.form==='puree'?'Puréed':item.form==='prepped'?INGREDIENTS[item.name].prep[1]:'Whole',methods.filter(m=>m!=='blend').map(m=>METHODS[m].past).join(' + '),QUALITY[quality(item)],partners.length?`with the ${list(partners)}`:''].filter(Boolean).join(' · ');
}
function renderResults() {
  const result=scoreDish(state.basket,state.seasonings),plated=itemsIn('plate');
  app.innerHTML=`<div class="results-intro"><div class="eyebrow">The tasting table</div><h1>“${escapeHTML(state.dishName)}”</h1><div class="results-plate plate-art">${plateMarkup(plated,state.seasonings)}</div><p>One mystery basket. Three honest opinions. Here’s how your dish landed.</p></div><section class="result-judges">${JUDGES.map((j,i)=>`<article class="result-card" style="--delay:${.3+i*.45}s"><div class="avatar">${judgeArt(i)}</div><div class="tag">${j.preference}</div><h3>${j.name}</h3><p>${result.comments[i]}</p><div class="judge-score"><span data-count="${result.scores[i]}" data-delay="${.8+i*.45}">${result.scores[i]}</span><small> / 10</small></div></article>`).join('')}</section><section class="total-row"><div class="total-math"><div><strong>${result.subtotal} / 30</strong><span class="tiny">JUDGES’ TOTAL</span></div><span>−</span><div><strong>${result.waste}</strong><span class="tiny">WASTE · ${result.unused.length} × 2 POINTS</span></div><span>=</span></div><div class="final-score"><span data-count="${result.total}" data-delay="2.2">${result.total}</span><small> / 30 FINAL SCORE</small></div></section>${plated.length?`<section class="plate-report"><h3>What reached the judges</h3><ul>${plated.map(i=>`<li>${foodArt(i)}<div><strong>${i.name}</strong><span>${escapeHTML(describe(i))}</span></div></li>`).join('')}</ul></section>`:''}<div class="notice ${result.waste?'warning':''}">${result.unused.length?`Left out of your dish: ${result.unused.join(', ')}. Each unused basket ingredient costs 2 points. The final score cannot fall below zero.`:'Zero waste. Every ingredient made it onto your plate. Beautifully done.'}</div><div class="results-footer"><p><strong>For your next service:</strong> Laurent rewards classic pairings, seasoning and food cooked through, and never forgives raw chicken, rice, pasta, potato, egg or eggplant. Amara rewards unexpected method pairings, ingredients cooked together and using both methods. Kenji rewards knife work and food taken off the heat in the perfect window. Only plated ingredients count.</p><button data-action="again">Play again ↗</button></div>`;
  countUp();
}
function countUp() {
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  for(const el of document.querySelectorAll('[data-count]')){
    const target=Number(el.dataset.count),delay=Number(el.dataset.delay)*1000,start=performance.now();
    el.textContent='0';
    const step=now=>{const t=clamp((now-start-delay)/700,0,1);el.textContent=String(Math.round(target*(1-(1-t)**3)));if(t<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }
}

// ---------- Input ----------
app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button||button.disabled)return;
  const action=button.dataset.action,id=button.dataset.id;
  if(action==='instructions'){
    const panel=document.querySelector('#instructions');panel.hidden=!panel.hidden;
    document.querySelector('[data-action="instructions"]').setAttribute('aria-expanded',String(!panel.hidden));
    if(!panel.hidden)panel.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  if(action==='again'){reset();window.scrollTo(0,0);return;}
  if(action==='start'){beginSelection();return;}
  if(action==='pick'){pick(Number(button.dataset.index));return;}
  if(action==='method'){
    if(state.methods.includes(id))state.methods=state.methods.filter(m=>m!==id);
    else if(state.methods.length<2)state.methods.push(id);
    updateMethods();return;
  }
  if(action==='cook'){if(state.methods.length===2)startKitchen();return;}
  if(state.screen!=='kitchen'||state.finished)return;
  if(action==='finish'){finish();return;}
  if(action==='ingredient'){const item=state.basket[Number(id)];if(item?.where==='hand'){relocate(item,'table');message(`${foodLabel(item)} back on the table.`);}else grab(item);return;}
  if(action==='station'){
    if(state.near!==id){message(`Walk closer to the ${STATIONS.find(s=>s.id===id).name.toLowerCase()} using the arrow keys.`);return;}
    const food=event.target.closest('[data-food]');
    if(food&&!held()){grab(state.basket[Number(food.dataset.food)]);return;}
    runPrimary(id,event.target.closest('[data-vessel]')?.dataset.vessel);return;
  }
  const item=held();
  if(action==='prep'&&item)startPrep(item);
  if(action==='add'&&item)addTo(id,item);
  if(action==='take')grab(state.basket[Number(id)]);
  if(action==='power')togglePower(id);
  if(action==='plate'&&item)plateItem(item);
  if(action==='season'&&state.near==='pantry'){
    const on=state.seasonings.includes(id);
    state.seasonings=on?state.seasonings.filter(s=>s!==id):[...state.seasonings,id];
    message(on?`${id} left out.`:`${id} added to your dish.`);
  }
  syncKitchen();
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
  const item=state.basket[Number(data)];
  if(!item||item.where!=='table')return;
  if(state.near!==station.dataset.id){message('Walk closer to that station before moving an ingredient there.');return;}
  grab(item);
  runPrimary(station.dataset.id,event.target.closest('[data-vessel]')?.dataset.vessel);
});
window.addEventListener('keydown',event=>{
  if(state.screen==='kitchen'&&!state.finished&&event.key.startsWith('Arrow')){event.preventDefault();keys.add(event.key);}
});
window.addEventListener('keyup',event=>keys.delete(event.key));
window.addEventListener('blur',()=>keys.clear());
// Title screen parallax: the studio layers drift against the pointer.
window.addEventListener('pointermove',event=>{
  const scene=state?.screen==='intro'&&document.querySelector('#title-screen');
  if(!scene?.style)return;
  scene.style.setProperty('--px',(event.clientX/window.innerWidth*2-1).toFixed(3));
  scene.style.setProperty('--py',(event.clientY/window.innerHeight*2-1).toFixed(3));
});
app.addEventListener('pointerdown',event=>{
  const button=event.target.closest('[data-move]');
  if(!button)return;
  event.preventDefault();keys.add(button.dataset.move);button.setPointerCapture(event.pointerId);
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])app.addEventListener(name,()=>keys.clear());
reset();
requestAnimationFrame(frame);
