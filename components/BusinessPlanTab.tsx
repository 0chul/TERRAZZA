
import React, { useEffect } from 'react';
import { GlobalConfig, CafeUnitCosts, MonthlyData } from '../types';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export interface BusinessPlanTabProps {
  totalInteriorExpenses: number;
  config: GlobalConfig;
  cafeUnitCosts: CafeUnitCosts;
  monthlyData: MonthlyData[];
}

export const BusinessPlanTab: React.FC<BusinessPlanTabProps> = ({ totalInteriorExpenses, config, cafeUnitCosts, monthlyData }) => {
  const interiorAmount = totalInteriorExpenses;
  
  const totalAmount = interiorAmount;
  
  const getWidth = (amount: number) => {
    if (totalAmount === 0) return '0%';
    return `${Math.round((amount / totalAmount) * 100)}%`;
  };

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="terrazza-template">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="hero-lines">
          <div className="hero-line"></div>
          <div className="hero-line"></div>
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">서울 서초구 방배동 807-17</p>
          <h1 className="hero-title">Terrazza<br/><em>Lounge</em></h1>
          <p className="hero-subtitle">낮의 카페 &nbsp;·&nbsp; 저녁의 와인 라운지 &nbsp;·&nbsp; 시간대 전환형 공간</p>
          <div className="hero-divider"></div>
          <p className="hero-tagline">
            카페가 바닥 매출을 깔고<br/>와인이 객단가를 올리고<br/>대관이 이익을 만든다
          </p>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* CONCEPT SECTION */}
      <section className="concept" id="concept">
        <div className="concept-inner">
          <div className="concept-left">
            <div className="section-label reveal">운영 개념</div>
            <h2 className="section-title reveal reveal-delay-1">운영 모델<br/><em>수익 구조 분석</em></h2>
            <p className="section-body reveal reveal-delay-2">
              Terrazza Lounge는 시간대별 수요 전환을 통해 수익을 극대화하는 멀티유즈 공간입니다. 카페 코어 10평과 가변홀 50평으로 구성되며, 주간 카페, 야간 라운지, 정기 대관의 세 가지 수익축을 기반으로 운영됩니다.
            </p>
            <div style={{marginTop:'36px', display:'flex', flexDirection:'column', gap:'14px'}} className="reveal reveal-delay-3">
              <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                <div style={{width:'36px',height:'1px',background:'var(--amber)',flexShrink:0}}></div>
                <span style={{fontSize:'0.8rem',color:'var(--mist)'}}>일반음식점 신고 전제 — 와인 서비스 합법 운영</span>
              </div>
              <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                <div style={{width:'36px',height:'1px',background:'var(--amber)',flexShrink:0}}></div>
                <span style={{fontSize:'0.8rem',color:'var(--mist)'}}>CAPEX 최소화 (인테리어 실비 중심) — 재건축 전 24개월 임시 운영</span>
              </div>
              <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                <div style={{width:'36px',height:'1px',background:'var(--amber)',flexShrink:0}}></div>
                <span style={{fontSize:'0.8rem',color:'var(--mist)'}}>무임차 전제 — 업계 평균 대비 고수익률 구조 설계</span>
              </div>
            </div>
          </div>
          <div className="concept-visual reveal reveal-delay-2">
            <div className="time-card time-card-1">
              <div className="time-card-icon">☕</div>
              <div className="time-card-time">12:00 — 17:00</div>
              <div className="time-card-title">주간 카페</div>
              <div className="time-card-desc">자연채광과 식물, 테라스 감성의 라운지형 카페. 커피·논커피 중심 운영. 좌석 체류 품질 우선.</div>
            </div>
            <div className="concept-connector cc-1"></div>
            <div className="time-card time-card-2">
              <div className="time-card-icon">🍷</div>
              <div className="time-card-time">18:30 — 23:00</div>
              <div className="time-card-title">와인 라운지</div>
              <div className="time-card-desc">조도를 낮춘 저녁 와인 라운지. 글라스 4~6종, 스몰 플레이트. 조용한 모임 공간으로 전환.</div>
            </div>
            <div className="concept-connector cc-2"></div>
            <div className="time-card time-card-3">
              <div className="time-card-icon">🏛</div>
              <div className="time-card-time">예약 기반 운영</div>
              <div className="time-card-title">대관 &amp; 클래스</div>
              <div className="time-card-desc">세미나·워크숍·프라이빗 파티·전시. 10분 전환 기준. 전관대관 최대 35인.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space" id="space">
        <div className="space-inner">
          <div className="section-label reveal">공간 운영 구조</div>
          <h2 className="section-title reveal reveal-delay-1">공간 설계<br/><em>가변적 공간 구성</em></h2>
          <p className="section-body reveal reveal-delay-2">카페 코어 10평과 가변형 홀 50평으로 구성됩니다. 가변 가구 도입을 통해 시공 시간과 인건비를 최소화하면서 다양한 운영 시나리오에 대응 가능한 인프라를 구축합니다.</p>
          <div className="space-grid">
            <div className="space-cell reveal">
              <div className="space-cell-number">01</div>
              <div className="space-cell-icon">🏪</div>
              <div className="space-cell-sub">오더 바 · 커피 스테이션</div>
              <div className="space-cell-title">카페 코어</div>
              <div className="space-cell-desc">카페·와인 공용 바. 동선 최단화. 대관 시에도 축소 유지하여 바닥 매출을 지킵니다. 상시 오픈 가능한 최소 운영 거점.</div>
            </div>
            <div className="space-cell reveal reveal-delay-1">
              <div className="space-cell-number">02</div>
              <div className="space-cell-icon">🎪</div>
              <div className="space-cell-sub">가변홀 · 50평</div>
              <div className="space-cell-title">다목적 전환홀</div>
              <div className="space-cell-desc">세미나·클래스·파티·전시·와인 라운지. 폴딩 테이블과 스태킹 체어로 10분 전환. 빔·스피커·마이크는 수납형 고정.</div>
            </div>
            <div className="space-cell reveal reveal-delay-2">
              <div className="space-cell-number">03</div>
              <div className="space-cell-icon">🖼</div>
              <div className="space-cell-sub">갤러리 월</div>
              <div className="space-cell-title">전시 공간</div>
              <div className="space-cell-desc">상시 전시 가능. 대관과 병행 운영. 7일 전시 패키지 250만원. 오픈나이트 별도 협의로 추가 수익 창출.</div>
            </div>
            <div className="space-cell reveal reveal-delay-3">
              <div className="space-cell-number">04</div>
              <div className="space-cell-icon">🌿</div>
              <div className="space-cell-sub">테라스 무드존</div>
              <div className="space-cell-title">입구 &amp; 테라스</div>
              <div className="space-cell-desc">첫인상을 만드는 공간. 식물·자연채광·향·조도. SNS 콘텐츠 촬영 거점. 고객 동선의 시작점이자 브랜드 이미지 형성 공간.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="menu" id="menu">
        <div className="menu-inner">
          <div className="section-label reveal">메뉴 전략</div>
          <h2 className="section-title reveal reveal-delay-1">공간을 방해하지 않는<br/><em>메뉴 설계</em></h2>
          <p className="section-body reveal reveal-delay-2">조리 복잡도는 낮게 유지합니다. 커피·논커피·와인·스몰 플레이트 네 카테고리로만 재고와 공정을 단순화합니다.</p>
          <div className="menu-grid">
            <div className="menu-card reveal">
              <div className="menu-card-cat">Coffee</div>
              <div className="menu-card-title">커피</div>
              <div className="menu-items">
                <div className="menu-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span>아메리카노</span>
                    <span className="menu-price">{config.cafe.avgPriceAmericano.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: 'var(--stone)', marginTop: '4px', fontWeight: 'normal'}}>
                    원가 {Math.round(cafeUnitCosts.finalCostAmericano).toLocaleString()}원 ({Math.round((cafeUnitCosts.finalCostAmericano / config.cafe.avgPriceAmericano) * 100)}%)
                  </div>
                </div>
                <div className="menu-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span>카페라떼</span>
                    <span className="menu-price">{config.cafe.avgPriceLatte.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: 'var(--stone)', marginTop: '4px', fontWeight: 'normal'}}>
                    원가 {Math.round(cafeUnitCosts.finalCostLatte).toLocaleString()}원 ({Math.round((cafeUnitCosts.finalCostLatte / config.cafe.avgPriceLatte) * 100)}%)
                  </div>
                </div>
                <div className="menu-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span>시럽라떼</span>
                    <span className="menu-price">{config.cafe.avgPriceSyrupLatte.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: 'var(--stone)', marginTop: '4px', fontWeight: 'normal'}}>
                    원가 {Math.round(cafeUnitCosts.finalCostSyrupLatte).toLocaleString()}원 ({Math.round((cafeUnitCosts.finalCostSyrupLatte / config.cafe.avgPriceSyrupLatte) * 100)}%)
                  </div>
                </div>
              </div>
              <div className="menu-rate">예상 원가율 <span>
                {Math.round(
                  ((cafeUnitCosts.finalCostAmericano * config.cafe.ratioAmericano +
                    cafeUnitCosts.finalCostLatte * config.cafe.ratioLatte +
                    cafeUnitCosts.finalCostSyrupLatte * config.cafe.ratioSyrupLatte) /
                  (config.cafe.avgPriceAmericano * config.cafe.ratioAmericano +
                    config.cafe.avgPriceLatte * config.cafe.ratioLatte +
                    config.cafe.avgPriceSyrupLatte * config.cafe.ratioSyrupLatte)) * 100
                )}%
              </span></div>
              <div style={{marginTop:'14px',fontSize:'0.75rem',color:'var(--stone)',lineHeight:1.7}}>상세설정의 판매가 및 재료비 연동. 테이크아웃/매장/아이스 비율이 반영된 가중평균 원가입니다.</div>
            </div>
            <div className="menu-card reveal reveal-delay-1">
              <div className="menu-card-cat">Non-Coffee &amp; Wine</div>
              <div className="menu-card-title">음료 &amp; 와인</div>
              <div className="menu-items">
                <div className="menu-item"><span>티 / 허브 에이드</span><span className="menu-price">5,800~7,500</span></div>
                <div className="menu-item"><span>글라스 와인 (4~6종)</span><span className="menu-price">11,000~13,000</span></div>
                <div className="menu-item"><span>와인 보틀 (8~12종)</span><span className="menu-price">52,000~98,000</span></div>
              </div>
              <div className="menu-rate">와인 목표 원가율 <span>30~42%</span></div>
              <div style={{marginTop:'14px',fontSize:'0.75rem',color:'var(--stone)',lineHeight:1.7}}>오픈병 회전 우선. SKU 좁게 유지. 화이트·레드·스파클링·오렌지/로제 라인업.</div>
            </div>
            <div className="menu-card reveal reveal-delay-2">
              <div className="menu-card-cat">Small Plates</div>
              <div className="menu-card-title">스몰 플레이트</div>
              <div className="menu-items">
                <div className="menu-item"><span>올리브 &amp; 너트</span><span className="menu-price">9,000~12,000</span></div>
                <div className="menu-item"><span>치즈 플레이트</span><span className="menu-price">16,000~22,000</span></div>
                <div className="menu-item"><span>콜드컷 / 브레드</span><span className="menu-price">12,000~18,000</span></div>
              </div>
              <div className="menu-rate">목표 원가율 <span>28~35%</span></div>
              <div style={{marginTop:'14px',fontSize:'0.75rem',color:'var(--stone)',lineHeight:1.7}}>조리보다 플레이팅 중심. 최소한의 키친 투자. 와인 야간 객단가 연동 설계.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rental" id="rental">
        <div className="rental-inner">
          <div className="section-label reveal">대관 가격표</div>
          <h2 className="section-title reveal reveal-delay-1">공간 대관<br/><em>이익의 레버리지</em></h2>
          <p className="section-body reveal reveal-delay-2">VAT 별도 가안. 대관 가동률이 이익률을 결정합니다. 전관대관 저녁·주말에는 F&amp;B 최소주문을 함께 설정해야 저수익 예약을 방어할 수 있습니다.</p>
          <div className="rental-table-wrap reveal reveal-delay-2">
            <table className="rental-table">
              <thead>
                <tr>
                  <th>상품</th>
                  <th>구성</th>
                  <th>예상 건수(월)</th>
                  <th>평균 단가</th>
                  <th>예상 월매출</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>부분대관 S</td>
                  <td style={{fontSize:'0.8rem'}}>라운지/프라이빗석, 4~8인, 4시간기준</td>
                  <td className="price text-center">{config.space.partSCountPerMonth}건</td>
                  <td className="price text-right">{config.space.partSAvgPrice.toLocaleString()}원</td>
                  <td className="price text-right" style={{color:'var(--amber)'}}>{(config.space.partSAvgPrice * config.space.partSCountPerMonth).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>부분대관 M</td>
                  <td style={{fontSize:'0.8rem'}}>클래스/세미나존, 15~20인, 4시간기준</td>
                  <td className="price text-center">{config.space.partMCountPerMonth}건</td>
                  <td className="price text-right">{config.space.partMAvgPrice.toLocaleString()}원</td>
                  <td className="price text-right" style={{color:'var(--amber)'}}>{(config.space.partMAvgPrice * config.space.partMCountPerMonth).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>전관대관 Half</td>
                  <td style={{fontSize:'0.8rem'}}>4시간, 25~35인, 행사·오프닝</td>
                  <td className="price text-center">{config.space.fullHalfCountPerMonth}건</td>
                  <td className="price text-right">{config.space.fullHalfAvgPrice.toLocaleString()}원</td>
                  <td className="price text-right" style={{color:'var(--amber)'}}>{(config.space.fullHalfAvgPrice * config.space.fullHalfCountPerMonth).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>전관대관 Full</td>
                  <td style={{fontSize:'0.8rem'}}>8시간, 25~35인, 종일 워크숍·전시</td>
                  <td className="price text-center">{config.space.fullFullCountPerMonth}건</td>
                  <td className="price text-right">{config.space.fullFullAvgPrice.toLocaleString()}원</td>
                  <td className="price text-right" style={{color:'var(--amber)'}}>{(config.space.fullFullAvgPrice * config.space.fullFullCountPerMonth).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>전시 패키지</td>
                  <td style={{fontSize:'0.8rem'}}>7일, 벽면 사용, 오픈나이트 별도</td>
                  <td className="price text-center">{config.space.exhibitionCountPerMonth}건</td>
                  <td className="price text-right">{config.space.exhibitionAvgPrice.toLocaleString()}원</td>
                  <td className="price text-right" style={{color:'var(--amber)'}}>{(config.space.exhibitionAvgPrice * config.space.exhibitionCountPerMonth).toLocaleString()}원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rental-note reveal reveal-delay-3">
            <strong>F&amp;B Minimum Spend 정책</strong>: 전관대관 저녁 30만원, 주말 50만원 최소 주문 필수 적용. 이 조항 없이 운영 시 "공간만 쓰고 음료는 거의 안 사는" 저수익 예약이 지속됩니다. 예약 확정은 계약금 20% 입금 시점. 외부 주류 반입 금지, 협의 시 corkage 별도 부과.
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="numbers" id="numbers">
        <div className="numbers-inner">
          <div className="numbers-header">
            <div>
              <div className="section-label reveal">재무 시나리오</div>
              <h2 className="section-title reveal reveal-delay-1">재무 목표<br/><em>수익성 분석</em></h2>
            </div>
            <p className="section-body reveal reveal-delay-2">
              카페 바닥 매출로 고정비를 방어하고, 대관과 와인으로 이익을 창출합니다. 
              객단가가 높은 야간 시간대와 대관 비중이 높아질수록 영업이익률이 급증하는 구조입니다.
            </p>
          </div>
          <div className="scenario-cards reveal reveal-delay-3">
            <div className="scenario-card">
              <div className="scenario-name">Conservative</div>
              <div className="scenario-revenue">1,800</div>
              <div className="scenario-unit">만원 / 월 매출</div>
              <div className="scenario-stats">
                <div className="stat-row">
                  <span className="stat-label">예상 영업이익</span>
                  <span className="stat-value">350 만원</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">대관 가동률</span>
                  <span className="stat-value">주 2회</span>
                </div>
              </div>
            </div>
            <div className="scenario-card featured">
              <div className="scenario-name highlight">Base Target</div>
              <div className="scenario-revenue">2,500</div>
              <div className="scenario-unit">만원 / 월 매출</div>
              <div className="scenario-stats">
                <div className="stat-row">
                  <span className="stat-label">예상 영업이익</span>
                  <span className="stat-value gold">800 만원 (32%)</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">대관 가동률</span>
                  <span className="stat-value">주 4회</span>
                </div>
              </div>
            </div>
            <div className="scenario-card">
              <div className="scenario-name">Optimistic</div>
              <div className="scenario-revenue">3,200</div>
              <div className="scenario-unit">만원 / 월 매출</div>
              <div className="scenario-stats">
                <div className="stat-row">
                  <span className="stat-label">예상 영업이익</span>
                  <span className="stat-value">1,350 만원</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">대관 가동률</span>
                  <span className="stat-value">주 6회</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHART */}
      <section className="chart-section" id="chart-section">
        <div className="chart-inner">
          <div className="chart-header">
            <div>
              <div className="section-label reveal">시뮬레이션</div>
              <h2 className="section-title reveal reveal-delay-1">손익분기점 (BEP)<br/><em>수익 곡선</em></h2>
            </div>
          </div>
          <div className="chart-wrap reveal reveal-delay-2" style={{ height: '400px', width: '100%', marginTop: '40px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--stone)" 
                  tickFormatter={(val) => `M+${val}`}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--stone)" 
                  tickFormatter={(val) => `${Math.round(val / 10000).toLocaleString()}`}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const label = name === 'totalRevenue' ? '총 매출' : name === 'totalCost' ? '총 비용 (고정+변동)' : name === 'totalFixed' ? '고정 비용' : name;
                    return [`${Math.round(value / 10000).toLocaleString()}만`, label];
                  }}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{ background: 'var(--charcoal)', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '8px', color: 'var(--cream)' }}
                  itemStyle={{ fontSize: '0.8rem' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', color: 'var(--stone)' }} 
                  formatter={(value) => {
                    if (value === 'totalRevenue') return '매출선';
                    if (value === 'totalCost') return '비용선';
                    if (value === 'totalFixed') return '고정 비용';
                    return value;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalFixed" 
                  name="totalFixed"
                  fill="rgba(201, 150, 58, 0.1)" 
                  stroke="none" 
                />
                <Line
                  type="monotone"
                  dataKey={(d) => d.totalFixed + d.totalCOGS}
                  name="totalCost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  name="totalRevenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--black)', stroke: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team" id="team">
        <div className="team-inner">
          <div className="section-label reveal">인력 운영 계획</div>
          <h2 className="section-title reveal reveal-delay-1">매니저 중심<br/><em>경량 운영 체계</em></h2>
          <p className="section-body reveal reveal-delay-2">외식업 평균 인건비 비율을 고려한 효율적 인력 설계. 책임 매니저 중심의 자율 운영 시스템을 지향합니다. 총 인건비 월 790만원 목표.</p>
          <div className="team-grid">
            <div className="team-card reveal">
              <div className="team-role">General Manager</div>
              <div className="team-name">책임 매니저</div>
              <div className="team-hours">주 46~50시간</div>
              <div className="team-salary">250</div>
              <div className="team-salary-unit">만원 / 월</div>
              <div className="team-tasks">
                <div className="team-task">총괄 운영 및 바 운영 주관</div>
                <div className="team-task">대관 상담 및 견적 관리</div>
                <div className="team-task">발주·재고 관리 및 정산</div>
                <div className="team-task">SNS 및 브랜딩 콘텐츠 제작</div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-1">
              <div className="team-role">Part A — Daytime</div>
              <div className="team-name">주간 파트</div>
              <div className="team-hours">주 26~30시간</div>
              <div className="team-salary">190</div>
              <div className="team-salary-unit">만원 / 월</div>
              <div className="team-tasks">
                <div className="team-task">주간 커피 바 운영 주관</div>
                <div className="team-task">홀 서비스 및 청결 관리</div>
                <div className="team-task">주간 대관 행사 지원</div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-2">
              <div className="team-role">Part B — Evening</div>
              <div className="team-name">저녁 파트</div>
              <div className="team-hours">주 18~22시간</div>
              <div className="team-salary">150</div>
              <div className="team-salary-unit">만원 / 월</div>
              <div className="team-tasks">
                <div className="team-task">저녁 와인 서비스 주관</div>
                <div className="team-task">영업 마감 및 보안 관리</div>
                <div className="team-task">금·토 피크 타임 응대</div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-3">
              <div className="team-role">Part C — Spot</div>
              <div className="team-name">예약형 스팟</div>
              <div className="team-hours">월 30~40시간 (가변)</div>
              <div className="team-salary">90</div>
              <div className="team-salary-unit">만원 / 월</div>
              <div className="team-tasks">
                <div className="team-task">대관 세팅 및 철수 주관</div>
                <div className="team-task">주말/행사 피크 보조</div>
                <div className="team-task">특수 행사 시 현장 전담</div>
              </div>
            </div>
          </div>
          <div className="rental-note reveal reveal-delay-3" style={{marginTop: '40px', fontSize: '0.8rem', opacity: 0.8}}>
            ⚠️ <strong>주 15시간 기준</strong> — 주 15시간 이상 근무자는 주휴수당 발생. 파트 B는 주휴수당 발생 구간 주의. 파트 C는 예약형 스팟으로 15시간 미만 설계. 법정비용·예비 항목 110만원 별도 적립.
          </div>
        </div>
      </section>

      {/* RISK */}
      <section className="risk">
        <div className="risk-inner">
          <div className="section-label reveal">리스크 대응</div>
          <h2 className="section-title reveal reveal-delay-1">예상 리스크 &amp;<br/><em>대응 계획</em></h2>
          <div className="risk-grid">
            <div className="risk-card reveal">
              <div className="risk-title">대관 미달</div>
              <div className="risk-trigger">📊 징후: 월 대관 6건 미만, 주말 공실 지속</div>
              <div className="risk-response">가격표 재조정, 부분대관 S 상품 확대. B2B 아웃바운드 강화. 인근 오피스·크리에이터 커뮤니티 타겟 직접 영업.</div>
            </div>
            <div className="risk-card reveal reveal-delay-1">
              <div className="risk-title">카페 매출 저조</div>
              <div className="risk-trigger">📊 징후: 평일 낮 테이블 점유율 저하</div>
              <div className="risk-response">Quiet Work Session, 워크패스 프로그램 도입. 인근 오피스·프리랜서 대상 월정액 카드. 주간 고정 고객 확보 우선.</div>
            </div>
            <div className="risk-card reveal reveal-delay-2">
              <div className="risk-title">와인 서비스 피로</div>
              <div className="risk-trigger">📊 징후: 저녁 민원·소음·과음 사고</div>
              <div className="risk-response">와인 SKU 축소, 라스트오더 22:00 엄격화. 21시 이후 BGM 다운, 팀 간 간섭 통제. "조용한 와인 라운지" 선 유지.</div>
            </div>
            <div className="risk-card reveal">
              <div className="risk-title">인건비 과다</div>
              <div className="risk-trigger">📊 징후: 오너 제외 인건비 700만원 초과</div>
              <div className="risk-response">월요일 휴무 고정 준수. 예약형 스팟만 호출하는 원칙 유지. 파트 확충보다 영업일 축소 우선 검토.</div>
            </div>
            <div className="risk-card reveal reveal-delay-1">
              <div className="risk-title">인허가·민원</div>
              <div className="risk-trigger">📊 징후: 소음, 주류 관련 민원, 청소년 이슈</div>
              <div className="risk-response">일반음식점 준수 사항 고정. CCTV 바 앞 각도 유지. "90년대생처럼 보이지 않으면 무조건 신분증 확인" 실무 기준 적용.</div>
            </div>
            <div className="risk-card reveal reveal-delay-2">
              <div className="risk-title">재건축 일정 변동</div>
              <div className="risk-trigger">📊 징후: 종료 시점 불확실</div>
              <div className="risk-response">3개월 전 신규 장기예약 제한. 장비 매각 리스트 사전 작성. 에스프레소 머신·AV·폴딩가구 중고 회수 계획 선수립.</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CAPEX */}
      <section className="capex" id="capex">
        <div className="capex-inner">
          <div className="section-label reveal">투자금 및 회수</div>
          <h2 className="section-title reveal reveal-delay-1">CAPEX<br/><em>초기 투자 지출</em></h2>
          <div className="capex-big">
            <div className="capex-visual reveal reveal-delay-2">
              <div className="capex-center-label">
                <div className="capex-total">{(totalAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="capex-total-label">총 투자금 (만원)</div>
              </div>
              <div className="capex-breakdown">
                <div className="capex-row">
                  <div className="capex-bar-label">인테리어 공사</div>
                  <div className="capex-bar-track"><div className="capex-bar-fill" style={{width: getWidth(interiorAmount)}}></div></div>
                  <div className="capex-bar-value">{(interiorAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>
            <div className="capex-recovery reveal reveal-delay-3">
              <div className="recovery-title">Payback Simulation</div>
              <div className="recovery-sub">무권리 및 무보증 전제 하의 시나리오별 예상 투자금 회수 기간 분석 결과입니다.</div>
              <div className="recovery-bars">
                <div className="recovery-item">
                  <div className="recovery-scenario"><span className="rec-name">Conservative</span><span className="rec-month">12 Months</span></div>
                  <div className="recovery-track"><div className="recovery-fill rf-conservative"></div></div>
                </div>
                <div className="recovery-item">
                  <div className="recovery-scenario"><span className="rec-name">Base Target</span><span className="rec-month">6 Months</span></div>
                  <div className="recovery-track"><div className="recovery-fill rf-base" style={{animationDelay: '0.2s'}}></div></div>
                </div>
                <div className="recovery-item">
                  <div className="recovery-scenario"><span className="rec-name">Optimistic</span><span className="rec-month">3.5 Months</span></div>
                  <div className="recovery-track"><div className="recovery-fill rf-optimistic" style={{animationDelay: '0.4s'}}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

