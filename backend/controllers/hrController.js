import Program from "../models/Program.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import Intern from "../models/Intern.js";
import bcrypt from "bcryptjs";
import Mentor from "../models/Mentor.js";

export const CreateProgram = async (req, res) => {
    try {
        const program = await Program.create({ title: req.body.title, description: req.body.description, duration: req.body.duration, createdBy: req.user.id });
        res.status(201).json(program);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const GetPrograms = async (req, res) => {
    try {
        const programs = await Program.find().populate("createdBy", "name email");
        res.status(200).json(programs);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const FindProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ message: "Program not found." });
        res.status(200).json(program);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const DeleteProgram = async (req, res) => {
    try {
        const deleted = await Program.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const GetInterns = async (req, res) => {
    try {
        const interns = await Intern.find().sort({ name: 1 });
        res.status(200).json(interns);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const GetInternByProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate({ path: "interns", model: "Intern", options: { sort: { name: 1 } } });
        res.json(program.interns);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const AddIntern = async (req, res) => {
    const { name, gender, email, password, college, department, skills } = req.body;
    if (!name || !email || !password || !college || !department || !skills)
        return res.status(400).json({ message: "Required fields missing." });
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user   = await User.create({ name, email, password: hashed, role: "Intern" });
        const intern = await Intern.create({ name, gender, email, college, department, skills: skills.split(",").map(s => s.trim()), userId: user._id });
        res.status(201).json({ intern, user });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const DeleteIntern = async (req, res) => {
    try {
        const intern = await Intern.findByIdAndDelete(req.params.id);
        if (!intern) return res.status(404).json({ message: "Intern not found." });
        await Program.updateMany({}, { $pull: { interns: intern._id } });
        if (intern.userId) await User.findByIdAndDelete(intern.userId);
        res.status(200).json({ message: "Intern deleted successfully." });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const AssignInternToProgram = async (req, res) => {
    try {
        const { internId, programId } = req.body;
        const intern = await Intern.findByIdAndUpdate(internId, { programId }, { new: true });
        await Program.findByIdAndUpdate(programId, { $addToSet: { interns: internId } });
        res.json({ message: "Intern assigned successfully", intern });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const RemoveInternFromProgram = async (req, res) => {
    try {
        const { programId, internId } = req.body;
        await Program.findByIdAndUpdate(programId, { $pull: { interns: internId } });
        await Intern.findOneAndUpdate({ _id: internId, programId }, { $unset: { programId: "" } });
        res.json({ message: "Intern removed from program." });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const AddMentor = async (req, res) => {
    const { name, email, password, specialization } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user   = await User.create({ name, email, password: hashed, role: "Mentor" });
        const mentor = await Mentor.create({ name, email, specialization, userId: user._id });
        res.status(201).json({ mentor, user });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const GetMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find().sort({ name: 1 });
        res.status(200).json(mentors);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const DeleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndDelete(req.params.id);
        if (!mentor) return res.status(404).json({ message: "Mentor not found." });
        await Program.updateMany({}, { $pull: { mentors: mentor._id } });
        if (mentor.userId) await User.findByIdAndDelete(mentor.userId);
        res.status(200).json({ message: "Mentor deleted successfully." });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const GetMentorById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate({ path: "mentors", model: "Mentor", options: { sort: { name: 1 } } });
        res.json(program.mentors);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const AssignMentor = async (req, res) => {
    try {
        const { programId, mentorId } = req.body;
        await Program.findByIdAndUpdate(programId, { $addToSet: { mentors: mentorId } });
        res.json({ message: "Mentor assigned successfully." });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ─── Remove mentor from a specific program ────────────────────────────────────
export const RemoveMentorFromProgram = async (req, res) => {
    try {
        const { programId, mentorId } = req.body;
        await Program.findByIdAndUpdate(programId, { $pull: { mentors: mentorId } });
        res.json({ message: "Mentor removed from program." });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const ApproveCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id, { approved: true, issuedAt: new Date() }, { new: true }
        );
        res.json(certificate);
    } catch (error) { res.status(500).json({ message: error.message }); }
};