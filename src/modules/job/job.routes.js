import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { addJobVal, applyJobVal, getJobsByCompanyVal, updateJobVal } from "./job.validation.js";
import { authenticate } from "../../middleware/authentication.js";
import { authorize } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addJob, updateJob, deleteJob, getAllJobs, getJobsByCompany, applyJob } from "./job.controllers.js";
import { cloudUpload } from "../../utils/multer-cloud.js";

const jobRouter = Router()
/**
 * @function addJob
 * @description This API endpoint allows an authenticated user (HR) to add a job listing under their company.
 * It verifies if the user has a company, checks if the job already exists, and then saves the new job 
 * with the provided details (job title, location, skills, etc.) to the database.
 * 
 * @param {Object} req - The request object containing the job details in the body and the authenticated user (authUser).
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the newly added job data if successful.
 * 
 * @throws {AppError} - Throws an error if the company is not found, the job already exists, or if the job fails to be created in the database.
 */
jobRouter.post('/add-job',
    authenticate(),
    authorize(roles.COMPANY_HR),
    validate(addJobVal),
    asyncHandler(addJob)
)
/**
 * @function updateJob
 * @description This API endpoint allows an authenticated user (HR) to update an existing job listing by providing new details.
 * It verifies if the job exists under the authenticated user's profile and updates the job fields accordingly.
 * 
 * @param {Object} req - The request object, containing the job details to be updated in the body and the job ID in the parameters.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the updated job data if the update is successful.
 * 
 * @throws {AppError} - Throws an error if the job does not exist or if the update operation fails.
 */
jobRouter.patch('/update-job/:jobId',
    authenticate(),
    authorize(roles.COMPANY_HR),
    validate(updateJobVal),
    asyncHandler(updateJob)
)
/**
 * @function deleteJob
 * @description This API endpoint allows an authenticated user (HR) to delete a job listing by its ID. 
 * It also deletes all related applications associated with the job.
 * 
 * @param {Object} req - The request object, containing the job ID in the parameters.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message if the job and its related applications are successfully deleted.
 * 
 * @throws {AppError} - Throws an error if the job fails to be deleted or is not found.
 */

jobRouter.delete('/delete-job/:jobId',
    authenticate(),
    authorize(roles.COMPANY_HR),
    asyncHandler(deleteJob)
)
/**
 * @function getAllJobs
 * @description This API endpoint fetches all job listings from the database. It supports various query features such as pagination, sorting, selecting specific fields, and filtering based on the provided query parameters.
 * 
 * @param {Object} req - The request object, containing optional query parameters for pagination, sorting, selection, and filtering.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and an array of job listings, or an error message if no jobs are found.
 * 
 * @throws {AppError} - Throws an error if no jobs are found in the database.
 */

jobRouter.get('/',
    authenticate(),
    authorize([roles.COMPANY_HR, roles.USER]),
    asyncHandler(getAllJobs)
)
/**
 * @function getJobsByCompany
 * @description This API endpoint retrieves all job listings for a specific company, based on the company name provided in the query parameters. 
 * The job listings are populated with information about the user who added them.
 * 
 * @param {Object} req - The request object, containing the company name in the query parameters.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and an array of job listings for the specified company.
 * 
 * @throws {AppError} - Throws an error if the company does not exist.
 */
jobRouter.get('/by-company',
    authenticate(),
    authorize([roles.USER, roles.COMPANY_HR]),
    validate(getJobsByCompanyVal),
    asyncHandler(getJobsByCompany)
)

/**
 * @function applyJob
 * @description This API endpoint allows an authenticated user to apply for a specific job. It checks if the job exists, 
 * verifies if the user has already applied, uploads the user's resume, and saves the application with technical 
 * and soft skills.
 * 
 * @param {Object} req - The request object, containing the job ID in the parameters, the authenticated user's data, and the resume file.
 * @param {Object} res - The response object, used to send a JSON response back to the client.
 * @param {Function} next - The next middleware function in the Express.js stack for error handling.
 * 
 * @returns {Object} - Returns a success message and the created application data if successful.
 * 
 * @throws {AppError} - Throws errors if the job does not exist, the user has already applied, no file is provided, 
 * or if the application fails to be created.
 */
jobRouter.post('/apply/:jobId',
    authenticate(),
    authorize([roles.USER]),
    cloudUpload().single('userResume'),
    validate(applyJobVal),
    asyncHandler(applyJob)
)

export default jobRouter