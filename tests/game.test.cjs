// Run with: node --test tests/game.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function game() {
  const elements = new Map();
  function element() {
    return { innerHTML:'', textContent:'', style:{}, classList:{toggle(){}},
      addEventListener(){}, querySelector:()=>element(), focus(){} };
  }
  const document = {
    querySelector(selector) {
      if(!elements.has(selector))elements.set(selector,element());
      return elements.get(selector);
    },
    createElement(){ const el=element(); el.remove=()=>{}; return el; },
    body:{append(){}},
  };
  const context = vm.createContext({ document, window:{addEventListener(){},scrollTo(){}},
    setInterval:()=>1, clearInterval(){}, requestAnimationFrame(){}, Date, console });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),context);
  return code => vm.runInContext(code,context);
}

test('six mystery choices lead to method selection and a fresh five-minute kitchen',()=>{
  const run=game();
  run('beginSelection(); for(let i=0;i<6;i++) pick(i%3)');
  assert.equal(run('state.basket.length'),6);
  assert.equal(run('state.screen'),'methods');
  assert.equal(run('new Set(state.basket.map(i=>i.id)).size'),6);
  run("state.methods=['saute','bake']; startKitchen()");
  assert.equal(run('state.screen'),'kitchen');
  assert.equal(run('state.remaining'),300);
  assert.equal(run("stationLocked('mixer')"),true);
  assert.equal(run("stationLocked('stove')"),false);
});

test('appliance food moves through undercooked, golden and burnt windows',()=>{
  for(const [elapsed,expected] of [[2,'undercooked'],[15,'perfect'],[25,'burnt']]){
    const run=game();
    run('beginSelection(); pick(0)');
    run(`state.jobs.stove={item:0,method:'saute',start:Date.now()-${elapsed}*1000}; state.basket[0].cooking='saute'; collect('stove',true)`);
    assert.equal(run('state.basket[0].quality'),expected);
    assert.equal(run('state.basket[0].cooking'),null);
    assert.equal(run('state.basket[0].methods[0]'),'saute');
    assert.equal(run('Object.keys(state.jobs).length'),0);
  }
});

test('judges score only plated food, apply waste, and stay within score bounds',()=>{
  const run=game();
  run('beginSelection(); for(let i=0;i<6;i++) pick(0)');
  assert.equal(run('scoreDish(state.basket,[]).total'),0);
  assert.equal(run('scoreDish(state.basket,[]).waste'),12);
  run("state.basket.forEach(i=>Object.assign(i,{plated:true,chopped:true,methods:['saute','bake'],quality:'perfect'}))");
  assert.equal(run("scoreDish(state.basket,['Salt','Basil']).total"),30);
  run('state.basket[0].plated=false');
  assert.equal(run('scoreDish(state.basket,[]).waste'),2);
  assert.equal(run('scoreDish(state.basket,[]).unused.length'),1);
  run("state.basket.forEach(i=>i.quality='burnt')");
  assert.equal(run('scoreDish(state.basket,[]).scores.every(n=>n>=1&&n<=10)'),true);
});

test('time expiry freezes cooking and replay clears every part of the round',()=>{
  const run=game();
  run("beginSelection(); for(let i=0;i<6;i++) pick(0); state.methods=['saute','bake']; startKitchen(); state.deadline=Date.now()-1; tick()");
  assert.equal(run('state.finished'),true);
  assert.equal(run('state.remaining'),0);
  run("state.dishName='Old dish'; state.seasonings=['Salt']; reset()");
  assert.equal(run('state.screen'),'intro');
  assert.equal(run('state.basket.length'),0);
  assert.equal(run('state.methods.length'),0);
  assert.equal(run('state.seasonings.length'),0);
  assert.equal(run('state.dishName'),'');
  assert.equal(run('state.finished'),false);
});

test('movement collision keeps the island solid and station approach reachable',()=>{
  const run=game();
  assert.equal(run('isBlocked(50,50)'),true);
  assert.equal(run('isBlocked(50,35)'),false);
  assert.equal(run('isBlocked(17,35)'),false);
  run("beginSelection(); for(let i=0;i<6;i++) pick(0); state.methods=['saute','bake']; startKitchen(); state.position={x:17,y:35}; updatePosition()");
  assert.equal(run('state.near'),'prep');
});
