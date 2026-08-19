import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

function issueToken(user: { id: string; email: string; role: "EMPLOYEE" | "MANAGER" | "ADMIN" }) {
  return jwt.sign({ email: user.email, role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "2h"
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const name = z.string().min(2).parse(req.body.name);
    const departmentId = z.string().min(1).parse(req.body.departmentId);

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        departmentId
      },
      select: { id: true, name: true, email: true, role: true, departmentId: true }
    });

    res.status(201).json({ user, token: issueToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = credentialsSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId },
      token: issueToken(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, departmentId: true, department: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
