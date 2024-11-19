import { model, Schema } from 'mongoose'
import { jobLocation, seniorityLevel, workingTime } from '../../src/utils/constant/enums.js';


const jobSchema = new Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    jobLocation: {
        type: String,
        enum: Object.values(jobLocation),
        required: true
    },
    workingTime: {
        type: String,
        enum: Object.values(workingTime),
        required: true
    },
    seniorityLevel: {
        type: String,
        enum: Object.values(seniorityLevel),
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    technicalSkills: {
        type: [String], // Array of technical skills
        required: true
    },
    softSkills: {
        type: [String], // Array of soft skills
        required: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' schema is for company HR
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export const Job = model('Job', jobSchema);

