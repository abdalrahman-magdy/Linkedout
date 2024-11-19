import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { changePassVal, updateAccVal } from "./user.validation.js";
import { authenticate } from "../../middleware/authentication.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
    AllRecoveryAccounts, changePassword, deleteAccount,
    getAccount, getMyAccount, updateAccount
} from "./user.controllers.js";

const userRouter = Router()

/**
 * @function updateAccount
 * @description This API endpoint allows an authenticated user to update their account details, such as email, phone, recovery email, date of birth (DOB), first name, and last name. It checks if the new email or phone already exists in the system and sends an email verification if the email is updated.
 * 
 * @param {Object} req - The request object, containing the user's updated account details in the body and the token in the headers.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the updated user data if the update is successful.
 * 
 * @throws {AppError} - Throws an error if the email or phone number is already associated with another account.
 */

userRouter.patch('/update-account',
    authenticate(),
    validate(updateAccVal),
    asyncHandler(updateAccount)
)
/**
 * @function deleteAccount
 * @description This API endpoint allows an authenticated user to delete their account. It removes the user's data from the database.
 * 
 * @param {Object} req - The request object, containing the authenticated user's data.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message if the account deletion is successful.
 * 
 * @throws {AppError} - Throws an error if the account deletion fails.
 */
userRouter.delete('/delete-account',
    authenticate(),
    asyncHandler(deleteAccount)
)
/**
 * @function getMyAccount
 * @description This API endpoint retrieves the details of the authenticated user's account. It fetches the user's data from the database.
 * 
 * @param {Object} req - The request object, containing the authenticated user's data.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the user's account data if the fetch is successful.
 * 
 * @throws {AppError} - Throws an error if the account details cannot be fetched.
 */
userRouter.get('/my-account',
    authenticate(),
    asyncHandler(getMyAccount)
)
/**
 * @function changePassword
 * @description This API endpoint allows an authenticated user to change their password. It verifies the old password and ensures the new password is different before updating it.
 * 
 * @param {Object} req - The request object, containing the user's old and new passwords in the body.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message if the password change is successful.
 * 
 * @throws {AppError} - Throws an error if the old password is incorrect or if the new password is the same as the old one.
 */
userRouter.patch('/change-password',
    authenticate(),
    validate(changePassVal),
    asyncHandler(changePassword)
)
/**
 * @function getAccount
 * @description This API endpoint retrieves the account details of a user by their user ID. It returns specific fields such as username, email, date of birth, phone number, verification status, and online status.
 * 
 * @param {Object} req - The request object, containing the user ID in the URL parameters.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the user's account data if the fetch is successful.
 * 
 * @throws {AppError} - Throws an error if the user account is not found.
 */
userRouter.get('/:userId',
    asyncHandler(getAccount)
)
/**
 * @function AllRecoveryAccounts
 * @description This API endpoint retrieves all user accounts associated with a given recovery email. It returns the usernames and email addresses of those accounts.
 * 
 * @param {Object} req - The request object, containing the recovery email in the body.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the list of accounts associated with the recovery email if found.
 * 
 * @throws {AppError} - Throws an error if no accounts are found with the specified recovery email.
 */
userRouter.post('/recovery-account',
    asyncHandler(AllRecoveryAccounts)
)


export default userRouter