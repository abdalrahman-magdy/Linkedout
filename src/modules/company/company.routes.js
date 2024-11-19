import Router from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { authenticate } from '../../middleware/authentication.js'
import { authorize } from '../../middleware/authorization.js'
import { validate } from '../../middleware/validate.js'
import { roles } from '../../utils/constant/enums.js'
import { addCompany, deleteCompany, getApplicationJob, getCompanyByName, getCompanyData, updateCompany } from './company.controllers.js'
import { addCompanyVal, getApplicationJobVal, getCompanyVal, searchCompanyByNameVal, updateCompanyVal } from './company.validation.js'
const companyRouter = Router()
/**
 * Add a new company.
 * This route allows an authenticated and authorized Company HR to add a new company.
 * 
 * @route POST /company
 * @access Private (Company_HR)
 * @middleware isAuthenticated, isAuthorized(Company_HR), isValid(addCompanyVal)
 * @param {Object} req - Express request object containing company details.
 * @param {Object} res - Express response object.
 * @returns {Object} 201 - Success message with the created company data.
 * @returns {Object} 400 - Validation error or invalid input.
 * @returns {Object} 403 - Unauthorized if the user does not have the required role.
 */

companyRouter.post('/add-company',
    authenticate(),
    authorize([roles.ADMIN, roles.COMPANY_HR]),
    validate(addCompanyVal),
    asyncHandler(addCompany)
)

/**
 * Update a company's information.
 * This route allows an authenticated and authorized Company HR to update a specific company's details.
 * 
 * @route PUT /company/:companyId
 * @access Private (Company_HR)
 * @middleware isAuthenticated, isAuthorized(Company_HR), isValid(updateCompanyVal)
 * @param {Object} req - Express request object containing updated company details.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message with the updated company data.
 * @returns {Object} 400 - Validation error or invalid input.
 * @returns {Object} 403 - Unauthorized if the user does not have the required role.
 * @returns {Object} 404 - Company not found.
 */
companyRouter.patch('/update-company',
    authenticate(),
    authorize([roles.COMPANY_HR]),
    validate(updateCompanyVal),
    asyncHandler(updateCompany)
)
/**
 * Delete a company.
 * This route allows an authenticated and authorized Company HR to delete a specific company.
 * It also deletes all related jobs and applications associated with the company.
 * 
 * @route DELETE /company/:companyId
 * @access Private (Company_HR)
 * @middleware isAuthenticated, isAuthorized(Company_HR), isValid(deleteCompanyVal)
 * @param {Object} req - Express request object containing companyId in params.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message confirming the deletion of the company.
 * @returns {Object} 403 - Unauthorized if the user does not have the required role.
 * @returns {Object} 404 - Company not found.
 * @returns {Object} 500 - Failed to delete the company or related documents.
 */
companyRouter.delete('/delete-company',
    authenticate(),
    authorize([roles.COMPANY_HR]),
    asyncHandler(deleteCompany)
)


/**
 * Get a company's data.
 * This route allows an authenticated and authorized Company HR to fetch details of a specific company.
 * 
 * @route GET /company/get/:companyId
 * @access Private (Company_HR)
 * @middleware isAuthenticated, isAuthorized(Company_HR), isValid(getCompanyVal)
 * @param {Object} req - Express request object containing companyId in params.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message with company data.
 * @returns {Object} 403 - Unauthorized if the user does not have the required role.
 * @returns {Object} 404 - Company not found.
 */
companyRouter.get('/:id',
    authenticate(),
    authorize([roles.COMPANY_HR]),
    validate(getCompanyVal),
    asyncHandler(getCompanyData)
)


/**
 * Search for a company by name.
 * This route allows both Company HR and regular users to search for companies by their names.
 * 
 * @route GET /company/search-company
 * @access Private (Company_HR, User)
 * @middleware isAuthenticated, isAuthorized(Company_HR, User), isValid(searchCompanyByNameVal)
 * @param {Object} req - Express request object containing search query in the query parameters.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message with matching company data.
 * @returns {Object} 400 - Validation error or invalid input.
 * @returns {Object} 403 - Unauthorized if the user does not have the required role.
 */
companyRouter.post('/get-company',
    authenticate(),
    authorize([roles.COMPANY_HR, roles.USER]),

    validate(searchCompanyByNameVal),
    asyncHandler(getCompanyByName)
)

/**
 * Get all applications for a specific job.
 * This route allows an authenticated and authorized Company HR to view all applications for one of their jobs.
 * Only the company owner (Company_HR) can access applications for their jobs.
 * 
 * @route GET /company/job-applications/:jobId
 * @access Private (Company_HR)
 * @middleware isAuthenticated, isAuthorized(Company_HR), isValid(getApplicationJobVal)
 * @param {Object} req - Express request object containing jobId in params.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message with applications and related user data.
 * @returns {Object} 403 - Unauthorized if the user does not own the job.
 * @returns {Object} 404 - Job or applications not found.
 */
companyRouter.get('/job-applications/:jobId',
    authenticate(),
    authorize([roles.COMPANY_HR]),
    validate(getApplicationJobVal),
    asyncHandler(getApplicationJob)
)


export default companyRouter 