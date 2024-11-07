import mongoose from 'mongoose';

const connectMongo = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI!, {
      });
      console.log('MongoDB bağlantısı başarılı!');
    } catch (error) {
      console.error('MongoDB bağlantısı başarısız:', error);
    }
  }
};

export default connectMongo;
