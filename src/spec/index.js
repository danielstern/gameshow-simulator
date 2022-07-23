const { sample } = require('lodash');

const { 
    createGameshowModel, 
    selectNextBriefcase, 
    revealRandomLosingBriefcase, 
    getSelectableBriefcases, 
    finalizeGame 
} = require('../');

const simulationIterations = 10000;
const results = [];

console.info(`Gameshow simulation beginning ${simulationIterations} iterations, with a total of 3 briefcases.`);
for (let i = 0; i < simulationIterations; i++) {
    
    const winner_briefcase_index = ~~(Math.random() * 3);
    
    let model = createGameshowModel({
        briefcase_count : 3,
        winner_briefcase_index,
        maximum_briefcase_selection_allowed : 2
    });
    
    let selected = sample(getSelectableBriefcases(model));
    model = selectNextBriefcase(model, selected);
    model = revealRandomLosingBriefcase(model);
    
    const switchLikelihood = 0.5;
    
    const didSwitch = Math.random() > switchLikelihood; 
    
    if (didSwitch) {
        selected = sample(getSelectableBriefcases(model));
        model = selectNextBriefcase(model, selected);
    }
    
    model = finalizeGame(model);
    const { winner } = model;

    results.push({
        winner,
        didSwitch
    })

}

const outputTable = {
    SWITCHED : {
        count : results.filter(r => r.didSwitch).length,
        winnerCount : results.filter(r => r.didSwitch && r.winner).length,
        winPercentage : results.filter(r => r.didSwitch && r.winner).length / results.filter(r => r.didSwitch).length
    },
    NOT_SWITCHED : {
        count : results.filter(r => !r.didSwitch).length,
        winnerCount : results.filter(r => !r.didSwitch && r.winner).length,
        winPercentage : results.filter(r => !r.didSwitch && r.winner).length / results.filter(r => !r.didSwitch).length
    }
}

console.log("Iterations complete");
console.table(outputTable);

console.log(
    `Final analysis: 
        Win rate when you do not switch choice: ${~~(outputTable.NOT_SWITCHED.winPercentage * 100)}%,
        Win rate when you do switch : ${~~(outputTable.SWITCHED.winPercentage * 100)}%.
        Switching choices increases contestant's chance of winning by ${~~((outputTable.SWITCHED.winPercentage - outputTable.NOT_SWITCHED.winPercentage) * 100)}%.
    `        
);