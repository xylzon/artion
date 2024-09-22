document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("paintCanvas");
    const context = canvas.getContext("2d");
    let painting = false;
    let eraserMode = false;
    let undoStack = [];
    let redoStack = [];

    // Initialize canvas size
    resizeCanvas(window.innerWidth * 0.8, window.innerHeight * 0.6);

    // Predefined color palette
    const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];

    // Populate color palette
    const colorPalette = document.getElementById("colorPalette");
    colors.forEach(color => {
        const colorButton = document.createElement("button");
        colorButton.style.backgroundColor = color;
        colorButton.addEventListener("click", () => {
            document.getElementById("colorPicker").value = color;
        });
        colorPalette.appendChild(colorButton);
    });

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        context.beginPath();
        saveState();
    }

    function draw(e) {
        if (!painting) return;

        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;

        const brushSize = document.getElementById("brushSize").value;
        const color = document.getElementById("colorPicker").value;
        const brushShape = document.getElementById("brushShape").value;
        const brushStyle = document.getElementById("brushStyle").value; // Get brush style

        context.lineWidth = brushSize;
        context.lineCap = brushShape;

        if (eraserMode) {
            context.strokeStyle = "#ffffff"; // Erasing with white
        } else if (brushStyle === "gradient") {
            // Create a gradient brush
            const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#FF0000"); // Red
            gradient.addColorStop(0.5, "#00FF00"); // Green
            gradient.addColorStop(1, "#0000FF"); // Blue
            context.strokeStyle = gradient;
        } else {
            context.strokeStyle = color;
        }

        // Set dashed or dotted line styles
        if (brushStyle === "dotted") {
            context.setLineDash([brushSize * 2, brushSize * 2]); // Adjust for dots
        } else if (brushStyle === "dashed") {
            context.setLineDash([brushSize * 4, brushSize]); // Adjust for dashes
        } else {
            context.setLineDash([]); // Reset to solid line
        }

        context.lineTo(x - canvas.offsetLeft, y - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(x - canvas.offsetLeft, y - canvas.offsetTop);
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    function toggleEraser() {
        eraserMode = !eraserMode;
        const eraserButton = document.getElementById("eraserButton");
        eraserButton.innerHTML = eraserMode ? '<i class="fas fa-paint-brush"></i>' : '<i class="fas fa-eraser"></i>';
    }

    function saveCanvas() {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "painting.png";
        link.click();
    }

    function resizeCanvas(width, height) {
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    function resizeCanvasPrompt() {
        const newWidth = prompt("Enter new canvas width:", canvas.width);
        const newHeight = prompt("Enter new canvas height:", canvas.height);
        if (newWidth && newHeight) {
            resizeCanvas(parseInt(newWidth, 10), parseInt(newHeight, 10));
        }
    }

    function saveState() {
        undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
        redoStack = []; // Clear redo stack
    }

    function undo() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            context.putImageData(undoStack[undoStack.length - 1], 0, 0);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(redoStack.pop());
            context.putImageData(undoStack[undoStack.length - 1], 0, 0);
        }
    }

    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);

    canvas.addEventListener("touchstart", startPosition);
    canvas.addEventListener("touchend", endPosition);
    canvas.addEventListener("touchmove", draw);

    document.getElementById("clearButton").addEventListener("click", clearCanvas);
    document.getElementById("eraserButton").addEventListener("click", toggleEraser);
    document.getElementById("saveButton").addEventListener("click", saveCanvas);
    document.getElementById("undoButton").addEventListener("click", undo);
    document.getElementById("redoButton").addEventListener("click", redo);
    document.getElementById("resizeButton").addEventListener("click", resizeCanvasPrompt);

    // Initial state save
    saveState();
});
