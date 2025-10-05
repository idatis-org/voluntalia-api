const skillService = require('../services/skillService');

exports.create = async (req, res, next) => {
    try {
        const { name } = req.body;
        const sub = req.user.sub;
        if (!name) return res.status(400).json({ error: "name is required" });
        const skill = await skillService.create(name, sub);
        res.status(201).json({skill});
    } catch (err) {
        next(err);
    }
}

exports.getAllSkills = async (req, res, next) => {
    try {
        const skills = await skillService.getAll();
        res.status(201).json({skills});
    } catch (err) {
        next(err);
    }
}

// ! Coordinator-only: update an existing skill
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await skillService.update(name, id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: delete skill
exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    await skillService.deleteSkill(id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: assign a volunteer to a skill
exports.assignSkill = async (req, res, next) => {
  try {
    const { id } = req.params; // skill id
    const { volunteer_id } = req.body;

    // ! Validate required field
    if (!volunteer_id)
      return res.status(400).json({ error: "volunteer_id required" });

    await skillService.assignSkill(id, volunteer_id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ! Coordinator-only: remove a volunteer from a skill
exports.unassignSkill = async (req, res, next) => {
  try {
    const { id } = req.params; // activity id
    const { volunteer_id } = req.body;

    // ! Validate required field
    if (!volunteer_id)
      return res.status(400).json({ error: "volunteer_id required" });

    await skillService.unassignSkill(id, volunteer_id);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};