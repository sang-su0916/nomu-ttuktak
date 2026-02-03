'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CompanyInfo } from '@/types';
import { loadCompanyInfo, defaultCompanyInfo } from '@/lib/storage';

interface WorkRulesData {
  company: CompanyInfo;
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  workDays: string;
  paymentDate: number;
  annualLeave: number;
  probationPeriod: number;
  retirementAge: number;
}

const defaultWorkRules: WorkRulesData = {
  company: defaultCompanyInfo,
  workStartTime: '09:00',
  workEndTime: '18:00',
  breakTime: 60,
  workDays: '월요일부터 금요일까지',
  paymentDate: 25,
  annualLeave: 15,
  probationPeriod: 3,
  retirementAge: 60,
};

export default function WorkRulesPage() {
  const [rules, setRules] = useState<WorkRulesData>(defaultWorkRules);
  const [showPreview, setShowPreview] = useState(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 취업규칙</h1>
          <p className="text-gray-500 mt-1">표준 취업규칙을 작성합니다.</p>
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

      {!showPreview ? (
        <div className="space-y-6">
          {/* 회사 정보 */}
          <div className="form-section">
            <h2 className="form-section-title">🏢 회사 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">상호</label>
                <input type="text" className="input-field bg-gray-50" value={rules.company.name} readOnly />
              </div>
              <div>
                <label className="input-label">대표자</label>
                <input type="text" className="input-field bg-gray-50" value={rules.company.ceoName} readOnly />
              </div>
            </div>
          </div>

          {/* 근로시간 */}
          <div className="form-section">
            <h2 className="form-section-title">⏰ 근로시간</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">시작 시간</label>
                <input
                  type="time"
                  className="input-field"
                  value={rules.workStartTime}
                  onChange={(e) => setRules(prev => ({ ...prev, workStartTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">종료 시간</label>
                <input
                  type="time"
                  className="input-field"
                  value={rules.workEndTime}
                  onChange={(e) => setRules(prev => ({ ...prev, workEndTime: e.target.value }))}
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
              <div className="md:col-span-3">
                <label className="input-label">근무일</label>
                <input
                  type="text"
                  className="input-field"
                  value={rules.workDays}
                  onChange={(e) => setRules(prev => ({ ...prev, workDays: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 기타 설정 */}
          <div className="form-section">
            <h2 className="form-section-title">⚙️ 기타 설정</h2>
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
                <label className="input-label">연차휴가 (일)</label>
                <input
                  type="number"
                  className="input-field"
                  value={rules.annualLeave}
                  onChange={(e) => setRules(prev => ({ ...prev, annualLeave: parseInt(e.target.value) || 0 }))}
                />
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
                  onChange={(e) => setRules(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>💡 안내:</strong> 본 취업규칙은 표준 양식을 기반으로 합니다. 
              상시 10인 이상 사업장은 취업규칙을 작성하여 관할 노동청에 신고해야 합니다.
              구체적인 내용은 노무사 상담을 권장합니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <WorkRulesPreview rules={rules} />
        </div>
      )}

      <div className="hidden">
        <div ref={printRef}>
          <WorkRulesPreview rules={rules} />
        </div>
      </div>
    </div>
  );
}

function WorkRulesPreview({ rules }: { rules: WorkRulesData }) {
  return (
    <div style={{ fontFamily: "'Nanum Gothic', sans-serif", lineHeight: '1.8', fontSize: '11pt' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px' }}>
        취 업 규 칙
      </h1>

      <p style={{ textAlign: 'right', marginBottom: '24px' }}>
        {rules.company.name}
      </p>

      {/* 제1장 총칙 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제1장 총칙
      </h2>
      
      <p style={{ marginBottom: '12px' }}>
        <strong>제1조 (목적)</strong><br />
        이 규칙은 {rules.company.name}(이하 &quot;회사&quot;라 한다)의 근로자의 채용, 복무, 급여, 휴가 등 
        근로조건에 관한 사항을 정함을 목적으로 한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제2조 (적용범위)</strong><br />
        이 규칙은 회사의 모든 근로자에게 적용한다. 다만, 기간제근로자, 단시간근로자, 
        파견근로자 등에 대하여는 별도로 정하는 바에 따른다.
      </p>

      {/* 제2장 채용 및 근로계약 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제2장 채용 및 근로계약
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제3조 (채용)</strong><br />
        ① 회사는 채용이 결정된 자에 대하여 근로계약을 체결한다.<br />
        ② 근로계약 체결 시 임금, 근로시간, 휴일, 연차유급휴가 등 근로조건을 명시한 근로계약서를 작성하여 교부한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제4조 (수습기간)</strong><br />
        ① 신규채용자의 수습기간은 {rules.probationPeriod}개월로 한다.<br />
        ② 수습기간 중에는 정규 급여의 90%를 지급할 수 있다.
      </p>

      {/* 제3장 근로시간 및 휴게 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제3장 근로시간 및 휴게
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제5조 (근로시간)</strong><br />
        ① 근로시간은 1일 8시간, 1주 40시간을 기준으로 한다.<br />
        ② 시업시각은 {rules.workStartTime}, 종업시각은 {rules.workEndTime}으로 한다.<br />
        ③ 업무상 필요한 경우 근로자대표와의 서면 합의에 따라 연장근로를 할 수 있다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제6조 (휴게시간)</strong><br />
        근로시간 중 {rules.breakTime}분의 휴게시간을 부여한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제7조 (근무일)</strong><br />
        근무일은 {rules.workDays}로 한다. 토요일과 일요일은 주휴일로 한다.
      </p>

      {/* 제4장 휴일 및 휴가 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제4장 휴일 및 휴가
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제8조 (휴일)</strong><br />
        ① 주휴일: 매주 일요일<br />
        ② 근로자의 날: 5월 1일<br />
        ③ 관공서의 공휴일에 관한 규정에 따른 공휴일 및 대체공휴일
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제9조 (연차유급휴가)</strong><br />
        ① 1년간 80% 이상 출근한 근로자에게 {rules.annualLeave}일의 연차유급휴가를 부여한다.<br />
        ② 연차휴가는 근로자가 청구한 시기에 부여한다. 다만, 사업 운영에 막대한 지장이 있는 경우 
        그 시기를 변경할 수 있다.<br />
        ③ 연차휴가는 1년간 행사하지 않으면 소멸된다.
      </p>

      {/* 제5장 임금 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제5장 임금
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제10조 (임금의 구성)</strong><br />
        임금은 기본급, 제수당, 상여금으로 구성한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제11조 (임금의 계산 및 지급)</strong><br />
        ① 임금은 매월 1일부터 말일까지를 산정기간으로 한다.<br />
        ② 임금은 매월 {rules.paymentDate}일에 근로자에게 직접 또는 근로자가 지정한 계좌로 지급한다.<br />
        ③ 지급일이 휴일인 경우에는 그 전일에 지급한다.
      </p>

      {/* 제6장 퇴직 및 해고 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제6장 퇴직 및 해고
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제12조 (정년)</strong><br />
        근로자의 정년은 만 {rules.retirementAge}세로 하며, 정년에 도달한 날이 속한 달의 말일에 퇴직한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제13조 (해고)</strong><br />
        ① 회사는 근로자가 다음 각 호에 해당하는 경우에는 해고할 수 있다.<br />
        1. 신체 또는 정신상의 장애로 직무를 감당할 수 없다고 인정되는 경우<br />
        2. 직무수행 능력이 부족하여 직무를 수행할 수 없다고 인정되는 경우<br />
        3. 기타 이에 준하는 사유가 있는 경우<br />
        ② 해고는 30일 전에 예고하거나 30일분의 통상임금을 지급한다.
      </p>

      <p style={{ marginBottom: '12px' }}>
        <strong>제14조 (퇴직금)</strong><br />
        1년 이상 계속 근무한 근로자가 퇴직할 경우에는 근로자퇴직급여보장법에 따라 퇴직금을 지급한다.
      </p>

      {/* 제7장 복무 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        제7장 복무
      </h2>

      <p style={{ marginBottom: '12px' }}>
        <strong>제15조 (복무의무)</strong><br />
        근로자는 다음 각 호의 사항을 준수하여야 한다.<br />
        1. 회사의 제 규정을 준수하고 상사의 정당한 지시에 따를 것<br />
        2. 직장질서를 유지하고 다른 근로자의 정상적인 업무수행을 방해하지 않을 것<br />
        3. 회사의 명예나 신용을 훼손하지 않을 것<br />
        4. 업무상 지득한 기밀을 누설하지 않을 것
      </p>

      {/* 부칙 */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        부칙
      </h2>

      <p style={{ marginBottom: '12px' }}>
        제1조 (시행일) 이 규칙은 ______년 ______월 ______일부터 시행한다.
      </p>

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <p style={{ marginBottom: '32px' }}>______년 ______월 ______일</p>
        <p style={{ fontWeight: 'bold' }}>{rules.company.name}</p>
        <p>대표이사 {rules.company.ceoName} (인)</p>
      </div>
    </div>
  );
}
