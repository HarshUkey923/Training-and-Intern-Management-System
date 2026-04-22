import Program    from "../models/Program.js";
import Task        from "../models/Task.js";
import Submission  from "../models/Submission.js";
import Intern      from "../models/Intern.js";
import Mentor      from "../models/Mentor.js";
import Certificate from "../models/Certificate.js";

export const GetOverview = async (req, res) => {
  try {
    const [programs, interns, mentors, tasks, submissions] = await Promise.all([
      Program.countDocuments(),
      Intern.countDocuments(),
      Mentor.countDocuments(),
      Task.countDocuments(),
      Submission.countDocuments(),
    ]);
    const taskBreakdown = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json({ programs, interns, mentors, tasks, submissions, taskBreakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetInternReports = async (req, res) => {
  try {
    const interns = await Intern.find().lean();
    const reports = await Promise.all(interns.map(async (intern) => {
      const tasks       = await Task.find({ internId: intern._id });
      const submissions = await Submission.find({ internId: intern._id });
      const pending     = tasks.filter(t => t.status === "Pending").length;
      const submitted   = tasks.filter(t => t.status === "Submitted").length;
      const reviewed    = tasks.filter(t => t.status === "Reviewed").length;
      const ratings     = submissions.filter(s => s.rating).map(s => s.rating);
      const avgRating   = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;
      const program = await Program.findOne({ interns: intern._id }).select("title duration");
      return {
        intern, program,
        totalTasks: tasks.length,
        pending, submitted, reviewed,
        totalSubmissions: submissions.length,
        avgRating,
        progress: tasks.length ? Math.round((reviewed / tasks.length) * 100) : 0,
      };
    }));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetProgramReports = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate("interns", "name email")
      .populate("mentors", "name email specialization")
      .lean();
    const reports = await Promise.all(programs.map(async (prog) => {
      const internIds = prog.interns.map(i => i._id);
      const tasks     = await Task.find({ internId: { $in: internIds }, programId: prog._id });
      const reviewed  = tasks.filter(t => t.status === "Reviewed").length;
      const progress  = tasks.length ? Math.round((reviewed / tasks.length) * 100) : 0;
      return { ...prog, totalTasks: tasks.length, reviewed, progress };
    }));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Issue certificate — now stores title (Mr./Ms./Mrs./Dr.) ─────────────────
export const IssueCertificate = async (req, res) => {
  try {
    const { internId, programId, title } = req.body;

    const existing = await Certificate.findOne({ internId, programId });
    if (existing) {
      return res.status(400).json({ message: "Certificate already issued for this intern and program." });
    }

    const certificate = await Certificate.create({
      internId,
      programId,
      issuedBy: req.user.id,
      title:    title || "Mr.",
      issuedAt: new Date(),
      approved: true,
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate("internId",  "name email college")
      .populate("programId", "title duration")
      .populate("issuedBy",  "name")
      .sort({ issuedAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
