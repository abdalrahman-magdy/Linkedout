import joi from "joi"
import { generalFields } from "../../middleware/validate.js"

export const updateAccVal = joi.object({
    firstName:generalFields.name,
    lastName:generalFields.name,
    email: generalFields.email,
    recoveryEmail: generalFields.email,
    phone: generalFields.phone,
    password: generalFields.password,
    DOB: generalFields.DOB
})

export const changePassVal = joi.object({
    oldPassword:generalFields.password.required(),
    newPassword:generalFields.password.required()
})