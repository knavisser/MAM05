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

        // Use a method to fetch the list of .txt files in the directory
        fetchPatientTextFiles(patientDirectory);
    }
}

function fetchPatientTextFiles(patientDirectory) {
    // Make a request to the server endpoint to get only .txt files
    fetch('/api/getPatientFiles?directory=' + encodeURIComponent(patientDirectory) + '&extension=txt')
        .then(response => response.json())
        .then(files => displayTextFiles(patientDirectory, files))
        .catch(error => console.error('Error fetching patient text files:', error));
}

function displayTextFiles(patientDirectory, textFiles) {
    // Display the list of text files in the UI
    var textFilesListElement = document.getElementById('textFilesList');
    textFilesListElement.innerHTML = ''; // Clear previous content

    if (textFiles.length > 0) {
        // Create an unordered list to hold text file titles and contents
        var fileListItems = textFiles.map(file => {
            return `<li><strong>${file}</strong>: <span id="${file}Content"></span></li>`;
        }).join('');

        textFilesListElement.innerHTML = `<ul>${fileListItems}</ul>`;

        // Fetch and display the content of each text file
        textFiles.forEach(file => {
            fetchTextFileContent(patientDirectory, file);
        });
    } else {
        textFilesListElement.innerHTML = '<p>No text files found for the patient.</p>';
    }
}

function fetchTextFileContent(patientDirectory, fileName) {
    // Make a request to the server endpoint to get the content of the text file
    fetch(`/api/getTextFileContent?directory=${encodeURIComponent(patientDirectory)}&fileName=${encodeURIComponent(fileName)}`)
        .then(response => response.text())
        .then(content => {
            // Replace newline characters with HTML line breaks
            content = content.replace(/\n/g, '<br>');
            
            // Display the content of the text file
            var contentElement = document.getElementById(`${fileName}Content`);
            contentElement.innerHTML = content;
        })
        .catch(error => console.error(`Error fetching content for ${fileName}:`, error));
}