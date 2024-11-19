
import fs from 'fs'
import { deleteCloudFile } from '../utils/cloud.js'
export const globalErrorHandler = async (err, req, res, next) => {

    const statusCode = err.statusCode || 500

    if (req.file)
        fs.unlinkSync(req.file.path)

    if (req.fail)
        await deleteCloudFile(req.fail.public_id)


    if (req.failImages?.length > 0) {
        for (const public_id of req.failImages) {

            await deleteCloudFile(public_id)

        }
    }


    return res.status(statusCode).json({ message: err.message || 'an unexpected error has occurred', success: false, error: err.stack })

}