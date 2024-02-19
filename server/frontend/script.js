

function showPatientFiles() {
    var inputElement = document.getElementById('patientIdInput');
    var patientId = inputElement.value.trim();
    var warningMessageElement = document.getElementById('warningMessage');

    if (patientId !== '') {
        // Construct the path to the patient's data directory
        var dataDirectory = 'Backend/Data/';
        var patientDirectory = dataDirectory + patientId;
        warningMessageElement.innerHTML = 'Showing data for patient nr: ' + patientId;

        // Use a method to fetch the list of .txt files in the directory
        fetchPatientTextFiles(patientDirectory);
        fetchPatientVariables(patientDirectory);
        fetchPatientImages(patientDirectory);
    }
    else{
        warningMessageElement.innerHTML = 'Please enter a patient ID!';
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

// Empty data to show empty charts when starting up
var data = {};

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

// Create the Hypoxic Burdenchart
var ctx2 = document.getElementById('myHypoxicChart').getContext('2d');
var myHypoxicChart = new Chart(ctx2, {
    type: 'bar',
    data: data,
    options: options
});

function updateChart(c, newData) {
    c.data = newData;
    c.update();
}

function fetchPatientVariables(patientDirectory) {
    // Make a request to the server endpoint to get only .txt files
    fetch('/api/getPatientData?directory=' + encodeURIComponent(patientDirectory) + '&extension=txt')
        .then(response => response.json())
        .then(data => {
            var days = Array.from({ length: data["HFmean"].length }, (_, index) => `Day ${index + 1}`);
            data["days"] = days;
            console.log(data);
            var chartData = {
                labels: data["days"],
                datasets: [{
                    label: "Sp02",
                    data: data["SpO2mean"], // Sample data for variable 1
                    borderColor: 'rgba(255, 99, 132, 1)', // Line color
                    borderWidth: 2, // Line width
                    fill: false // Don't fill area under the line
                },
                {
                    label: "Fi02",
                    data: data["FiO2mean"], // Sample data for variable 2
                    borderColor: 'rgba(54, 162, 235, 1)', // Line color
                    borderWidth: 2, // Line width
                    fill: false // Don't fill area under the line
                }]
            };
            updateChart(myChart, chartData);

            var dropdown = document.getElementById('dropdown');
            var selectedTreshold = dropdown.value; 
            console.log(selectedTreshold)
        
            var chartHypoxicData = {
                labels: data["days"],
                datasets: [{
                    label: "Total Hypoxic Burden Events",
                    data: data[selectedTreshold], // Sample data for variable 1
                    borderColor: 'rgba(255, 99, 132, 1)', // Line color
                    borderWidth: 2, // Line width
                    fill: false // Don't fill area under the line 
                }]
            };  
            updateChart(myHypoxicChart, chartHypoxicData)
        })
        .catch(error => console.error('Error fetching patient text files:', error));
}

function fetchPatientImages(patientDirectory) {
    // Make a request to the server endpoint to get image data
    fetch('/api/getPatientImages?directory=' + encodeURIComponent(patientDirectory))
        .then(response => response.json())
        .then(images => {
            console.log(images[0].name)
            // Assuming the response contains an array of objects with 'name' and 'data' properties
            if (images && images.length > 0) {
                // Get the img element
                const imgElement = document.getElementById('patientImage');
                const imgTitleElement = document.getElementById('imageTitle');

                // Set the src attribute with the first image data
                imgElement.src = 'data:image/png;base64,' + images[0].data;
                imgTitleElement.innerHTML = images[0].name + ':';
            } else {
                console.warn('No images found for the patient.');
            }
        })
        .catch(error => console.error('Error fetching patient images:', error));
}