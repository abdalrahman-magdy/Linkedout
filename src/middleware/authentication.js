import { User } from "../../database/index.js"
import { AppError } from "../utils/AppError.js"
import { status } from "../utils/constant/enums.js"
import { messages } from "../utils/constant/messages.js"
import { verifyToken } from "../utils/token.js"

export const authenticate = () => {
    return async (req, res, next) => {
        const { token } = req.headers

        if (!token)
            return next(new AppError(messages.token.notFound))

        let payload = verifyToken(token)

        if (!payload) {

            return next(new AppError(messages.user.invalidCredentials))
        }
        payload = { ...payload.payload }
        const user = await User.findOne({ _id: payload._id, verified: true, status: status.ONLINE })
        if (!user)
            return next(new AppError(messages.user.notAuthorized, 400))
        

        req.authUser = user

        next()
    }
}  