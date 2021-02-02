return {
    complete: (context, event) => {
        // On puzzle completion
        let dogPuzzle = context.puzzles['dog'];
        context.fn.activatePuzzle(dogPuzzle);
    },
    fail: (context, event) => {
        // On puzzle failure
        context.fn.playSound('fart');
    },
    activate: (context, event) => {
        // On puzzle activation
    }
};