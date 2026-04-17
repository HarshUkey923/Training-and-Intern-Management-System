import mongoose from "mongoose";

const Certificate = new mongoose.Schema({
  internId:  { type: mongoose.Schema.Types.ObjectId, ref: "Intern",   required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program",  required: true },
  issuedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  issuedAt:  { type: Date, default: Date.now },
  approved:  { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Certificate", Certificate);
