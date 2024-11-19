import { Company, Job } from "../../../database/index.js"
import { Application } from "../../../database/models/application.model.js"
import { AppError } from "../../utils/AppError.js"
import { messages } from "../../utils/constant/messages.js"
import { ApiFeature } from "../../utils/ApiFeature.js"
import cloudinary from "../../utils/cloud.js"

// Function to add a new job
export const addJob = async (req, res, next) => {
    // Extract job details from the request body
    let { jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills } = req.body
    jobTitle = jobTitle.toLowerCase();

    const authUser = req.authUser
    // Check if the user has a company associated with them
    const company = await Company.findOne({ HR: authUser._id })
    if (!company)
        return next(new AppError(messages.company.notFound, 404))

    // Check if the job already exists
    const jobExists = await Job.findOne({ jobTitle, addedBy: authUser._id })
    if (jobExists)
        return next(new AppError(messages.job.alreadyExists, 409))

    // Prepare the job data
    const job = new Job({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        addedBy: authUser._id,
        company: company ? company._id : null
    })

    // Save the job to the database
    const addedJob = await job.save()
    if (!addedJob)
        return next(AppError(messages.job.failToCreate, 500))

    // Send success response
    return res.status(200).json({
        message: messages.job.createdSuccessfully,
        success: true,
        data: addedJob
    })
}

// Function to update an existing job
export const updateJob = async (req, res, next) => {
    // Extract updated job details from the request body
    let { jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills } = req.body;
    const { jobId } = req.params;

    const authUser = req.authUser;

    // Find the job being updated
    const job = await Job.findOne({ addedBy: authUser._id, _id: jobId });

    // Check if the job exists
    if (!job)
        return next(new AppError(messages.job.notExist, 404))

    // Prepare updated job data
    job.jobTitle = jobTitle || job.jobTitle;
    job.jobLocation = jobLocation || job.jobLocation;
    job.workingTime = workingTime || job.workingTime;
    job.seniorityLevel = seniorityLevel || job.seniorityLevel;
    job.jobDescription = jobDescription || job.jobDescription;
    job.technicalSkills = technicalSkills || job.technicalSkills;
    job.softSkills = softSkills || job.softSkills;

    // Update the job in the database
    const updatedJob = await job.save();

    // Handle update failure
    if (!updatedJob) {
        return next(new AppError(messages.job.failToUpdate, 500));
    }

    // Send success response
    return res.status(200).json({
        message: messages.job.updatedSuccessfully,
        success: true,
        data: updatedJob
    });
}

// Function to delete a job
export const deleteJob = async (req, res, next) => {
    // Extract job ID from request parameters
    const { jobId } = req.params
    const authUser = req.authUser;

    // Delete the job if it was added by the authenticated user
    const deletedJob = await Job.findOneAndDelete({ addedBy: authUser._id, _id: jobId })
    if (!deletedJob)
        return next(new AppError(messages.job.failToDelete, 500))

    // Delete related applications for this job
    await Application.deleteMany({ jobId })

    // Send success response
    return res.status(200).json({
        message: messages.job.deletedSuccessfully,
        success: true
    })
}

// Function to get all jobs with their company's information
export const getAllJobs = async (req, res, next) => {
    // Retrieve jobs from the database with pagination, sorting, selection, and filtering
    const apiFeature = new ApiFeature(Job.find().populate('company'), req.query).pagination().sort().select().filter()

    const jobs = await apiFeature.mongooseQuery

    // Handle case where no jobs are found
    if (jobs.length == 0)
        return next(new AppError(messages.job.notExist, 500))

    // Send the retrieved jobs in the response
    return res.status(200).json({
        success: true,
        data: jobs
    })
}

// Function to get jobs for a specific company
export const getJobsByCompany = async (req, res, next) => {
    // Extract company name from query parameters
    let { companyName } = req.query;
    companyName = companyName.toLowerCase()
    console.log(companyName);
    
    // Search for the company by name
    const companyExist = await Company.findOne({ name:companyName })
    
    console.log(companyExist);
    if (!companyExist) {
        return next(new AppError(messages.company.notFound, 404))
    }

    // Retrieve jobs associated with the company
    const jobs = await Job.find({ company: companyExist._id }).populate('addedBy', 'username')

    // Send the jobs in the response
    return res.status(200).json({
        success: true,
        data: jobs
    })
}

// Function to apply for a job
export const applyJob = async (req, res, next) => {
    // Extract job ID and user ID from request
    const { jobId } = req.params;
    const userId = req.authUser._id;
    const { userTechSkills, userSoftSkills } = req.body;

    // Check if the job exists
    const jobExist = await Job.findById(jobId);
    if (!jobExist) {
        return next(new AppError(messages.job.notFound, 404));
    }

    // Check if the user has already applied for this job
    const userApplied = await Application.findOne({ userId, jobId });
    if (userApplied) {
        return next(new AppError(messages.job.alreadyApplied, 400));
    }

    // Check if the resume file is provided
    if (!req.file) {
        return next(new AppError("file required", 400));
    }

    // Upload the resume file to cloud storage
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: '/Job Search App/resume'
    })
    console.log();
    
    // Handle upload failure
    req.fail = { secure_url, public_id };

    // Prepare application data
    const application = new Application({
        jobId,
        userId,
        userTechSkills: JSON.parse(userTechSkills),
        userSoftSkills: JSON.parse(userSoftSkills),
        userResume: { secure_url, public_id }
    });

    // Save the application to the database
    const createdApplication = await application.save();

    // Handle application creation failure
    if (!createdApplication) {
        return next(new AppError(messages.job.failToApply, 500));
    }

    // Send success response
    return res.status(201).json({
        message: messages.job.createdApplication,
        success: true,
        data: createdApplication
    })
}
