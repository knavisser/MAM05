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

// Create an endpoint to fetch patient files
app.get('/api/getPatientFiles', (req, res) => {
    const patientId = req.query.patientId;

    // Construct the path to the patient's data directory
    const patientDirectory = path.join(backendPath, 'Data', patientId);

    // Check if the directory exists
    if (fs.existsSync(patientDirectory)) {
        try {
            const files = fs.readdirSync(patientDirectory);
            res.json(files);
        } catch (error) {
            console.error('Error reading patient files:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(404).json({ error: 'Patient data not found.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
