import bcrypt from "bcrypt"
import { Company, User } from "../../../database/index.js"
import { AppError } from "../../utils/AppError.js"
import { status } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { generateToken, verifyToken } from "../../utils/token.js"
import { sendEmail } from "../../utils/emails.js"

/**
 * @function signup
 * @description Handles user signup by validating input data, checking for existing users, hashing the password, and saving the new user to the database. A verification email is sent to the user upon successful signup.
 *
 * Steps:
 * 1. Extract data from the request body.
 * 2. Check if a user with the same email or phone already exists.
 * 3. Normalize the email and recoveryEmail to lowercase.
 * 4. Generate a username by concatenating the first and last names.
 * 5. Hash the password for security.
 * 6. Create a new User object and save it to the database.
 * 7. Generate a verification token and send a verification email to the user.
 * 8. Respond with a success message.
 */
export const signup = async (req, res, next) => {
    let { firstName, lastName, email, recoveryEmail, password, phone, DOB, role } = req.body
    const userExists = await User.findOne({ $or: [{ email }, { phone }] })
    if (userExists)
        return next(new AppError(messages.user.alreadyExists))

    email.toLowerCase()
    recoveryEmail.toLowerCase()
    const userName = `${firstName}_${lastName}`
    password = bcrypt.hashSync(password, 8)
    DOB = new Date(DOB)

    const user = new User({
        firstName,
        lastName,
        userName,
        email,
        recoveryEmail,
        password,
        phone,
        DOB,
        role
    })

    const token = generateToken({ _id: user._id, email, type: "user" })
    sendEmail({ to: email, subject: 'E-mail verification', html: `<p><a href="${req.protocol}://${req.headers.host}/api/auth/verify/${token}">link</p>` })
    await user.save()

    return res.status(201).json({ message: messages.user.createdSuccessfully, success: true })
}

/**
 * @function verifyAccount
 * @description Verifies a user's or company's account using a token. The token is decoded to find the corresponding user or company and updates their verification status in the database.
 *
 * Steps:
 * 1. Extract the token from request parameters.
 * 2. Verify the token and decode its payload.
 * 3. Check if the payload belongs to a user or company and update the verification status accordingly.
 * 4. Respond with a success message and the verified user's or company's data.
 */
export const verifyAccount = async (req, res, next) => {
    const { token } = req.params
    const payload = verifyToken(token)

    if (payload.type == 'user') {
        const verifiedUser = await User.findByIdAndUpdate(payload._id, { verified: true }, { new: true })
        if (!verifiedUser)
            return next(new AppError(messages.user.notFound, 404))
        return res.status(200).json({ message: messages.user.verifiedSuccessfully, success: true, data: verifiedUser })
    }
    if (payload.type == 'company') {
        const verifiedCompany = await Company.findByIdAndUpdate(payload._id, { verified: true }, { new: true })
        if (!verifiedCompany)
            return next(new AppError(messages.company.notFound, 404))
        return res.status(200).json({ message: messages.company.verifiedSuccessfully, success: true, data: verifiedCompany })
    }
}

/**
 * @function login
 * @description Authenticates a user by validating their credentials (email, recovery email, or phone) and password. If valid, the user status is updated to online and a token is generated for the session.
 *
 * Steps:
 * 1. Extract email, recovery email, phone, and password from the request body.
 * 2. Find the user by either email, recovery email, or phone.
 * 3. Check if the user is already logged in.
 * 4. Validate the password.
 * 5. Generate a session token for the user.
 * 6. Update the user's status to online.
 * 7. Respond with a success message and the generated token.
 */
export const login = async (req, res, next) => {
    const { email, recoveryEmail, phone, password } = req.body

    const user = await User.findOne({ $or: [{ email }, { recoveryEmail }, { phone }] })
    if (user.status == status.ONLINE)
        return next(new AppError('already logged in', 400))

    if (!user)
        return next(new AppError(messages.user.invalidCredentials, 400))

    if (!bcrypt.compareSync(password, user.password))
        return next(new AppError(messages.user.invalidCredentials, 400))

    const token = generateToken({ payload: { _id: user._id, email } })
    user.status = status.ONLINE
    await user.save()

    return res.status(200).json({ message: messages.user.loggedinSuccessfully, success: true, token })
}

/**
 * @function logOut
 * @description Logs out the user by updating their status to offline in the database.
 *
 * Steps:
 * 1. Get the authenticated user from the request.
 * 2. Update the user's status to offline.
 * 3. Respond with a success message.
 */
export const logOut = async (req, res, next) => {
    const authUser = req.authUser
    authUser.status = status.OFFLINE
    authUser.save()

    return res.status(200).json({ message: messages.user.loggedoutSuccessfully, success: true })
}

/**
 * @function sendOtp
 * @description Generates a one-time password (OTP) for password recovery and sends it to the user's email. The OTP expires after 5 minutes.
 *
 * Steps:
 * 1. Extract the email from the request body.
 * 2. Generate a random OTP and set its expiration time.
 * 3. Find the user with the given email and update their OTP and expiration time.
 * 4. Generate a token for the user.
 * 5. Send the OTP to the user's email.
 * 6. Respond with a success message and the token.
 */
export const sendOtp = async (req, res, next) => {
    const { email } = req.body

    const otpCode = Math.floor((Math.random() * 1000000) + 1)
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;

    const user = await User.findOneAndUpdate({ email, status: status.OFFLINE }, { otp: otpCode, otpExpiresAt })
    if (!user)
        return next(new AppError(messages.user.notFound, 404))

    const token = generateToken({ _id: user._id })

    sendEmail({ to: email, subject: 'forgot password', html: `<p>Your one time password is ${otpCode}` })

    return res.status(200).json({ message: `otp sent, expires after 5 minutes`, success: true, token })
}

/**
 * @function forgotPassword
 * @description Resets the user's password if the provided OTP is valid. The user must supply the correct OTP and a new password.
 *
 * Steps:
 * 1. Extract OTP and new password from the request body.
 * 2. Verify the token provided in the request headers.
 * 3. Check if the user exists and validate the OTP against the user's stored OTP.
 * 4. Ensure the new password is different from the old password.
 * 5. Hash the new password and update it in the database.
 * 6. Clear the OTP and its expiration time.
 * 7. Respond with a success message.
 */
export const forgotPassword = async (req, res, next) => {
    let { otp, newPassword } = req.body
    const { token } = req.headers

    let payload = verifyToken(token)

    if (!payload) {
        return next(new AppError(messages.token.invalidToken));
    }

    otp = parseInt(otp)

    let forgotUser = await User.findById(payload._id)
    if (!forgotUser)
        return next(new AppError(messages.token.invalidToken))

    if (forgotUser.otp !== otp || forgotUser.otpExpiresAt < Date.now()) {
        return next(new AppError("invalid or expired otp"))
    }

    if (bcrypt.compareSync(newPassword, forgotUser.password))
        return next(new AppError('can\'t have the same password'))

    newPassword = bcrypt.hashSync(newPassword, 8)
    forgotUser.password = newPassword

    forgotUser.otp = null
    forgotUser.otpExpiresAt = null

    await forgotUser.save()

    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true })
}
