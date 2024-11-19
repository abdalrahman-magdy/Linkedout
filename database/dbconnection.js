import mongoose from "mongoose"
export const connectDB = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log(`connected to database successfully to linkedout ${process.env.DB_URL}`);

    }).catch((error) => {
        console.error(error);
    })
}
