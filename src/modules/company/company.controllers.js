import { Company, Job } from "../../../database/index.js"
import { Application } from "../../../database/models/application.model.js"
import { AppError } from "../../utils/AppError.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/emails.js"
import { generateToken } from "../../utils/token.js"

// Function to add a new company
export const addCompany = async (req, res, next) => {
    // Extract company details from request body
    const { name, description, industry, address, numberOfEmployees, email } = req.body
    const authUser = req.authUser

    // Convert name and email to lowercase
    name.toLowerCase()
    email.toLowerCase()

    // Check if the company already exists
    const companyExists = await Company.findOne({ $or: [{ name }, { email }] })
    if (companyExists)
        return next(new AppError(messages.company.alreadyExists, 409))

    // Create a new company instance
    const HR = authUser._id
    let company = new Company({
        name,
        email,
        description,
        industry,
        address,
        numberOfEmployees,
        HR
    })

    // Generate email verification token and send verification email
    const token = generateToken({ _id: company._id, type: "company" })
    sendEmail({
        to: email,
        subject: 'E-mail verification',
        html: `<p><a href="${req.protocol}://${req.headers.host}/api/auth/verify/${token}">link</p>`
    })

    // Save the new company to the database
    const createdCompany = await company.save()

    // Send success response
    return res.status(201).json({
        message: messages.company.createdSuccessfully,
        success: true,
        data: createdCompany
    })
}

// Function to update existing company details
export const updateCompany = async (req, res, next) => {
    // Extract updated company details from request body
    let { name, description, industry, address, numberOfEmployees, email } = req.body
    const authCompany = await Company.findOne({ HR: req.authUser._id })
    if (!authCompany)
        return next(AppError(messages.company.notFound, 404))

    // Prepare company data for update, using existing values if not provided
    name = name ? name.toLowerCase() : authCompany.name;
    email = email ? email.toLowerCase() : authCompany.email;
    description = description || authCompany.description;
    industry = industry || authCompany.industry;
    address = address || authCompany.address;
    numberOfEmployees = numberOfEmployees || authCompany.numberOfEmployees;

    // Check for existing companies with the same name or email
    const newCompanyExists = await Company.findOne({
        $or: [{ email }, { name }],
        _id: { $ne: authCompany._id }
    })
    if (newCompanyExists)
        return next(new AppError(messages.company.alreadyExists, 409))

    // Send verification email if the email has changed
    if (authCompany.email != email) {
        const token = generateToken({ _id: authCompany._id, type: "company" })
        sendEmail({
            to: email,
            subject: 'E-mail verification',
            html: `<p><a href="${req.protocol}://${req.headers.host}/api/auth/verify/${token}">link</p>`
        })
        authCompany.verified = false
    }

    // Update company details
    authCompany.name = name
    authCompany.email = email
    authCompany.description = description
    authCompany.industry = industry
    authCompany.address = address
    authCompany.numberOfEmployees = numberOfEmployees

    // Save updated company to the database
    const updatedCompany = await authCompany.save()

    // Send success response
    return res.status(200).json({
        message: messages.company.updatedSuccessfully,
        success: true,
        data: updatedCompany
    })
}

// Function to delete a company
export const deleteCompany = async (req, res, next) => {
    // Extract company ID from request parameters
    const { companyId } = req.params

    // Delete the company if it belongs to the authenticated HR user
    const deletedCompany = await Company.findOneAndDelete({ HR: req.authUser._id, _id: companyId }, { new: true })
    if (!deletedCompany)
        return next(new AppError(messages.company.failToDelete, 500))

    //  Delete all related documents (jobs and applications)
    const relatedDocs = await Job.find({ company: companyId })
    await Application.deleteMany({ jobId: relatedDocs._id })
    await Job.deleteMany({ company: companyId })

    // Send success response
    return res.status(200).json({ message: messages.company.deletedSuccessfully, success: true, data: deletedCompany })
}

// Function to get company data by ID
export const getCompanyData = async (req, res, next) => {
    // Extract company ID from request parameters
    const { id } = req.params

    // Fetch company data from the database
    const company = await Company.findById(id)
    if (!company)
        return next(new AppError(messages.company.notFound, 404))

    // Send company data in response
    return res.status(200).json({ success: true, Data: company })
}

// Function to get a company by name
export const getCompanyByName = async (req, res, next) => {
    // Extract company name from request body
    const { name } = req.body

    // Find the company by name
    const company = await Company.findOne({ name })
    if (!company)
        return next(new AppError(messages.company.notFound, 404))

    // Send company data in response
    return res.status(200).json({ success: true, data: company })
}

// Function to get all applications for a specific job
export const getApplicationJob = async (req, res, next) => {
    // Extract job ID from request parameters
    const { jobId } = req.params;
    const userId = req.authUser._id;

    // Check if the job exists
    const jobExist = await Job.findById(jobId).populate('company')
    if (!jobExist) {
        return next(new AppError(messages.job.notExist, 404))
    }

    // Fetch all applications for the job
    const applications = await Application.find({ jobId }).populate('userId', '-password -__v -createdAt -updatedAt')
    
    // Check if there are applications
    if (applications.length === 0) {
        return next(new AppError(messages.application.notFound, 404))
    }

    // Send applications data in response
    return res.status(200).json({
        success: true,
        data: applications
    })
}
