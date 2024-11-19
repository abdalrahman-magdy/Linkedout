const generateMessage = (entity) => ({
    alreadyExists: `${entity} already exist`,
    notFound: `${entity} not found`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,
    deletedSuccessfully: `${entity} deleted successfully`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to Update ${entity}`,
    failToDelete: `fail to delete ${entity}`,
    failToFetch: `fail to fetch ${entity}`
})

export const messages = {

    user: {
        ...generateMessage('User'),
        verifiedSuccessfully: 'User verified successfully',
        invalidCredentials: 'invalid credentials',
        loggedinSuccessfully: 'logged in successfully',
        loggedoutSuccessfully: 'logged out successfully',
        notAuthorized: 'not authorized'
    },
    token: {
        ...generateMessage('token'),
        invalidToken: 'invalid token'
    },
    company: {
        ...generateMessage('company')
    },
    job: {
        ...generateMessage('job')
    },
    application: {
        ...generateMessage('application')
    },
}