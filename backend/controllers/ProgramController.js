import Program from "../models/Program.js";
import Intern  from "../models/Intern.js";
import User    from "../models/User.js";

// ─── Helper: resolve Intern doc from JWT user id ──────────────────────────────
const getInternFromUser = async (userId) => {
  let intern = await Intern.findOne({ userId });
  if (!intern) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    intern = await Intern.findOne({ email: user.email });
  }
  if (!intern) throw new Error("Intern profile not found");
  // backfill userId for future lookups
  if (!intern.userId) { intern.userId = userId; await intern.save(); }
  return intern;
};

export const CreateProgram = async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const program = await Program.create({ title, description, duration, createdBy: req.user.id });
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("createdBy", "name email");
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Fix: look up Intern._id first, then query programs ──────────────────────
export const GetInternProgram = async (req, res) => {
  try {
    const intern = await getInternFromUser(req.user.id);

    const programs = await Program.find({ interns: intern._id })
      .populate("createdBy", "name email")
      .populate({
        path: "mentors",
        model: "Mentor",
        select: "name email specialization",
      });

    if (!programs.length) {
      return res.status(404).json({ message: "No program assigned to you yet." });
    }

    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const UpdateProgram = async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const program = await Program.findById(req.params.programId);
    if (!program) return res.status(404).json({ message: "Program not found." });

    program.title       = title       || program.title;
    program.description = description || program.description;
    program.duration    = duration    || program.duration;
    await program.save();

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
