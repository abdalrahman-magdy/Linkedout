import { model, Schema } from "mongoose";

// schema
const applicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userTechSkills: {
        type: [String],
        required: true
    },
    userSoftSkills: {
        type: [String],
        require: true
    },
    userResume: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }
}, { timestamps: true, versionKey: false })

// model
export const Application = model('Application', applicationSchema)