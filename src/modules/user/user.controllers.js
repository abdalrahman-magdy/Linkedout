import { Company, Job, User } from "../../../database/index.js"
import { Application } from "../../../database/models/application.model.js"
import { AppError } from "../../utils/AppError.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/emails.js"
import { generateToken } from "../../utils/token.js"
import bcrypt from "bcrypt"

// Function to update the user's account information
export const updateAccount = async (req, res, next) => {
    // Extract data from the request body and headers
    let { email, phone, recoveryEmail, DOB, lastName, firstName } = req.body
    let { token } = req.headers
    const authUser = req.authUser

    // Set defaults for user information if not provided
    email = email ? email.toLowerCase() : authUser.email
    phone = phone ? phone : authUser.phone
    recoveryEmail = recoveryEmail ? recoveryEmail : authUser.recoveryEmail
    firstName = firstName ? firstName : authUser.firstName
    lastName = lastName ? lastName : authUser.lastName
    DOB = DOB ? DOB : authUser.DOB

    // Check for the existence of the new email or phone in the database
    const userExists = await User.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: authUser._id }
    })
    if (userExists)
        return next(new AppError(messages.user.alreadyExists))

    // Update provided data and handle email verification
    if (authUser.email !== email) {
        token = generateToken({ _id: authUser._id })
        sendEmail({
            to: email,
            subject: 'E-mail verification',
            html: `<p><a href="${req.protocol}://${req.headers.host}/api/auth/verify/${token}">link</p>`
        })
        authUser.email = email
        authUser.verified = false
    }

    // Update user details
    authUser.firstName = firstName
    authUser.lastName = lastName

    let userName = `${firstName}_${lastName}`
    authUser.userName = userName

    authUser.phone = phone
    authUser.recoveryEmail = recoveryEmail

    // Convert DOB to date format
    DOB = new Date(DOB)
    authUser.DOB = DOB

    // Save the updated user details in the database
    const updatedUser = await authUser.save()

    // Send success response
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true, data: updatedUser })
}

// Function to get the authenticated user's account details

export const getMyAccount = async (req, res, next) => {
    const authUser = req.authUser

    // Retrieve the user's account information from the database
    const MyAccount = await User.findById(authUser._id)

    // Handle case where the account is not found
    if (!MyAccount)
        return next(new AppError(messages.user.failToFetch, 500))

    // Send the account information in the response
    return res.status(200).json({ success: true, data: MyAccount })
}

// Function to delete the authenticated user's account
export const deleteAccount = async (req, res, next) => {
    const authUser = req.authUser

    // Delete the user's account from the database
    const deletedUser = await User.findByIdAndDelete(authUser._id, { new: true })
    await Application.deleteMany({ userId: authUser._id })
    await Company.deleteMany({ HR: authUser._id })
    await Job.deleteMany({ addedBy: authUser._id })
    // Handle case where the account deletion fails
    if (!deletedUser)
        return next(new AppError(messages.user.failToDelete, 500))

    // Send success response
    return res.status(200).json({ message: messages.user.deletedSuccessfully, success: true })
}

// Function to get another user's account details by user ID
export const getAccount = async (req, res, next) => {
    const { userId } = req.params

    // Retrieve the user's information from the database
    const user = await User.findById(
        userId,
        {
            userName: 1,
            email: 1,
            DOB: 1,
            phone: 1,
            verified: 1,
            status: 1
        }
    )

    // Handle case where the user is not found
    if (!user)
        return next(new AppError(messages.user.notFound, 404))

    // Send the user information in the response
    return res.status(200).json({ success: true, data: user })
}

// Function to change the authenticated user's password
export const changePassword = async (req, res, next) => {
    let { oldPassword, newPassword } = req.body
    const authUser = req.authUser

    // Check if the old password is correct
    if (!bcrypt.compareSync(oldPassword, authUser.password))
        return next(new AppError(messages.user.invalidCredentials, 400))

    // Prevent the user from setting the same password
    if (bcrypt.compareSync(newPassword, authUser.password))
        return next(new AppError('Same password isn\'t allowed', 400))

    // Hash the new password and update the user's password
    newPassword = bcrypt.hashSync(newPassword, 8)
    authUser.password = newPassword

    // Save the updated user details in the database
    await authUser.save()

    // Send success response
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true })
}

// Function to get all accounts associated with a specific recovery email
export const AllRecoveryAccounts = async (req, res, next) => {
    const { recoveryEmail } = req.body

    // Find all accounts that match the provided recovery email
    const accounts = await User.find({ recoveryEmail }, { userName: 1, email: 1 })

    // Handle case where no accounts are found
    if (!accounts.length) {
        return next(new AppError("No accounts found with this recovery email", 404));
    }

    // Send the accounts in the response
    return res.status(200).json({ success: true, data: accounts });
}
