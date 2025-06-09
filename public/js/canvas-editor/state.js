let state = [],
    redoStack = [],
    undoing = false;

function saveState() {
    if (!undoing) {
        state.push(JSON.stringify(window.canvas));
        redoStack = [];
    }
}

function undo() {
    if (state.length > 1) {
        undoing = true;
        redoStack.push(state.pop());
        window.canvas.loadFromJSON(state[state.length - 1], () => {
            window.canvas.renderAll();
            undoing = false;
        });
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoing = true;
        const redoState = redoStack.pop();
        state.push(redoState);
        window.canvas.loadFromJSON(redoState, () => {
            window.canvas.renderAll();
            undoing = false;
        });
    }
}

window.canvas.on('object:added', saveState);
window.canvas.on('object:modified', saveState);
window.canvas.on('object:removed', saveState);

window.undo = undo;
window.redo = redo;