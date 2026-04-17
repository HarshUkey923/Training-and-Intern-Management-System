import Program from "../models/Program.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import Intern from "../models/Intern.js";
import bcrypt from "bcryptjs";
import Mentor from "../models/Mentor.js";

export const CreateProgram = async (req, res) => {
    const program = await Program.create({
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        createdBy: req.user.id
    });

    res.status(201).json(program);
};

export const GetPrograms = async (req, res) => {
    const programs = await Program.find().populate("createdBy", "name email");
    res.status(200).json(programs);
};

export const FindProgramById = async (req, res) => {
    try {
        const programbyid = await Program.findById(req.params.id);
        if(!programbyid)
            return res.status(404).json({message: "Program not found."});
        res.status(200).json(programbyid);
    } catch (error) {
        console.error("Error fetching program:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }}

export const DeleteProgram = async (req, res) => {
    try {
        const deleteProgram = await Program.findByIdAndDelete(req.params.id);
        res.status(200).json(deleteProgram);
    } catch {
        console.log(error)
        res.status(500);
    }
}

export const GetInterns = async (req, res) => {
    const interns = await Intern.find();
    res.status(200).json(interns);
}

export const GetInternByProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate({
        path: "interns",
        model: "Intern",
        options: { sort: { name : 1}}
      });

    res.json(program.interns);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const AddIntern = async (req, res) => {
    const { name, gender, email, password, college, department, skills } = req.body;
 
    if (!name || !gender || !email || !password || !college || !department || !skills) {
        return res.status(400).json({ message: "Required fields missing." });
    }
 
    try {
        const hashed = await bcrypt.hash(password, 10);
 
        const user = await User.create({
            name,
            email,
            password: hashed,
            role: "Intern"
        });
 
        const intern = await Intern.create({
            name,
            gender,
            email,
            college,
            department,
            skills: skills.split(",").map((s) => s.trim()), 
            userId: user._id,
        });
 
        res.status(201).json({ intern, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const AssignInternToProgram = async (req, res) => {
  try {
    const { internId, programId } = req.body;

    const intern = await Intern.findByIdAndUpdate(
      internId,
      { programId },
      { new: true }
    );

    await Program.findByIdAndUpdate(
      programId,
      { $addToSet: { interns: internId } }
    );

    res.json({ message: "Intern assigned successfully", intern });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const AddMentor = async (req, res) => {
    const { name, email, password, specialization } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            role: "Mentor"
        });

        const mentor = await Mentor.create({
            name,
            email,
            specialization,
            userId: user._id
        });

        res.status(201).json({ mentor, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const GetMentors = async (req, res) => {
    const mentor = await Mentor.find();
    res.status(200).json(mentor);
}

export const GetMentorById = async (req, res) => {
    try {
    const program = await Program.findById(req.params.id)
      .populate({
        path: "mentors",
        model: "Mentor",
        options: { sort: { name : 1}}
      });

    res.json(program.mentors);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const AssignMentor = async (req, res) => {
    const { programId, mentorId } = req.body;

    const mentor = await Intern.findOneAndUpdate(
        { userId: programId },
        { mentorId },
        { new: true }
    )

    await Program.findByIdAndUpdate(
      programId,
      { $addToSet: { mentors: mentorId } }
    );

    res.json(mentor);
};

export const ApproveCertificate = async (req, res) => {
    const certificate = await Certificate.findOneAndUpdate(
        req.params.id,
        {
            apporved: true,
            issuedAt: new Data()
        },
        { new: true }
    );

    res.json(certificate)
};