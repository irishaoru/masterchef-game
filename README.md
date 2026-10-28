# Mystery Kitchen
The game is a cooking competition where players make a dish from 6 random ingredients within a 5 minute time limit and present it to a panel of 3 judges. The objective is to get the highest score out of 30.

Play it here: https://irishaoru.github.io/masterchef-game/

## How to Play

1. Read the opening instructions to clarify gameplay. 
2. Then, press "start cooking" to  pick your six random ingredients. Each ingredient has 3 options and you choose one of three cards. Each card flips over to show what you got.
2. Choose exactly two methods of cooking from these 4 options: sauté, bake, boil, or blend. Start cooking begins the five-minute timer.
3. Use arrow keys (or the on-screen arrows) to walk around the kitchen. Click food on the center table to pick it up, then click a nearby station to use it (a prompt above the station shows what will happen). You can also drag food from the table onto a nearby station, or use the controls below the kitchen.
4. Cook in any order you like. Prepping food is option but prepped food cooks about a third faster. The pan and pot (on the stovetop), the oven tray, and the mixer each hold up to three ingredient, and ingredients cooked together are noted by the judges. Food can come out, go back on the heat, or move to another appliance.
5. Appliances heat up realistically. Pans take a moment to get hot, water has to come to a boil, and the oven preheats (you can turn them on ahead of time). Food browns as it cooks, moving from raw through perfect to overcooked, and dry heat eventually burns it. Boiling only makes food overcooked. The mixer turns food into a purée, which is plated as a sauce.
6. Season at the pantry and plate at the counter. Plated food can be taken back until you press Finish. Then name your dish and Serve. At five minutes, cooking ends automatically.
7. Three judges score from 1–10 each. Their total loses two points for each unplated basket ingredient, with a minimum final score of zero. 
8. Play Again clears the entire round.

## Features built based on spec
**Main game**:
- ingredient selection (players are able to pick one of three hidden cards for each of the 6 ingredients without knowing what's behind them)
- Arrow-key movements 
- Aerial view of hte kitchen and all the different stations as well as the player itself  
- Food can be cooked and burned on the stovetop and in the oven, and it changes colour as it browns
- Chopping, sautéing, boiling, baking and blending (mixer)
- Pantry with seasonings (salt, pepper, olive oil, garlic, chili, basil) that can be added to the dish
- The player names their dish before submitting it
- When the timer runs out, cooking stops and the player goes to naming and then judging
- 3 judges with different criteria
- waste penalty for unused ingredients 

**Judging and results**:
- Each judge gives a score from 1–10 based on their preferences
- Each judge gives a short comment about the actual dish 
- The results screen shows each judge's critique and score, the combined total, the waste penalty subtracted, and the final score out of 30
- A scoring explanation and a breakdown of how each plated ingredient was prepared help the player improve next time
- Play Again starts a new round and clears the previous results

**Gameplay**:
- The player moves around the kitchen with the arrow keys 
- When the player gets close to a station, it lights up and a prompt appears showing what clicking it will do
- The touchpad/mouse is used to click buttons, pick up ingredients and move them into pots, pans, the oven, the mixer and onto the plate (ingredients can also be dragged from the table to a nearby station)
- The player must select exactly two cooking methods
- The judges' preferences are visible before serving (on the instructions, method selection and kitchen screens)
- The Serve button only appears after the player presses Finish
- A "How to Play" section explains ingredient selection, cooking methods, judge preferences and the waste penalty

**Partially built / changed from the spec**:
- The pantry has seasonings only. It doesn't offer extra ingredients like other condiments
- The kitchen is styled like a cooking-show studio but isn't an exact copy of the MasterChef layout. It's also rather squished on the screen

## What still needs to be done/Idea suggestions:
### Testing and polishing UX
- Test on more browsers and devices (so far tested mainly in Chrome)
- On phones, the judges' row is hidden in the kitchen. That makes line 44's "kitchen screens" not quite true on mobile.
- Judging round could be a lot more interactive because right now it feels very static
- More random ingredients (they're pretty limited right now)
- perhaps adding some sound effects (sizzling, boiling, timer countdown, "hands off!")
- difficulty evels or different time limits 


## AI use
Used Codex originally to build out the first version. The UI and gameplay proved to be very challenging for it to fix so I switched to Claude Code. 

Claude rewrote the cooking system, the animations, replaced the food emojis with actually drawn illustrations, and all of this was based on the features I had in my SPEC.md as well as some modifications that I gave to Claude in the prompt such as just havin two cooking methods so that would mean players can't use all the stations and this also means the timer doens't start until after they've chosen their methods, which is different from what I wrote in my spec. 

