// Sample data
var data = {
    labels: ["Time 1", "Time 2", "Time 3", "Time 4", "Time 5"],
    datasets: [{
        label: "FiO2",
        data: [10, 20, 30, 40, 50], // Sample data for variable 1
        borderColor: 'rgba(255, 99, 132, 1)', // Line color
        borderWidth: 2, // Line width
        fill: false // Don't fill area under the line
    },
    {
        label: "PEEP",
        data: [20, 30, 40, 50, 60], // Sample data for variable 2
        borderColor: 'rgba(54, 162, 235, 1)', // Line color
        borderWidth: 2, // Line width
        fill: false // Don't fill area under the line
    },
    {
        label: "Variable 3",
        data: [30, 40, 50, 60, 70], // Sample data for variable 3
        borderColor: 'rgba(255, 206, 86, 1)', // Line color
        borderWidth: 2, // Line width
        fill: false // Don't fill area under the line
    }]
};

// Configuration options
var options = {
    scales: {
        x: {
            title: {
                display: true,
                text: 'Time'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Variables'
            }
        }
    }
};

// Create the chart
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});

function showPatientFiles() {
    var inputElement = document.getElementById('patientIdInput');
    var patientId = inputElement.value.trim();

    if (patientId !== '') {
        // Construct the path to the patient's data directory
        var dataDirectory = 'Backend/Data/';
        var patientDirectory = dataDirectory + patientId;

        // Use a method to fetch the list of files in the directory
        console.log(patientDirectory)
        fetchPatientFiles(patientDirectory);
    }
}

function fetchPatientFiles(patientDirectory) {
    // Make a request to the server endpoint
    fetch('/api/getPatientFiles?directory=' + encodeURIComponent(patientDirectory))
        .then(response => response.json())
        .then(files => displayPatientFiles(files))
        .catch(error => console.error('Error fetching patient files:', error));
}

function displayPatientFiles(files) {
    // Display the list of files in the UI
    var fileListElement = document.getElementById('patientFileList');
    fileListElement.innerHTML = ''; // Clear previous content

    if (files.length > 0) {
        var fileListItems = files.map(file => '<li>' + file + '</li>').join('');
        fileListElement.innerHTML = '<ul>' + fileListItems + '</ul>';
    } else {
        fileListElement.innerHTML = '<p>No files found for the patient.</p>';
    }
}
