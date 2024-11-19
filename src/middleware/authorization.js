import { Company } from "../../database/index.js"
import { AppError } from "../utils/AppError.js"
import { messages } from "../utils/constant/messages.js"

export const authorize = (roles) => {
    return async (req, res, next) => {

        const authUser = req.authUser


        if (authUser.role == roles.COMPANY_HR) {
            const company = await Company.findOne({ HR: user._id })
            if (company)
                req.authCompany = company
        }
        if (!roles.includes(authUser.role))
            return next(new AppError(messages.user.notAuthorized, 401))
        next()
    }
}