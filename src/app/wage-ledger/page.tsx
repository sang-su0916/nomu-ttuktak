'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CompanyInfo } from '@/types';
import { loadCompanyInfo, defaultCompanyInfo, formatCurrency, formatBusinessNumber } from '@/lib/storage';

interface Employee {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  allowances: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localTax: number;
}

interface WageLedgerData {
  company: CompanyInfo;
  year: number;
  month: number;
  employees: Employee[];
}

const createEmptyEmployee = (): Employee => ({
  id: Date.now().toString(),
  name: '',
  position: '',
  baseSalary: 0,
  overtime: 0,
  bonus: 0,
  allowances: 0,
  nationalPension: 0,
  healthInsurance: 0,
  longTermCare: 0,
  employmentInsurance: 0,
  incomeTax: 0,
  localTax: 0,
});

const today = new Date();

export default function WageLedgerPage() {
  const [data, setData] = useState<WageLedgerData>({
    company: defaultCompanyInfo,
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    employees: [createEmptyEmployee()],
  });
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCompany = loadCompanyInfo();
    if (savedCompany) {
      setData(prev => ({ ...prev, company: savedCompany }));
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `임금대장_${data.year}년${data.month}월`,
  });

  const addEmployee = () => {
    setData(prev => ({
      ...prev,
      employees: [...prev.employees, createEmptyEmployee()]
    }));
  };

  const removeEmployee = (id: string) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id)
    }));
  };

  const updateEmployee = (id: string, field: keyof Employee, value: string | number) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(e => 
        e.id === id ? { ...e, [field]: value } : e
      )
    }));
  };

  const autoCalculateDeductions = (id: string) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id !== id) return e;
        const taxable = e.baseSalary + e.overtime + e.bonus;
        return {
          ...e,
          nationalPension: Math.round(taxable * 0.045),
          healthInsurance: Math.round(taxable * 0.03545),
          longTermCare: Math.round(taxable * 0.03545 * 0.1295),
          employmentInsurance: Math.round(taxable * 0.009),
          incomeTax: Math.round(taxable * 0.03), // 간단 계산
          localTax: Math.round(taxable * 0.003),
        };
      })
    }));
  };

  const getEmployeeTotals = (emp: Employee) => {
    const totalEarnings = emp.baseSalary + emp.overtime + emp.bonus + emp.allowances;
    const totalDeductions = emp.nationalPension + emp.healthInsurance + emp.longTermCare + 
                           emp.employmentInsurance + emp.incomeTax + emp.localTax;
    return { totalEarnings, totalDeductions, netPay: totalEarnings - totalDeductions };
  };

  const grandTotals = data.employees.reduce((acc, emp) => {
    const { totalEarnings, totalDeductions, netPay } = getEmployeeTotals(emp);
    return {
      totalEarnings: acc.totalEarnings + totalEarnings,
      totalDeductions: acc.totalDeductions + totalDeductions,
      netPay: acc.netPay + netPay,
    };
  }, { totalEarnings: 0, totalDeductions: 0, netPay: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 임금대장</h1>
          <p className="text-gray-500 mt-1">월별 급여 내역을 관리합니다.</p>
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
          {/* 기간 선택 */}
          <div className="form-section">
            <div className="flex items-center gap-4">
              <div>
                <label className="input-label">연도</label>
                <select
                  className="input-field"
                  value={data.year}
                  onChange={(e) => setData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">월</label>
                <select
                  className="input-field"
                  value={data.month}
                  onChange={(e) => setData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto">
                <button onClick={addEmployee} className="btn-success">
                  + 직원 추가
                </button>
              </div>
            </div>
          </div>

          {/* 직원 목록 */}
          {data.employees.map((emp, index) => {
            const { totalEarnings, totalDeductions, netPay } = getEmployeeTotals(emp);
            return (
              <div key={emp.id} className="form-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">직원 {index + 1}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => autoCalculateDeductions(emp.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      🔄 공제 자동계산
                    </button>
                    {data.employees.length > 1 && (
                      <button
                        onClick={() => removeEmployee(emp.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">성명</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      placeholder="홍길동"
                      value={emp.name}
                      onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">직책</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      placeholder="대리"
                      value={emp.position}
                      onChange={(e) => updateEmployee(emp.id, 'position', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">기본급</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={emp.baseSalary || ''}
                      onChange={(e) => updateEmployee(emp.id, 'baseSalary', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">연장수당</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={emp.overtime || ''}
                      onChange={(e) => updateEmployee(emp.id, 'overtime', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">상여금</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={emp.bonus || ''}
                      onChange={(e) => updateEmployee(emp.id, 'bonus', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">제수당</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={emp.allowances || ''}
                      onChange={(e) => updateEmployee(emp.id, 'allowances', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">국민연금</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.nationalPension || ''}
                      onChange={(e) => updateEmployee(emp.id, 'nationalPension', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">건강보험</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.healthInsurance || ''}
                      onChange={(e) => updateEmployee(emp.id, 'healthInsurance', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">장기요양</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.longTermCare || ''}
                      onChange={(e) => updateEmployee(emp.id, 'longTermCare', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">고용보험</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.employmentInsurance || ''}
                      onChange={(e) => updateEmployee(emp.id, 'employmentInsurance', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">소득세</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.incomeTax || ''}
                      onChange={(e) => updateEmployee(emp.id, 'incomeTax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">지방소득세</label>
                    <input
                      type="number"
                      className="input-field text-sm bg-red-50"
                      value={emp.localTax || ''}
                      onChange={(e) => updateEmployee(emp.id, 'localTax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-blue-600">지급: {formatCurrency(totalEarnings)}</span>
                  <span className="text-red-600">공제: {formatCurrency(totalDeductions)}</span>
                  <span className="font-bold text-emerald-600">실수령: {formatCurrency(netPay)}</span>
                </div>
              </div>
            );
          })}

          {/* 합계 */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">📊 합계</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm opacity-80">총 지급액</p>
                <p className="text-2xl font-bold">{formatCurrency(grandTotals.totalEarnings)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">총 공제액</p>
                <p className="text-2xl font-bold">{formatCurrency(grandTotals.totalDeductions)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">총 실수령액</p>
                <p className="text-2xl font-bold">{formatCurrency(grandTotals.netPay)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 overflow-x-auto">
          <WageLedgerPreview data={data} />
        </div>
      )}

      <div className="hidden">
        <div ref={printRef}>
          <WageLedgerPreview data={data} />
        </div>
      </div>
    </div>
  );
}

function WageLedgerPreview({ data }: { data: WageLedgerData }) {
  const getEmployeeTotals = (emp: Employee) => {
    const totalEarnings = emp.baseSalary + emp.overtime + emp.bonus + emp.allowances;
    const totalDeductions = emp.nationalPension + emp.healthInsurance + emp.longTermCare + 
                           emp.employmentInsurance + emp.incomeTax + emp.localTax;
    return { totalEarnings, totalDeductions, netPay: totalEarnings - totalDeductions };
  };

  const grandTotals = data.employees.reduce((acc, emp) => {
    const { totalEarnings, totalDeductions, netPay } = getEmployeeTotals(emp);
    return {
      baseSalary: acc.baseSalary + emp.baseSalary,
      overtime: acc.overtime + emp.overtime,
      bonus: acc.bonus + emp.bonus,
      allowances: acc.allowances + emp.allowances,
      nationalPension: acc.nationalPension + emp.nationalPension,
      healthInsurance: acc.healthInsurance + emp.healthInsurance,
      longTermCare: acc.longTermCare + emp.longTermCare,
      employmentInsurance: acc.employmentInsurance + emp.employmentInsurance,
      incomeTax: acc.incomeTax + emp.incomeTax,
      localTax: acc.localTax + emp.localTax,
      totalEarnings: acc.totalEarnings + totalEarnings,
      totalDeductions: acc.totalDeductions + totalDeductions,
      netPay: acc.netPay + netPay,
    };
  }, {
    baseSalary: 0, overtime: 0, bonus: 0, allowances: 0,
    nationalPension: 0, healthInsurance: 0, longTermCare: 0, employmentInsurance: 0,
    incomeTax: 0, localTax: 0, totalEarnings: 0, totalDeductions: 0, netPay: 0
  });

  return (
    <div style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>임 금 대 장</h1>
        <p>{data.year}년 {data.month}월</p>
        <p style={{ marginTop: '8px' }}>{data.company.name} (사업자번호: {formatBusinessNumber(data.company.businessNumber)})</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#f3f4f6' }}>No</th>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#f3f4f6' }}>성명</th>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#f3f4f6' }}>직책</th>
            <th colSpan={4} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#dbeafe' }}>지급</th>
            <th colSpan={6} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>공제</th>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#d1fae5' }}>실수령</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#dbeafe' }}>기본급</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#dbeafe' }}>연장</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#dbeafe' }}>상여</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#dbeafe' }}>수당</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>국민</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>건강</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>장기</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>고용</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>소득세</th>
            <th style={{ border: '1px solid #333', padding: '4px', backgroundColor: '#fecaca' }}>지방세</th>
          </tr>
        </thead>
        <tbody>
          {data.employees.map((emp, index) => {
            const { netPay } = getEmployeeTotals(emp);
            return (
              <tr key={emp.id}>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{emp.name}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{emp.position}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.baseSalary.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.overtime.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.bonus.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.allowances.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.nationalPension.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.healthInsurance.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.longTermCare.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.employmentInsurance.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.incomeTax.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{emp.localTax.toLocaleString()}</td>
                <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{netPay.toLocaleString()}</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
            <td colSpan={3} style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>합 계</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.baseSalary.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.overtime.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.bonus.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.allowances.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.nationalPension.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.healthInsurance.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.longTermCare.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.employmentInsurance.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.incomeTax.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.localTax.toLocaleString()}</td>
            <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'right' }}>{grandTotals.netPay.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <p>작성일: {new Date().toLocaleDateString('ko-KR')}</p>
        <p>작성자: _________________ (인)</p>
      </div>
    </div>
  );
}
