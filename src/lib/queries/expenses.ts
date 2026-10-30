import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  billAccounts, bills, buildings, cashAccounts, expenseCategories, expenseEntries, funds, maintenanceLogs, rooms,
} from "@/db/schema";
import { ensureTenant } from "./auth";

export async function getExpenseCategories() {
  const tenant = await ensureTenant();
  return db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.tenantId, tenant.id))
    .orderBy(asc(expenseCategories.sortOrder), asc(expenseCategories.name));
}

export async function getExpenses(from: string, to: string) {
  const tenant = await ensureTenant();
  return db
    .select({
      id: expenseEntries.id,
      voucherNumber: expenseEntries.voucherNumber,
      amount: expenseEntries.amount,
      payee: expenseEntries.payee,
      category: expenseEntries.category,
      categoryId: expenseEntries.categoryId,
      description: expenseEntries.description,
      date: expenseEntries.date,
      accountId: expenseEntries.accountId,
      accountName: cashAccounts.name,
      fundId: expenseEntries.fundId,
      fundName: funds.name,
      photoPath: expenseEntries.photoPath,
      sourceType: expenseEntries.sourceType,
      createdAt: expenseEntries.createdAt,
      updatedAt: expenseEntries.updatedAt,
    })
    .from(expenseEntries)
    .leftJoin(cashAccounts, eq(expenseEntries.accountId, cashAccounts.id))
    .leftJoin(funds, eq(expenseEntries.fundId, funds.id))
    .where(and(eq(expenseEntries.tenantId, tenant.id), gte(expenseEntries.date, from), lte(expenseEntries.date, to)))
    .orderBy(desc(expenseEntries.date), desc(expenseEntries.createdAt));
}

export async function getBillAccounts() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: billAccounts.id,
      name: billAccounts.name,
      consumerNumber: billAccounts.consumerNumber,
      categoryId: billAccounts.categoryId,
      categoryName: expenseCategories.name,
      isActive: billAccounts.isActive,
      notes: billAccounts.notes,
    })
    .from(billAccounts)
    .leftJoin(expenseCategories, eq(billAccounts.categoryId, expenseCategories.id))
    .where(eq(billAccounts.tenantId, tenant.id))
    .orderBy(asc(billAccounts.name));
}

export async function getBills(limit = 200) {
  const tenant = await ensureTenant();
  return db
    .select({
      id: bills.id,
      billAccountId: bills.billAccountId,
      accountLabel: billAccounts.name,
      consumerNumber: billAccounts.consumerNumber,
      year: bills.year,
      month: bills.month,
      amount: bills.amount,
      dueDate: bills.dueDate,
      paidDate: bills.paidDate,
      accountId: bills.accountId,
      paidVia: cashAccounts.name,
      note: bills.note,
    })
    .from(bills)
    .innerJoin(billAccounts, eq(bills.billAccountId, billAccounts.id))
    .leftJoin(cashAccounts, eq(bills.accountId, cashAccounts.id))
    .where(eq(bills.tenantId, tenant.id))
    .orderBy(desc(bills.year), desc(bills.month), asc(billAccounts.name))
    .limit(limit);
}

export async function getUnpaidBills() {
  const tenant = await ensureTenant();
  return db
    .select({
      id: bills.id,
      accountLabel: billAccounts.name,
      year: bills.year,
      month: bills.month,
      amount: bills.amount,
      dueDate: bills.dueDate,
    })
    .from(bills)
    .innerJoin(billAccounts, eq(bills.billAccountId, billAccounts.id))
    .where(and(eq(bills.tenantId, tenant.id), isNull(bills.paidDate)))
    .orderBy(asc(bills.dueDate));
}

export async function getMaintenanceLogs(buildingId?: string, roomId?: string) {
  const tenant = await ensureTenant();
  const filters = [eq(maintenanceLogs.tenantId, tenant.id)];
  if (buildingId) filters.push(eq(maintenanceLogs.buildingId, buildingId));
  if (roomId) filters.push(eq(maintenanceLogs.roomId, roomId));
  return db
    .select({
      id: maintenanceLogs.id,
      date: maintenanceLogs.date,
      buildingId: maintenanceLogs.buildingId,
      buildingName: buildings.name,
      roomId: maintenanceLogs.roomId,
      roomName: rooms.name,
      area: maintenanceLogs.area,
      work: maintenanceLogs.work,
      doneBy: maintenanceLogs.doneBy,
      cost: maintenanceLogs.cost,
      status: maintenanceLogs.status,
      photoPath: maintenanceLogs.photoPath,
      paidDate: maintenanceLogs.paidDate,
      accountId: maintenanceLogs.accountId,
      paidVia: cashAccounts.name,
    })
    .from(maintenanceLogs)
    .leftJoin(buildings, eq(maintenanceLogs.buildingId, buildings.id))
    .leftJoin(rooms, eq(maintenanceLogs.roomId, rooms.id))
    .leftJoin(cashAccounts, eq(maintenanceLogs.accountId, cashAccounts.id))
    .where(and(...filters))
    .orderBy(desc(maintenanceLogs.date), desc(maintenanceLogs.createdAt));
}
