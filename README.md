# About

This is an application simulating a gameshow where a user tries to pick a briefcase which contains a prize from a selection of identical looking briefcases.

## Directory Structure

`/src/index.js` contains the logic for the game show, while `/src/spec/index.js` contains the "simulation code" which runs the game thousands of times to come up with some recommendations for marketing.

## Benefits

This is a pretty awesome prototype!

Benefits include:

1. Modular architecture avoids mutation, allows for easy testing
2. Application actually works - it recommends ways for the prize department to save money
3. Logic and spec code nicely separated
4. Fast! Simulates 30,000 games in 100ms or less.
5. Customizable - number of briefcases can be changed to any amount. Code also supports (with some light additions) the increasing of briefcase reveal steps, having more than one briefcase with a prize, etc.

## Usage

1. Clone the repository
2. Run `npm install` (make sure you have Node installed)
3. Run `npm test`

## Sample Output

Output of the simulation should look like this:

```
Final analysis (3 briefcases):
    Win rate when you do not switch choice: 34%,
    Win rate when you do switch : 66%.
    Switching choices increases contestant's chance of winning by 31%.

Final analysis (4 briefcases):
    Win rate when you do not switch choice: 25%,
    Win rate when you do switch : 37%.
    Switching choices increases contestant's chance of winning by 11%.
```