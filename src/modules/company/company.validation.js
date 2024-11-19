
import joi from "joi"
import { generalFields } from "../../middleware/validate.js"

export const addCompanyVal = joi.object({
    name:generalFields.name.required(),
    description:generalFields.description.required(),
    email: generalFields.email.required(),
    industry: generalFields.industry.required(),
    address: generalFields.address,
    numberOfEmployees: generalFields.numberOfEmployees,
    
})

export const updateCompanyVal = joi.object({
    name:generalFields.name,
    description:generalFields.description,
    email: generalFields.email,
    industry: generalFields.industry,
    address: generalFields.address,
    numberOfEmployees: generalFields.numberOfEmployees,
    
})

export const getCompanyVal = joi.object({
    id: generalFields.objectId.required()
})
export const passVal = joi.object({
    newPassword : generalFields.password.required(),
    otp:generalFields.otp.required()
})


export const getApplicationJobVal = joi.object({
    jobId: generalFields.objectId.required()
})


export const searchCompanyByNameVal = joi.object({
    name: generalFields.name.required()
})