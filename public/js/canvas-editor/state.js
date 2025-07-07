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

// Lưu state của canvas bao gồm viewport
function saveCanvasState() {
    if (!canvas) return null;
    
    return {
        viewport_state: {
            zoom: canvas.getZoom(),
            pan: canvas.viewportTransform ? [canvas.viewportTransform[4], canvas.viewportTransform[5]] : [0, 0]
        },
        canvas_objects: canvas.toJSON(['customType', 'variable'])
    };
}

// Khôi phục state của canvas
function restoreCanvasState(state) {
    if (!canvas || !state) return;

    // Khôi phục viewport
    if (state.viewport_state) {
        canvas.setZoom(state.viewport_state.zoom);
        if (state.viewport_state.pan) {
            canvas.absolutePan({
                x: -state.viewport_state.pan[0],
                y: -state.viewport_state.pan[1]
            });
        }
    }

    // Khôi phục objects
    if (state.canvas_objects) {
        canvas.loadFromJSON(state.canvas_objects, () => {
            canvas.renderAll();
        });
    }
}

// Hàm khôi phục kích thước canvas từ config
function restoreCanvasDimensions(config) {
    if (!window.canvas || !config) return;

    // Khôi phục kích thước canvas từ config nếu có
    if (config.canvasWidth && config.canvasHeight) {
        window.canvas.setWidth(config.canvasWidth);
        window.canvas.setHeight(config.canvasHeight);
        const box = document.getElementById('canvasBox');
        if (box) {
            box.style.width = config.canvasWidth + 'px';
            box.style.height = config.canvasHeight + 'px';
        }
    }
}

// Lưu template lên server
async function saveTemplate() {
    const state = saveCanvasState();
    const templateData = {
        name: document.getElementById('templateName').value,
        width: canvas.width,
        height: canvas.height,
        unit: document.getElementById('unit').value,
        viewport_state: state.viewport_state,
        canvas_objects: state.canvas_objects
    };

    try {
        const response = await fetch('/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(templateData)
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        console.log('Template saved:', result);
        return result;
    } catch (error) {
        console.error('Error saving template:', error);
        throw error;
    }
}

// Load template từ server
async function loadTemplate(templateId) {
    try {
        const response = await fetch(`/templates/${templateId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Khôi phục kích thước canvas trước
        if (data.canvas_objects) {
            restoreCanvasDimensions(data.canvas_objects);
        }
        
        // Khôi phục state
        restoreCanvasState({
            viewport_state: data.viewport_state,
            canvas_objects: data.canvas_objects
        });

        return data;
    } catch (error) {
        console.error('Error loading template:', error);
        throw error;
    }
}

// Export functions
window.restoreCanvasDimensions = restoreCanvasDimensions;