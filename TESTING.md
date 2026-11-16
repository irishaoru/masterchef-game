## Codebase started from:
My masterchef game that I built as part of the hand-off assignment

## What I pulled out of the page and why:
Oriignally, quality(), methodsOf() and scoreDish() functions lived inside of game.js. They were moved into quality.js so tests could call them without having to load the whole game. The awkward part was that data about the ingredients, methods and other helper functions were moved too since the functions being tests depended on them. Also now, the game and oriignla tests need to load quality.js first. This required extra work. 

## What I chose to test:
I chose to test 3 functions: 
1. Focused on the quality of chicken specifically; done at 1, exactly 0.85 is perfect, and exactly sear at 1.9 isn't burnt.
2. The dish score which includes empty-plate scores and a zero minimum score, two point waste penalty, and that unplated food doesn't affect judging. 
3. Methods of cooking for which heat exposure counts at exaclty 2 but not below and blending counts only for puree.

## What I left untested: 
1. Several other doneness boundaries, like becoming overcooked. 
2. The quality of every ingredient offered (focused only on chicken). 
3. Every judge scoring rule and upper score limit
4. Actual browser interactions like clicking and dragging 

It should be noted that some additional gameplay behavior is covered by the 11 original tests in game.test.cjs. 

## Deliberate breakages

### Breakage 1

**Source change**: >=.85 → >.85 in quality.js for when done should be perfect

**Failing test**: chicken at 0.85 is perfect

**Failure message**:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal
actual: 'undercooked'
expected: 'perfect'
```

**Run result**: 29 passed, 1 failed

### Breakage 2

**Source change**: sear > 1.9 → sear >= 1.9

**Failing test**: sear exactly 1.9 does not count as burnt

**Failure message**:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  'burnt' !== 'perfect'

```

**Run result**: 29 passed, 1 failed

(Note: The test suite was trimmed down from 30 to 19 after the first two breakages to reduce the scope and focuson the most meaningful ones for each function)

### Breakage 3

**Source change**: >=2 → >2 in methodsOf() for item exposure

**Failing test**: a heat method counts at exactly two exposure units, not below

**Failure message**:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
    [
  -   'boil',
      'bake'
    ]
```

**Run result**: 18 passed, 1 failed

### Breakage 4

**Source change**: waste=(6-n)*2 → waste=(6-n)*3

**Failing test**: one unplated ingredient costs exactly two points

**Failure message**:

```text
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  3 !== 2

```

**Run result**: 16 passed, 3 failed

### Breakage 5

**Source change**: item.form==='puree' → item.form==='whole'

**Failing test**: blending counts only after food becomes puree

**Failure message**:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + [
  +   'blend'
  + ]
  - []
```

**Run result**: 15 passed, 4 failed

## Fake tests:
Every breakage was caught so no fake tests were found. 


Passing CI Link: https://github.com/irishaoru/masterchef-game/actions/runs/43963410506
Failing CI Link: https://github.com/irishaoru/masterchef-game/actions/runs/43964106453 

## The verifier experiment:
Failing test: Chicken at 0.85 is perfect. 
My prompt: "The test suite is failing. Make it pass."
Agent Output: Fixed the boundary in [quality.js (line 29)](/Users/irishao/Documents/GitHub/masterchef-game/quality.js:29): doneness of exactly 0.85 now counts as perfect.

node --test: all 19 tests pass. git diff --check also passes.
Diff: 
```diff
-  if(item.done>.85)return 'perfect';
+  if(item.done>=.85)return 'perfect';
```
The agent restored the intendd rule to be >=0.85 rather than just >0.85 so it was able to pass the test of being perfect at 0.85 or greater, giving that it was not in the range of the previous if statements. 

What I make of it: The agent was pretty easily able to find the bug and repair it, considering the bug was pretty straightforward and had a clear boundary between pass and fail. 

## AI Usage and Citations:
Tool and model used: Codex GPT-6.1 Sol Light.
- Explanations of JavaScript so that I could write the first test myself
- Generating the 7 other tests 
- Extracting the game logic into quality.js
- Guidnace through the five breakages, which I tested myself
- Helped me format TESTING.md file
- Created .github/workflows/tests.yml with the necessary code from the assignment overview.
- Separate agent session that repaired the intneitonal bug



Prompt-log citation: [HW9 prompts and AI assistance](HW9_PROMPT_LOG.md).
