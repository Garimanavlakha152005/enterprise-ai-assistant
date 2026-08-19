import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const user = req.user!;
    const where = user.role === "EMPLOYEE" ? { employeeId: user.id } : {};

    const [expenseAggregate, pendingReimbursements, recentExpenses, recentAiActions] = await Promise.all([
      prisma.expense.aggregate({ _sum: { amount: true }, where }),
      prisma.reimbursement.count({
        where: user.role === "EMPLOYEE" ? { employeeId: user.id, status: "PENDING" } : { status: "PENDING" }
      }),
      prisma.expense.findMany({
        where,
        orderBy: { expenseDate: "desc" },
        take: 5,
        select: { id: true, amount: true, category: true, description: true, expenseDate: true, status: true }
      }),
      prisma.aIAction.findMany({
        where: user.role === "EMPLOYEE" ? { userId: user.id } : {},
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, actionType: true, status: true, createdAt: true }
      })
    ]);

    res.json({
      totalExpenses: expenseAggregate._sum.amount?.toString() ?? "0",
      pendingReimbursements,
      recentExpenses,
      recentAiActions
    });
  } catch (error) {
    next(error);
  }
});

export default router;
