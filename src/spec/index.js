const { createGameshowModel, selectNextBriefcase } = require('../');

let model = createGameshowModel({
    briefcase_count : 5,
    winner_briefcase_index : 2,
    maximum_briefcase_selection_allowed : 3
});

console.log(model);

model = selectNextBriefcase(model, model.briefcases[0]);

console.log(model);