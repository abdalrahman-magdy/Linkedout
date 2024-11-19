import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { forgotPassword, login, logOut, sendOtp, signup, verifyAccount } from "./auth.controllers.js";
import { loginVal, passVal, signupVal } from "./auth.validation.js";
import { authenticate } from "../../middleware/authentication.js";

const authRouter = Router()

/**
 * User signup.
 * 
 * @async
 * @function signup
 * @description Registers a new user by creating an account with the provided details. The user's password is hashed, and an email is sent to verify the account. This function ensures that the email and mobile number are unique before creating the user.
 * @param {Object} req - Express request object containing user registration details (first name, last name, email, password, mobile number, recovery email, DOB).
 * @param {Object} res - Express response object to send back the result of the user creation process.
 * @param {Function} next - Express middleware to handle errors.
 * @returns {Object} JSON response with user creation confirmation or error message.
 */
authRouter.post('/signup',
    validate(signupVal),
    asyncHandler(signup)
)

/**
 * User login.
 * 
 * @async
 * @function login
 * @description Authenticates the user using email, mobile number, or recovery email and password. If successful, a session token is generated. The function also checks if the user is verified and updates the user's status to online upon successful login.
 * @param {Object} req - Express request object containing user credentials (email, mobile number, recovery email, and password).
 * @param {Object} res - Express response object to send back login status and token if successful.
 * @param {Function} next - Express middleware to handle errors.
 * @returns {Object} JSON response with authentication token and success message, or error message if authentication fails.
 */
authRouter.post('/login',
    validate(loginVal),
    asyncHandler(login)
)

/**
 * Verify account via email token.
 * 
 * @async
 * @function verifyAccount
 * @description Verifies a user's email address by validating the token sent during registration. This function updates the user's account status to verified.
 * @param {Object} req - Express request object containing the token in the URL parameters.
 * @param {Object} res - Express response object to send back the result of the verification process.
 * @param {Function} next - Express middleware to handle errors.
 * @returns {Object} JSON response confirming account verification or an error message.
 */
authRouter.get('/verify/:token', 
    asyncHandler(verifyAccount))


    /**
 * @function forgotPassword
 * @description This API endpoint allows users to reset their password using an OTP (One-Time Password).
 * The user sends their new password and OTP, along with a token in the headers for authorization. 
 * The function verifies the token, checks if the OTP is valid and has not expired, ensures the new password 
 * is different from the old one, and finally updates the user's password.
 * 
 * @param {Object} req - The request object, containing the OTP and new password in the body, and the token in the headers.
 * @param {Object} res - The response object, used to send a JSON response to the client.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * 
 * @returns {Object} - Returns a success message if the password is updated, otherwise throws an error for various failure cases.
 * 
 * @throws {AppError} - Throws an error if the token is invalid, the OTP is incorrect or expired, or if the new password matches the old one.
 */
authRouter.route('/forget-password')
    .post(
        asyncHandler(sendOtp)
    )
    .patch(
        validate(passVal),
        asyncHandler(forgotPassword)
    )

/**
 * @function logOut
 * @description This API endpoint logs the authenticated user out by updating their status to OFFLINE.
 * It retrieves the authenticated user from the request object, updates their status, and saves the changes.
 * 
 * @param {Object} req - The request object, which contains the authenticated user (authUser).
 * @param {Object} res - The response object, used to send a JSON response to the client.
 * @param {Function} next - The next middleware function in the Express.js stack.
 * 
 * @returns {Object} - Returns a success message indicating the user has been logged out.
 * 
 * @throws {AppError} - Could throw an error if saving the user fails, although not explicitly handled in the code.
 */
authRouter.get('/logout',
    authenticate(),
    asyncHandler(logOut)
)


export default authRouter