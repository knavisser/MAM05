// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
