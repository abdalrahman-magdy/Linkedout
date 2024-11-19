import joi from "joi"
import { AppError } from "../utils/AppError.js"
import { roles, jobLocation, workingTime, seniorityLevel } from "../utils/constant/enums.js"

const parseArray = (value, helper) => {
    if (typeof value == 'string') {
        let data = JSON.parse(value)
        const schema = joi.array().items(joi.string())
        const { error } = schema.validate(data)
        if (error)
            return helper(error.details)
        return true
    }
    else {
        joi.array.items(joi.string())
    }
}
// const parseArray = (value, helper) => {
//     if (typeof value === 'string') {
//         try {
//             let data = JSON.parse(value); // Parse the string to an array
//             const schema = joi.array().items(joi.string());
//             const { error } = schema.validate(data); // Validate as array of strings

//             if (error) {
//                 return helper.error('any.invalid'); // Return error if validation fails
//             }

//             return data; // Return parsed array
//         } catch (err) {
//             return helper.error('any.invalid'); // Return error if parsing fails
//         }
//     } else {
//         // If already an array, validate it directly
//         const schema = joi.array().items(joi.string());
//         const { error } = schema.validate(value);

//         if (error) {
//             return helper.error('any.invalid'); // Return error if validation fails
//         }

//         return value; // Return valid array
//     }
// };


export const generalFields = {
    name: joi.string().trim(),

    email: joi.string().trim(),

    phone: joi.string().trim().pattern(new RegExp(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/)),

    password: joi.string().trim().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)),

    DOB: joi.string().pattern(new RegExp(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)),

    address: joi.string().max(100),

    numberOfEmployees: joi.number().min(3),

    objectId: joi.string().trim().min(24).hex().messages({
        'string.min': 'ID should have at least 24 digits'
    }),

    role: joi.string().valid(...Object.values(roles)),

    description: joi.string().min(5).max(400),

    otp: joi.string().max(6).min(6).trim(),

    industry: joi.string(),

    jobLocation: joi.string().valid(...Object.values(jobLocation)),

    workingTime: joi.string().valid(...Object.values(workingTime)),

    seniorityLevel: joi.string().valid(...Object.values(seniorityLevel)),

    technicalSkills: joi.array().items(joi.string()),
    technicalSkillsString: joi.custom(parseArray),

    softSkills: joi.array().items(joi.string()),
    softSkillsString: joi.custom(parseArray),



}

export const validate = (schema) => {
    return (req, res, next) => {

        let { error } = schema.validate({
            ...req.body,
            ...req.params,
            ...req.query
        })

        if (error) {

            let errMessages = error.details.map(err => err.message)
            return next(new AppError(errMessages, 401))
        }
        next()
    }
}