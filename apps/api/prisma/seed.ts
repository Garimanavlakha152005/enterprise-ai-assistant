import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering" }
  });

  const finance = await prisma.department.upsert({
    where: { name: "Finance" },
    update: {},
    create: { name: "Finance" }
  });

  const sales = await prisma.department.upsert({
    where: { name: "Sales" },
    update: {},
    create: { name: "Sales" }
  });

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash },
    create: { name: "Aarav Mehta", email: "admin@example.com", passwordHash, role: "ADMIN", departmentId: finance.id }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: { passwordHash },
    create: { name: "Priya Sharma", email: "manager@example.com", passwordHash, role: "MANAGER", departmentId: engineering.id }
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: { passwordHash },
    create: { name: "Rohan Patel", email: "employee@example.com", passwordHash, role: "EMPLOYEE", departmentId: engineering.id }
  });

  const financeEmployee = await prisma.user.upsert({
    where: { email: "finance@example.com" },
    update: { passwordHash },
    create: { name: "Neha Kapoor", email: "finance@example.com", passwordHash, role: "EMPLOYEE", departmentId: finance.id }
  });

  await prisma.expense.deleteMany();
  await prisma.reimbursement.deleteMany();
  await prisma.aIAction.deleteMany();

  const hotel = await prisma.expense.create({
    data: {
      employeeId: employee.id,
      amount: 4500,
      category: "Travel",
      description: "Hotel stay for client visit in Mumbai",
      expenseDate: new Date("2026-08-08"),
      status: "SUBMITTED"
    }
  });

  const flight = await prisma.expense.create({
    data: {
      employeeId: employee.id,
      amount: 8200,
      category: "Travel",
      description: "Return flight for customer workshop",
      expenseDate: new Date("2026-08-04"),
      status: "APPROVED"
    }
  });

  await prisma.expense.create({
    data: {
      employeeId: manager.id,
      amount: 1650,
      category: "Meals",
      description: "Team dinner",
      expenseDate: new Date("2026-08-11"),
      status: "APPROVED"
    }
  });

  await prisma.expense.create({
    data: {
      employeeId: financeEmployee.id,
      amount: 2300,
      category: "Software",
      description: "Finance reporting software renewal",
      expenseDate: new Date("2026-08-03"),
      status: "SUBMITTED"
    }
  });

  await prisma.reimbursement.create({
    data: {
      expenseId: hotel.id,
      employeeId: employee.id,
      amount: hotel.amount,
      status: "PENDING"
    }
  });

  await prisma.reimbursement.create({
    data: {
      expenseId: flight.id,
      employeeId: employee.id,
      amount: flight.amount,
      status: "APPROVED",
      approvedBy: manager.id,
      approvedAt: new Date("2026-08-06T10:30:00Z")
    }
  });

  await prisma.aIAction.create({
    data: {
      userId: employee.id,
      actionType: "VIEW_EXPENSE_SUMMARY",
      parameters: { scope: "self", period: "current_month" },
      status: "EXECUTED",
      result: { total: "12700" },
      executedAt: new Date("2026-08-12T09:00:00Z")
    }
  });

  console.log("Seeded users:", admin.email, manager.email, employee.email, financeEmployee.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
