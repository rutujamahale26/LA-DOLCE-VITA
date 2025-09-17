import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Error in connecting DB', error.message);
  }
};







// 8AXORBAO3MZd587u
// rutujamahale26_db_user
// mongodb+srv://rutujamahale26_db_user:8AXORBAO3MZd587u@cluster0.eutjjje.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0