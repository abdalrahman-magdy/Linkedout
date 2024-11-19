import joi from "joi"
import { generalFields } from "../../middleware/validate.js"

export const signupVal = joi.object({
    firstName:generalFields.name.required(),
    lastName:generalFields.name.required(),
    email: generalFields.email.required(),
    recoveryEmail: generalFields.email,
    phone: generalFields.phone.required(),
    password: generalFields.password.required(),
    DOB: generalFields.DOB,
    role: generalFields.role
})

export const loginVal = joi.object({
    email:generalFields.email,
    recoveryEmail:generalFields.email,
    phone:generalFields.phone.when('email',{
        is:joi.exist(),
        then:joi.optional(),
        otherwise:joi.required()
    }),
    password:generalFields.password.required()
})

export const passVal = joi.object({
    newPassword : generalFields.password.required(),
    otp:generalFields.otp.required()
})