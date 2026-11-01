# Prompt Log

Prompts I gave to AI tools while building Mystery Kitchen, with what the AI did in response and what I did afterward. Prompts are copied word for word.

## Codex (first version)

### 1. Building my first working version (Oct 28)
> based on my spec.md, create a first working version of my game . let me know if you have any questions before starting

**Response:** Codex built out a first iteration of the game, which included all the main crtieria fromthe SPEC.

> i want this kind of vibe like hte masterchef colors. also UI looks kinda bad. I want the landing page to represent this vibe more as well and not look like a webpage. also the kitchen shouold be more interactive. liike a long rectnagle represenitng the kitchen aerial view with all the ingreidents laid out on the table on plates so it looks like food not just random stuff on the side.when they chop, mix, cook, etc, actually make the motions like a knife cutting or the veggies being fliped and sauteed in the pan or something or like steam coming out of the pot when boiling.

**Response:** Codex reworked the game with a studio-style title screen (featuring things like dark wood, steel and amber-like lighting), a long over head kitchen with illustrated ingredientss on plats and animated knife chopping, pan tossing, oven heating and boiling bubbles and steam,
### 2. 

## Claude Code

I used Claude to help me improve the gameplay, UI design and create kind of a second iteration of the game. 

### 1. Improving the game (Oct 28)

> based on my SPEC.md, can you help me improve the game? right now, the UI feels very choppy so make the whole cooking process feel more realistic. and also the cook should be able to do what they want with the ingredients. Right now, you have to chop all of them before doing anything else for some reason, even for stuff like pasta? also i'd love if the landing page had some moving components like maybe a moving kitchen in the background. also the food is all emojis right now??

**Response:** Claude found why everything seemed to need chopping first: pots and pans drew all food as chopped cubes (pasta included), and the technique judge scored chopping for every ingredient. It then:
- Rewrote `game.js` so ingredients can be prepped and cooked in any order. Knife work became optional and ingredient-specific (pasta and rice have nothing to cut). Pots, pans, the oven and the mixer each hold three ingredients.
- Made cooking more realistic: appliances heat up, water comes to a boil, food browns gradually and can burn, each ingredient gets a doneness meter, and the mixer makes purées.
- Made the UI smoother: the chef turns and walks, food flies between stations, cards flip, and screens fade.
- Built an animated studio kitchen on the title screen.
- Replaced all the emojis with drawn SVG illustrations.
- Updated `style.css`, the README and the tests.

It checked the work with 11 passing tests and headless Chrome screenshots.

**What I did:** Committed the changes as "revised with claude" and pushed them to GitHub.

### 3. Checking what changed (Oct 28)

> you changed my code?

**Response:** Claude confirmed it had edited `game.js`, `style.css`, the tests and the README directly. It explained that my earlier uncommitted changes were mixed in, and offered to restore my version or keep its changes on a separate branch.

### 4. GitHub not updating (Oct 28)

> cuz it's been 6 minutes since i pushed to github and nothign has changed that's why i'm asking

**Response:** Claude checked the repo and my GitHub Pages site. The push had worked and the live site already had the new code. It suggested a hard refresh (Cmd + Shift + R) because the browser was probably showing a cached copy.

### 5. Features list (between Oct 28 and Oct 31)

> can you give me the full list of Features built based on spec

**Response:** Claude compared `SPEC.md` with the code and wrote a features list, with a separate section for things only partly built.

**What I did:** Added a shortened version to the README.

### 6. Remaining work (between Oct 28 and Oct 31)

> what about what still needs to be done

**Response:** Claude suggested a "still to do" list: spec items not fully met, testing and polish, and optional ideas like sound effects. It also pointed out typos in the README.

**What I did:** Wrote my own "What still needs to be done" section in the README.

### 8. README review (between Oct 28 and Oct 31)

> doesm y readm e look good to hadnoff?

**Response:** Claude recommended adding a link to play the game, listing the partly built items honestly, and fixing some typos.

### 9. Repository access (between Oct 28 and Oct 31)

> they'll have access to my github repository

**Response:** Claude explained that opening `index.html` on GitHub shows the code, not the game, and suggested adding just the play link.

**What I did:** Added the play link to the README.

### 10. Second README review (between Oct 28 and Oct 31)

> better now? i decided some of the stuff doesn't really matter any ore so i didn't include it

**Response:** Claude listed the remaining typos and noted that the AI use section described two changes as my requests to Claude, when they were already in my spec and first version.

**What I did:** Fixed the typos. I decided to leave out some partly built items.

### 11. Handoff requirements (Oct 31)

> do i have all of these in my readme to hand off: README.md
> This serves both someone who wants to run the game and the developer taking over. Include:
>
> How to install and run it on a machine that isn't yours
> Controls, and anything else a player needs to know
> Which acceptance criteria are already met, and which aren't
> A map of the code: what each file, class, or major function is responsible for, so someone knows where to go to change a given behavior
> What you'd do next, in priority order
> Known bugs and traps (e.g. the thing that breaks when you resize the window, the function that looks reusable but isn't)
> Where you cut corners, and why

**Response:** Claude checked the README against each requirement and drafted the missing sections: how to run, a code map, known bugs and traps, and corners cut. It also suggested a priority order for next steps.

