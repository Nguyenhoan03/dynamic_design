let state = [],
    undoing = false;

function saveState() {
    if (!undoing) {
        state.push(JSON.stringify(window.canvas));
    }
}

function undo() {
    if (state.length > 1) {
        undoing = true;
        state.pop();
        window.canvas.loadFromJSON(state[state.length - 1], () => {
            window.canvas.renderAll();
            undoing = false;
        });
    }
}

function redo() {
    alert('Chức năng redo cần bổ sung stack riêng!');
}


window.canvas.on('object:added', saveState);
window.canvas.on('object:modified', saveState);
window.canvas.on('object:removed', saveState);

window.undo = undo;
window.redo = redo;