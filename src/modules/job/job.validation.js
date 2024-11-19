
import joi from "joi"
import { generalFields } from "../../middleware/validate.js"

export const addJobVal = joi.object({
    jobTitle: generalFields.name.required(),

    jobLocation: generalFields.jobLocation.required(),

    workingTime: generalFields.workingTime.required(),

    seniorityLevel: generalFields.seniorityLevel.required(),

    jobDescription: generalFields.description.required(),

    technicalSkills: generalFields.technicalSkills.required(),

    softSkills: generalFields.softSkills,

})

export const updateJobVal = joi.object({
    jobTitle: generalFields.name,

    jobLocation: generalFields.jobLocation,

    workingTime: generalFields.workingTime,

    seniorityLevel: generalFields.seniorityLevel,

    jobDescription: generalFields.description,

    technicalSkills: generalFields.technicalSkills,

    softSkills: generalFields.softSkills,

    jobId :generalFields.objectId

    

})


export const getJobsByCompanyVal = joi.object({
    companyName: generalFields.name.optional()
})


export const applyJobVal = joi.object({
    jobId: generalFields.objectId.required(),
    userTechSkills: generalFields.technicalSkillsString.required(),
    userSoftSkills: generalFields.softSkillsString.required()
})