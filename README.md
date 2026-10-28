# Mystery Kitchen

A first playable browser version of the Masterchef game in `SPEC.md`. No installation, build step, API keys, or backend required.

## Run

Open `index.html` in a modern browser, or serve this folder locally:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Play

1. Read the opening instructions, then reveal six ingredients by choosing one of three cards in each category.
2. Choose exactly two methods: sauté, bake, boil, or blend. Start cooking begins the five-minute timer.
3. Use arrow keys (or the on-screen arrows) to walk around the kitchen. Select an ingredient, approach an outlined station, and use its controls below the kitchen. You can also drag ingredients to nearby counters.
4. Chop at the prep board, cook at your selected appliances, and season at the pantry. Collect food in its ten-second golden window; it becomes burnt after that. Each appliance holds one ingredient at a time, and keeps cooking while you walk away.
5. Add ingredients at the plating counter. Plating is final. Only plated ingredients contribute to judging. Press Finish to stop cooking, name your dish, and Serve. At five minutes, cooking ends automatically and the same naming and judging flow opens.
6. Three judges score from 1–10 each. Their total loses two points for each unplated basket ingredient, with a minimum final score of zero. Play Again clears the entire round.

## Scoring

Scoring is deterministic and local, with feedback based on the actual submitted ingredients. Laurent rewards completeness, seasoning, and well-cooked food; Amara rewards ingredient variety, different methods, and seasonings; Kenji rewards chopping, golden cooking, and different methods, with deductions for burnt or undercooked food. Selecting two methods unlocks them; using both on plated food improves scores. Pantry additions are optional and never incur waste.

This prototype uses stylized emoji food and a top-down CSS kitchen. Cooking times are intentionally shortened for gameplay; they are not real cooking instructions. All game state resets on refresh.
