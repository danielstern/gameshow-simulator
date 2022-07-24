const { sample } = require('lodash');

const { 
    createGameshowModel, 
    selectNextBriefcase, 
    revealRandomLosingBriefcase, 
    getSelectableBriefcases, 
    finalizeGame 
} = require('../');


const simulationIterations = 2000 * 10; // 10 times more simulations than requested. On purpose.

// The code in this file runs thousands of instances of the gameshow code defined in the main index file.
// This is down n' dirty spec code, as opposed to code that would ever be in a published version of the app,
// so, on purpose, it is less commented and less DRY.

for (const briefcase_count of [3,4,5]) {
    
    const results = [];
    console.info(`Gameshow simulation beginning ${simulationIterations} iterations, with a total of ${briefcase_count} briefcases.`);
    
    for (let i = 0; i < simulationIterations; i++) {
        
        const winner_briefcase_index = ~~(Math.random() * 3);
        
        let model = createGameshowModel({
            briefcase_count,
            winner_briefcase_index,
            maximum_briefcase_selection_allowed : 2
        });
        
        let selected = sample(getSelectableBriefcases(model));
        model = selectNextBriefcase(model, selected);
        model = revealRandomLosingBriefcase(model);
        
        const chanceToSwitch = 0.5;
        const didSwitch = Math.random() > chanceToSwitch; 
        
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
    
    console.table(outputTable);
    
    console.log(
        `Final analysis (${briefcase_count} briefcases): 
            Win rate when you do not switch choice: ${~~(outputTable.NOT_SWITCHED.winPercentage * 100)}%,
            Win rate when you do switch : ${~~(outputTable.SWITCHED.winPercentage * 100)}%.
            Switching choices increases contestant's chance of winning by ${~~((outputTable.SWITCHED.winPercentage - outputTable.NOT_SWITCHED.winPercentage) * 100)}%.
        `        
    );

    console.info(`Opinion: To reduce spend on prizes, increase the number of briefcases. Note this makes it less exciting, as switching has a lower impact on win rate.`);

}