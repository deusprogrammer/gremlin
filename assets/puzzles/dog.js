return {
    complete: (context, event) => {
        // On puzzle completion
        context.fn.playSound('blarp');
    },
    fail: (context, event) => {
        // On puzzle failure
    },
    activate: (context, event) => {
        // On puzzle activation
    }
};