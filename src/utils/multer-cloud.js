import multer from "multer"
import { AppError } from "./AppError.js"

export const allowedFilesTypes = {
    file: ['application/pdf']
}
export const cloudUpload = ({ allowFile = allowedFilesTypes.file } = {}) => {
    const storage = multer.diskStorage({})

    const fileFilter = (req, file, cb) => {

        if (!allowFile.includes(file.mimetype))
            return cb(new appError('images only please', 401), false)
        cb(null, true)
    }

    const upload = multer({
        storage, fileFilter
    })
    return upload
}

