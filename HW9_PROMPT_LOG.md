# HW9 prompt log

Starting project: Mystery Kitchen / masterchef-game.

Tool Used: Codex GPT-6.1 Sol Light

## Choosing a project and understanding tests

> would this specific project work for this hw assignment: [https://www.cs.cmu.edu/\~113/hw9.html](https://www.cs.cmu.edu/~113/hw9.html)

Codex read the assignment and inspected the repository, identifying doneness, cooking methods, and scoring as testable logic.

> ok can you explain the doneness and how that would be tested cuz right now i don't understand how the code works

> ok how would i write tests for this since i have to write one myself

> i'm not rlly familiar with the javascript function help me understand it. 

Codex explained how doneness works in comparison to seared and helped me to better udnerstand JavaScript objects, assertions, imports, and test registration. I assembled the chicken test in tests/quality.test.cjs and ran it. My first test received AI guidance in which I asked it if I was on the right track with how I was writing out the test. 

## Extracting logic

> quality() needs to be extracted into an importable module. can you help me do this part?

Context: Codex created quality.js, moved ingredient data and quality(),  updated the browser and original test loader so that testing it now calls quality.js, and created an empty tests/quality.test.cjs where I wrote my test function.

## Generating and trimming tests

> ok so now can you write the rest of the tests for me

Codex also extracted methodsOf(), scoreDish(), their data and helpers into quality.js. It generated 18 additional tests in tests/logic.test.cjs. There were 30 passing tests including the original 11 and the student's chicken test.

> maybe get rid of some that aren't as "meaningful" since the assignment calls for 8.

Codex trimmed the generated tests to seven across the three extracted functions. The retained suite contained 19 tests total. There were 11 original, 7 newly generated, and one written by me. 

## Report formatting

> help me format whole hting in TESTING.md like i did for first breakage:

Codex read my existing breakage entries and changed the Markdown formatting.


## GitHub Actions and commits

> i'm confused how to do it

Codex created .github/workflows/tests.yml with the code provided in the assignment overview. It ran the local suite successfully and guided me through separate commits and locating Actions run URLs. I committed and pushed the files and deliberately broken code.

## Verifier experiment — separate agent session

> how do i write the code diff in my testing.md?

Codex supplied the diff block showing the boundary repair done during the agent repair experiment. I added it to the report. 

