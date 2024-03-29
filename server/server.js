// server.js
const csv = require('csv-parser');
const express = require('express');
const path = require('path');
const fs = require('fs');
var convert = require('xml-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend files from the "Frontend" directory
app.use(express.static(path.join(__dirname, 'Frontend')));

// Define the path to the "Backend" directory
const backendPath = path.join(__dirname, 'Backend');


app.get('/api/getPatientFiles', (req, res) => {
    const patientDirectory = '../' + req.query.directory;

    // Check if the directory exists
    if (fs.existsSync(patientDirectory)) {
        try {
            const files = fs.readdirSync(patientDirectory)
                .filter(file => file.endsWith('.txt')); // Filter for .txt files
            res.json(files);
        } catch (error) {
            console.error('Error reading patient files:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(404).json({ error: 'Patient data not found.' });
    }
});

app.get('/api/getTextFileContent', (req, res) => {
    const filePath = path.join('../', req.query.directory, req.query.fileName);

    console.log(filePath)

    // Check if the file exists
    if (fs.existsSync(filePath) && filePath.endsWith('.txt')) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.send(content);
        } catch (error) {
            console.error(`Error reading content for ${req.query.fileName}:`, error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(404).send('Text file not found.');
    }
});

app.get('/api/getPatientImages', (req, res) => {
    const patientDirectory = path.join('../', req.query.directory);

    // Check if the directory exists
    if (fs.existsSync(patientDirectory)) {
        try {
            const files = fs.readdirSync(patientDirectory)
                .filter(file => file.endsWith('.png')); // Filter for .png files

            // Read the content of each image file and send it as a response
            const imageData = files.map(file => {
                const filePath = path.join(patientDirectory, file);
                const data = fs.readFileSync(filePath, 'base64');
                return { name: file, data: data };
            });

            res.json(imageData);
            console.log(files);
        } catch (error) {
            console.error('Error reading patient Images:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(404).json({ error: 'Patient Images not found.' });
    }
});

app.get('/api/getPatientReferral', (req, res) => {
    const patientDirectory = '../' + req.query.directory;
    const csvFilePath = path.join(patientDirectory, 'part-r-00000.csv');

        // Check if the CSV file exists
        if (fs.existsSync(csvFilePath) && csvFilePath.endsWith('.csv')) {
            try {
                const record = []; // Object to store processed data
    
                // Read the CSV file using csv-parser
                console.log(csvFilePath)
                fs.createReadStream(csvFilePath)
                    .pipe(csv(['Property', 'Value']))
                    .on('data', (data) => { 
                    record.push(data);
            })
                    .on('end', () => {
                        // Send the processed data as JSON
                        res.json(record);
                    });
            } catch (error) {
                console.error('Error reading CSV file:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.status(404).json({ error: 'CSV file not found.' });
        }
})

app.get('/api/getPatientData', (req, res) => {
    const patientDirectory = '../' + req.query.directory;
    const csvFilePath = path.join(patientDirectory, '5_variables.csv');

    // Check if the CSV file exists
    if (fs.existsSync(csvFilePath) && csvFilePath.endsWith('.csv')) {
        try {
            const data = {}; // Object to store processed data

            // Read the CSV file using csv-parser
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    // Process each row of the CSV data
                    for (const key in row) {
                        var variableName = ''
                        if (key.includes('oxic')) {
                            if (key.includes('event')) {
                                variableName = key.split('')[0] + key.split('_')[1] + key.split('_')[2] + key.split('_')[3]
                            } else {
                                variableName = key.split('')[0] + key.split('_')[1] + key.split('_')[2]
                            }
                        } else {
                            variableName = key.split('_')[0] + key.split('_')[1]; // Extract variable name (e.g., FiO2, HF, SpO2)
                        }

                        if (!data[variableName]) {
                            data[variableName] = []
                        }

                        data[variableName].push(parseFloat(row[key]));
                    }
                })
                .on('end', () => {
                    // Send the processed data as JSON
                    res.json(data);
                });
        } catch (error) {
            console.error('Error reading CSV file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(404).json({ error: 'CSV file not found.' });
    }
});

app.get('/api/getPatientRecords', (req, res) => {
    const filePath = path.join('../Backend/Data/', 'patientRecordsFebruary.xml')
        // Check if the CSV file exists
        if (fs.existsSync(filePath) && filePath.endsWith('.xml')) {
            try {
                var xml = fs.readFileSync(filePath, 'utf8');
                var result = convert.xml2json(xml, {compact: true, spaces: 4});
                res.json(result);
            } catch (error) {
                console.error('Error reading XML file:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.status(404).json({ error: 'XML file not found.' });
        }

})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
