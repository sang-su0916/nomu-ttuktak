'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CompanyInfo, EmployeeInfo } from '@/types';
import { loadCompanyInfo, defaultCompanyInfo, formatDate, formatCurrency, formatBusinessNumber, formatPhoneNumber, formatResidentNumber } from '@/lib/storage';

interface ParttimeContractData {
  company: CompanyInfo;
  employee: EmployeeInfo;
  contractDate: string;
  startDate: string;
  endDate: string;
  workplace: string;
  jobDescription: string;
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  workDays: string[];
  weeklyHours: number;
  weeklyHoliday: string;
  hourlyWage: number;
  weeklyAllowance: boolean;
  paymentMethod: string;
  paymentDate: number;
  insurance: {
    national: boolean;
    health: boolean;
    employment: boolean;
    industrial: boolean;
  };
}

const defaultEmployee: EmployeeInfo = {
  name: '',
  residentNumber: '',
  address: '',
  phone: '',
};

const defaultContract: ParttimeContractData = {
  company: defaultCompanyInfo,
  employee: defaultEmployee,
  contractDate: new Date().toISOString().split('T')[0],
  startDate: '',
  endDate: '',
  workplace: '',
  jobDescription: '',
  workStartTime: '09:00',
  workEndTime: '14:00',
  breakTime: 30,
  workDays: ['월', '수', '금'],
  weeklyHours: 15,
  weeklyHoliday: '매주 일요일',
  hourlyWage: 10030,  // 2026년 최저임금
  weeklyAllowance: true,
  paymentMethod: '근로자 명의 예금통장에 입금',
  paymentDate: 10,
  insurance: {
    national: false,
    health: false,
    employment: true,
    industrial: true,
  },
};

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function ParttimeContractPage() {
  const [contract, setContract] = useState<ParttimeContractData>(defaultContract);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCompany = loadCompanyInfo();
    if (savedCompany) {
      setContract(prev => ({ 
        ...prev, 
        company: savedCompany,
        workplace: savedCompany.address 
      }));
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `파트타임_근로계약서_${contract.employee.name || '이름없음'}`,
  });

  const updateContract = (field: string, value: unknown) => {
    setContract(prev => ({ ...prev, [field]: value }));
  };

  const updateEmployee = (field: keyof EmployeeInfo, value: string) => {
    setContract(prev => ({
      ...prev,
      employee: { ...prev.employee, [field]: value }
    }));
  };

  const toggleWorkDay = (day: string) => {
    setContract(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  const toggleInsurance = (type: keyof typeof contract.insurance) => {
    setContract(prev => ({
      ...prev,
      insurance: { ...prev.insurance, [type]: !prev.insurance[type] }
    }));
  };

  // 예상 월급 계산
  const estimatedMonthly = contract.hourlyWage * contract.weeklyHours * 4.345;
  const weeklyAllowanceAmount = contract.weeklyAllowance && contract.weeklyHours >= 15
    ? contract.hourlyWage * 8 * 4.345
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⏰ 파트타임 근로계약서</h1>
          <p className="text-gray-500 mt-1">단시간 근로자 근로계약서를 작성합니다.</p>
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
            <h2 className="form-section-title">🏢 사용자(회사) 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">상호</label>
                <input type="text" className="input-field bg-gray-50" value={contract.company.name} readOnly />
              </div>
              <div>
                <label className="input-label">대표자</label>
                <input type="text" className="input-field bg-gray-50" value={contract.company.ceoName} readOnly />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">주소</label>
                <input type="text" className="input-field bg-gray-50" value={contract.company.address} readOnly />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              💡 회사 정보는 <a href="/settings" className="text-blue-500 underline">설정</a>에서 수정할 수 있습니다.
            </p>
          </div>

          {/* 근로자 정보 */}
          <div className="form-section">
            <h2 className="form-section-title">👤 근로자 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">성명 *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="홍길동"
                  value={contract.employee.name}
                  onChange={(e) => updateEmployee('name', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">주민등록번호 *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="990101-1234567"
                  value={contract.employee.residentNumber}
                  onChange={(e) => updateEmployee('residentNumber', e.target.value.replace(/[^0-9-]/g, '').slice(0, 14))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">주소 *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="서울시 강남구 테헤란로 123"
                  value={contract.employee.address}
                  onChange={(e) => updateEmployee('address', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">연락처 *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="010-1234-5678"
                  value={contract.employee.phone}
                  onChange={(e) => updateEmployee('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 계약 기간 */}
          <div className="form-section">
            <h2 className="form-section-title">📅 계약 기간</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">계약 체결일 *</label>
                <input
                  type="date"
                  className="input-field"
                  value={contract.contractDate}
                  onChange={(e) => updateContract('contractDate', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">근무 시작일 *</label>
                <input
                  type="date"
                  className="input-field"
                  value={contract.startDate}
                  onChange={(e) => updateContract('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">근무 종료일</label>
                <input
                  type="date"
                  className="input-field"
                  value={contract.endDate}
                  onChange={(e) => updateContract('endDate', e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="input-label">근무 장소 *</label>
                <input
                  type="text"
                  className="input-field"
                  value={contract.workplace}
                  onChange={(e) => updateContract('workplace', e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="input-label">업무 내용 *</label>
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="예: 매장 판매 보조"
                  value={contract.jobDescription}
                  onChange={(e) => updateContract('jobDescription', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 근로시간 */}
          <div className="form-section">
            <h2 className="form-section-title">⏰ 근로시간</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label">시작 시간</label>
                <input
                  type="time"
                  className="input-field"
                  value={contract.workStartTime}
                  onChange={(e) => updateContract('workStartTime', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">종료 시간</label>
                <input
                  type="time"
                  className="input-field"
                  value={contract.workEndTime}
                  onChange={(e) => updateContract('workEndTime', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">휴게시간 (분)</label>
                <input
                  type="number"
                  className="input-field"
                  value={contract.breakTime}
                  onChange={(e) => updateContract('breakTime', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="input-label">주 소정근로시간</label>
                <input
                  type="number"
                  className="input-field"
                  value={contract.weeklyHours}
                  onChange={(e) => updateContract('weeklyHours', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="input-label">근무 요일</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {WEEKDAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkDay(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      contract.workDays.includes(day)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="input-label">주휴일 *</label>
              <select
                className="input-field"
                value={contract.weeklyHoliday}
                onChange={(e) => updateContract('weeklyHoliday', e.target.value)}
              >
                <option value="매주 일요일">매주 일요일</option>
                <option value="매주 토요일">매주 토요일</option>
                <option value="매주 토요일, 일요일">매주 토요일, 일요일</option>
                <option value="주 1회 (별도 지정)">주 1회 (별도 지정)</option>
              </select>
              <p className="text-sm text-gray-400 mt-1">
                주 15시간 이상 근무 시 유급 주휴일 부여 (근로기준법 제55조)
              </p>
            </div>
          </div>

          {/* 급여 */}
          <div className="form-section">
            <h2 className="form-section-title">💰 급여</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">시급 (원) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="10030"
                  value={contract.hourlyWage || ''}
                  onChange={(e) => updateContract('hourlyWage', parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-400 mt-1">2026년 최저시급: 10,030원</p>
              </div>
              <div>
                <label className="input-label">급여 지급일</label>
                <select
                  className="input-field"
                  value={contract.paymentDate}
                  onChange={(e) => updateContract('paymentDate', parseInt(e.target.value))}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>매월 {day}일</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">지급방법 *</label>
                <select
                  className="input-field"
                  value={contract.paymentMethod}
                  onChange={(e) => updateContract('paymentMethod', e.target.value)}
                >
                  <option value="근로자 명의 예금통장에 입금">근로자 명의 예금통장에 입금</option>
                  <option value="현금 직접 지급">현금 직접 지급</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contract.weeklyAllowance}
                    onChange={(e) => updateContract('weeklyAllowance', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-gray-700">주휴수당 지급 (주 15시간 이상 근무 시)</span>
                </label>
              </div>
            </div>
            
            {/* 예상 급여 계산 */}
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📊 예상 월급여</h4>
              <div className="text-sm text-purple-700 space-y-1">
                <p>기본급: {formatCurrency(Math.round(estimatedMonthly))}</p>
                {contract.weeklyAllowance && contract.weeklyHours >= 15 && (
                  <p>주휴수당: {formatCurrency(Math.round(weeklyAllowanceAmount))}</p>
                )}
                <p className="font-bold text-lg pt-2 border-t border-purple-200">
                  합계: {formatCurrency(Math.round(estimatedMonthly + weeklyAllowanceAmount))}
                </p>
              </div>
            </div>
          </div>

          {/* 4대보험 */}
          <div className="form-section">
            <h2 className="form-section-title">🏥 4대보험 가입</h2>
            <p className="text-sm text-gray-500 mb-4">
              단시간 근로자는 월 60시간 이상 근무 시 국민연금·건강보험 의무가입
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'national', label: '국민연금' },
                { key: 'health', label: '건강보험' },
                { key: 'employment', label: '고용보험' },
                { key: 'industrial', label: '산재보험' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contract.insurance[item.key as keyof typeof contract.insurance]}
                    onChange={() => toggleInsurance(item.key as keyof typeof contract.insurance)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <ParttimeContractPreview contract={contract} />
        </div>
      )}

      <div className="hidden">
        <div ref={printRef}>
          <ParttimeContractPreview contract={contract} />
        </div>
      </div>
    </div>
  );
}

function ParttimeContractPreview({ contract }: { contract: ParttimeContractData }) {
  const insuranceList = [];
  if (contract.insurance.national) insuranceList.push('국민연금');
  if (contract.insurance.health) insuranceList.push('건강보험');
  if (contract.insurance.employment) insuranceList.push('고용보험');
  if (contract.insurance.industrial) insuranceList.push('산재보험');

  // 연차휴가 비례 계산 (주 15시간 이상일 경우)
  const annualLeaveRatio = contract.weeklyHours >= 15 ? (contract.weeklyHours / 40 * 15).toFixed(1) : 0;

  return (
    <div className="contract-document p-8" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
        단시간 근로자 근로계약서
      </h1>
      <p style={{ fontSize: '12px', textAlign: 'center', color: '#666', marginBottom: '32px' }}>
        (근로기준법 제17조, 제18조에 의한 근로조건 명시)
      </p>

      <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
        <strong>{contract.company.name}</strong>(이하 &quot;사용자&quot;라 함)과(와) 
        <strong> {contract.employee.name}</strong>(이하 &quot;근로자&quot;라 함)은(는) 다음과 같이 근로계약을 체결한다.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', width: '25%', textAlign: 'left' }}>
              1. 계약기간
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              {formatDate(contract.startDate)} ~ {contract.endDate ? formatDate(contract.endDate) : '별도 합의시까지'}
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              2. 근무장소
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              {contract.workplace}
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              3. 업무내용
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              {contract.jobDescription}
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              4. 소정근로시간
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              <strong>• 근무시간:</strong> {contract.workStartTime} ~ {contract.workEndTime}<br />
              <strong>• 휴게시간:</strong> {contract.breakTime}분<br />
              <strong>• 근무요일:</strong> {contract.workDays.join(', ')} (주 {contract.workDays.length}일)<br />
              <strong>• 주 소정근로시간:</strong> {contract.weeklyHours}시간
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              5. 휴일<br/><span style={{ fontSize: '11px', fontWeight: 'normal' }}>(근로기준법 제55조)</span>
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              <strong>• 주휴일:</strong> {contract.weeklyHoliday} {contract.weeklyHours >= 15 ? '(유급)' : '(무급)'}<br />
              <span style={{ fontSize: '11px', color: '#666' }}>
                ※ 주 15시간 이상 근무 시 유급 주휴일 부여
              </span>
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              6. 연차유급휴가<br/><span style={{ fontSize: '11px', fontWeight: 'normal' }}>(근로기준법 제18조)</span>
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              {contract.weeklyHours >= 15 
                ? <>통상 근로자의 근로시간에 비례하여 연 약 {annualLeaveRatio}일<br />
                    <span style={{ fontSize: '11px', color: '#666' }}>※ 계산: 주 {contract.weeklyHours}시간 ÷ 40시간 × 15일</span></>
                : '주 15시간 미만 근무로 미적용'}
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              7. 임금
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              <strong>• 시급:</strong> {formatCurrency(contract.hourlyWage)} (2026년 최저임금 10,030원 이상)<br />
              <strong>• 주휴수당:</strong> {contract.weeklyAllowance && contract.weeklyHours >= 15 ? '지급 (주 15시간 이상 근무)' : '미지급'}<br />
              <strong>• 지급일:</strong> 매월 {contract.paymentDate}일<br />
              <strong>• 지급방법:</strong> {contract.paymentMethod}
            </td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              8. 사회보험 적용
            </th>
            <td style={{ border: '1px solid #333', padding: '12px' }}>
              {insuranceList.length > 0 ? insuranceList.join(', ') + ' 가입' : '해당 없음'}<br />
              <span style={{ fontSize: '11px', color: '#666' }}>
                ※ 월 60시간 이상 근무 시 국민연금·건강보험 의무가입
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>9. 근로계약서 교부</h2>
        <p style={{ lineHeight: '1.8', fontSize: '13px' }}>
          사용자는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부요구와 관계없이 
          근로자에게 교부함 (근로기준법 제17조 이행)
        </p>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>10. 기타</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', fontSize: '13px' }}>
          <li>본 계약에 명시되지 않은 사항은 근로기준법 및 관계 법령에 따른다.</li>
          <li>단시간 근로자의 근로조건은 그 사업장의 같은 종류의 업무에 종사하는 통상 근로자의 근로시간을 기준으로 산정한 비율에 따라 결정한다. (근로기준법 제18조)</li>
          <li>본 계약서는 2부를 작성하여 사용자와 근로자가 각각 1부씩 보관한다.</li>
        </ul>
      </div>

      <p style={{ textAlign: 'center', marginTop: '48px', marginBottom: '48px', fontSize: '14px' }}>
        {formatDate(contract.contractDate)}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px' }}>
        <div style={{ width: '45%' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>[사용자]</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', width: '100px' }}>사업체명:</td>
                <td style={{ padding: '4px 0' }}>{contract.company.name}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>사업자번호:</td>
                <td style={{ padding: '4px 0' }}>{formatBusinessNumber(contract.company.businessNumber)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>소 재 지:</td>
                <td style={{ padding: '4px 0' }}>{contract.company.address}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>대 표 자:</td>
                <td style={{ padding: '4px 0' }}>{contract.company.ceoName} (서명 또는 인)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ width: '45%' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>[근로자]</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', width: '80px' }}>성 명:</td>
                <td style={{ padding: '4px 0' }}>{contract.employee.name}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>주민번호:</td>
                <td style={{ padding: '4px 0' }}>{formatResidentNumber(contract.employee.residentNumber)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>주 소:</td>
                <td style={{ padding: '4px 0' }}>{contract.employee.address}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0' }}>연 락 처:</td>
                <td style={{ padding: '4px 0' }}>{contract.employee.phone} (서명 또는 인)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
