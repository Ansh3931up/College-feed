import mongoose from 'mongoose'
const connectDB=async()=>{
    try {
        const Connection=await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`your database is connected to the ${Connection.connection.host}`)

    } catch (error) {
        console.log(error);
        process.exit(1)
        
    }
}
// mongodb+srv://ANSH_39:ansh3931@cluster0.o3kp0fp.mongodb.net//lms
export default connectDB;