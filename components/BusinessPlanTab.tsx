
import React from 'react';
import { 
  Target, 
  Users, 
  Smartphone, 
  MapPin, 
  Share2, 
  Calendar, 
  Heart, 
  Briefcase,
  Megaphone,
  Repeat,
  TrendingUp,
  Layout
} from 'lucide-react';

export const BusinessPlanTab: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 bg-[#5d4037] rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Terrazza</h1>
          <p className="text-xl md:text-2xl font-light text-orange-100 max-w-2xl mx-auto">
            성공적인 론칭을 위한 광고 운영 및 행사 실행 전략
          </p>
          <div className="mt-8 w-24 h-1 bg-orange-400 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-4 text-[#5d4037]">
            <Target size={28} />
            <h2 className="text-2xl font-bold">우리의 비전</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            Terrazza는 단순한 대여 공간이 아닌, 사람들이 모여 <span className="font-bold text-[#5d4037]">새로운 관계</span>를 맺고, 
            영감을 나누며 잊지 못할 경험을 만들어가는 <span className="font-bold text-[#5d4037]">강남의 새로운 문화 거점</span>이 되는 것을 목표로 합니다.
          </p>
        </div>
        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-3 mb-4 text-orange-800">
            <Briefcase size={28} />
            <h2 className="text-2xl font-bold">현실적인 과제</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-700">
              <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>수많은 경쟁 공간 속에서 Terrazza의 존재를 어떻게 각인시킬 것인가?</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>단발성 방문객을 어떻게 충성도 높은 커뮤니티 멤버로 전환할 것인가?</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>초기 인지도를 성공적으로 확보하고 안정적인 운영 기반을 마련할 것인가?</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Two Core Strategies */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#3e2723] mb-2">하나의 목표를 위한 두 개의 핵심 전략</h2>
          <p className="text-gray-500">Digital Reach & Community Building</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-md">
             <span className="font-bold text-[#5d4037] px-2">Terrazza</span>
          </div>

          {/* Strategy 1 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Smartphone size={120} />
            </div>
            <h3 className="text-xl font-bold text-blue-200 mb-2 uppercase tracking-widest">Strategy 01</h3>
            <h4 className="text-2xl font-bold mb-4">압도적인 디지털 리치<br/>(Digital Reach)</h4>
            <p className="text-slate-300 mb-6 leading-relaxed">
              잠재 고객이 있는 모든 디지털 채널에 Terrazza를 노출시켜, 인지도를 극대화하고 결정적 순간에 선택받는 전략입니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">#타겟광고</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">#검색최적화</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs">#플랫폼입점</span>
            </div>
          </div>

          {/* Strategy 2 */}
          <div className="bg-gradient-to-br from-[#5d4037] to-[#3e2723] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={120} />
            </div>
            <h3 className="text-xl font-bold text-orange-200 mb-2 uppercase tracking-widest">Strategy 02</h3>
            <h4 className="text-2xl font-bold mb-4">강력한 커뮤니티 구축<br/>(Community Building)</h4>
            <p className="text-orange-100/80 mb-6 leading-relaxed">
              오프라인 경험을 통해 방문객을 팬으로 만들고, 지속적인 관계를 형성하여 자발적인 바이럴을 유도하는 전략입니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#4e342e] border border-orange-900/50 rounded-full text-xs">#오프닝이벤트</span>
              <span className="px-3 py-1 bg-[#4e342e] border border-orange-900/50 rounded-full text-xs">#시그니처프로그램</span>
              <span className="px-3 py-1 bg-[#4e342e] border border-orange-900/50 rounded-full text-xs">#B2B네트워킹</span>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Channel Detail */}
      <section>
        <h3 className="text-2xl font-bold text-[#3e2723] mb-8 border-l-4 border-orange-500 pl-4">
          전략 1: 디지털 채널 포트폴리오
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">META (IG/FB)</h4>
              <Smartphone className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
              단순 노출을 넘어 행동을 유도하는 퀄리티 리치 전략
            </p>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
              <div className="flex gap-2">
                <span className="font-bold text-blue-800">M3</span>
                <span>단기간 타겟 40~60% 도달</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-blue-800">Story</span>
                <span>브랜드 메시지 깊이 각인</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-400 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">NAVER Place</h4>
              <MapPin className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
              '강남 파티룸' 등 명확한 목적을 가진 고객의 최종 결정 단계 선점
            </p>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
              <div>✅ 지도 검색 광고 집행</div>
              <div>✅ 플레이스 상위 노출 최적화</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-400 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">당근마켓</h4>
              <MapPin className="text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
              반포, 서초 등 핵심 상권 내 지역 주민 대상 정밀 타겟팅
            </p>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
              <div>🎯 서초구 내곡동, 반포1~5동 타겟</div>
              <div>👥 예상 타겟 약 41만명 도달</div>
            </div>
          </div>
          
           <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-400 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">플랫폼 (SpaceCloud)</h4>
              <Layout className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
              대관 목적 고객에게 직접 노출하는 핵심 판매 채널
            </p>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
              <div>⭐ '강남 대형 파티룸' 키워드 선점</div>
              <div>📸 매력적인 대표 사진 세팅</div>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Strategy Roadmap */}
      <section>
        <h3 className="text-2xl font-bold text-[#3e2723] mb-8 border-l-4 border-orange-500 pl-4">
          전략 2: 오프라인 경험 로드맵
        </h3>
        
        <div className="relative border-l-2 border-orange-200 ml-4 md:ml-6 space-y-12 pb-8">
          {/* Phase 1 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
            <h4 className="text-lg font-bold text-orange-800 mb-1">Phase 1: 론칭 이벤트 (첫인상)</h4>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mt-3">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-bold mb-2 flex items-center gap-2"><Calendar size={16}/> Soft Opening Week</h5>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>운영 프로세스 최종 점검 및 리허설</li>
                    <li>초기 리뷰, 사진 등 온라인 확산용 콘텐츠 확보</li>
                    <li>100% 예약제 (타임 슬롯 운영)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold mb-2 flex items-center gap-2"><Heart size={16}/> Terrazza Open Table</h5>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>저녁 와인 라운지로서의 정체성 강화</li>
                    <li>동네 주민 및 직장인 대상 고정 고객 확보</li>
                    <li>웰컴 와인 1잔 및 스몰 플레이트 제공</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-400 ring-4 ring-orange-100"></div>
            <h4 className="text-lg font-bold text-orange-800 mb-1">Phase 2: 팬덤 형성 (시그니처)</h4>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-3">
              <p className="text-sm text-gray-600 mb-3">
                '오픈 테이블'과 같은 정기적인 이벤트를 통해 고정 고객을 만들고 Terrazza만의 문화를 구축합니다.
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative pl-8 md:pl-12">
             <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#5d4037] ring-4 ring-orange-100"></div>
            <h4 className="text-lg font-bold text-[#5d4037] mb-1">Phase 3: 비즈니스 확장 (B2B)</h4>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-3">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-bold mb-2 text-sm text-gray-800">Daytime: 원데이 클래스</h5>
                  <p className="text-sm text-gray-600">클래스 수강생들에게 공간을 자연스럽게 알리고, 잠재적인 대관 고객으로 전환</p>
                </div>
                <div>
                  <h5 className="font-bold mb-2 text-sm text-gray-800">Evening: 미니 세미나</h5>
                  <p className="text-sm text-gray-600">기업 행사 담당자 초청, 공간 시설과 케이터링 직접 경험 유도</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Cycle */}
      <section className="bg-[#fff3e0] rounded-3xl p-8 text-center">
        <div className="flex flex-col items-center mb-8">
           <Repeat className="text-orange-600 mb-4" size={48} />
           <h3 className="text-2xl font-bold text-[#5d4037]">선순환 성장 모델 (Flywheel)</h3>
           <p className="text-orange-800/70 mt-2">디지털과 오프라인이 만나 만드는 강력한 시너지</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { title: "1. 디지털 광고", desc: "인지도 상승 & 신규 유입" },
             { title: "2. 행사 참여", desc: "오프라인 경험 & 만족도" },
             { title: "3. 자발적 공유", desc: "리뷰 및 UGC 생성" },
             { title: "4. 2차 확산", desc: "신뢰도 높은 광고 소재 확보" }
           ].map((step, idx) => (
             <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 relative">
                {idx < 3 && <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-orange-300">▶</div>}
                <div className="font-bold text-[#5d4037] mb-1">{step.title}</div>
                <div className="text-xs text-gray-500">{step.desc}</div>
             </div>
           ))}
        </div>
      </section>

      {/* Budget Allocation */}
      <section>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-2xl font-bold text-[#3e2723]">마케팅 예산 배분</h3>
           <span className="text-sm font-bold bg-[#5d4037] text-white px-3 py-1 rounded-full">Total: 3,500만원 / 연</span>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex flex-col md:flex-row gap-8 items-center">
             <div className="flex-1 w-full space-y-4">
               <div className="flex justify-between items-end">
                 <span className="font-bold text-lg text-gray-700">Online Marketing</span>
                 <span className="text-2xl font-black text-blue-600">60%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                 <div className="bg-blue-500 h-full rounded-full" style={{width: '60%'}}></div>
               </div>
               <p className="text-sm text-gray-500">씨앗 뿌리기 - 잠재 고객에게 브랜드를 각인시키다 (2,100만원)</p>
               <div className="flex gap-2 mt-2">
                 <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">플랫폼</span>
                 <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">META광고</span>
                 <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">지역광고</span>
               </div>
             </div>
             
             <div className="hidden md:block w-px h-32 bg-gray-200"></div>

             <div className="flex-1 w-full space-y-4">
               <div className="flex justify-between items-end">
                 <span className="font-bold text-lg text-gray-700">Offline Event</span>
                 <span className="text-2xl font-black text-orange-600">40%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                 <div className="bg-orange-500 h-full rounded-full" style={{width: '40%'}}></div>
               </div>
               <p className="text-sm text-gray-500">열매 맺기 - 방문객을 충성 고객으로 만들다 (1,400만원)</p>
               <div className="flex gap-2 mt-2">
                 <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">소프트오픈</span>
                 <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">오픈테이블</span>
                 <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">쇼케이스</span>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Footer / Future Vision */}
      <section className="text-center space-y-6 pt-12 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-[#5d4037]">우리가 함께 만들어갈 Terrazza의 미래</h3>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          우리의 전략은 단순히 공간을 채우는 것을 넘어섭니다.<br/>
          체계적인 디지털 전략으로 <span className="text-[#5d4037] font-bold">가장 먼저 기억되는 공간</span>이 되고,<br/>
          진정성 있는 오프라인 경험으로 <span className="text-[#5d4037] font-bold">다시 찾고 싶은 공간</span>이 될 것입니다.
        </p>
        <div className="text-sm text-gray-400 mt-8">
           사람과 이야기가 모이고, 새로운 기회가 시작되는 커뮤니티의 중심
        </div>
      </section>

    </div>
  );
};
