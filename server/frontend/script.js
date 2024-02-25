
function showPatientFiles() {
    var inputElement = document.getElementById('patientIdInput');
    var patientId = inputElement.value.trim();
    var warningMessageElement = document.getElementById('warningMessage');

    if (patientId !== '') {
        // Construct the path to the patient's data directory
        var dataDirectory = 'Backend/Data/';
        var patientDirectory = dataDirectory + patientId;
        
        warningMessageElement.innerHTML = 'Showing data for patient nr: ' + patientId;


        //Clear Summary section
        clearSummary();

        // Use a method to fetch the list of .txt files in the directory
        fetchPatientTextFiles(patientDirectory);
        fetchPatientVariables(patientDirectory);
        fetchPatientImages(patientDirectory);
        fetchPatientReferral(patientDirectory);
        fetchPatientRecords(patientId);
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
            return `<li><h3>${file}:</h3> <span id="${file}Content"></span></li>`;
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

// Another empty data to show when variables cannot be fetched
var dataEmpty = {};

// Configuration options
var options = {
    scales: {
        x: {
            title: {
                display: true,
                text: 'Time in Days'
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

// Configuration options Hypoxic Burden Chart
var options2 = {
    scales: {
        x: {
            title: {
                display: true,
                text: 'Time in Days'
            },
            offset: true
        },
        y: { 
            title: {
                display: true,
                text: 'Times under Treshold'
            },
            ticks: {
                stepSize: 1
              }
        }
    }
};

// Create the Hypoxic Burdenchart
var ctx2 = document.getElementById('myHypoxicChart').getContext('2d');
var myHypoxicChart = new Chart(ctx2, {
    type: 'bar',
    data: data,
    options: options2
});

function updateChart(c, newData) {
    c.data = newData;
    c.update();
}

function fetchPatientRecords (patientId){
    fetch('api/getPatientRecords')
    .then(response => response.json())
    .then(data => {
        const obj = JSON.parse(data);
        const record = obj.records.record;
        var result = record.filter(x => {
            return x.patientID._text === patientId;
        });
        console.log(result);
        document.getElementById('patientId').innerHTML = result[0].patientID._text;
        document.getElementById('firstname').innerHTML = result[0].firstName._text;
        document.getElementById('lastname').innerHTML = result[0].lastName._text;
        document.getElementById('gender').innerHTML = result[0].gender._text;
        document.getElementById('birthDate').innerHTML = result[0].dateOfBirth._text;
        document.getElementById('timeOfBirth').innerHTML = result[0].timeOfBirth._text;
        document.getElementById('notes').innerHTML = result[0].notes._text;

    })
}

function fetchPatientReferral(patientDirectory) {
        fetch('/api/getPatientReferral?directory=' + encodeURIComponent(patientDirectory))
        .then(response => response.json())
        .then(data => {
            console.log(data);
            var patientReferralTable = document.getElementById('referralDetailsTable');
            patientReferralTable.innerHTML = '';
            var content = ''
            if (data.length > 0){
                for (x in data){
                    var row = data[x]
                    content = content + `<tr><td>${row.Property}</td><td>${row.Value}</td></tr>`;
                }
                content = `<table>${content}</table>`;
                patientReferralTable.innerHTML = content;
            } else {
                patientReferralTable.innerHTML = '<p>No Referral files found for the patient.</p>'
            }
            
        })
        .catch(error => console.error('Error fetching patient referral files:', error));
}

function fetchPatientVariables(patientDirectory) {
    // Make a request to the server endpoint to get only .txt files
    fetch('/api/getPatientData?directory=' + encodeURIComponent(patientDirectory) + '&extension=txt')
        .then(response => response.json())
        .then(data => {
            var days = Array.from({ length: data["HFmean"].length }, (_, index) => `Day ${index + 1}`);
            data["days"] = days;
            console.log(data);
            makeDataSummary(data);
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
        .catch(error => {console.error('Error fetching patient Variables for chart:', error)
                updateChart(myHypoxicChart, dataEmpty);
                updateChart(myChart, dataEmpty)});
}

function makeDataSummary(data) {
    var days = data["days"].length;
    var averageFi02 = averageArray(data["FiO2mean"]);
    var averageSp02 = averageArray(data["SpO2mean"]);

    var dropdown = document.getElementById('dropdown');
    var selectedTreshold = dropdown.value; 
    var averageHypoxicEvents = averageArray(data[selectedTreshold]);

    clearSummary()

    var warningMessageSummary = ''
    if (averageSp02 < 90) {
        warningMessageSummary += `<li>The average Sp02 level of this patient is below 90%!</li>`
    }
    if (averageFi02 < 30 ) {
        warningMessageSummary += `<li>The average Fi02 level of this patient is below 30%!</li>`
    }
    if (averageHypoxicEvents > 5 ) {
        warningMessageSummary += `<li>This patient has an average of more than 5 Hypoxic Burden Event each day!</li>`
    }
    
    // Show averages
    document.getElementById('dataSummary1').innerHTML = `<p>The average Sp02 of this patient over ${days} days: ${averageSp02}%</p>`
    document.getElementById('dataSummary2').innerHTML = `<p>The average Fi02 of this patient over ${days} days: ${averageFi02}%</p>`
    document.getElementById('dataSummary3').innerHTML = `<p>The average amount of daily Hypoxic Events of this patient over ${days} days: ${averageHypoxicEvents}</p>`

    // Show warning message
    if (warningMessageSummary != ''){
        document.getElementById('warningMessageSummary').innerHTML = `
        <div  class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>WARNING</strong>
            <ul>${warningMessageSummary}</ul>
        </div>`;
    }
}

function averageArray (arr) {
    var sum = 0
    for (let i=0; i < arr.length; i++) {
        sum = sum + arr[i]
        console.log(sum);
    }
    var avg = sum/arr.length;
    return Number(avg.toFixed(4));
}

function clearSummary () {
    document.getElementById('dataSummary1').innerHTML = ``
    document.getElementById('dataSummary2').innerHTML = ``
    document.getElementById('dataSummary3').innerHTML = ``
    document.getElementById('warningMessageSummary').innerHTML = ``;
}

function fetchPatientImages(patientDirectory) {
    // Make a request to the server endpoint to get image data
    fetch('/api/getPatientImages?directory=' + encodeURIComponent(patientDirectory))
        .then(response => response.json())
        .then(images => {
            // Get the img element
            const imgElement = document.getElementById('patientImage');
            const imgTitleElement = document.getElementById('imageTitle');

            imgElement.src = '';
            imgTitleElement.innerHTML = '';

            // Assuming the response contains an array of objects with 'name' and 'data' properties
            if (images && images.length > 0) {

                // Set the src attribute with the first image data
                imgElement.src = 'data:image/png;base64,' + images[0].data;
                imgTitleElement.innerHTML = images[0].name + ':';
            } else {
                console.warn('No images found for the patient.');
            }
        })
        .catch(error => console.error('Error fetching patient images:', error));
}