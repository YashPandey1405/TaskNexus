import mongoose from "mongoose";

const DB_Connect = async () => {
  try {
    // As Database In In Another Continent.....
    await mongoose.connect(process.env.MONGO_URI_ATLAS);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("ERROR While Connecting With MongoDB", error);
    process.exit(1);
  }
};

export default DB_Connect;
