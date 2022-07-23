// Returns an object which is manipulated to enact the logic of the game show.

const { zipObject } = require("lodash");
// const { sample } = require("")

function createGameshowModel({
    briefcase_count = 3,
    winner_briefcase_index = 2,
    maximum_briefcase_selection_allowed = 2
}){

    const briefcases = [];

    for (let i = 0; i < briefcase_count; i++) {
        const _id = `BRIEFCASE_${i}`;
        briefcases.push(_id);
    }

    const briefcasesRevealedIndex = zipObject(briefcases, briefcases.map(b => false));
    const briefcaseWinnerIndex = zipObject(briefcases, briefcases.map((_briefcase, i) => i === winner_briefcase_index));

    return {
        game_completed : false,
        winner : false,
        selectionCount : 0,
        maximum_briefcase_selection_allowed,
        lastSelectedBriefcase : null,
        briefcases,
        briefcasesRevealedIndex,
        briefcaseWinnerIndex,
    }
}

function selectNextBriefcase(gameShowModel, briefcaseId) {

     const {
        briefcasesRevealedIndex,
        briefcases,
        selectionCount,
        maximum_briefcase_selection_allowed
    } = gameShowModel;

    const briefcaseExists = briefcases.includes(briefcaseId);
    const briefcaseRevealed = briefcasesRevealedIndex[briefcaseId];
    const nextSelectionCount = selectionCount + 1;
    const selectionsRemaining = nextSelectionCount < maximum_briefcase_selection_allowed;

    if (!selectionsRemaining) {
        throw new Error(
            `The selection would exceed the maximum allowed number of tries`
        );
    }

    if (!briefcaseExists) {
        throw new Error(
            `Selection of a briefcase that does not exist, ${briefcaseId}`
        );
    }

    if (briefcaseRevealed) {
        throw new Error(
            `You cannot select a briefcase which as already been exposed as empty.`
        );
    }

    return {
        ...gameShowModel,
        lastSelectedBriefcase : briefcaseId,
        selectionCount : nextSelectionCount
    }

}

function revealRandomLosingBriefcase(gameShowModel){
    const {
        briefcases,
        briefcaseWinnerIndex,
        briefcasesRevealedIndex
    } = gameShowModel;

    const unrevealed = briefcases
        .filter(_id => !briefcaseWinnerIndex[_id])
        .filter(_id => !briefcasesRevealedIndex[_id]);

    
}

module.exports = {
    createGameshowModel,
    selectNextBriefcase
}