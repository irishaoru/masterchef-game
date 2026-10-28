// Run with: node --test tests/game.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function game() {
  const elements = new Map();
  function element() {
    return { innerHTML:'', textContent:'', style:{setProperty(){}}, dataset:{}, classList:{toggle(){},add(){},remove(){}},
      addEventListener(){}, querySelector:()=>element(), setAttribute(){}, focus(){} };
  }
  const document = {
    querySelector(selector) {
      if(!elements.has(selector))elements.set(selector,element());
      return elements.get(selector);
    },
    querySelectorAll:()=>[],
    createElement(){ const el=element(); el.remove=()=>{}; return el; },
    body:{append(){}},
  };
  // Timers run immediately so the card-reveal pause does not slow the tests down.
  const context = vm.createContext({ document, window:{addEventListener(){},scrollTo(){}},
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>fn(), requestAnimationFrame(){}, performance:{now:()=>0}, Date, Math, JSON, console });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),context);
  return code => vm.runInContext(code,context);
}
// A kitchen with a known basket: Chicken, Carrot, Pasta, Tomato, Strawberry, Egg.
function kitchen(methods) {
  const run=game();
  run("beginSelection(); for(let i=0;i<6;i++) pick(0)");
  run("['Chicken','Carrot','Pasta','Tomato','Strawberry','Egg'].forEach((name,i)=>state.basket[i]=newItem(i,name))");
  run(`state.methods=${JSON.stringify(methods)}; startKitchen()`);
  return run;
}

test('six mystery choices lead to method selection and a fresh five-minute kitchen',()=>{
  const run=game();
  run('beginSelection(); for(let i=0;i<6;i++) pick(i%3)');
  assert.equal(run('state.basket.length'),6);
  assert.equal(run('state.screen'),'methods');
  assert.equal(run('state.revealing'),false);
  assert.equal(run('new Set(state.basket.map(i=>i.id)).size'),6);
  run("state.methods=['saute','bake']; startKitchen()");
  assert.equal(run('state.screen'),'kitchen');
  assert.equal(run('state.remaining'),300);
  assert.equal(run("stationLocked('mixer')"),true);
  assert.equal(run("stationLocked('stove')"),false);
  assert.equal(run("vesselsAt('stove').join()"),'pan');
});

test('ingredients can go straight to the heat without chopping, in any order',()=>{
  const run=kitchen(['boil','saute']);
  run("state.near='stove'; grab(state.basket[2]); addTo('pot',state.basket[2])");
  assert.equal(run('state.basket[2].where'),'pot');
  assert.equal(run('state.basket[2].form'),'whole');
  run("grab(state.basket[0]); addTo('pan',state.basket[0])");
  assert.equal(run('state.basket[0].where'),'pan');
  assert.equal(run("primaryAction('prep')"),null);
});

test('pasta has nothing to chop, and knife work happens only while standing at the board',()=>{
  const run=kitchen(['boil','saute']);
  run("state.near='prep'; grab(state.basket[2]); startPrep(state.basket[2])");
  assert.equal(run('state.board'),null);
  assert.equal(run('state.basket[2].where'),'hand');
  run("grab(state.basket[1]); startPrep(state.basket[1])");
  assert.equal(run('state.basket[1].where'),'board');
  assert.equal(run('state.basket[2].where'),'table');
  run("state.near=null; simulate(5)");
  assert.equal(run('state.basket[1].form'),'whole');
  run("state.near='prep'; simulate(2.5)");
  assert.equal(run('state.basket[1].form'),'prepped');
  assert.equal(run('state.basket[1].where'),'hand');
  assert.equal(run('state.board'),null);
});

test('food cooks gradually through raw, perfect, overcooked and burnt as the pan heats',()=>{
  const run=kitchen(['saute','bake']);
  run("state.near='stove'; grab(state.basket[0]); addTo('pan',state.basket[0])");
  const seen=[];
  for(let t=0;t<40;t+=.5){run('simulate(.5)');seen.push(run('quality(state.basket[0])'));}
  const order=['raw','undercooked','perfect','overcooked','burnt'];
  assert.deepEqual([...new Set(seen)],order);
  assert.equal(run("methodsOf(state.basket[0]).join()"),'saute');
  assert.ok(run("Number(foodLook(state.basket[0]).match(/--char:([\\d.]+)/)[1])")>0);
});

test('boiling needs the water hot first, never burns, and prepped food cooks faster',()=>{
  const time=(prepped)=>{
    const run=kitchen(['boil','saute']);
    run(`state.basket[1].form='${prepped?'prepped':'whole'}'; state.near='stove'; grab(state.basket[1]); addTo('pot',state.basket[1])`);
    let t=0;
    while(run("quality(state.basket[1])")!=='perfect'&&t<60){run('simulate(.25)');t+=.25;}
    run('simulate(60)');
    assert.equal(run('quality(state.basket[1])'),'overcooked');
    return t;
  };
  assert.ok(time(true)<time(false));
});

test('vessels hold three ingredients that cook together, and the mixer turns food into purée',()=>{
  const run=kitchen(['saute','blend']);
  run("state.near='stove'; for(const i of [0,1,3,5]){grab(state.basket[i]); addTo('pan',state.basket[i])}");
  assert.equal(run("itemsIn('pan').length"),3);
  assert.equal(run('state.basket[5].where'),'hand');
  run('simulate(3)');
  assert.equal(run('state.basket[0].partners.length'),2);
  run("state.near='mixer'; addTo('mixer',state.basket[5]); simulate(5)");
  assert.equal(run('state.basket[5].form'),'puree');
  assert.equal(run("methodsOf(state.basket[5]).join()"),'blend');
});

test('plated food can be taken back until finishing, and stations require being nearby',()=>{
  const run=kitchen(['saute','bake']);
  run("grab(state.basket[3]); state.near='oven'; plateItem(state.basket[3])");
  assert.equal(run('state.basket[3].where'),'hand');
  run("state.near='plate'; plateItem(state.basket[3])");
  assert.equal(run('state.basket[3].where'),'plate');
  run("grab(state.basket[3])");
  assert.equal(run('state.basket[3].where'),'hand');
  run("plateItem(state.basket[3]); state.near='stove'; grab(state.basket[3])");
  assert.equal(run('state.basket[3].where'),'plate');
});

test('judges score only plated food, reward real cooking, apply waste, and stay within bounds',()=>{
  const run=kitchen(['saute','bake']);
  assert.equal(run('scoreDish(state.basket,[]).total'),0);
  assert.equal(run('scoreDish(state.basket,[]).waste'),12);
  run("state.basket=['Chicken','Carrot','Potato','Mushroom','Strawberry','Egg'].map((name,i)=>Object.assign(newItem(i,name),{where:'plate',form:'prepped',done:1.1,sear:1.1,exposure:{saute:5,bake:5},partners:[0,1,2,3,4,5].filter(n=>n!==i)}))");
  assert.equal(run("scoreDish(state.basket,['Salt','Basil']).total"),30);
  run("state.basket[0].where='table'");
  assert.equal(run('scoreDish(state.basket,[]).waste'),2);
  assert.equal(run('scoreDish(state.basket,[]).unused.length'),1);
  run("state.basket.forEach(i=>{i.where='plate';i.sear=3;i.done=3})");
  assert.equal(run('scoreDish(state.basket,[]).scores.every(n=>n>=1&&n<=10)'),true);
  run("state.basket.forEach(i=>{i.sear=0;i.done=0;i.exposure={}})");
  assert.match(run("scoreDish(state.basket,['Salt']).comments[0]"),/not cooked through/);
});

test('time expiry freezes cooking and replay clears every part of the round',()=>{
  const run=kitchen(['saute','bake']);
  run("state.near='prep'; grab(state.basket[1]); startPrep(state.basket[1]); state.deadline=Date.now()-1; tick()");
  assert.equal(run('state.finished'),true);
  assert.equal(run('state.remaining'),0);
  assert.equal(run('state.board'),null);
  assert.equal(run('state.basket[1].where'),'table');
  assert.equal(run('state.basket[1].form'),'whole');
  run("state.dishName='Old dish'; state.seasonings=['Salt']; reset()");
  assert.equal(run('state.screen'),'intro');
  assert.equal(run('state.basket.length'),0);
  assert.equal(run('state.methods.length'),0);
  assert.equal(run('state.seasonings.length'),0);
  assert.equal(run('state.dishName'),'');
  assert.equal(run('state.finished'),false);
  assert.equal(run('state.board'),null);
});

test('movement collision keeps the island solid and station approach reachable',()=>{
  const run=kitchen(['saute','bake']);
  assert.equal(run('isBlocked(50,50)'),true);
  assert.equal(run('isBlocked(50,35)'),false);
  assert.equal(run('isBlocked(17,35)'),false);
  run("state.position={x:17,y:35}; updatePosition()");
  assert.equal(run('state.near'),'prep');
  run("keys.add('ArrowRight'); for(let i=0;i<30;i++) moveChef(.05); keys.clear()");
  assert.ok(run('state.position.x')>17);
  assert.equal(run('isBlocked(state.position.x,state.position.y)'),false);
});

test('food art follows its form: whole, prepped pieces, and purée on the plate',()=>{
  const run=kitchen(['boil','blend']);
  assert.equal(run("foodArt(state.basket[2]).includes('aria-label=\"Pasta\"')"),true);
  run("state.basket[1].form='prepped'");
  assert.equal(run("foodArt(state.basket[1]).includes('aria-label=\"Sliced carrot\"')"),true);
  run("state.basket[4].form='puree'; state.basket[4].where='plate'; state.basket[0].where='plate'");
  const plate=run("plateMarkup(itemsIn('plate'),['Salt'])");
  assert.match(plate,/class="sauce sauce-0"/);
  assert.match(plate,/aria-label="Strawberry purée"/);
  assert.match(plate,/aria-label="Chicken"/);
  assert.doesNotMatch(plate,/Carrot/);
});
