import type { ExpensePayer, ExpenseScope, InteriorCost, InteriorDeposit } from './types';
import { seoulDate } from './dates';

export const PAYER_LABELS: Record<ExpensePayer, string> = {
  company: '회사 자금', personal: '개인 선결제', customer: '고객 직접결제', unclassified: '결제 주체 미확인',
};
export const SCOPE_LABELS: Record<ExpenseScope, string> = {
  construction: '공사비', equipment: '장비·집기', operations: '행정·운영', incidental: '현장 부대비', unclassified: '비용 미분류', excluded: '현장 비용에서 제외',
};

export function fundsCsvCell(value: string | number) {
  const safe = typeof value === 'string' && /^(?:\s*[=+\-@]|[\t\r])/.test(value) ? "'" + value : String(value);
  return '"' + safe.replace(/"/g, '""') + '"';
}

// Classification is independent of card/cash/transfer and does not alter source amounts.
export function expensePayer(row: InteriorCost): ExpensePayer {
  if (row.payer && row.payer in PAYER_LABELS) return row.payer;
  if (row.source?.startsWith('지출내역!')) {
    if (row.payment === '직접구매') return 'customer'; // User confirmed all four source purchases.
    if (row.payment?.includes('조영철')) return 'personal';
    return 'company';
  }
  return 'unclassified';
}
export function expenseScope(row: InteriorCost): ExpenseScope {
  if (row.scope && row.scope in SCOPE_LABELS) return row.scope;
  if (['덕트', '전기', '목공', '금속', '설비', '대리석', '데코타일', '도장'].includes(row.category)) return 'construction';
  if (row.category === '주방기기') return 'equipment';
  if (row.category === '행정') return 'operations';
  if (['운임', '기타', '청소'].includes(row.category)) return 'incidental';
  return 'unclassified';
}
export const isPlannedExpense = (row: InteriorCost, today = seoulDate()) => row.estimated ?? (!row.source && row.date > today);
export const reimbursement = (row: InteriorCost) => expensePayer(row) === 'personal' && !isPlannedExpense(row) ? Math.min(row.cost, Math.max(0, row.reimbursedAmount || 0)) : 0;
export const companyOutflow = (row: InteriorCost) => isPlannedExpense(row) ? 0 : expensePayer(row) === 'company' ? row.cost : reimbursement(row);
export const needsFundsReview = (row: InteriorCost) => expensePayer(row) === 'unclassified' || expenseScope(row) === 'unclassified' || (expensePayer(row) === 'personal' && !isPlannedExpense(row) && !row.settlementConfirmed);
export const projectActualTotal = (rows: InteriorCost[]) => rows.filter(row => !isPlannedExpense(row) && expenseScope(row) !== 'excluded').reduce((sum, row) => sum + row.cost, 0);

export function summarizeFunds(rows: InteriorCost[], deposits: InteriorDeposit[]) {
  const actual = rows.filter(row => !isPlannedExpense(row));
  const sum = (payer: ExpensePayer) => actual.filter(row => expensePayer(row) === payer).reduce((total, row) => total + row.cost, 0);
  const received = deposits.reduce((total, row) => total + row.amount, 0);
  const companyDirect = sum('company');
  const reimbursed = actual.reduce((total, row) => total + reimbursement(row), 0);
  return {
    received, companyDirect, reimbursed, companyExecuted: companyDirect + reimbursed,
    balance: received - companyDirect - reimbursed,
    personal: sum('personal'), customerDirect: sum('customer'), unknownPayer: sum('unclassified'),
    projectActual: projectActualTotal(rows),
    excluded: actual.filter(row => expenseScope(row) === 'excluded').reduce((total, row) => total + row.cost, 0),
    planned: rows.filter(row => isPlannedExpense(row) && expenseScope(row) !== 'excluded').reduce((total, row) => total + row.cost, 0),
    settlementUnknown: actual.filter(row => expensePayer(row) === 'personal' && !row.settlementConfirmed).reduce((total, row) => total + row.cost, 0),
    personalUnsettled: actual.filter(row => expensePayer(row) === 'personal' && row.settlementConfirmed).reduce((total, row) => total + row.cost - reimbursement(row), 0),
    matrix: Object.keys(SCOPE_LABELS).map(scope => {
      const filtered = actual.filter(row => expenseScope(row) === scope);
      return { scope: scope as ExpenseScope, total: filtered.reduce((total, row) => total + row.cost, 0), payers: Object.fromEntries(Object.keys(PAYER_LABELS).map(payer => [payer, filtered.filter(row => expensePayer(row) === payer).reduce((total, row) => total + row.cost, 0)])) as Record<ExpensePayer, number> };
    }),
  };
}

export function validateFundExpense(row: InteriorCost, isNew = false): string {
  if (!row.item.trim() || !row.category.trim()) return '항목과 카테고리를 입력해 주세요.';
  if (!Number.isInteger(row.cost) || row.cost <= 0) return '지출 금액은 1원 이상의 정수로 입력해 주세요.';
  if (isNew && !row.date) return '지출 날짜를 입력해 주세요.';
  const paidBack = row.reimbursedAmount || 0;
  if (!Number.isInteger(paidBack) || paidBack < 0 || paidBack > row.cost) return '정산액은 0원부터 원래 지출액까지 입력할 수 있습니다.';
  if (paidBack && (expensePayer(row) !== 'personal' || isPlannedExpense(row))) return '개인 선결제의 실제 지출에만 정산액을 등록할 수 있습니다.';
  if (paidBack && row.reimbursementDate && row.reimbursementDate > seoulDate()) return '정산 날짜는 실제 지급한 날짜로 입력해 주세요. 미래 날짜는 사용할 수 없습니다.';
  return '';
}
