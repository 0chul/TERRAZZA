import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, Upload, ClipboardCheck, Coffee, ShoppingBag } from 'lucide-react';
import type { GlobalConfig, CafeSupplies } from '../types';
import { PREPARATION_TASKS, SUPPLY_ITEMS, calculateSupplyOrder } from '../operations';
import { useBrowserState } from './useBrowserState';
import './operations.css';

interface TaskNote { owner?: string; due?: string; note?: string }
interface ProgressState {
  checked: Record<string, boolean>;
  notes: Record<string, TaskNote>;
  purchased: Record<string, boolean>;
  days: number;
  safetyRatio: number;
  stock: Partial<Record<keyof CafeSupplies, number>>;
}
const initial: ProgressState = {
  checked: Object.fromEntries(PREPARATION_TASKS.flatMap(task => task.steps.map(step => [step.id, !!step.complete]))),
  notes: {}, purchased: {}, days: 7, safetyRatio: 0.2, stock: {},
};

function downloadText(text: string, filename: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const OperationsTab: React.FC<{ config: GlobalConfig; dailySalesCount: number; onNavigate: (tab: string) => void }> = ({ config, dailySalesCount, onNavigate }) => {
  const [state, setState, storageError] = useBrowserState('terrazza-opening-progress-v1', initial);
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState('');
  const allPurchased = SUPPLY_ITEMS.every(item => state.purchased[item.key]);
  const isChecked = (id: string) => id === 'supplies-order' ? allPurchased : !!state.checked[id];
  const complete = PREPARATION_TASKS.filter(task => task.steps.every(step => isChecked(step.id))).length;
  const stepCount = PREPARATION_TASKS.reduce((sum, task) => sum + task.steps.length, 0);
  const stepComplete = PREPARATION_TASKS.reduce((sum, task) => sum + task.steps.filter(step => isChecked(step.id)).length, 0);
  const orders = useMemo(() => calculateSupplyOrder(config, dailySalesCount, state.days, state.safetyRatio, state.stock), [config, dailySalesCount, state.days, state.safetyRatio, state.stock]);
  const budget = orders.reduce((sum, row) => sum + row.amount, 0);
  const updateNote = (id: string, field: keyof TaskNote, value: string) => setState(prev => ({ ...prev, notes: { ...prev.notes, [id]: { ...prev.notes[id], [field]: value } } }));

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const value = data.state;
      if (data.format !== 'terrazza-opening-v1' || !value || typeof value.checked !== 'object' || !value.checked || typeof value.notes !== 'object' || !value.notes || typeof value.purchased !== 'object' || !value.purchased || typeof value.stock !== 'object' || !value.stock || !Number.isFinite(value.days) || value.days < 1 || value.days > 90 || !Number.isFinite(value.safetyRatio) || value.safetyRatio < 0 || value.safetyRatio > 1) throw new Error('format');
      const next: ProgressState = { ...initial, checked: {}, notes: {}, purchased: {}, stock: {}, days: value.days, safetyRatio: value.safetyRatio };
      for (const task of PREPARATION_TASKS) {
        for (const step of task.steps) {
          if (typeof value.checked[step.id] !== 'boolean') throw new Error('check');
          next.checked[step.id] = value.checked[step.id];
        }
        const note = value.notes[task.id];
        if (note) {
          if (typeof note !== 'object' || ['owner', 'due', 'note'].some(key => note[key] !== undefined && typeof note[key] !== 'string')) throw new Error('note');
          next.notes[task.id] = { owner: note.owner, due: note.due, note: note.note };
        }
      }
      for (const item of SUPPLY_ITEMS) {
        if (value.purchased[item.key] !== undefined && typeof value.purchased[item.key] !== 'boolean') throw new Error('purchase');
        if (value.stock[item.key] !== undefined && (!Number.isFinite(value.stock[item.key]) || value.stock[item.key] < 0)) throw new Error('stock');
        next.purchased[item.key] = !!value.purchased[item.key];
        next.stock[item.key] = value.stock[item.key] ?? 0;
      }
      if (!window.confirm('백업의 진행 상황으로 현재 체크·메모·재고를 교체하시겠습니까?')) return;
      setState(next); setFeedback('백업을 불러왔습니다.');
    } catch { setFeedback('테라짜 진행 체크 백업 파일을 확인해 주세요. 현재 기록은 유지됩니다.'); }
  };

  const exportOrders = () => {
    const rows = [['품목', '규격', '예상사용량', '안전재고', '현재재고', '발주수량', '기준단가(원)', '예상금액(원)', '구매확인'], ...orders.map(row => [row.name, row.spec, row.expected, row.safety, row.stock, row.quantity, row.unitCost, row.amount, state.purchased[row.key] ? '확인' : '대기'])];
    const escape = (cell: unknown) => '"' + String(cell).replace(/"/g, '""') + '"';
    downloadText('\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n'), 'TERRAZZA-일회용품-구매목록.csv', 'text/csv;charset=utf-8');
  };

  return <div className="ops-page">
    <div className="ops-heading">
      <div><p className="ops-eyebrow">TERRAZZA · OPENING DESK</p><h1>오픈 준비 현황</h1><p>설치부터 메뉴와 소모품까지, 다음 할 일을 한눈에 확인하세요.</p></div>
      <div className="ops-actions">
        <button className="ops-button" onClick={() => downloadText(JSON.stringify({ format: 'terrazza-opening-v1', savedAt: new Date().toISOString(), state }, null, 2), 'TERRAZZA-진행체크-백업.json')}><Download size={16} /> 백업</button>
        <label className="ops-button"><Upload size={16} /> 불러오기<input className="ops-file" aria-label="진행 체크 백업 불러오기" type="file" accept=".json,application/json" onChange={event => { void importBackup(event.target.files?.[0]); event.target.value = ''; }} /></label>
      </div>
    </div>
    <p className="ops-storage">체크·담당자·메모는 이 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때는 백업을 사용하세요.</p>
    {(storageError || feedback) && <p className="ops-notice" role="status">{storageError || feedback}</p>}
    <div className="ops-summary">
      <div className="ops-stat"><span>완료한 준비 항목</span><strong>{complete}<small> / {PREPARATION_TASKS.length}</small></strong><span>세부 체크 {stepComplete} / {stepCount}</span></div>
      <div className="ops-stat"><span>라마르조꼬 설치 견적</span><strong>704,000<small> 원</small></strong><span>부가세 포함 · 기존 지출에 미포함</span></div>
      <div className="ops-stat"><span>고급 커피 목표 판매가</span><strong>10,000~12,000<small> 원</small></strong><span>잔당 가격 · 원두와 레시피 확정 예정</span></div>
    </div>
    <div className="ops-progress" aria-label={`세부 준비 ${stepComplete}/${stepCount} 완료`}><span style={{ width: `${stepComplete / stepCount * 100}%` }} /></div>
    <div className="ops-section-head"><h2><ClipboardCheck size={20} /> 진행 체크</h2><div className="ops-filters">{[['all', '전체'], ['pending', '미완료'], ['done', '완료']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    <div className="ops-task-grid">
      {PREPARATION_TASKS.filter(task => filter === 'all' || (filter === 'done') === task.steps.every(step => isChecked(step.id))).map(task => {
        const done = task.steps.every(step => isChecked(step.id));
        const count = task.steps.filter(step => isChecked(step.id)).length;
        return <article key={task.id} className={`ops-card ${done ? 'ops-card-done' : ''}`}>
          <div className="ops-card-top"><span className="ops-category">{task.category}</span><span className={`ops-badge ${done ? 'is-done' : ''}`}>{done ? <><CheckCircle2 size={14} /> 완료</> : `${count} / ${task.steps.length} 체크`}</span></div>
          <h3>{task.title}</h3><p className="ops-next">{task.nextAction}</p>
          <div className="ops-checks">{task.steps.map(step => <label key={step.id}><input type="checkbox" checked={isChecked(step.id)} disabled={step.id === 'supplies-order'} onChange={event => setState(prev => ({ ...prev, checked: { ...prev.checked, [step.id]: event.target.checked } }))} /><span>{step.label}{step.id === 'supplies-order' && <small>아래 10개 구매 확인에 연동</small>}</span></label>)}</div>
          <div className="ops-note-fields"><label>담당자<input value={state.notes[task.id]?.owner ?? ''} onChange={event => updateNote(task.id, 'owner', event.target.value)} placeholder="담당자 입력" /></label><label>목표일<input type="date" value={state.notes[task.id]?.due ?? ''} onChange={event => updateNote(task.id, 'due', event.target.value)} /></label></div>
          <label className="ops-note">메모<textarea rows={2} value={state.notes[task.id]?.note ?? ''} onChange={event => updateNote(task.id, 'note', event.target.value)} placeholder="업체 협의 내용이나 다음 할 일" /></label>
          {task.id === 'manual' && <button className="ops-text-button" onClick={() => onNavigate('manual')}>운영 매뉴얼 열기 <ArrowRight size={15} /></button>}
        </article>;
      })}
      {filter === 'done' && complete === 0 && <p className="ops-empty">아직 완료된 항목이 없습니다. 세부 체크를 모두 마치면 여기에 표시됩니다.</p>}
      {filter === 'pending' && complete === PREPARATION_TASKS.length && <p className="ops-empty">모든 준비 항목을 완료했습니다.</p>}
    </div>
    <section className="ops-panel">
      <div className="ops-section-head"><h2><Coffee size={20} /> 메뉴 운영 계획</h2><button className="ops-text-button" onClick={() => onNavigate('planner')}>상세 설정 <ArrowRight size={15} /></button></div>
      <div className="ops-menu-grid"><div><p className="ops-category">기본 커피</p><h3>매일 마시는 기본 4종</h3><dl className="ops-menu-list"><div><dt>에스프레소</dt><dd>판매가 확정 필요</dd></div><div><dt>아메리카노</dt><dd>{config.cafe.avgPriceAmericano.toLocaleString()}원</dd></div><div><dt>카페라떼</dt><dd>{config.cafe.avgPriceLatte.toLocaleString()}원</dd></div><div><dt>시럽라떼</dt><dd>{config.cafe.avgPriceSyrupLatte.toLocaleString()}원</dd></div></dl><p className="ops-muted">아메리카노·라떼·시럽라떼 가격은 상세 설정에 연동됩니다.</p></div>
      <div className="ops-premium"><p className="ops-category">프리미엄 커피 · 구성안</p><h3>한 잔의 경험을 더하는 메뉴</h3><dl className="ops-menu-list"><div><dt>싱글오리진 커피</dt><dd>목표 10,000원</dd></div><div><dt>리저브 커피</dt><dd>목표 12,000원</dd></div></dl><p>원두 산지·가공 방식·추출 레시피와 전용 잔을 정한 뒤 시음과 원가 검토를 진행합니다. 최종 명칭과 판매가는 확정 예정입니다.</p><p className="ops-muted">고급 커피와 에스프레소는 출시 준비 항목입니다. 판매 비중·원가가 확정되기 전 재무 예측은 기존 3종을 기준으로 합니다.</p></div></div>
    </section>
    <section className="ops-panel" id="supply-order">
      <div className="ops-section-head"><h2><ShoppingBag size={20} /> 일회용품 구매 목록</h2><button className="ops-button" onClick={exportOrders}><Download size={16} /> 구매 목록 CSV</button></div>
      <p className="ops-muted">상세 설정의 품목·규격·기준 단가와 판매량을 사용합니다. 규격, 묶음 수량, 실제 구매가는 업체 견적에서 확인하세요.</p>
      <div className="ops-order-controls"><label>준비할 영업일 수<input type="number" min={1} max={90} value={state.days} onChange={event => setState(prev => ({ ...prev, days: Math.min(90, Math.max(1, Math.floor(Number(event.target.value)))) }))} /></label><label>안전재고 (%)<input type="number" min={0} max={100} value={Math.round(state.safetyRatio * 100)} onChange={event => setState(prev => ({ ...prev, safetyRatio: Math.min(1, Math.max(0, Number(event.target.value) / 100)) }))} /></label><div><span>현재 판매량 가정</span><strong>일 {dailySalesCount}잔</strong><small>포장 {Math.round(config.cafe.takeoutRatio * 100)}% · ICE {Math.round(config.cafe.iceRatio * 100)}%</small></div><div><span>예상 발주금액</span><strong>{budget.toLocaleString()}원</strong><small>상세 설정 단가 기준 · 구매 확인 {SUPPLY_ITEMS.filter(item => state.purchased[item.key]).length} / 10</small></div></div>
      <div className="ops-table-wrap"><table className="ops-table"><caption className="sr-only">상세 설정에 연동된 일회용품 구매 및 재고 목록</caption><thead><tr><th>구매 확인</th><th>품목 / 규격</th><th>기준 단가</th><th>예상 사용</th><th>안전재고</th><th>현재 재고</th><th>발주 수량</th><th>예상 금액</th></tr></thead><tbody>{orders.map(row => <tr key={row.key}><td><input type="checkbox" aria-label={`${row.name} 구매 확인`} checked={!!state.purchased[row.key]} onChange={event => setState(prev => ({ ...prev, purchased: { ...prev.purchased, [row.key]: event.target.checked } }))} /></td><td><strong>{row.name}</strong><small>{row.spec}</small></td><td>{row.unitCost.toLocaleString()}원</td><td>{row.expected.toLocaleString()}개</td><td>{row.safety.toLocaleString()}개</td><td><input type="number" aria-label={`${row.name} 현재 재고`} min={0} step={1} value={state.stock[row.key] ?? 0} onChange={event => setState(prev => ({ ...prev, stock: { ...prev.stock, [row.key]: Math.max(0, Math.floor(Number(event.target.value))) } }))} /></td><td className="ops-highlight">{row.quantity.toLocaleString()}개</td><td>{row.amount.toLocaleString()}원</td></tr>)}</tbody></table></div>
      <p className="ops-muted">발주 수량 = 예상 사용량 + 안전재고 − 현재 사용가능재고 (최소 0개). 캐리어는 기존 원가 모델의 포장 음료당 1개 가정을 따릅니다. 대관 추가 수요와 묶음 구매 단위는 발주 시 조정하세요.</p>
      <p className="ops-muted">원두·우유·시럽·정수물·얼음은 원재료, 식기세척비는 관리비로 분리해 일회용품 목록에서 제외했습니다.</p>
    </section>
    <div className="ops-footer-link"><span>엑셀 기준 자금·공사 내역을 함께 확인하세요.</span><button className="ops-text-button" onClick={() => onNavigate('interior')}>인테리어 자금표 <ArrowRight size={15} /></button></div>
  </div>;
};
