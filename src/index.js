// Returns an object which is manipulated to enact the logic of the game show.

const { zipObject, sample } = require("lodash");
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
        winner : null,
        complete : false,
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
    const selectionsRemaining = selectionCount < maximum_briefcase_selection_allowed;

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

function getSelectableBriefcases(gameShowModel) {
    const {
        briefcases,
        briefcasesRevealedIndex,
        lastSelectedBriefcase
    } = gameShowModel;

    return briefcases
        .filter(_id => !briefcasesRevealedIndex[_id])
        .filter(_id => _id !== lastSelectedBriefcase)
}

function revealRandomLosingBriefcase(gameShowModel){
    const {
        briefcaseWinnerIndex,
        briefcasesRevealedIndex,
    } = gameShowModel;

    const unrevealed = getSelectableBriefcases(gameShowModel)
        .filter(_id => !briefcaseWinnerIndex[_id]);

    if (unrevealed.length === 0) {
        throw new Error(
            `Cannot reveal the contents of a briefcase as no non-winning, unselected, unrevealed briefcases remain.`
        )
    }

    const revealedId = sample(unrevealed);

    const nextBriefcaseRevealIndex = {
        ... briefcasesRevealedIndex,
        [revealedId] : true
    };

    return {
        ...gameShowModel,
        briefcasesRevealedIndex : nextBriefcaseRevealIndex
    }
    
}

function finalizeGame(gameShowModel) {

    const {
        briefcaseWinnerIndex,
        lastSelectedBriefcase,
        complete
    } = gameShowModel;

    if (complete) {
        throw new Error(
            `Cannot finalize this game as it is already complete.`
        )
    }
    if (!lastSelectedBriefcase) {
        throw new Error(
            `Game cannot be finalized until the player has selected a briefcase`
        )
    }

    const winner = briefcaseWinnerIndex[lastSelectedBriefcase];

    return {
        ...gameShowModel,
        winner,
        complete : true
    }
}

module.exports = {
    createGameshowModel,
    selectNextBriefcase,
    revealRandomLosingBriefcase,
    getSelectableBriefcases,
    finalizeGame
}