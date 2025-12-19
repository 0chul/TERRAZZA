
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GlobalConfig } from '../types';
import { 
    BrainCircuit, 
    Sparkles, 
    TrendingUp, 
    ShieldAlert, 
    Target, 
    Lightbulb, 
    Loader2,
    CheckCircle2,
    ArrowRight,
    // Add missing FileText import
    FileText
} from 'lucide-react';

interface StrategyTabProps {
  config: GlobalConfig;
  financials: any;
  bepMonth: string;
}

export const StrategyTab: React.FC<StrategyTabProps> = ({ config, financials, bepMonth }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        당신은 프리미엄 복합 문화 공간 'Terrazza Lounge'의 전문 비즈니스 컨설턴트입니다. 
        카페, 공간대여, 와인바 3가지 사업이 결합된 현재의 사업 계획을 분석하고 전략적인 조언을 제공해주세요.

        현재 설정 데이터:
        - 카페: 좌석 ${config.cafe.seatCount}개, 일 영업 ${config.cafe.operatingHours}시간, 회전율 ${config.cafe.turnoverTarget*100}%, 테이크아웃 ${config.cafe.takeoutRatio*100}%
        - 공간대여: 시간당 ${config.space.hourlyRate}원, 가동률 ${config.space.utilizationRate*100}%
        - 와인바: 객단가 ${config.wine.avgTicketPrice}원, 원가율 ${config.wine.costOfGoodsSoldRate*100}%
        - 재무 요약: 월 매출 ₩${Math.round(financials.totalRevenue).toLocaleString()}, 월 순이익 ₩${Math.round(financials.netProfit).toLocaleString()}, 초기 투자 ₩${Math.round(financials.totalInvestment).toLocaleString()}, BEP ${bepMonth}

        다음 항목을 포함하여 전문적이고 구체적인 비즈니스 리포트를 작성해주세요:
        1. SWOT 분석 (강점, 약점, 기회, 위협)
        2. 3-in-1 복합 모델의 시너지 극대화 전략
        3. 수익성 개선을 위한 핵심 액션 플랜 (변동되는 계획별 최적화 팁 포함)
        4. Terrazza만의 프리미엄 브랜딩 제언

        형식: 읽기 쉬운 마크다운(Markdown) 스타일로 작성하고, 전문적이지만 열정적인 톤을 유지하세요.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "분석 결과를 가져오지 못했습니다.");
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-[#5d4037] to-[#3e2723] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-xl backdrop-blur-md">
                <BrainCircuit className="text-orange-400" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">AI 비즈니스 전략 엔진</h2>
          </div>
          <p className="text-orange-100 text-lg leading-relaxed mb-8 font-medium">
            현재 설정된 데이터를 기반으로 Gemini AI가 Terrazza Lounge의 사업 성공 가능성을 분석합니다. 
            상황별 변동 계획에 따른 최적의 운영 전략과 시너지 창출 방안을 확인하세요.
          </p>
          <button 
            onClick={generateStrategy}
            disabled={loading}
            className="group relative flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />}
            {analysis ? '전략 다시 분석하기' : 'AI 맞춤 전략 리포트 생성'}
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-orange-100 shadow-sm">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
          <p className="text-lg font-bold text-[#5d4037]">비즈니스 모델 분석 중...</p>
          <p className="text-sm text-gray-500 mt-2">Terrazza의 데이터를 기반으로 최적의 시나리오를 구상하고 있습니다.</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 flex items-center gap-4">
          <ShieldAlert size={24} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-orange-50 bg-orange-50/30 flex items-center justify-between">
                <h3 className="font-black text-xl text-[#5d4037] flex items-center gap-2">
                    <FileText className="text-orange-600" size={24} />
                    맞춤형 사업 계획 분석 리포트
                </h3>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-orange-100">AI GEN v3.0</span>
            </div>
            <div className="p-10 prose prose-orange max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-orange-100 shadow-sm">
                <h4 className="font-bold text-[#5d4037] mb-6 flex items-center gap-2">
                    <Target className="text-orange-600" size={20} />
                    전략적 핵심 지표
                </h4>
                <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-2xl">
                        <div className="text-[10px] font-black text-orange-400 uppercase mb-1">매출 효율성</div>
                        <div className="text-xl font-black text-[#5d4037]">₩{(financials.totalRevenue / (config.cafe.seatCount || 1)).toLocaleString()}</div>
                        <div className="text-xs text-orange-600 font-bold mt-1">좌석당 월 매출</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl">
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-1">수익 안정성</div>
                        <div className="text-xl font-black text-[#3e2723]">{Math.round((financials.netProfit / financials.totalRevenue) * 100)}%</div>
                        <div className="text-xs text-blue-600 font-bold mt-1">영업 이익률</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                        <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">투자 회수율</div>
                        <div className="text-xl font-black text-[#3e2723]">{bepMonth}</div>
                        <div className="text-xs text-emerald-600 font-bold mt-1">손익분기 도달 예상</div>
                    </div>
                </div>
            </div>

            <div className="bg-[#5d4037] p-8 rounded-3xl shadow-xl text-white">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                    <Lightbulb className="text-orange-400" size={20} />
                    오늘의 전문가 팁
                </h4>
                <div className="space-y-4 text-sm text-orange-100 leading-relaxed">
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-orange-400 shrink-0" size={18} />
                        <p>카페 고객의 데이터(선호 음료, 방문 시간)를 와인바 마케팅에 활용해 '낮 고객'의 '밤 전환'을 유도하세요.</p>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-orange-400 shrink-0" size={18} />
                        <p>공간 대여 가동률이 낮은 평일 오전 시간대에 '로컬 커뮤니티' 대상 소모임 패키지를 런칭해보세요.</p>
                    </div>
                    <div className="flex gap-3">
                        <ArrowRight className="text-orange-400 shrink-0" size={18} />
                        <p className="font-bold text-white">상세 설정 탭에서 수치를 변경해 AI 분석을 다시 실행할 수 있습니다.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
      
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-orange-100">
            <div className="p-4 bg-orange-50 rounded-full mb-6">
                <Sparkles className="text-orange-300" size={48} />
            </div>
            <h3 className="text-xl font-bold text-[#5d4037]">비즈니스 분석이 준비되었습니다.</h3>
            <p className="text-gray-500 mt-2">상단의 버튼을 눌러 AI가 제안하는 맞춤형 비즈니스 전략을 확인하세요.</p>
        </div>
      )}
    </div>
  );
};
