import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  bgmiId: { type: String, required: true },
  bgmiName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  whatsapp: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
});

const User = mongoose.model("User", UserSchema);
export default User;
