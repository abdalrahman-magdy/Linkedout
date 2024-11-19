import { model, Schema } from 'mongoose'
import { roles, status } from '../../src/utils/constant/enums.js'

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    recoveryEmail: {
        type: String,

    },
    DOB: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.USER
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.OFFLINE
    },
    verified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number
    },
    otpExpiresAt: {
        type: String,
    }
}, { timestamps: true })


export const User = model('User', userSchema)