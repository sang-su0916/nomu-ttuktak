'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CompanyInfo } from '@/types';
import { loadCompanyInfo, defaultCompanyInfo } from '@/lib/storage';

interface WorkRulesData {
  company: CompanyInfo;
  // 근로시간
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  breakTime: number;
  workDays: string[];
  weeklyHours: number;
  // 임금
  paymentDate: number;
  paymentMethod: string;
  // 휴가
  annualLeave: number;
  // 인사
  probationPeriod: number;
  retirementAge: number;
  // 경조사
  marriageLeave: number;
  bereavementLeave: number;
  childBirthLeave: number;
  // 징계
  disciplineTypes: string[];
  // 기타
  effectiveDate: string;
  industryType: string;
  employeeCount: string;
  
  // ========== 2025년 개정 옵션 ==========
  // 배우자 출산휴가 (2025.2.23 시행)
  spouseLeave2025: boolean; // true: 20일, false: 10일(기존)
  
  // 육아휴직 확대 (2025.2.23 시행)
  parentalLeave2025: boolean; // true: 1년6개월, false: 1년
  
  // 육아기 근로시간 단축 확대
  childcareReduction2025: boolean; // true: 12세이하, false: 8세이하
  
  // 난임치료휴가 확대
  infertilityLeave2025: boolean; // true: 6일, false: 3일
  
  // ========== 고용지원금 옵션 ==========
  // 정년연장 (고령자 계속고용장려금)
  enableRetirementExtension: boolean;
  extendedRetirementAge: number; // 65세 등
  
  // 정년 후 재고용 (촉탁직)
  enableReemployment: boolean;
  reemploymentPeriod: number; // 재고용 기간 (년)
  
  // 임금피크제
  enableWagePeak: boolean;
  wagePeakStartAge: number;
  wagePeakReductionRate: number; // %
  
  // ========== 유연근무제 옵션 ==========
  enableFlexibleWork: boolean;
  flexibleWorkTypes: string[]; // 선택근로, 재택근무, 시차출퇴근
  
  // ========== 5인 미만 사업장 옵션 ==========
  isSmallBusiness: boolean; // 5인 미만 여부
}

const defaultWorkRules: WorkRulesData = {
  company: defaultCompanyInfo,
  workStartTime: '09:00',
  workEndTime: '18:00',
  breakStartTime: '12:00',
  breakEndTime: '13:00',
  breakTime: 60,
  workDays: ['월', '화', '수', '목', '금'],
  weeklyHours: 40,
  paymentDate: 25,
  paymentMethod: '근로자가 지정한 금융기관 계좌',
  annualLeave: 15,
  probationPeriod: 3,
  retirementAge: 60,
  marriageLeave: 5,
  bereavementLeave: 5,
  childBirthLeave: 10,
  disciplineTypes: ['견책', '감봉', '정직', '해고'],
  effectiveDate: new Date().toISOString().split('T')[0],
  industryType: '서비스업',
  employeeCount: '10인 이상',
  
  // 2025년 개정 옵션 (기본: 적용)
  spouseLeave2025: true,
  parentalLeave2025: true,
  childcareReduction2025: true,
  infertilityLeave2025: true,
  
  // 고용지원금 옵션 (기본: 미적용)
  enableRetirementExtension: false,
  extendedRetirementAge: 65,
  enableReemployment: false,
  reemploymentPeriod: 2,
  enableWagePeak: false,
  wagePeakStartAge: 58,
  wagePeakReductionRate: 10,
  
  // 유연근무제 (기본: 미적용)
  enableFlexibleWork: false,
  flexibleWorkTypes: [],
  
  // 5인 미만 (기본: 아니오)
  isSmallBusiness: false,
};

export default function WorkRulesPage() {
  const [rules, setRules] = useState<WorkRulesData>(defaultWorkRules);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCompany = loadCompanyInfo();
    if (savedCompany) {
      setRules(prev => ({ ...prev, company: savedCompany }));
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `취업규칙_${rules.company.name}`,
  });

  const sections = [
    { id: 'basic', label: '기본 정보', icon: '🏢' },
    { id: 'worktime', label: '근로시간', icon: '⏰' },
    { id: 'wage', label: '임금', icon: '💰' },
    { id: 'leave', label: '휴가', icon: '🏖️' },
    { id: 'law2025', label: '2025 개정', icon: '⭐' },
    { id: 'subsidy', label: '고용지원금', icon: '💵' },
    { id: 'flexible', label: '유연근무', icon: '🏠' },
    { id: 'discipline', label: '상벌', icon: '⚖️' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 취업규칙</h1>
          <p className="text-gray-500 mt-1">고용노동부 표준 취업규칙 (2025년 개정 반영)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
          >
            {showPreview ? '✏️ 수정하기' : '👁️ 미리보기'}
          </button>
          <button onClick={() => handlePrint()} className="btn-primary">
            🖨️ 인쇄/PDF
          </button>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>📌 2025년 개정 법령 반영</strong><br />
          배우자 출산휴가 20일, 육아휴직 1년6개월, 육아기 근로시간 단축 12세 이하 등 2025.2.23 시행 법령이 반영되었습니다.
          <strong> 고용지원금</strong> 수령을 위한 정년연장/재고용 조항도 옵션으로 추가할 수 있습니다.
        </p>
      </div>

      {!showPreview ? (
        <div className="flex gap-6">
          {/* 사이드 네비게이션 */}
          <div className="w-48 flex-shrink-0">
            <nav className="sticky top-4 space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition text-sm ${
                    activeSection === section.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {section.icon} {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 폼 영역 */}
          <div className="flex-1 space-y-6">
            {activeSection === 'basic' && (
              <div className="form-section">
                <h2 className="form-section-title">🏢 기본 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">상호 *</label>
                    <input type="text" className="input-field bg-gray-50" value={rules.company.name} readOnly />
                    <p className="text-xs text-gray-500 mt-1">설정에서 변경 가능</p>
                  </div>
                  <div>
                    <label className="input-label">대표자 *</label>
                    <input type="text" className="input-field bg-gray-50" value={rules.company.ceoName} readOnly />
                  </div>
                  <div>
                    <label className="input-label">사업자등록번호</label>
                    <input type="text" className="input-field bg-gray-50" value={rules.company.businessNumber} readOnly />
                  </div>
                  <div>
                    <label className="input-label">업종</label>
                    <select
                      className="input-field"
                      value={rules.industryType}
                      onChange={(e) => setRules(prev => ({ ...prev, industryType: e.target.value }))}
                    >
                      <option value="제조업">제조업</option>
                      <option value="서비스업">서비스업</option>
                      <option value="건설업">건설업</option>
                      <option value="도소매업">도소매업</option>
                      <option value="음식숙박업">음식숙박업</option>
                      <option value="운수업">운수업</option>
                      <option value="정보통신업">정보통신업</option>
                      <option value="금융보험업">금융보험업</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">상시 근로자 수</label>
                    <select
                      className="input-field"
                      value={rules.employeeCount}
                      onChange={(e) => {
                        const isSmall = e.target.value === '5인 미만';
                        setRules(prev => ({ ...prev, employeeCount: e.target.value, isSmallBusiness: isSmall }));
                      }}
                    >
                      <option value="5인 미만">5인 미만</option>
                      <option value="5~9인">5~9인</option>
                      <option value="10인 이상">10인 이상</option>
                      <option value="30인 이상">30인 이상</option>
                      <option value="100인 이상">100인 이상</option>
                    </select>
                    {rules.isSmallBusiness && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ 5인 미만 사업장은 일부 조항 적용 제외</p>
                    )}
                  </div>
                  <div>
                    <label className="input-label">수습기간 (개월)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={rules.probationPeriod}
                      onChange={(e) => setRules(prev => ({ ...prev, probationPeriod: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">정년 (세)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={rules.retirementAge}
                      min={60}
                      onChange={(e) => setRules(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 60 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">고용상 연령차별금지법: 최소 60세</p>
                  </div>
                  <div>
                    <label className="input-label">시행일</label>
                    <input
                      type="date"
                      className="input-field"
                      value={rules.effectiveDate}
                      onChange={(e) => setRules(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'worktime' && (
              <div className="form-section">
                <h2 className="form-section-title">⏰ 근로시간 및 휴게</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">시업 시각</label>
                    <input
                      type="time"
                      className="input-field"
                      value={rules.workStartTime}
                      onChange={(e) => setRules(prev => ({ ...prev, workStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">종업 시각</label>
                    <input
                      type="time"
                      className="input-field"
                      value={rules.workEndTime}
                      onChange={(e) => setRules(prev => ({ ...prev, workEndTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">휴게 시작</label>
                    <input
                      type="time"
                      className="input-field"
                      value={rules.breakStartTime}
                      onChange={(e) => setRules(prev => ({ ...prev, breakStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">휴게 종료</label>
                    <input
                      type="time"
                      className="input-field"
                      value={rules.breakEndTime}
                      onChange={(e) => setRules(prev => ({ ...prev, breakEndTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">휴게시간 (분)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={rules.breakTime}
                      onChange={(e) => setRules(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">주 소정근로시간</label>
                    <input
                      type="number"
                      className="input-field"
                      value={rules.weeklyHours}
                      max={40}
                      onChange={(e) => setRules(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 40 }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label">근무일</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rules.workDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRules(prev => ({ ...prev, workDays: [...prev.workDays, day] }));
                              } else {
                                setRules(prev => ({ ...prev, workDays: prev.workDays.filter(d => d !== day) }));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span>{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'wage' && (
              <div className="form-section">
                <h2 className="form-section-title">💰 임금</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">급여 지급일</label>
                    <select
                      className="input-field"
                      value={rules.paymentDate}
                      onChange={(e) => setRules(prev => ({ ...prev, paymentDate: parseInt(e.target.value) }))}
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>매월 {day}일</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">지급 방법</label>
                    <select
                      className="input-field"
                      value={rules.paymentMethod}
                      onChange={(e) => setRules(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="근로자가 지정한 금융기관 계좌">계좌이체</option>
                      <option value="현금">현금 지급</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'leave' && (
              <div className="space-y-6">
                <div className="form-section">
                  <h2 className="form-section-title">🏖️ 연차휴가</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">연차휴가 (일)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rules.annualLeave}
                        onChange={(e) => setRules(prev => ({ ...prev, annualLeave: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">🎊 경조사 휴가</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="input-label">본인 결혼 (일)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rules.marriageLeave}
                        onChange={(e) => setRules(prev => ({ ...prev, marriageLeave: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="input-label">부모/배우자 사망 (일)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rules.bereavementLeave}
                        onChange={(e) => setRules(prev => ({ ...prev, bereavementLeave: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== 2025년 개정사항 ========== */}
            {activeSection === 'law2025' && (
              <div className="space-y-6">
                <div className="form-section">
                  <h2 className="form-section-title">⭐ 2025년 법령 개정사항</h2>
                  <p className="text-sm text-gray-600 mb-4">2025.2.23 시행 개정 법령을 반영합니다. 옵션을 끄면 기존(2024년) 기준이 적용됩니다.</p>
                  
                  <div className="space-y-4">
                    {/* 배우자 출산휴가 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rules.spouseLeave2025}
                          onChange={(e) => setRules(prev => ({ ...prev, spouseLeave2025: e.target.checked }))}
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">배우자 출산휴가 확대</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {rules.spouseLeave2025 
                              ? '✅ 20일 (120일 이내 청구, 3회 분할 가능)' 
                              : '❌ 10일 (90일 이내 청구, 1회 분할)'}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* 육아휴직 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rules.parentalLeave2025}
                          onChange={(e) => setRules(prev => ({ ...prev, parentalLeave2025: e.target.checked }))}
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">육아휴직 기간 확대</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {rules.parentalLeave2025 
                              ? '✅ 1년 6개월 (부모 각 3개월 이상 사용 시, 한부모, 중증장애아동 부모)' 
                              : '❌ 1년'}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">분할 횟수: 2회 → 4회</p>
                        </div>
                      </label>
                    </div>

                    {/* 육아기 근로시간 단축 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rules.childcareReduction2025}
                          onChange={(e) => setRules(prev => ({ ...prev, childcareReduction2025: e.target.checked }))}
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">육아기 근로시간 단축 확대</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {rules.childcareReduction2025 
                              ? '✅ 대상: 12세 이하 (초등 6학년), 최소 1개월 분할, 최대 3년' 
                              : '❌ 대상: 8세 이하 (초등 2학년), 최소 3개월 분할'}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* 난임치료휴가 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rules.infertilityLeave2025}
                          onChange={(e) => setRules(prev => ({ ...prev, infertilityLeave2025: e.target.checked }))}
                          className="w-5 h-5 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">난임치료휴가 확대</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {rules.infertilityLeave2025 
                              ? '✅ 연 6일 (유급 2일)' 
                              : '❌ 연 3일 (유급 1일)'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>💡 참고:</strong> 임신기 근로시간 단축(32주→36주 이후), 출산전후휴가(미숙아 100일) 등은 자동 반영됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========== 고용지원금 옵션 ========== */}
            {activeSection === 'subsidy' && (
              <div className="space-y-6">
                <div className="form-section">
                  <h2 className="form-section-title">💵 고용지원금 관련 조항</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    고령자 계속고용장려금, 정년연장 지원금 등을 받기 위해 필요한 취업규칙 조항입니다.
                  </p>

                  {/* 정년연장 */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.enableRetirementExtension}
                        onChange={(e) => setRules(prev => ({ ...prev, enableRetirementExtension: e.target.checked }))}
                        className="w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-green-800">🎯 정년연장 (계속고용장려금)</span>
                        <p className="text-sm text-green-700 mt-1">
                          법정 정년(60세)을 초과하여 정년을 연장합니다.
                        </p>
                        {rules.enableRetirementExtension && (
                          <div className="mt-3 flex items-center gap-2">
                            <label className="text-sm">연장 정년:</label>
                            <select
                              className="input-field w-24"
                              value={rules.extendedRetirementAge}
                              onChange={(e) => setRules(prev => ({ ...prev, extendedRetirementAge: parseInt(e.target.value) }))}
                            >
                              <option value={62}>62세</option>
                              <option value={63}>63세</option>
                              <option value={64}>64세</option>
                              <option value={65}>65세</option>
                              <option value={70}>70세</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 정년 후 재고용 */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.enableReemployment}
                        onChange={(e) => setRules(prev => ({ ...prev, enableReemployment: e.target.checked }))}
                        className="w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-green-800">🎯 정년 후 재고용 (촉탁직 전환)</span>
                        <p className="text-sm text-green-700 mt-1">
                          정년퇴직자를 촉탁직으로 재고용하는 제도를 운영합니다.
                        </p>
                        {rules.enableReemployment && (
                          <div className="mt-3 flex items-center gap-2">
                            <label className="text-sm">재고용 기간:</label>
                            <select
                              className="input-field w-24"
                              value={rules.reemploymentPeriod}
                              onChange={(e) => setRules(prev => ({ ...prev, reemploymentPeriod: parseInt(e.target.value) }))}
                            >
                              <option value={1}>1년</option>
                              <option value={2}>2년</option>
                              <option value={3}>3년</option>
                              <option value={5}>5년</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 임금피크제 */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.enableWagePeak}
                        onChange={(e) => setRules(prev => ({ ...prev, enableWagePeak: e.target.checked }))}
                        className="w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-green-800">🎯 임금피크제</span>
                        <p className="text-sm text-green-700 mt-1">
                          정년연장/재고용과 연계하여 일정 연령 이후 임금을 조정합니다.
                        </p>
                        {rules.enableWagePeak && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm">적용 시작:</label>
                              <select
                                className="input-field w-20"
                                value={rules.wagePeakStartAge}
                                onChange={(e) => setRules(prev => ({ ...prev, wagePeakStartAge: parseInt(e.target.value) }))}
                              >
                                <option value={55}>55세</option>
                                <option value={56}>56세</option>
                                <option value={57}>57세</option>
                                <option value={58}>58세</option>
                                <option value={59}>59세</option>
                                <option value={60}>60세</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm">감액률:</label>
                              <select
                                className="input-field w-20"
                                value={rules.wagePeakReductionRate}
                                onChange={(e) => setRules(prev => ({ ...prev, wagePeakReductionRate: parseInt(e.target.value) }))}
                              >
                                <option value={10}>10%</option>
                                <option value={15}>15%</option>
                                <option value={20}>20%</option>
                                <option value={25}>25%</option>
                                <option value={30}>30%</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💰 고령자 계속고용장려금 조건:</strong><br />
                      • 정년을 60세 이상으로 운영 중인 사업장<br />
                      • 정년퇴직자를 정년 이후에도 계속 고용<br />
                      • 취업규칙에 관련 조항 명시 필수<br />
                      • 지원금: 월 30만원/인 (최대 2년)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========== 유연근무제 ========== */}
            {activeSection === 'flexible' && (
              <div className="form-section">
                <h2 className="form-section-title">🏠 유연근무제 (선택)</h2>
                <p className="text-sm text-gray-600 mb-4">유연근무제를 도입할 경우 취업규칙에 명시가 필요합니다.</p>

                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.enableFlexibleWork}
                      onChange={(e) => setRules(prev => ({ ...prev, enableFlexibleWork: e.target.checked }))}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div>
                      <span className="font-semibold">유연근무제 도입</span>
                      <p className="text-sm text-gray-600 mt-1">선택 시 유연근무제 관련 조항이 취업규칙에 추가됩니다.</p>
                    </div>
                  </label>
                </div>

                {rules.enableFlexibleWork && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">도입할 유연근무제 유형 선택:</p>
                    {[
                      { id: '선택적근로시간제', desc: '출퇴근 시간을 근로자가 자유롭게 결정' },
                      { id: '시차출퇴근제', desc: '출근시간대를 선택 (예: 8시/9시/10시)' },
                      { id: '재택근무제', desc: '자택 또는 지정된 장소에서 근무' },
                      { id: '원격근무제', desc: '사무실 외 장소에서 정보통신기기를 이용한 근무' },
                    ].map(type => (
                      <label key={type.id} className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={rules.flexibleWorkTypes.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRules(prev => ({ ...prev, flexibleWorkTypes: [...prev.flexibleWorkTypes, type.id] }));
                            } else {
                              setRules(prev => ({ ...prev, flexibleWorkTypes: prev.flexibleWorkTypes.filter(t => t !== type.id) }));
                            }
                          }}
                          className="w-4 h-4 mt-0.5"
                        />
                        <div>
                          <span className="font-medium">{type.id}</span>
                          <p className="text-sm text-gray-500">{type.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'discipline' && (
              <div className="form-section">
                <h2 className="form-section-title">⚖️ 상벌</h2>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">징계 종류</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['견책', '감봉', '정직', '강등', '해고'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rules.disciplineTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRules(prev => ({ ...prev, disciplineTypes: [...prev.disciplineTypes, type] }));
                              } else {
                                setRules(prev => ({ ...prev, disciplineTypes: prev.disciplineTypes.filter(d => d !== type) }));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 overflow-auto max-h-[80vh]">
          <WorkRulesPreview rules={rules} />
        </div>
      )}

      {/* 인쇄용 숨김 영역 */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          <WorkRulesPreview rules={rules} />
        </div>
      </div>
    </div>
  );
}

function WorkRulesPreview({ rules }: { rules: WorkRulesData }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const sectionStyle = {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginTop: '28px',
    marginBottom: '14px',
    borderBottom: '2px solid #333',
    paddingBottom: '6px',
  };

  const articleStyle = {
    marginBottom: '16px',
    lineHeight: '1.9',
  };

  const titleStyle = {
    fontWeight: 'bold' as const,
  };

  // 2025년 개정 적용 값
  const spouseLeave = rules.spouseLeave2025 ? 20 : 10;
  const spouseLeaveDays = rules.spouseLeave2025 ? 120 : 90;
  const spouseLeaveSplit = rules.spouseLeave2025 ? 3 : 1;
  const parentalLeaveMonths = rules.parentalLeave2025 ? '1년 6개월' : '1년';
  const parentalLeaveSplit = rules.parentalLeave2025 ? 4 : 2;
  const childcareAge = rules.childcareReduction2025 ? 12 : 8;
  const childcareGrade = rules.childcareReduction2025 ? 6 : 2;
  const childcareMinMonths = rules.childcareReduction2025 ? 1 : 3;
  const infertilityDays = rules.infertilityLeave2025 ? 6 : 3;
  const infertilityPaid = rules.infertilityLeave2025 ? 2 : 1;

  return (
    <div style={{ fontFamily: "'Nanum Gothic', 'Malgun Gothic', sans-serif", fontSize: '11pt', lineHeight: '1.8', color: '#111' }}>
      {/* 제목 */}
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', letterSpacing: '8px' }}>
        취 업 규 칙
      </h1>

      <p style={{ textAlign: 'right', marginBottom: '30px', fontSize: '12pt' }}>
        {rules.company.name || '(회사명)'}
      </p>

      {/* 개정 안내 */}
      <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', fontSize: '10pt' }}>
        <strong>※ 본 취업규칙은 2025년 개정 법령을 반영하였습니다.</strong>
        <br />• 배우자 출산휴가: {spouseLeave}일 / 육아휴직: {parentalLeaveMonths} / 육아기 근로시간 단축: {childcareAge}세 이하
      </div>

      {/* ==================== 제1장 총칙 ==================== */}
      <h2 style={sectionStyle}>제1장 총칙</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제1조 (목적)</span></p>
        <p>이 규칙은 {rules.company.name || '(회사명)'}(이하 &ldquo;회사&rdquo;라 한다)과 근로자 사이에 근로조건 및 복무규율에 관한 사항을 규정함을 목적으로 한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제2조 (적용범위)</span></p>
        <p>① 이 규칙은 회사에 근무하는 모든 근로자에게 적용한다.</p>
        <p>② 기간제근로자, 단시간근로자, 파견근로자 등에 대하여는 별도로 정하는 바에 따르며, 별도로 정함이 없는 경우에는 이 규칙을 적용한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제3조 (근로조건의 준수)</span></p>
        <p>회사와 근로자는 단체협약, 이 규칙 및 근로계약을 준수하여야 하며, 성실하게 이행하여야 한다.</p>
      </div>

      {/* ==================== 제2장 채용 및 근로계약 ==================== */}
      <h2 style={sectionStyle}>제2장 채용 및 근로계약</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제4조 (채용)</span></p>
        <p>① 회사는 채용이 결정된 자에 대하여 근로계약을 체결한다.</p>
        <p>② 채용 시 다음 각 호의 서류를 제출하여야 한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 이력서 1통</p>
        <p style={{ paddingLeft: '20px' }}>2. 주민등록등본 1통</p>
        <p style={{ paddingLeft: '20px' }}>3. 최종학교 졸업증명서 1통</p>
        <p style={{ paddingLeft: '20px' }}>4. 자격증 사본(해당자에 한함)</p>
        <p style={{ paddingLeft: '20px' }}>5. 기타 회사가 필요로 하는 서류</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제5조 (근로계약의 체결)</span></p>
        <p>① 회사는 채용이 확정된 자와 근로계약을 체결하고, 근로조건이 명시된 근로계약서를 작성하여 교부한다.</p>
        <p>② 근로계약서에는 다음 각 호의 사항을 명시한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 임금의 구성항목, 계산방법, 지급방법</p>
        <p style={{ paddingLeft: '20px' }}>2. 소정근로시간</p>
        <p style={{ paddingLeft: '20px' }}>3. 휴일</p>
        <p style={{ paddingLeft: '20px' }}>4. 연차유급휴가</p>
        <p style={{ paddingLeft: '20px' }}>5. 취업의 장소와 종사하여야 할 업무에 관한 사항</p>
        <p style={{ paddingLeft: '20px' }}>6. 근로계약기간(기간제의 경우)</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제6조 (수습기간)</span></p>
        <p>① 신규 채용된 근로자의 수습기간은 {rules.probationPeriod}개월로 한다.</p>
        <p>② 수습기간 중에는 업무 적성, 기능, 품성 등을 평가하여 정규직 전환 여부를 결정한다.</p>
        <p>③ 수습기간은 근속연수에 포함한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제7조 (인사이동)</span></p>
        <p>① 회사는 업무상 필요한 경우 근로자의 직종, 직위, 근무장소 등을 변경할 수 있다.</p>
        <p>② 근로자는 정당한 사유 없이 인사이동을 거부할 수 없다.</p>
      </div>

      {/* ==================== 제3장 복무 ==================== */}
      <h2 style={sectionStyle}>제3장 복무</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제8조 (출퇴근)</span></p>
        <p>① 근로자는 업무시작 시각까지 출근하여 업무에 임할 준비를 갖추어야 한다.</p>
        <p>② 근로자는 출퇴근 시 회사가 정한 방법에 따라 출퇴근 사실을 기록하여야 한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제9조 (근로자의 의무)</span></p>
        <p>근로자는 다음 각 호의 사항을 준수하여야 한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 회사의 제 규정을 준수하고, 상사의 정당한 지시에 따를 것</p>
        <p style={{ paddingLeft: '20px' }}>2. 직장 내 질서를 유지하고, 다른 근로자의 정상적인 업무를 방해하지 않을 것</p>
        <p style={{ paddingLeft: '20px' }}>3. 회사의 명예나 신용을 훼손하지 않을 것</p>
        <p style={{ paddingLeft: '20px' }}>4. 업무상 지득한 기밀을 누설하지 않을 것</p>
        <p style={{ paddingLeft: '20px' }}>5. 회사의 허가 없이 다른 직무를 겸하지 않을 것</p>
        <p style={{ paddingLeft: '20px' }}>6. 회사의 물품 및 비품을 소중히 다루고, 사적으로 사용하지 않을 것</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제10조 (결근, 지각, 조퇴, 외출)</span></p>
        <p>① 근로자가 질병 기타 부득이한 사유로 결근하고자 할 때에는 사전에 소속 부서장에게 신고하여야 한다.</p>
        <p>② 지각, 조퇴, 외출 시에도 사전에 승인을 받아야 한다.</p>
        <p>③ 병가의 경우 3일 이상은 의사의 진단서를 첨부하여야 한다.</p>
      </div>

      {/* ==================== 제4장 근로시간 ==================== */}
      <h2 style={sectionStyle}>제4장 근로시간, 휴게, 휴일</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제11조 (근로시간)</span></p>
        <p>① 1주간의 소정근로시간은 휴게시간을 제외하고 {rules.weeklyHours}시간으로 한다.</p>
        <p>② 1일의 소정근로시간은 휴게시간을 제외하고 8시간으로 한다.</p>
        <p>③ 시업시각은 {rules.workStartTime}, 종업시각은 {rules.workEndTime}으로 한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제12조 (휴게시간)</span></p>
        <p>① 근로시간 중 휴게시간은 {rules.breakStartTime}부터 {rules.breakEndTime}까지 {rules.breakTime}분으로 한다.</p>
        <p>② 휴게시간은 근로자가 자유롭게 이용할 수 있다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제13조 (연장·야간·휴일 근로)</span></p>
        <p>① 회사는 업무상 필요한 경우 근로자대표와의 서면 합의에 따라 1주간에 12시간을 한도로 연장근로를 시킬 수 있다.</p>
        <p>② 회사는 연장근로, 야간근로(22:00~06:00), 휴일근로에 대하여 통상임금의 50%를 가산하여 지급한다.</p>
        <p>③ 8시간 이내의 휴일근로는 통상임금의 50%, 8시간을 초과하는 휴일근로는 통상임금의 100%를 가산하여 지급한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제14조 (휴일)</span></p>
        <p>① 유급휴일은 다음 각 호와 같다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 주휴일: 매주 일요일</p>
        <p style={{ paddingLeft: '20px' }}>2. 근로자의 날: 5월 1일</p>
        <p style={{ paddingLeft: '20px' }}>3. 「관공서의 공휴일에 관한 규정」에 따른 공휴일 및 대체공휴일</p>
        <p>② 휴일은 근로자대표와의 서면 합의에 따라 다른 날로 대체할 수 있다.</p>
      </div>

      {/* ========== 유연근무제 (선택) ========== */}
      {rules.enableFlexibleWork && rules.flexibleWorkTypes.length > 0 && (
        <>
          <div style={articleStyle}>
            <p><span style={titleStyle}>제14조의2 (유연근무제)</span></p>
            <p>① 회사는 업무 효율 향상 및 근로자의 일·생활 균형을 위해 다음 각 호의 유연근무제를 시행할 수 있다.</p>
            {rules.flexibleWorkTypes.includes('선택적근로시간제') && (
              <p style={{ paddingLeft: '20px' }}>1. 선택적 근로시간제: 근로자가 1개월 이내의 정산기간 중 총 근로시간을 준수하는 범위 내에서 출퇴근 시간을 자율적으로 결정</p>
            )}
            {rules.flexibleWorkTypes.includes('시차출퇴근제') && (
              <p style={{ paddingLeft: '20px' }}>2. 시차출퇴근제: 1일 소정근로시간을 유지하면서 출근시간대를 선택 (예: 08:00~09:00~10:00)</p>
            )}
            {rules.flexibleWorkTypes.includes('재택근무제') && (
              <p style={{ paddingLeft: '20px' }}>3. 재택근무제: 자택 또는 지정된 장소에서 정보통신기기를 이용하여 근무</p>
            )}
            {rules.flexibleWorkTypes.includes('원격근무제') && (
              <p style={{ paddingLeft: '20px' }}>4. 원격근무제: 사무실 외 장소에서 정보통신기기를 이용하여 근무</p>
            )}
            <p>② 유연근무제를 적용받고자 하는 근로자는 사전에 신청서를 제출하고 회사의 승인을 받아야 한다.</p>
            <p>③ 유연근무제 적용 시에도 근로기준법상 근로시간, 휴게, 휴일에 관한 규정을 준수하여야 한다.</p>
          </div>
        </>
      )}

      {/* ==================== 제5장 휴가 ==================== */}
      <h2 style={sectionStyle}>제5장 휴가</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제15조 (연차유급휴가)</span></p>
        <p>① 회사는 1년간 80퍼센트 이상 출근한 근로자에게 {rules.annualLeave}일의 유급휴가를 부여한다.</p>
        <p>② 계속 근로연수가 1년 미만인 근로자에게는 1개월 개근 시 1일의 유급휴가를 부여한다.</p>
        <p>③ 3년 이상 계속 근로한 근로자에게는 최초 1년을 초과하는 계속 근로연수 매 2년에 대하여 1일을 가산한 유급휴가를 부여한다. 이 경우 가산휴가를 포함한 총 휴가일수는 25일을 한도로 한다.</p>
        <p>④ 연차유급휴가일수 산정을 위한 출근율 계산 시 다음 각 호의 기간은 출근한 것으로 본다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 업무상 부상 또는 질병으로 휴업한 기간</p>
        <p style={{ paddingLeft: '20px' }}>2. 출산전후휴가로 휴업한 기간</p>
        <p style={{ paddingLeft: '20px' }}>3. 육아휴직으로 휴업한 기간</p>
        <p style={{ paddingLeft: '20px' }}>4. 육아기 근로시간 단축을 사용하여 단축된 근로시간 (2024.10.22. 시행)</p>
        <p style={{ paddingLeft: '20px' }}>5. 임신기 근로시간 단축을 사용하여 단축된 근로시간 (2024.10.22. 시행)</p>
        <p>⑤ 연차유급휴가는 근로자가 청구한 시기에 부여한다. 다만, 사업 운영에 막대한 지장이 있는 경우 그 시기를 변경할 수 있다.</p>
        <p>⑥ 연차유급휴가는 1년간 행사하지 아니하면 소멸된다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제16조 (경조사 휴가)</span></p>
        <p>회사는 근로자가 다음 각 호의 경조사가 있을 때 경조사 휴가를 부여한다.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #333', padding: '8px' }}>구분</th>
              <th style={{ border: '1px solid #333', padding: '8px' }}>일수</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>본인 결혼</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>{rules.marriageLeave}일</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>자녀 결혼</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>1일</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>본인·배우자의 부모 사망</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>{rules.bereavementLeave}일</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>본인·배우자의 조부모, 외조부모 사망</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>3일</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>배우자, 자녀 사망</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>5일</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: '8px' }}>형제자매 사망</td><td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>3일</td></tr>
          </tbody>
        </table>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제17조 (생리휴가)</span></p>
        <p>회사는 여성 근로자가 청구하면 월 1일의 무급 생리휴가를 부여한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제17조의2 (난임치료휴가)</span></p>
        <p>① 회사는 인공수정 또는 체외수정 등 난임치료를 받는 근로자가 청구하면 연간 {infertilityDays}일 이내의 난임치료휴가를 부여한다.</p>
        <p>② 난임치료휴가 중 최초 {infertilityPaid}일은 유급으로 한다.</p>
        <p>③ 난임치료휴가를 청구하려는 근로자는 난임치료를 받을 예정이거나 받고 있다는 사실을 증명하는 서류를 제출하여야 한다.</p>
      </div>

      {/* ==================== 제6장 모성보호 ==================== */}
      <h2 style={sectionStyle}>제6장 모성보호</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제18조 (출산전후휴가)</span></p>
        <p>① 임신 중인 여성 근로자에게 출산 전후를 통하여 90일(다태아의 경우 120일)의 출산전후휴가를 부여한다.</p>
        <p>② 미숙아를 출산하여 신생아 집중치료실에 입원하는 경우에는 100일의 출산전후휴가를 부여한다. (2025.2.23. 시행)</p>
        <p>③ 출산전후휴가 중 최초 60일(다태아의 경우 75일)은 유급으로 한다.</p>
        <p>④ 출산전후휴가는 출산 후에 45일(다태아의 경우 60일) 이상이 확보되도록 부여한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제19조 (유산·사산휴가)</span></p>
        <p>① 임신 중인 여성 근로자가 유산 또는 사산한 경우 다음 각 호에 따라 유산·사산휴가를 부여한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 임신 11주 이내: 유산·사산한 날부터 5일</p>
        <p style={{ paddingLeft: '20px' }}>2. 임신 12주~15주: 유산·사산한 날부터 10일</p>
        <p style={{ paddingLeft: '20px' }}>3. 임신 16주~21주: 유산·사산한 날부터 30일</p>
        <p style={{ paddingLeft: '20px' }}>4. 임신 22주~27주: 유산·사산한 날부터 60일</p>
        <p style={{ paddingLeft: '20px' }}>5. 임신 28주 이상: 유산·사산한 날부터 90일</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제20조 (육아휴직)</span></p>
        <p>① 만 8세 이하 또는 초등학교 2학년 이하의 자녀를 양육하기 위하여 근로자가 휴직을 신청하는 경우 이를 허용한다.</p>
        <p>② 육아휴직 기간은 {parentalLeaveMonths} 이내로 한다.</p>
        {rules.parentalLeave2025 && (
          <p style={{ paddingLeft: '20px', color: '#0066cc' }}>※ 부모가 각각 3개월 이상 사용하는 경우, 한부모 또는 중증 장애아동 부모의 경우 1년 6개월 적용 (2025.2.23. 시행)</p>
        )}
        <p>③ 육아휴직은 {parentalLeaveSplit}회에 한정하여 나누어 사용할 수 있다.</p>
        <p>④ 육아휴직 기간은 근속기간에 포함한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제21조 (육아기 근로시간 단축)</span></p>
        <p>① 만 {childcareAge}세 이하 또는 초등학교 {childcareGrade}학년 이하의 자녀를 양육하기 위하여 근로자가 근로시간 단축을 신청하는 경우 이를 허용한다.</p>
        <p>② 육아기 근로시간 단축을 분할하여 사용하는 경우 1회 사용 시 최소 {childcareMinMonths}개월 이상이어야 한다.</p>
        <p>③ 단축 후 근로시간은 주당 15시간 이상 35시간 이하로 한다.</p>
        {rules.childcareReduction2025 && (
          <p style={{ paddingLeft: '20px', color: '#0066cc' }}>※ 육아휴직 미사용기간을 2배 가산하여 최대 3년까지 사용 가능 (2025.2.23. 시행)</p>
        )}
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제22조 (배우자 출산휴가)</span></p>
        <p>① 근로자가 배우자의 출산을 이유로 휴가를 청구하는 경우 <strong>{spouseLeave}일</strong>의 유급휴가를 부여한다.</p>
        <p>② 배우자 출산휴가는 출산한 날부터 {spouseLeaveDays}일 이내에 청구하여야 한다.</p>
        <p>③ 배우자 출산휴가는 {spouseLeaveSplit}회에 한정하여 나누어 사용할 수 있다.</p>
        {rules.spouseLeave2025 && (
          <p style={{ paddingLeft: '20px', color: '#0066cc' }}>※ 2025.2.23. 시행 개정법 적용 (10일 → 20일, 90일 → 120일, 1회 → 3회 분할)</p>
        )}
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제23조 (태아검진 시간)</span></p>
        <p>임신한 여성 근로자가 임산부 정기건강진단을 받는데 필요한 시간을 청구하는 경우 이를 허용하고, 이를 이유로 임금을 삭감하지 아니한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제23조의2 (임신기 근로시간 단축)</span></p>
        <p>① 임신 후 12주 이내 또는 <strong>32주 이후</strong>에 있는 여성 근로자가 1일 2시간의 근로시간 단축을 신청하는 경우 이를 허용한다.</p>
        <p>② 고위험 임산부(조기 진통, 다태아 임신 등)의 경우 의사의 진단에 따라 임신 전 기간에 대해 근로시간 단축을 허용한다. (2025.2.23. 시행)</p>
        <p>③ 임신기 근로시간 단축을 이유로 임금을 삭감하지 아니한다.</p>
      </div>

      {/* ==================== 제7장 임금 ==================== */}
      <h2 style={sectionStyle}>제7장 임금</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제24조 (임금의 구성)</span></p>
        <p>임금은 기본급, 제수당, 상여금으로 구성한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제25조 (임금의 계산 및 지급)</span></p>
        <p>① 임금은 매월 1일부터 말일까지를 산정기간으로 한다.</p>
        <p>② 임금은 매월 {rules.paymentDate}일에 {rules.paymentMethod}로 지급한다.</p>
        <p>③ 지급일이 휴일인 경우에는 그 전일에 지급한다.</p>
        <p>④ 임금 지급 시 임금명세서를 교부한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제26조 (비상시 지급)</span></p>
        <p>근로자가 출산, 질병, 재해, 그 밖에 비상한 경우의 비용에 충당하기 위하여 임금 지급을 청구하는 경우에는 지급기일 전이라도 이미 제공한 근로에 대한 임금을 지급한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제27조 (휴업수당)</span></p>
        <p>회사의 귀책사유로 휴업하는 경우에는 휴업기간 동안 평균임금의 70% 이상의 수당을 지급한다. 다만, 평균임금의 70%가 통상임금을 초과하는 경우에는 통상임금을 휴업수당으로 지급한다.</p>
      </div>

      {/* ========== 임금피크제 (선택) ========== */}
      {rules.enableWagePeak && (
        <div style={articleStyle}>
          <p><span style={titleStyle}>제27조의2 (임금피크제)</span></p>
          <p>① 회사는 정년연장 및 고령자 고용 안정을 위하여 다음과 같이 임금피크제를 시행한다.</p>
          <p>② 만 {rules.wagePeakStartAge}세가 도래한 다음 달부터 기본급의 {rules.wagePeakReductionRate}%를 감액한다.</p>
          <p>③ 감액률은 연령에 따라 단계적으로 적용할 수 있으며, 구체적인 사항은 별도 내규로 정한다.</p>
          <p>④ 임금피크제 대상자에게는 감액된 임금에 상응하는 직무 조정 또는 근로시간 단축 등을 부여할 수 있다.</p>
        </div>
      )}

      {/* ==================== 제8장 퇴직 ==================== */}
      <h2 style={sectionStyle}>제8장 퇴직, 해고</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제28조 (퇴직)</span></p>
        <p>근로자가 다음 각 호의 어느 하나에 해당할 때에는 퇴직한 것으로 본다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 본인이 퇴직을 원하는 경우</p>
        <p style={{ paddingLeft: '20px' }}>2. 사망한 경우</p>
        <p style={{ paddingLeft: '20px' }}>3. 정년에 도달한 경우</p>
        <p style={{ paddingLeft: '20px' }}>4. 근로계약기간이 만료된 경우</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제29조 (정년)</span></p>
        <p>① 근로자의 정년은 만 {rules.retirementAge}세로 하고, 정년에 도달한 날이 속하는 달의 말일에 퇴직한다.</p>
        {rules.enableRetirementExtension && (
          <>
            <p style={{ color: '#008000', fontWeight: 'bold' }}>② 회사는 고령자 고용 촉진을 위하여 정년을 만 {rules.extendedRetirementAge}세까지 연장할 수 있다.</p>
            <p style={{ paddingLeft: '20px', color: '#008000' }}>※ 고령자 계속고용장려금 수령을 위한 정년연장 조항</p>
          </>
        )}
      </div>

      {/* ========== 정년 후 재고용 (선택) ========== */}
      {rules.enableReemployment && (
        <div style={articleStyle}>
          <p><span style={titleStyle}>제29조의2 (정년 후 재고용)</span></p>
          <p style={{ color: '#008000' }}>① 회사는 정년에 도달한 근로자 중 재고용을 희망하고 일정 자격을 갖춘 자를 촉탁직 근로자로 재고용할 수 있다.</p>
          <p style={{ color: '#008000' }}>② 재고용 기간은 {rules.reemploymentPeriod}년 이내로 하며, 근무실적 등을 고려하여 연장할 수 있다.</p>
          <p style={{ color: '#008000' }}>③ 재고용 근로자의 근로조건은 별도의 근로계약으로 정한다.</p>
          <p style={{ paddingLeft: '20px', color: '#008000', fontSize: '10pt' }}>※ 고령자 계속고용장려금 수령을 위한 재고용 조항</p>
        </div>
      )}

      <div style={articleStyle}>
        <p><span style={titleStyle}>제30조 (해고)</span></p>
        <p>① 회사는 근로자에게 다음 각 호의 사유가 있는 경우 해고할 수 있다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 신체 또는 정신상의 장애로 직무를 감당할 수 없다고 인정되는 경우</p>
        <p style={{ paddingLeft: '20px' }}>2. 직무수행 능력이 부족하여 직무를 수행할 수 없다고 인정되는 경우</p>
        <p style={{ paddingLeft: '20px' }}>3. 이 규칙에서 정한 징계사유에 해당하는 경우</p>
        <p style={{ paddingLeft: '20px' }}>4. 기타 위 각 호에 준하는 정당한 이유가 있는 경우</p>
        <p>② 회사는 해고를 하는 경우 30일 전에 해고예고를 하거나, 30일분 이상의 통상임금을 지급한다.</p>
        <p>③ 회사는 해고를 하는 경우 해고사유와 해고시기를 서면으로 통지한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제31조 (퇴직금)</span></p>
        <p>1년 이상 계속 근무한 근로자가 퇴직할 경우에는 「근로자퇴직급여보장법」에 따라 퇴직금을 지급한다.</p>
      </div>

      {/* ==================== 제9장 상벌 ==================== */}
      <h2 style={sectionStyle}>제9장 상벌</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제32조 (표창)</span></p>
        <p>회사는 다음 각 호의 어느 하나에 해당하는 근로자에게 표창을 수여할 수 있다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 품행이 방정하고 업무에 정려하여 타의 모범이 된 자</p>
        <p style={{ paddingLeft: '20px' }}>2. 업무상 유익한 발명, 개량 또는 창안을 한 자</p>
        <p style={{ paddingLeft: '20px' }}>3. 재해를 미연에 방지하거나 비상재해 시 특별한 공로가 있는 자</p>
        <p style={{ paddingLeft: '20px' }}>4. 기타 위 각 호에 준하는 공적이 있는 자</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제33조 (징계의 종류)</span></p>
        <p>징계는 다음 각 호와 같이 구분한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 견책: 시말서를 제출받고 훈계한다.</p>
        <p style={{ paddingLeft: '20px' }}>2. 감봉: 1회의 금액이 평균임금 1일분의 2분의 1을, 총액이 1임금지급기 임금 총액의 10분의 1을 초과하지 않는 범위에서 임금을 감액한다.</p>
        <p style={{ paddingLeft: '20px' }}>3. 정직: 1개월 이내의 기간을 정하여 출근을 정지하고 그 기간 중 임금을 지급하지 아니한다.</p>
        <p style={{ paddingLeft: '20px' }}>4. 해고: 근로계약을 해지한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제34조 (징계사유)</span></p>
        <p>회사는 근로자가 다음 각 호의 어느 하나에 해당하는 경우 징계할 수 있다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 정당한 사유 없이 무단결근을 한 경우</p>
        <p style={{ paddingLeft: '20px' }}>2. 직장 내 괴롭힘 또는 성희롱 행위를 한 경우</p>
        <p style={{ paddingLeft: '20px' }}>3. 회사의 명예를 훼손하거나 불명예스러운 행위를 한 경우</p>
        <p style={{ paddingLeft: '20px' }}>4. 업무상 비밀 또는 기밀을 누설한 경우</p>
        <p style={{ paddingLeft: '20px' }}>5. 회사의 물품을 무단으로 반출하거나 훼손한 경우</p>
        <p style={{ paddingLeft: '20px' }}>6. 직무를 이용하여 부당한 이익을 취한 경우</p>
        <p style={{ paddingLeft: '20px' }}>7. 정당한 사유 없이 업무상 지시에 불응하거나 직장질서를 문란하게 한 경우</p>
        <p style={{ paddingLeft: '20px' }}>8. 기타 이 규칙 또는 회사 규정을 위반한 경우</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제35조 (징계절차)</span></p>
        <p>① 징계는 징계위원회의 의결을 거쳐 결정한다.</p>
        <p>② 징계위원회는 징계 대상자에게 소명의 기회를 부여하여야 한다.</p>
        <p>③ 징계 결과는 서면으로 당사자에게 통보한다.</p>
      </div>

      {/* ==================== 제10장 직장 내 괴롭힘 ==================== */}
      <h2 style={sectionStyle}>제10장 직장 내 괴롭힘 금지</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제36조 (직장 내 괴롭힘 금지)</span></p>
        <p>① 회사의 사용자 또는 근로자는 직장에서의 지위 또는 관계 등의 우위를 이용하여 업무상 적정범위를 넘어 다른 근로자에게 신체적·정신적 고통을 주거나 근무환경을 악화시키는 행위(이하 &ldquo;직장 내 괴롭힘&rdquo;이라 한다)를 하여서는 아니 된다.</p>
        <p>② 직장 내 괴롭힘 행위의 유형은 다음 각 호와 같다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 신체에 대하여 폭행하거나 협박하는 행위</p>
        <p style={{ paddingLeft: '20px' }}>2. 지속·반복적인 욕설이나 폭언</p>
        <p style={{ paddingLeft: '20px' }}>3. 다른 직원들 앞에서 또는 온라인상에서 모욕감을 주거나 개인사에 대한 소문을 퍼뜨리는 행위</p>
        <p style={{ paddingLeft: '20px' }}>4. 합리적 이유 없이 반복적으로 개인 심부름 등 사적인 용무를 지시하는 행위</p>
        <p style={{ paddingLeft: '20px' }}>5. 합리적 이유 없이 업무능력이나 성과를 인정하지 않거나 조롱하는 행위</p>
        <p style={{ paddingLeft: '20px' }}>6. 집단적으로 따돌리거나 정당한 이유 없이 업무와 관련된 중요한 정보 또는 의사결정 과정에서 배제하는 행위</p>
        <p style={{ paddingLeft: '20px' }}>7. 정당한 이유 없이 상당 기간 동안 근로계약서 등에 명시되어 있는 업무와 무관한 일을 지시하거나 허드렛일만 시키는 행위</p>
        <p style={{ paddingLeft: '20px' }}>8. 정당한 이유 없이 상당 기간 동안 일을 거의 주지 않는 행위</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제37조 (직장 내 괴롭힘 예방교육)</span></p>
        <p>회사는 직장 내 괴롭힘 예방을 위한 교육을 연 1회 이상 실시한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제38조 (직장 내 괴롭힘 발생 시 조치)</span></p>
        <p>① 누구든지 직장 내 괴롭힘 발생 사실을 알게 된 경우 회사에 신고할 수 있다.</p>
        <p>② 회사는 신고를 접수하거나 직장 내 괴롭힘 발생 사실을 인지한 경우 지체 없이 사실 확인을 위한 조사를 실시한다.</p>
        <p>③ 회사는 조사 기간 동안 피해자 보호를 위해 필요한 경우 근무장소의 변경, 유급휴가 명령 등 적절한 조치를 한다.</p>
        <p>④ 회사는 조사 결과 직장 내 괴롭힘 발생 사실이 확인된 때에는 피해 근로자가 요청하면 근무장소의 변경, 배치전환, 유급휴가 명령 등 적절한 조치를 한다.</p>
        <p>⑤ 회사는 직장 내 괴롭힘 발생 사실이 확인된 때에는 지체 없이 행위자에 대하여 징계, 근무장소의 변경 등 필요한 조치를 한다.</p>
        <p>⑥ 회사는 직장 내 괴롭힘 발생 사실을 신고한 근로자 및 피해 근로자 등에게 해고나 그 밖의 불리한 처우를 하여서는 아니 된다.</p>
      </div>

      {/* ==================== 제11장 직장 내 성희롱 ==================== */}
      <h2 style={sectionStyle}>제11장 직장 내 성희롱 금지</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제39조 (직장 내 성희롱 금지)</span></p>
        <p>사용자, 상급자 또는 근로자는 직장 내 성희롱을 하여서는 아니 된다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제40조 (직장 내 성희롱 예방교육)</span></p>
        <p>① 회사는 직장 내 성희롱 예방을 위한 교육을 연 1회 이상 실시한다.</p>
        <p>② 성희롱 예방교육의 내용에는 다음 각 호의 사항이 포함되어야 한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 직장 내 성희롱에 관한 법령</p>
        <p style={{ paddingLeft: '20px' }}>2. 해당 사업장의 직장 내 성희롱 발생 시 처리절차와 조치기준</p>
        <p style={{ paddingLeft: '20px' }}>3. 해당 사업장의 직장 내 성희롱 피해 근로자의 고충상담 및 구제절차</p>
        <p style={{ paddingLeft: '20px' }}>4. 그 밖에 직장 내 성희롱 예방에 필요한 사항</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제41조 (직장 내 성희롱 발생 시 조치)</span></p>
        <p>① 회사는 직장 내 성희롱 발생 사실을 알게 된 경우 지체 없이 사실 확인을 위한 조사를 실시한다.</p>
        <p>② 회사는 조사 기간 동안 피해 근로자를 보호하기 위하여 필요한 경우 해당 피해 근로자에 대하여 근무장소의 변경, 유급휴가 명령 등 적절한 조치를 한다.</p>
        <p>③ 회사는 조사 결과 직장 내 성희롱 발생 사실이 확인된 때에는 지체 없이 직장 내 성희롱 행위자에 대하여 징계나 그 밖에 이에 준하는 조치를 한다.</p>
        <p>④ 회사는 직장 내 성희롱 발생 사실을 신고한 근로자 및 피해 근로자에게 해고나 그 밖의 불리한 처우를 하여서는 아니 된다.</p>
      </div>

      {/* ==================== 제12장 안전보건 ==================== */}
      <h2 style={sectionStyle}>제12장 안전과 보건</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제42조 (안전보건 조치)</span></p>
        <p>① 회사는 근로자의 안전과 건강을 유지·증진시키고 쾌적한 작업환경을 조성하기 위하여 산업안전보건법이 정하는 안전보건조치를 이행한다.</p>
        <p>② 근로자는 안전보건 관계법령 및 회사의 안전보건 규정을 준수하여야 한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제43조 (건강진단)</span></p>
        <p>① 회사는 근로자에 대하여 1년에 1회 이상 정기 건강진단을 실시한다.</p>
        <p>② 근로자는 정당한 사유 없이 건강진단을 거부하지 못한다.</p>
      </div>

      {/* ==================== 제13장 재해보상 ==================== */}
      <h2 style={sectionStyle}>제13장 재해보상</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제44조 (재해보상)</span></p>
        <p>근로자의 업무상 재해에 대하여는 「산업재해보상보험법」에 따라 보상한다.</p>
      </div>

      {/* ==================== 제14장 교육 ==================== */}
      <h2 style={sectionStyle}>제14장 교육</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제45조 (직무교육)</span></p>
        <p>회사는 근로자의 직무능력 향상을 위하여 필요한 교육을 실시할 수 있으며, 근로자는 교육에 성실히 참여하여야 한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제46조 (법정의무교육)</span></p>
        <p>회사는 다음 각 호의 법정의무교육을 실시한다.</p>
        <p style={{ paddingLeft: '20px' }}>1. 성희롱 예방교육: 연 1회</p>
        <p style={{ paddingLeft: '20px' }}>2. 개인정보보호 교육: 연 1회</p>
        <p style={{ paddingLeft: '20px' }}>3. 직장 내 괴롭힘 예방교육: 연 1회</p>
        <p style={{ paddingLeft: '20px' }}>4. 산업안전보건교육: 분기별</p>
        <p style={{ paddingLeft: '20px' }}>5. 퇴직연금 교육: 연 1회</p>
      </div>

      {/* ==================== 부칙 ==================== */}
      <h2 style={sectionStyle}>부칙</h2>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제1조 (시행일)</span></p>
        <p>이 규칙은 {formatDate(rules.effectiveDate)}부터 시행한다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제2조 (경과조치)</span></p>
        <p>이 규칙 시행 전에 종전의 규정에 따라 행한 행위는 이 규칙에 따라 행한 것으로 본다.</p>
      </div>

      <div style={articleStyle}>
        <p><span style={titleStyle}>제3조 (규칙의 변경)</span></p>
        <p>① 이 규칙을 변경할 경우에는 근로자 과반수의 의견을 들어야 한다.</p>
        <p>② 취업규칙을 근로자에게 불리하게 변경하는 경우에는 근로자 과반수의 동의를 받아야 한다.</p>
      </div>

      {/* 서명란 */}
      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <p style={{ marginBottom: '40px' }}>{formatDate(rules.effectiveDate)}</p>
        <p style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '8px' }}>{rules.company.name || '(회사명)'}</p>
        <p style={{ marginBottom: '20px' }}>대표이사 {rules.company.ceoName || '(대표자명)'} (인)</p>
      </div>

      {/* 신고 안내 */}
      <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#f5f5f5', fontSize: '10pt' }}>
        <p><strong>※ 취업규칙 신고 안내</strong></p>
        <p>• 상시 10인 이상 사업장은 취업규칙을 작성하여 관할 노동관서에 신고하여야 합니다. (근로기준법 제93조)</p>
        <p>• 취업규칙을 변경하는 경우에도 변경 후 신고하여야 합니다.</p>
        <p>• 문의: 고용노동부 고객상담센터 ☎ 1350</p>
        {(rules.enableRetirementExtension || rules.enableReemployment) && (
          <>
            <p style={{ marginTop: '12px' }}><strong>※ 고용지원금 안내</strong></p>
            <p>• 고령자 계속고용장려금: 정년 60세 이상 + 계속고용 시 월 30만원/인 (최대 2년)</p>
            <p>• 신청: 고용보험 홈페이지 또는 고용센터</p>
          </>
        )}
      </div>
    </div>
  );
}
