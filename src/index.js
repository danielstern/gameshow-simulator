const { zipObject, sample } = require("lodash");

// Returns an object representing the gameshow. Has no methods, but it
// is mutated by the other functions in this file.

function createGameshowModel({
    briefcase_count = 3, // how many briefcases to simulate
    winner_briefcase_index = 2, // the index of the winning briefcase (from 0 to (briefcase_count - 1)))
    maximum_briefcase_selection_allowed = 2 // the number of selections the player is allowed to make
}){

    // create array of briefcase ids... BRIEFCASE_1, BRIEFCASE 2... etc...
    const briefcases = [];
    for (let i = 0; i < briefcase_count; i++) {
        const _id = `BRIEFCASE_${i}`;
        briefcases.push(_id);
    }

    // create indexes mapping true or false values for a) whether the briefcase is revealed and b)
    // whether a briefcase contains a prize, to the briefcase indexes
    const briefcasesRevealedIndex = zipObject(briefcases, briefcases.map(b => false));
    const briefcaseWinnerIndex = zipObject(briefcases, briefcases.map((_briefcase, i) => i === winner_briefcase_index));

    return {
        winner : null,  // if the contestant won this game. null if game is not complete.
        complete : false, // if the simulation has been finished
        selectionCount : 0, // how many selections the player has made so far
        maximum_briefcase_selection_allowed, // max number of guesses
        lastSelectedBriefcase : null, // the last briefcase the user chose. if it has a prize when the game is over, they win.
        briefcases, // array of briefcase IDs
        briefcasesRevealedIndex, // index: briefcase id -> has it been revealed
        briefcaseWinnerIndex, // index: briefcase id -> does it win
    }
}

// returns the next gameshow state after changing the selected briefcase to the desired ID
function selectNextBriefcase(
    gameShowModel, // the current state of the show
    briefcaseId // the desired briefcase ID
) {

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

// Returns an array of briefcases which are valid to select. 
// Invalid briefcases are those already revealed, and those already selected.
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

// Updates the model of the gameshow so that one briefcase that is a loser
// and previously unrevealed is now in a revealed state.
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

// changes the model complete status to true and calculates the value
// of the winner property based on if the selected briefcase is a winner.
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