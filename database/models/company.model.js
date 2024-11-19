import { model, Schema } from 'mongoose'

const companySchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true
    },
    description: {
        type: String,
    },
    industry: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    numberOfEmployees: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    HR: {
        type: Schema.Types.ObjectId,
        required: true 
    },
    verified:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })


export const Company = model('Company', companySchema)