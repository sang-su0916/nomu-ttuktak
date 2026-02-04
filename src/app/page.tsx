'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Employee } from '@/types';
import { loadCompanyInfo, loadEmployees, formatCurrency } from '@/lib/storage';
import { MINIMUM_WAGE } from '@/lib/constants';

const features = [
  {
    href: '/employees',
    icon: '👥',
    title: '직원 관리',
    description: '직원 등록 및 급여 최적화',
    color: 'bg-teal-500',
    badge: '추천',
  },
  {
    href: '/contract/fulltime',
    icon: '📝',
    title: '정규직 계약서',
    description: '무기계약 정규직 근로계약서',
    color: 'bg-blue-500',
  },
  {
    href: '/contract/parttime',
    icon: '⏰',
    title: '파트타임 계약서',
    description: '시간제 근로자 계약서',
    color: 'bg-purple-500',
  },
  {
    href: '/contract/freelancer',
    icon: '💼',
    title: '프리랜서 계약서',
    description: '용역/도급 계약서',
    color: 'bg-emerald-500',
  },
  {
    href: '/payslip',
    icon: '💰',
    title: '급여명세서',
    description: '개인별 급여명세서 발급',
    color: 'bg-pink-500',
  },
  {
    href: '/wage-ledger',
    icon: '📊',
    title: '임금대장',
    description: '월별 급여 내역 관리',
    color: 'bg-orange-500',
  },
  {
    href: '/work-rules',
    icon: '📋',
    title: '취업규칙',
    description: '표준 취업규칙 작성',
    color: 'bg-indigo-500',
  },
  {
    href: '/settings',
    icon: '⚙️',
    title: '설정',
    description: '회사 정보 관리',
    color: 'bg-gray-500',
  },
];

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const company = loadCompanyInfo();
    if (company) {
      setCompanyName(company.name);
    }
    setEmployees(loadEmployees());
    setIsLoaded(true);
  }, []);

  // 통계 계산
  const activeEmployees = employees.filter(e => e.status === 'active');
  const fulltimeCount = activeEmployees.filter(e => e.employmentType === 'fulltime').length;
  const parttimeCount = activeEmployees.filter(e => e.employmentType === 'parttime').length;
  const freelancerCount = activeEmployees.filter(e => e.employmentType === 'freelancer').length;
  
  const totalMonthlySalary = activeEmployees.reduce((sum, emp) => {
    if (emp.salary.type === 'monthly') {
      return sum + emp.salary.baseSalary + emp.salary.mealAllowance + 
             emp.salary.carAllowance + emp.salary.childcareAllowance;
    }
    // 파트타임은 시급 × 주간시간 × 4주로 대략 계산
    return sum + (emp.salary.hourlyWage || 0) * emp.workCondition.weeklyHours * 4;
  }, 0);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          👷 노무뚝딱
        </h1>
        <p className="text-gray-500">
          쉽고 빠른 노무서류 작성 서비스
        </p>
        {companyName && (
          <p className="mt-2 text-blue-600 font-medium">
            🏢 {companyName}
          </p>
        )}
      </div>

      {/* 대시보드 카드 */}
      {isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* 직원 현황 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm">총 직원</p>
            <p className="text-3xl font-bold mt-1">{activeEmployees.length}명</p>
            <div className="mt-3 text-sm text-blue-100 space-y-1">
              <p>정규직 {fulltimeCount}명</p>
              <p>파트타임 {parttimeCount}명</p>
              {freelancerCount > 0 && <p>프리랜서 {freelancerCount}명</p>}
            </div>
          </div>

          {/* 이번 달 급여 */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-green-100 text-sm">{currentMonth} 예상 급여</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalMonthlySalary)}</p>
            <p className="mt-3 text-sm text-green-100">
              인당 평균: {activeEmployees.length > 0 
                ? formatCurrency(Math.round(totalMonthlySalary / activeEmployees.length))
                : '-'}
            </p>
          </div>

          {/* 2026년 최저임금 */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm">2026년 최저임금</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(MINIMUM_WAGE.hourly)}/시간</p>
            <p className="mt-3 text-sm text-amber-100">
              월 {formatCurrency(MINIMUM_WAGE.monthly)}
            </p>
          </div>

          {/* 빠른 액션 */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-purple-100 text-sm">빠른 시작</p>
            <div className="mt-3 space-y-2">
              <Link 
                href="/employees" 
                className="block bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                👥 직원 등록
              </Link>
              <Link 
                href="/payslip" 
                className="block bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                💰 급여명세서 발급
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 회사 정보 미등록 안내 */}
      {isLoaded && !companyName && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 font-medium">
            ⚠️ 회사 정보가 등록되지 않았습니다.
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            먼저 <Link href="/settings" className="underline font-medium">설정</Link>에서 
            회사 정보를 입력하세요. 모든 서류에 자동으로 반영됩니다.
          </p>
        </div>
      )}

      {/* 기능 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {features.map((feature) => (
          <Link 
            key={feature.href} 
            href={feature.href}
            className="relative dashboard-card group text-center"
          >
            {feature.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {feature.badge}
              </span>
            )}
            <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h2 className="font-bold text-gray-800 text-sm mb-1">
              {feature.title}
            </h2>
            <p className="text-gray-500 text-xs">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      {/* 최근 등록 직원 */}
      {isLoaded && activeEmployees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">👥 최근 등록 직원</h3>
            <Link href="/employees" className="text-blue-500 text-sm hover:underline">
              전체 보기 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">이름</th>
                  <th className="px-4 py-2 text-left text-gray-600">고용형태</th>
                  <th className="px-4 py-2 text-left text-gray-600">부서</th>
                  <th className="px-4 py-2 text-right text-gray-600">월급여</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeEmployees.slice(0, 5).map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{emp.info.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        emp.employmentType === 'fulltime' ? 'bg-blue-100 text-blue-700' :
                        emp.employmentType === 'parttime' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {emp.employmentType === 'fulltime' ? '정규직' :
                         emp.employmentType === 'parttime' ? '파트타임' : '프리랜서'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.department || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {emp.salary.type === 'monthly' 
                        ? formatCurrency(emp.salary.baseSalary + emp.salary.mealAllowance + emp.salary.carAllowance)
                        : `시급 ${formatCurrency(emp.salary.hourlyWage || 0)}`
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 사용 안내 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          💡 추천 사용 순서
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-medium text-blue-800">설정</p>
              <p className="text-blue-600">회사 정보 입력</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-medium text-blue-800">직원 관리</p>
              <p className="text-blue-600">직원 등록 + 급여 최적화</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-medium text-blue-800">계약서 작성</p>
              <p className="text-blue-600">직원 선택 → 자동 입력</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <div>
              <p className="font-medium text-blue-800">급여/임금대장</p>
              <p className="text-blue-600">월별 급여 관리</p>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="text-center text-gray-400 text-sm">
        <p>© 2026 노무뚝딱 | 본 서비스는 참고용이며, 법적 효력을 보장하지 않습니다.</p>
        <p className="mt-1">
          문의: <a href="mailto:sangsu0916@naver.com" className="text-blue-400 hover:underline">sangsu0916@naver.com</a>
        </p>
      </footer>
    </div>
  );
}
