import dotenv from "dotenv"
import path from "path";
import { companyRouter,authRouter, userRouter } from "./modules/index.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import jobRouter from "./modules/job/job.routes.js";

export const bootstrap = (app, express) => {

    dotenv.config({ path: path.resolve('./config/.env') })
    
    app.use(express.json())
    
    app.use('/api/company',companyRouter)
    app.use('/api/auth',authRouter)
    app.use('/api/user',userRouter)
    app.use('/api/job',jobRouter)


    app.use(globalErrorHandler)

}