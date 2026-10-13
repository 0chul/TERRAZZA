import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, Plus, Download, Edit2, Trash2, Check, X, ArrowUpDown } from 'lucide-react';
import type { ExpensePayer, ExpenseScope, InteriorCost, InteriorDeposit } from '../types';
import { DEFAULT_INTERIOR_DEPOSITS, FINANCE_SOURCE } from '../defaultInteriorCosts';
import { dbService } from '../db';
import { seoulDate } from '../dates';
import { PAYER_LABELS, SCOPE_LABELS, expensePayer, expenseScope, isPlannedExpense, reimbursement, companyOutflow, needsFundsReview, summarizeFunds, validateFundExpense, fundsCsvCell } from '../funds';
import './operations.css';
import './funds.css';

const DEPOSIT_KEY = 'terrazza_interior_deposits_v2';
const won = (value: number) => value.toLocaleString('ko-KR') + '원';
const readDeposits = () => {
  try {
    const raw = localStorage.getItem(DEPOSIT_KEY);
    if (!raw) return { rows: DEFAULT_INTERIOR_DEPOSITS, error: '' };
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || !rows.every(row => typeof row.id === 'string' && Number.isFinite(row.amount) && typeof row.date === 'string' && typeof row.note === 'string')) throw new Error();
    return { rows: rows as InteriorDeposit[], error: '' };
  } catch { return { rows: DEFAULT_INTERIOR_DEPOSITS, error: '기존 입금 기록을 읽지 못했습니다. 엑셀 기준 입금을 표시하며 기존 저장값은 유지합니다.' }; }
};
const emptyExpense = (): InteriorCost => ({ id: '', date: seoulDate(), category: '', item: '', cost: 0, payment: '계좌이체', estimated: false, payer: 'company', scope: 'construction', reimbursedAmount: 0, settlementConfirmed: false });
const editableExpense = (row: InteriorCost): InteriorCost => ({ ...row, payer: expensePayer(row), scope: expenseScope(row), estimated: isPlannedExpense(row), reimbursedAmount: reimbursement(row) });
const displayDate = (row: InteriorCost) => row.date || (row.rawDate === '2026-10-0' ? '2026-10 · 일자 미확인' : '일자 미확인');

const download = (text: string, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const DateInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => <label>{label}<input aria-label={label} type="date" value={value} onInput={event => onChange(event.currentTarget.value)} onChange={event => onChange(event.target.value)} /></label>;
const ExpenseEditor: React.FC<{ row: InteriorCost; onChange: (row: InteriorCost) => void; onSave: () => void; onCancel: () => void }> = ({ row, onChange, onSave, onCancel }) => <section className="ops-panel funds-editor">
  <div className="ops-section-head"><h2>{row.id ? '지출 수정' : '지출 등록'}</h2><button className="ops-text-button" onClick={onCancel}><X size={16} /> 닫기</button></div>
  <div className="funds-form-grid">
    <DateInput label="지출 날짜" value={row.date} onChange={value => onChange({ ...row, date: value, rawDate: value ? null : row.rawDate })} />
    <label>항목<input aria-label="지출 항목" value={row.item} onChange={event => onChange({ ...row, item: event.target.value })} /></label>
    <label>카테고리<input aria-label="지출 카테고리" placeholder="예: 전기, 목공, 운임" value={row.category} onChange={event => onChange({ ...row, category: event.target.value })} /></label>
    <label>금액 (원)<input aria-label="지출 금액" type="number" min={1} step={1} value={row.cost || ''} onChange={event => onChange({ ...row, cost: Number(event.target.value) })} /></label>
    <label>결제 주체<select aria-label="지출 결제 주체" value={row.payer} onChange={event => onChange({ ...row, payer: event.target.value as ExpensePayer, reimbursedAmount: 0, reimbursementDate: '', settlementConfirmed: false })}>{Object.entries(PAYER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>비용 구분<select aria-label="지출 비용 구분" value={row.scope} onChange={event => onChange({ ...row, scope: event.target.value as ExpenseScope })}>{Object.entries(SCOPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>지출 상태<select aria-label="지출 상태" value={row.estimated ? 'planned' : 'actual'} onChange={event => onChange({ ...row, estimated: event.target.value === 'planned' })}><option value="actual">실제 지출</option><option value="planned">예상 지출</option></select></label>
    <label>원문 결제표시 / 결제수단<input aria-label="지출 결제수단" value={row.payment || ''} onChange={event => onChange({ ...row, payment: event.target.value })} /></label>
  </div>
  <label className="ops-note">내용·메모<textarea aria-label="지출 메모" rows={2} value={row.details || ''} onChange={event => onChange({ ...row, details: event.target.value })} /></label>
  {row.payer === 'personal' && !row.estimated && <div className="funds-settlement"><h3>개인 선결제 정산</h3><p className="ops-muted">회사에서 실제로 돌려준 금액을 기록하세요. 원래 지출은 한 번만 실비로 계산하고, 정산액은 회사 자금 집행에 반영합니다.</p><div className="funds-form-grid"><label>회사에서 지급한 정산액 (원)<input aria-label="개인 선결제 정산액" type="number" min={0} max={row.cost} step={1} value={row.reimbursedAmount || 0} onChange={event => onChange({ ...row, reimbursedAmount: Number(event.target.value), settlementConfirmed: Number(event.target.value) > 0 ? true : row.settlementConfirmed })} /></label><DateInput label="정산 날짜" value={row.reimbursementDate || ''} onChange={value => onChange({ ...row, reimbursementDate: value })} /><label>정산 여부 확인<select aria-label="정산 여부 확인" value={row.settlementConfirmed ? 'confirmed' : 'unknown'} onChange={event => onChange({ ...row, settlementConfirmed: event.target.value === 'confirmed' })}><option value="unknown">확인 필요</option><option value="confirmed">현재 정산 내역 확인함</option></select></label></div></div>}
  <div className="ops-actions" style={{ marginTop: 18 }}><button className="ops-button" onClick={onSave}><Check size={16} /> 지출 저장</button><button className="ops-button" onClick={onCancel}>취소</button></div>
</section>;

type FundsView = 'project' | 'all' | 'company' | 'personal' | 'customer' | 'construction' | 'review';
interface Filters { view: FundsView; payer: string; scope: string; status: string; search: string }
const defaultFilters: Filters = { view: 'project', payer: 'all', scope: 'all', status: 'actual', search: '' };

export const FundsTab: React.FC = () => {
  const [costs, setCosts] = useState<InteriorCost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [initialDeposits] = useState(readDeposits);
  const [deposits, setDeposits] = useState<InteriorDeposit[]>(initialDeposits.rows);
  const [depositsChanged, setDepositsChanged] = useState(false);
  const [error, setError] = useState(initialDeposits.error);
  const [showReceipts, setShowReceipts] = useState(false);
  const [receipt, setReceipt] = useState<InteriorDeposit | null>(null);
  const [expense, setExpense] = useState<InteriorCost | null>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState<{ key: 'date' | 'cost' | 'item'; asc: boolean }>({ key: 'date', asc: true });
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPayer, setBulkPayer] = useState('');
  const [bulkScope, setBulkScope] = useState('');
  const [busy, setBusy] = useState(false);
  const [oldDeposits] = useState<InteriorDeposit[]>(() => { try { const data = JSON.parse(localStorage.getItem('terrazza_interior_deposits') || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } });
  useEffect(() => {
    let alive = true;
    (async () => { try { await dbService.importFinanceSource(); const data = await dbService.getAllInteriorCosts(); if (alive) { setCosts(data); setLoaded(true); } } catch { if (alive) setError('지출 내역을 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.'); } })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!depositsChanged) return;
    try { localStorage.setItem(DEPOSIT_KEY, JSON.stringify(deposits)); }
    catch { setError('입금 기록을 브라우저에 저장하지 못했습니다.'); }
  }, [deposits, depositsChanged]);
  const totals = useMemo(() => summarizeFunds(costs, deposits), [costs, deposits]);
  const changeFilters = (next: Filters) => { setFilters(next); setSelected([]); };
  const chooseView = (view: FundsView) => changeFilters({ view, payer: ['personal','customer'].includes(view) ? view : 'all', scope: view === 'construction' ? 'construction' : 'all', status: view === 'all' ? 'all' : 'actual', search: '' });
  const visible = useMemo(() => costs.filter(row => {
    if (filters.view === 'project' && expenseScope(row) === 'excluded') return false;
    if (filters.view === 'company' && companyOutflow(row) <= 0) return false;
    if (filters.view === 'review' && !needsFundsReview(row)) return false;
    if (filters.payer !== 'all' && expensePayer(row) !== filters.payer) return false;
    if (filters.scope !== 'all' && expenseScope(row) !== filters.scope) return false;
    if (filters.status !== 'all' && isPlannedExpense(row) !== (filters.status === 'planned')) return false;
    return `${row.item} ${row.category} ${row.details || ''} ${row.payment || ''}`.toLocaleLowerCase().includes(filters.search.toLocaleLowerCase());
  }).sort((a,b) => (sort.key === 'cost' ? (filters.view === 'company' ? companyOutflow(a)-companyOutflow(b) : a.cost - b.cost) : (a[sort.key] || '9999').localeCompare(b[sort.key] || '9999')) * (sort.asc ? 1 : -1)), [costs, filters, sort]);
  const visibleAmount = (row: InteriorCost) => filters.view === 'company' ? companyOutflow(row) : row.cost;
  const visibleTotal = visible.reduce((sum,row) => sum + visibleAmount(row),0);
  const saveExpense = async () => {
    if (!expense || busy) return;
    const issue = validateFundExpense(expense, !expense.id); if (issue) { setError(issue); return; }
    const row = { ...expense, id: expense.id || crypto.randomUUID(), item: expense.item.trim(), category: expense.category.trim(), settlementConfirmed: !!expense.settlementConfirmed || (expense.reimbursedAmount || 0) > 0 };
    setBusy(true);
    try { await dbService.saveInteriorCost(row); setCosts(prev => prev.some(item => item.id === row.id) ? prev.map(item => item.id === row.id ? row : item) : [...prev,row]); setExpense(null); setError(''); }
    catch { setError('지출 기록을 저장하지 못했습니다.'); }
    finally { setBusy(false); }
  };
  const applyBulk = async () => {
    if (!selected.length || (!bulkPayer && !bulkScope) || busy) return;
    const updated = costs.filter(row => selected.includes(row.id)).map(row => ({ ...editableExpense(row), ...(bulkPayer ? { payer: bulkPayer as ExpensePayer } : {}), ...(bulkScope ? { scope: bulkScope as ExpenseScope } : {}) }));
    if (updated.some(row => expensePayer(row) !== 'personal' && (row.reimbursedAmount || 0) > 0)) { setError('정산 기록이 있는 개인 지출은 개별 수정에서 정산 내역을 확인한 뒤 결제 주체를 변경하세요.'); return; }
    setBusy(true);
    try { await dbService.saveInteriorCosts(updated); setCosts(prev => prev.map(row => updated.find(item => item.id === row.id) || row)); setSelected([]); setBulkPayer(''); setBulkScope(''); setError(''); }
    catch { setError('선택한 내역을 저장하지 못했습니다.'); }
    finally { setBusy(false); }
  };
  const saveReceipt = () => {
    if (!receipt || !Number.isInteger(receipt.amount) || receipt.amount <= 0 || (!receipt.id && !receipt.date)) { setError('입금 날짜와 1원 이상의 금액을 입력해 주세요.'); return; }
    const row = { ...receipt, id: receipt.id || crypto.randomUUID(), note: receipt.note.trim() || '고객 입금' };
    setDeposits(prev => prev.some(item => item.id === row.id) ? prev.map(item => item.id === row.id ? row : item) : [...prev,row]); setDepositsChanged(true); setReceipt(null); setError('');
  };
  const exportExpenses = () => {
    const lines: (string | number)[][] = [['날짜','항목','카테고리','비용 구분','결제 주체','원문 결제표시','원 지출액(원)','회사 집행액(원)','지출 상태','회사 정산액(원)','정산일','정산 확인','내용','출처'], ...visible.map(row => [row.date || row.rawDate || '',row.item,row.category,SCOPE_LABELS[expenseScope(row)],PAYER_LABELS[expensePayer(row)],row.payment || '',row.cost,companyOutflow(row),isPlannedExpense(row)?'예상':'실제',reimbursement(row),row.reimbursementDate || '',expensePayer(row)==='personal'?(row.settlementConfirmed?'확인':'미확인'):'해당 없음',row.details || '',row.source || '사용자 입력'])];
    download('\uFEFF'+lines.map(line => line.map(fundsCsvCell).join(',')).join('\r\n'),'TERRAZZA-자금집행-지출.csv','text/csv;charset=utf-8');
  };

  if (!loaded) return <div className="ops-page funds-page"><h1>자금 집행</h1><p role="status" className="ops-notice">{error || '저장된 자금 집행 내역을 불러오고 있습니다.'}</p></div>;
  return <div className="ops-page funds-page">
    <div className="ops-heading"><div><p className="ops-eyebrow">TERRAZZA · FUNDS</p><h1>자금 집행</h1><p>고객 입금, 회사의 실제 집행, 현장 전체 실비를 구분해 확인합니다.</p></div><button className="ops-button" onClick={() => { setExpense(emptyExpense()); setError(''); }}><Plus size={16} /> 지출 등록</button></div>
    <div className="funds-source"><strong>고객 입금은 한 원천으로 통합했습니다.</strong> 엑셀의 직접구매 4건은 고객 직접결제, 조영철 카드 4건은 개인 선결제로 분리했습니다. 결제 주체와 비용 구분은 각 내역에서 수정할 수 있습니다.</div>
    {error && <p className="ops-notice" role="alert">{error}</p>}
    <div className="funds-summary">
      <div className="ops-stat"><span>고객에게 받은 돈</span><strong>{won(totals.received)}</strong><button className="ops-text-button" onClick={() => setShowReceipts(value => !value)}>{showReceipts?'입금 내역 닫기':'고객 입금 내역 보기'}</button></div>
      <div className="ops-stat"><span>회사 자금 실제 집행</span><strong>{won(totals.companyExecuted)}</strong><span>회사 직접결제 {won(totals.companyDirect)}<br />등록된 개인 정산 {won(totals.reimbursed)}</span></div>
      <div className="ops-stat"><span>관리자금 계산 잔액</span><strong style={{color:totals.balance < 0?'#fda4af':'#b7d6b5'}}>{won(totals.balance)}</strong><span>고객 입금 − 회사 실제 집행<br />예상 지출과 고객 직접결제 제외</span></div>
      <div className="ops-stat"><span>현장 총실비</span><strong>{won(totals.projectActual)}</strong><span>회사·개인·고객의 실제 비용 합계<br />정산 중복·예상·제외 비용은 미포함</span></div>
    </div>
    <div className="funds-separate">
      <button onClick={() => chooseView('personal')}><span>개인 선결제</span><strong>{won(totals.personal)}</strong><small>정산 확인 필요 {won(totals.settlementUnknown)} · 확인된 미정산 {won(totals.personalUnsettled)}</small></button>
      <button onClick={() => chooseView('customer')}><span>고객 직접결제</span><strong>{won(totals.customerDirect)}</strong><small>회사 자금에서는 빠져나가지 않은 현장 비용</small></button>
      <button onClick={() => chooseView('review')}><span>분류·정산 확인</span><strong>{costs.filter(needsFundsReview).length}건</strong><small>결제 주체 미확인 {won(totals.unknownPayer)} · 개인 정산 여부 확인</small></button>
    </div>
    <p className="ops-muted">잔액은 등록된 입출금으로 계산합니다. 개인 정산 여부가 미확인인 금액은 회사 집행에 추가하지 않았습니다. 예상 지출 {won(totals.planned)}은 별도로 관리합니다.</p>

    {showReceipts && <section className="ops-panel"><div className="ops-section-head"><h2>고객 입금 내역</h2><button className="ops-button" onClick={() => setReceipt({id:'',date:seoulDate(),amount:0,note:'고객 입금'})}><Plus size={16} /> 입금 등록</button></div>
      {receipt && <div className="funds-editor"><div className="funds-form-grid"><DateInput label="입금 날짜" value={receipt.date} onChange={value => setReceipt({...receipt,date:value})} /><label>입금 적요<input aria-label="입금 적요" value={receipt.note} onChange={event => setReceipt({...receipt,note:event.target.value})} /></label><label>입금액 (원)<input aria-label="입금액" type="number" min={1} step={1} value={receipt.amount || ''} onChange={event => setReceipt({...receipt,amount:Number(event.target.value)})} /></label></div><div className="ops-actions" style={{margin:'16px 0'}}><button className="ops-button" onClick={saveReceipt}>입금 저장</button><button className="ops-button" onClick={() => setReceipt(null)}>취소</button></div></div>}
      <div className="ops-table-wrap"><table className="ops-table" style={{minWidth:650}}><thead><tr><th>입금일</th><th>적요 / 출처</th><th>금액</th><th>관리</th></tr></thead><tbody>{[...deposits].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')).map(row => <tr key={row.id}><td>{row.date || '입금일 미확인'}</td><td>{row.note}<small>{row.source}</small></td><td>{won(row.amount)}</td><td><div className="ops-actions"><button aria-label={`${row.note} 입금 수정`} onClick={() => setReceipt({...row})}><Edit2 size={15}/></button><button aria-label={`${row.note} 입금 삭제`} onClick={() => { if(window.confirm('이 고객 입금 내역을 삭제하시겠습니까?')) {setDeposits(prev=>prev.filter(item=>item.id!==row.id));setDepositsChanged(true);} }}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>
      <p className="ops-muted">원문에 가수금으로 표시된 입금도 고객이 준 돈으로 확인되어 함께 집계합니다. 추가 입금 3,000,000원의 날짜는 확인 후 입력하세요.</p></section>}

    <section className="ops-panel"><div className="ops-section-head"><h2><Wallet size={20}/> 비용 종류와 결제 주체</h2><span className="ops-muted">실제 지출 기준</span></div><div className="ops-table-wrap"><table className="ops-table funds-matrix"><thead><tr><th>비용 구분</th><th>회사 최초결제</th><th>개인 최초결제</th><th>고객 직접결제</th><th>주체 미확인</th><th>실비 합계</th></tr></thead><tbody>{totals.matrix.map(row=><tr key={row.scope}><td><button className="ops-text-button" onClick={()=>changeFilters({view:'all',payer:'all',scope:row.scope,status:'actual',search:''})}>{SCOPE_LABELS[row.scope]}</button></td>{(['company','personal','customer','unclassified'] as ExpensePayer[]).map(payer=><td key={payer}>{won(row.payers[payer])}</td>)}<td className="ops-highlight">{won(row.total)}</td></tr>)}</tbody></table></div><p className="ops-muted">공사비: 시공·마감·설비 / 장비·집기: 주방기기 / 행정·운영: 신고 수수료 / 현장 부대비: 운임·교통·식대·청소 등. 기존 카테고리로 기본 분류했으며 항목별로 변경할 수 있습니다. 이 표는 최초 결제 기준이라 개인 정산을 비용으로 다시 더하지 않습니다.</p></section>
    {expense && <ExpenseEditor row={expense} onChange={setExpense} onSave={saveExpense} onCancel={()=>setExpense(null)} />}

    <section className="ops-panel"><div className="ops-section-head"><h2>집행·비용 상세</h2><button className="ops-button" onClick={exportExpenses}><Download size={16}/> 현재 목록 CSV</button></div>
      <div className="funds-view-tabs">{([['project','현장 총실비'],['company','회사 집행'],['personal','개인 선결제'],['customer','고객 직접결제'],['construction','공사 내역'],['review','확인 필요'],['all','전체 기록']] as [FundsView,string][]).map(([view,label])=><button key={view} aria-pressed={filters.view===view} onClick={()=>chooseView(view)}>{label}</button>)}</div>
      <div className="funds-filter-grid"><label>결제 주체 필터<select aria-label="결제 주체 필터" value={filters.payer} onChange={event=>changeFilters({...filters,payer:event.target.value,view:'all'})}><option value="all">모든 결제 주체</option>{Object.entries(PAYER_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>비용 구분 필터<select aria-label="비용 구분 필터" value={filters.scope} onChange={event=>changeFilters({...filters,scope:event.target.value,view:'all'})}><option value="all">모든 비용 구분</option>{Object.entries(SCOPE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>지출 상태 필터<select aria-label="지출 상태 필터" value={filters.status} onChange={event=>changeFilters({...filters,status:event.target.value})}><option value="actual">실제 지출</option><option value="planned">예상 지출</option><option value="all">실제 + 예상</option></select></label><label>검색<input aria-label="집행 내역 검색" type="search" placeholder="항목·카테고리·메모" value={filters.search} onChange={event=>changeFilters({...filters,search:event.target.value})}/></label></div>
      <div className="ops-section-head"><p className="ops-muted">현재 목록 {visible.length}건 · {filters.view==='company'?'회사 집행 합계':'원 지출 합계'} {won(visibleTotal)}{filters.status==='all'?' (예상 포함)':''}</p><span className="ops-muted">선택 {selected.length}건</span></div>
      {selected.length>0 && <div className="funds-bulk"><label>선택 항목의 결제 주체<select aria-label="일괄 결제 주체" value={bulkPayer} onChange={event=>setBulkPayer(event.target.value)}><option value="">변경하지 않음</option>{Object.entries(PAYER_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>선택 항목의 비용 구분<select aria-label="일괄 비용 구분" value={bulkScope} onChange={event=>setBulkScope(event.target.value)}><option value="">변경하지 않음</option>{Object.entries(SCOPE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="ops-button" disabled={busy||(!bulkPayer&&!bulkScope)} onClick={applyBulk}>선택 {selected.length}건 분류 적용</button></div>}
      <div className="ops-table-wrap"><table className="ops-table funds-ledger"><thead><tr><th><input aria-label="현재 목록 전체 선택" type="checkbox" disabled={!visible.length} checked={visible.length>0&&visible.every(row=>selected.includes(row.id))} onChange={event=>setSelected(event.target.checked?visible.map(row=>row.id):[])}/></th>{([['date','날짜'],['item','항목']] as const).map(([key,label])=><th key={key}><button className="ops-text-button" onClick={()=>setSort(prev=>({key,asc:prev.key===key?!prev.asc:true}))}>{label}<ArrowUpDown size={13}/></button></th>)}<th>비용 구분</th><th>결제 주체</th><th>원문 결제표시</th><th><button className="ops-text-button" onClick={()=>setSort(prev=>({key:'cost',asc:prev.key==='cost'?!prev.asc:false}))}>{filters.view==='company'?'회사 집행액':'원 지출액'}<ArrowUpDown size={13}/></button></th><th>개인 정산</th><th>관리</th></tr></thead><tbody>{visible.map(row=><tr key={row.id}><td><input type="checkbox" aria-label={`${row.item} 선택`} checked={selected.includes(row.id)} onChange={event=>setSelected(prev=>event.target.checked?[...prev,row.id]:prev.filter(id=>id!==row.id))}/></td><td>{displayDate(row)}{isPlannedExpense(row)&&<small>예상 지출</small>}</td><td><strong>{row.item}</strong><small>{row.category} · {row.details}</small><small>{row.source}</small></td><td>{SCOPE_LABELS[expenseScope(row)]}</td><td><span className={`funds-payer payer-${expensePayer(row)}`}>{PAYER_LABELS[expensePayer(row)]}</span></td><td>{row.payment||'미등록'}</td><td>{won(visibleAmount(row))}{filters.view==='company'&&expensePayer(row)==='personal'&&<small>원 지출 {won(row.cost)}</small>}</td><td>{expensePayer(row)==='personal'&&!isPlannedExpense(row)?<><span>{row.settlementConfirmed?(reimbursement(row)===row.cost?'정산 완료':reimbursement(row)>0?'일부 정산':'미정산 확인'):'확인 필요'}</span><small>등록 {won(reimbursement(row))}</small></>:'—'}</td><td><div className="ops-actions"><button aria-label={`${row.item} 지출 수정`} onClick={()=>{setExpense(editableExpense(row));setError('');}}><Edit2 size={16}/></button><button aria-label={`${row.item} 지출 삭제`} onClick={async()=>{if(!window.confirm(`${row.item} 지출을 삭제하시겠습니까?`))return;try{await dbService.deleteInteriorCost(row.id);setCosts(prev=>prev.filter(item=>item.id!==row.id));setSelected(prev=>prev.filter(id=>id!==row.id));}catch{setError('지출 삭제를 저장하지 못했습니다.');}}}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
      {visible.length===0&&<p className="ops-empty">선택한 조건에 맞는 내역이 없습니다.</p>}
      <p className="ops-storage">지출 분류·정산·입금 변경은 이 브라우저에 저장됩니다. CSV에는 현재 필터의 내역이 내려받아집니다.</p>
    </section>
    <details className="ops-panel"><summary>원본 금액과 분류 기준</summary><p className="ops-muted">{FINANCE_SOURCE}의 지출 상세 53건을 유지했습니다. 상세 합계 15,796,450원과 총 입금 16,110,000원이 기준이며, 시트의 예전 요약 합계 대신 상세 행을 사용합니다. 직접구매 4건 389,500원은 고객 직접 지출로 사용자 확인을 받았습니다. 조영철 카드 4건 269,500원은 개인 결제로 분류하고 정산 여부를 확인 필요로 남겼습니다.</p><p className="ops-muted">현장 총실비는 실제 지출만 원문 금액으로 합산합니다. 개인·고객 결제도 현장 비용이면 포함하고, 예상 지출과 ‘현장 비용에서 제외’ 항목은 빼며 부가세를 임의로 차감하지 않습니다. 회사 돈으로 결제한 제외 항목도 자금 잔액에는 반영됩니다. 도장 추가작업의 원문 날짜 2026-10-0은 일자 미확인으로 보존했습니다.</p></details>
    {oldDeposits.length>0&&<details className="ops-panel"><summary>이전 버전의 입금 입력 기록</summary><p className="ops-muted">중복 계산을 방지하기 위해 현재 고객 입금 합계에는 포함하지 않았습니다.</p>{oldDeposits.map((row,index)=><p key={index} className="ops-muted">{row.date} · {row.note} · {won(row.amount)}</p>)}</details>}
  </div>;
};
