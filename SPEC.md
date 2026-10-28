# Masterchef Game — Project Specification

## Overview

- **Concept:** The game is like a simulation of masterchef. The player chooses a random set of 6 ingredients and have a set time limit to make the best dish they can with those ingredients. After, they finish their dish, they will present it to a panel of 3 judges, each with a different judging criteria, and try to get the highest score out of 30. 
- **Why it's fun:** It's fun because it actually simulates a cooking experience, with abilities to chop foods up, cook, bake, use a mixer, etc. It's also fun because the player can get creative with their dish and there is a pantry so they can use things outside of the 6 ingredients like condiments, spices, etc. The point system also motivates players to get creative and make the "best" dish they can. 


## Full Feature Set
The main game:
- In the beginning, the player picks a number from 1 - 3 for each ingredient, not knowing what's behind each card. 
- Interface from an aerial view of the player and the kitchen (the kitchen will be formatted like the one in masterchef)
- Ability to cook/burn food on the stovetop and in the oven (so they brown or turn a different color)
- Give your creation a name before submitting it.
- once timer is up, players will be taken to another screen for judging.
- 3 judges each with a difference preference: traditional, creative, focused on cooking techniques
- Food waste penalty: every ingreident unused costs a player two points

The judging and results:
- Each judge gives a score out of 10 based on their preferences.
- Each judge gives a short comment explaining something about your choices.
- Results show all three scores and your final score out of 30.
- A scoring explanation helps you understand what worked and improve next time.
- A Play Again button starts a new round

Gameplay:
- player uses the left, right, up, down keys to move around the kitchen. 
- If they get close to a feature like the stovetop, a button will appear, asking if they want to use it. Same for the oven and other appliances. 
- Use the touchpad to click on those buttons and also to move ingredients to things like bowls, plates, pots, pans, etc. 

## Acceptance Criteria
- The player moves with the arrow keys and uses the touchpad to click on appliances, equipment, ingredients, and all the buttons on the screen. 
- The player can select exactly two cooking methods
- All three judges’ preferences are visible before the player serves the dish.
- Each unused basket ingredient creates a two-point waste penalty which is displayed in the player's final score. 
- The serve button only works once the player presses: finish
- Each judge awards a number from 1-10
- Each judge gives a comment related to the submitted dish and their scoring preferences.
- Results display each judge’s score after their critques and their combined total afterwards. This also includes the waste penalty subtracted to give the final score. 
- Clicking Play Again starts a new round and clears previous results.
 - An instructions screen in the beginning before the player presses "start" explains ingredient selection, cooking methods, judge preferences, and the waste penalty.
- Once the player presses "finish" they can enter a dish name before being taken to the judges.

## Priorities
Must have:
- The gameplay abilities
- The time limit that starts once players finish selecting their ingredients.
- The ability to choose random ingredients in the beginning 
- The 3 working judges and their different preferences 
- A clear scoring system that works 
- The instructions in the beginning of how to play 

Nice to have:
- Judge feedback 
- A fully fleshed out UI so the game feels interactive (this includes features/animations that make it feel like a masterchef cooking competition and more realistic movements in the cooking phase )
- Dish naming
- The ability to use a pantry for other miscellaneous ingredients


