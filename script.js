// Get the canvas element and its context
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Define sample data for FiO2 over time
var data = [
    { time: 0, fio2: 0.21 },
    { time: 1, fio2: 0.25 },
    { time: 2, fio2: 0.3 },
    { time: 3, fio2: 0.35 },
    { time: 4, fio2: 0.4 },
    { time: 5, fio2: 0.45 },
    { time: 6, fio2: 0.5 },
    { time: 7, fio2: 0.55 },
    { time: 8, fio2: 0.6 },
    { time: 9, fio2: 0.65 },
    { time: 10, fio2: 0.7 }
];

// Function to draw the graph
function drawGraph() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define graph dimensions
    var graphWidth = canvas.width - 100;
    var graphHeight = canvas.height - 50;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, graphHeight);
    ctx.lineTo(graphWidth, graphHeight);
    ctx.stroke();

    // Draw data points and lines
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    for (var i = 0; i < data.length; i++) {
        var x = 50 + (data[i].time * (graphWidth - 50) / 10);
        var y = graphHeight - (data[i].fio2 * graphHeight);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        ctx.arc(x, y, 4, 0, Math.PI * 2);
    }
    ctx.stroke();
}

drawGraph();