# Mystery Kitchen

A first playable browser version of the Masterchef game in `SPEC.md`. No installation, build step, API keys, or backend required.

## Run

Open `index.html` in a modern browser, or serve this folder locally:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Play

1. Read the opening instructions, then reveal six ingredients by choosing one of three cards in each category. Each card flips over to show what you got.
2. Choose exactly two methods: sauté, bake, boil, or blend. Start cooking begins the five-minute timer.
3. Use arrow keys (or the on-screen arrows) to walk around the kitchen. Click food on the center table to pick it up, then click a nearby station to use it (a prompt above the station shows what will happen). You can also drag food from the table onto a nearby station, or use the controls below the kitchen.
4. Cook in any order you like. Knife work is optional and ingredient-specific (dice chicken, crack an egg; pasta and rice have nothing to cut), but prepped food cooks about a third faster. The pan, the pot (via the stovetop), the oven tray, and the mixer each hold up to three ingredients, and ingredients cooked together are noted by the judges. Food can come out, go back on the heat, or move to another appliance.
5. Appliances heat up realistically: pans take a moment to get hot, water has to come to a boil, and the oven preheats (you can turn them on ahead of time). Food browns as it cooks, moving from raw through perfect to overcooked, and dry heat eventually burns it; boiling only makes food overcooked. Each ingredient in an appliance has a doneness meter. The mixer turns food into a purée, which is plated as a sauce.
6. Season at the pantry and plate at the counter. Plated food can be taken back until you press Finish. Then name your dish and Serve. At five minutes, cooking ends automatically and the same naming and judging flow opens.
7. Three judges score from 1–10 each. Their total loses two points for each unplated basket ingredient, with a minimum final score of zero. Play Again clears the entire round.

## Scoring

Scoring is deterministic and local, with feedback based on the actual submitted ingredients. Laurent rewards a complete, seasoned plate with classic pairings (boiled pasta, baked potato) and heavily penalizes ingredients that must be cooked but are not (chicken, eggplant, potato, rice, pasta, egg). Amara rewards unexpected method pairings that still taste good, ingredients cooked together, both methods, and seasoning. Kenji rewards knife work, food taken out in the perfect window, and both methods, with deductions for overcooked, burnt, or undercooked food. Pantry additions are optional and never incur waste. The results screen shows the plated dish and how every ingredient on it was prepared.

## Presentation

Everything is drawn with inline SVG and CSS. There are no emoji or image assets. The title screen is a living studio kitchen: swinging pendant lights, line cooks walking behind the pass, flames, tossing pans, steam, rising embers, drifting ingredients and a slow camera drift with pointer parallax. In the kitchen the chef accelerates, turns to face where they walk and swings their arms; food flies between the table, hands and appliances; knives chop with crumbs; burners glow; water bubbles harder as it heats; the oven window and temperature rise; and the mixer swirls food into a purée. Interface pieces update in place instead of being re-rendered, so animations never restart. The game respects reduced-motion settings. Cooking times are intentionally shortened for gameplay; they are not real cooking instructions. All game state resets on refresh.

## Verification

With Node.js available, run `node --test tests/game.test.cjs`. The eleven tests cover ingredient selection, cooking in any order without chopping, ingredient-specific knife work, gradual doneness and browning, boiling and prep speed, shared vessels and purées, plating and proximity, judging and waste, timeout and replay, movement and collision, and food illustrations.
