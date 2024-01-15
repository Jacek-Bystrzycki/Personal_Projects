import mongoose from 'mongoose';

const connectDB = async (uri: string): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
  } catch (error) {}
};

export default connectDB;
