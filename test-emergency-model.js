const mongoose = require('mongoose');
const EmergencyRequest = require('./models/EmergencyRequest');

// Mock data based on what the frontend sends
const mockData = {
    hospital: new mongoose.Types.ObjectId(),
    bloodGroup: 'O+',
    unitsRequired: 2,
    urgencyLevel: 'critical',
    location: {
        type: 'Point',
        coordinates: [85.8, 20.3], // longitude, latitude
    },
    message: 'Test message'
};

const request = new EmergencyRequest(mockData);
const validationError = request.validateSync();

if (validationError) {
    console.error('Validation Error Details:');
    for (const field in validationError.errors) {
        console.error(`- ${field}: ${validationError.errors[field].message}`);
    }
} else {
    console.log('Validation passed successfully.');
}
