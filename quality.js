'use strict';

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
function quality(item) {
  const info=INGREDIENTS[item.name];
  if(item.sear>1.9)return 'burnt';
  if(item.done>1.45)return 'overcooked';
  if(item.done>=.85)return 'perfect';
  if(item.done>=.3)return info.raw?'warm':'undercooked';
  return info.raw?'fresh':'raw';
}

const METHODS = {
  saute:{name:'Sauté',past:'Sautéed',description:'A hot pan, a golden sear',station:'stove',vessel:'pan',rate:1.25,warm:2,dry:true},
  boil:{name:'Boil',past:'Boiled',description:'Rolling water, tender bites',station:'stove',vessel:'pot',rate:1,warm:4,dry:false},
  bake:{name:'Bake',past:'Baked',description:'Dry heat, deep roasting',station:'oven',vessel:'oven',rate:.8,warm:5,dry:true},
  blend:{name:'Blend',past:'Blended',description:'Silky sauces and purées',station:'mixer',vessel:'mixer',rate:0,warm:0,dry:false},
};

const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const list = words => words.length<2?words.join(''):`${words.slice(0,-1).join(', ')} and ${words.at(-1)}`;
function methodsOf(item) {
  return Object.keys(METHODS).filter(m=>m==='blend'?item.form==='puree':(item.exposure[m]||0)>=2);
}
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INGREDIENTS, METHODS, quality, methodsOf, scoreDish };
}
