import React, { useMemo, useState } from 'react';
import { Download, Printer, BookOpen, Search } from 'lucide-react';
import type { GlobalConfig } from '../types';
import { MANUAL_SECTIONS, ManualBlock } from '../manualContent';
import { useBrowserState } from './useBrowserState';
import { seoulDate } from '../dates';
import './operations.css';

export const ManualTab: React.FC<{ config: GlobalConfig }> = ({ config }) => {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(seoulDate);
  const [checks, setChecks, error] = useBrowserState<Record<string, boolean>>('terrazza-daily-checks-v1', {});
  const [feedback, setFeedback] = useState('');
  const sections = useMemo(() => MANUAL_SECTIONS.filter(section => JSON.stringify(section).toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())), [query]);
  const renderBlock = (block: ManualBlock, index: number, sectionId: string) => {
    if (block.type === 'heading') return <h3>{block.text}</h3>;
    if (block.type === 'table') return <div className="ops-table-wrap"><table className="ops-table"><thead><tr>{block.header?.map((text, i) => <th scope="col" key={i}>{text}</th>)}</tr></thead><tbody>{block.rows?.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
    if (sectionId === 'manual-7' && block.text?.startsWith('□')) {
      const key = `${date}:${sectionId}:${index}`;
      return <div className="ops-checks"><label><input type="checkbox" checked={!!checks[key]} onChange={event => setChecks(prev => ({ ...prev, [key]: event.target.checked }))} /><span>{block.text.replace(/^□\s*/, '')}</span></label></div>;
    }
    if (block.type === 'item') return <ul><li>{block.text}</li></ul>;
    if (block.type === 'callout') return <p className="ops-notice">{block.text}</p>;
    return <p>{block.text}</p>;
  };
  const resetDay = () => {
    if (!window.confirm(`${date} 현장 체크 기록을 초기화하시겠습니까? 다른 날짜의 기록은 유지됩니다.`)) return;
    setChecks(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${date}:`))));
  };
  const printManual = () => {
    document.querySelectorAll<HTMLDetailsElement>('.manual-section').forEach(element => { element.open = true; });
    window.print();
  };

  return <div className="ops-page">
    <div className="ops-heading"><div><p className="ops-eyebrow">TERRAZZA · OPERATION MANUAL</p><h1>운영 매뉴얼</h1><p>카페 · 와인라운지 · 장소대관의 현장 운영 기준</p></div><div className="ops-actions"><a className="ops-button" href={`${import.meta.env.BASE_URL}manual/TERRAZZA-Operation-Manual-v0.9.pdf`} target="_blank" rel="noopener noreferrer"><BookOpen size={16} /> 원본 PDF</a><a className="ops-button" href={`${import.meta.env.BASE_URL}manual/TERRAZZA-Operation-Manual-v0.9.docx`} download><Download size={16} /> Word</a><button className="ops-button" onClick={printManual}><Printer size={16} /> 인쇄</button></div></div>
    <p className="ops-notice">Version 0.9 · 2026.10 · 운영기준 초안. 첨부 매뉴얼의 9개 장을 옮겼습니다. 문서 내 영업시간·가격·대관 조건은 초안 가정이며, 정식 운영 정책을 확정한 뒤 업데이트합니다.</p>
    <label className="ops-note"><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Search size={15} /> 매뉴얼 검색</span><input className="manual-search" type="search" placeholder="오픈, 와인, 대관, 재고 등" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <nav className="manual-contents" aria-label="운영 매뉴얼 목차">{MANUAL_SECTIONS.map(section => <a key={section.id} href={`#${section.id}`} onClick={event => {
      event.preventDefault(); setQuery('');
      requestAnimationFrame(() => { const element = document.getElementById(section.id) as HTMLDetailsElement | null; if (element) { element.open = true; element.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    }}>{section.title.replace(/^\d\. /, '')}</a>)}</nav>
    <section className="ops-panel"><h2 style={{ fontSize: 17, marginBottom: 15 }}>현재 메뉴 준비 기준</h2><div className="ops-menu-grid"><div><p>기본 메뉴: 에스프레소 · 아메리카노 · 라떼 · 시럽라떼</p><p className="ops-muted">아메리카노 {config.cafe.avgPriceAmericano.toLocaleString()}원 · 라떼 {config.cafe.avgPriceLatte.toLocaleString()}원 · 시럽라떼 {config.cafe.avgPriceSyrupLatte.toLocaleString()}원 (상세 설정 연동)</p></div><div><p>추가 운영 계획: 잔당 10,000~12,000원 고급 커피</p><p className="ops-muted">에스프레소 판매가, 고급 커피 원두·레시피·가격은 확정 필요</p></div></div></section>
    {sections.length === 0 && <p className="ops-empty">검색 결과가 없습니다. 다른 단어로 검색하세요.</p>}
    {sections.map(section => <details className="ops-panel manual-section" id={section.id} key={`${section.id}:${query ? 'search' : 'all'}`} open={!!query || section.id === 'manual-7' || section.id === 'manual-0'}><summary><span>{section.title}</span><small>{section.subtitle}</small></summary>
      {section.id === 'manual-7' && <div className="manual-block"><div className="manual-day"><label>체크 날짜<input type="date" value={date} onInput={event => { if (event.currentTarget.value) setDate(event.currentTarget.value); }} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label><button className="ops-text-button" onClick={resetDay}>이 날짜 체크 초기화</button><button className="ops-text-button" onClick={() => {
        const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'terrazza-daily-checks-v1', checks }, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'TERRAZZA-현장체크-기록.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setFeedback('현장 체크 기록을 내려받았습니다.');
      }}>현장 기록 백업</button></div><p className="ops-muted">날짜별 체크가 이 브라우저에 자동 저장됩니다. 오픈 준비의 진행 체크와 별도로 관리합니다.</p>{(error || feedback) && <p role="status" className="ops-notice">{error || feedback}</p>}</div>}
      {section.blocks.map((block, index) => <div className="manual-block" key={index}>{renderBlock(block, index, section.id)}</div>)}
    </details>)}
  </div>;
};
