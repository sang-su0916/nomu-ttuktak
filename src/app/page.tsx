'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Employee } from '@/types';
import { loadCompanyInfo, loadEmployees, formatCurrency } from '@/lib/storage';
import { MINIMUM_WAGE } from '@/lib/constants';

/* ───── Tier 1: Primary Categories (3-col, large) ───── */
const primaryCategories = [
  {
    id: 'contract', label: '근로계약서', icon: '📋', bg: '#ecfdf5',
    badge: '3종',
    items: [
      { href: '/contract/fulltime', title: '정규직' },
      { href: '/contract/parttime', title: '단시간(파트타임)' },
      { href: '/contract/freelancer', title: '프리랜서 용역' },
    ],
  },
  {
    id: 'salary', label: '급여 · 임금', icon: '💵', bg: '#fffbeb',
    badge: '자동계산',
    items: [
      { href: '/payslip', title: '급여명세서' },
      { href: '/wage-ledger', title: '임금대장' },
    ],
  },
  {
    id: 'rules', label: '취업규칙', icon: '📖', bg: '#f5f3ff',
    badge: '98조항',
    items: [
      { href: '/work-rules', title: '취업규칙 (98조항)' },
    ],
  },
];

/* ───── Tier 2: Secondary Categories (4-col, compact) ───── */
const secondaryCategories = [
  {
    id: 'onboard', label: '입사서류', icon: '📥', bg: '#eef2ff',
    items: [
      { href: '/documents/privacy-consent', title: '개인정보 동의서' },
      { href: '/documents/nda', title: '비밀유지 서약서' },
    ],
  },
  {
    id: 'attendance', label: '근태관리', icon: '🕐', bg: '#fdf2f8',
    items: [
      { href: '/documents/attendance', title: '출퇴근기록부' },
      { href: '/documents/annual-leave', title: '연차관리대장' },
      { href: '/documents/overtime', title: '시간외근로 합의서' },
    ],
  },
  {
    id: 'certificate', label: '증명서', icon: '📜', bg: '#fefce8',
    items: [
      { href: '/documents/certificate', title: '재직증명서' },
      { href: '/documents/career-certificate', title: '경력증명서' },
    ],
  },
  {
    id: 'offboard', label: '퇴사서류', icon: '📤', bg: '#fef2f2',
    items: [
      { href: '/documents/resignation', title: '사직서' },
      { href: '/documents/retirement-pay', title: '퇴직금 정산서' },
      { href: '/documents/annual-leave-notice', title: '연차촉진 통보서' },
    ],
  },
];

export default function Home() {
  const [companyName] = useState(() => {
    if (typeof window === 'undefined') return '';
    const company = loadCompanyInfo();
    return company ? company.name : '';
  });
  const [employees] = useState<Employee[]>(() =>
    typeof window !== 'undefined' ? loadEmployees() : []
  );
  const isLoaded = typeof window !== 'undefined';

  const activeEmployees = employees.filter(e => e.status === 'active');
  const fulltimeCount = activeEmployees.filter(e => e.employmentType === 'fulltime').length;
  const parttimeCount = activeEmployees.filter(e => e.employmentType === 'parttime').length;
  const totalMonthlySalary = activeEmployees.reduce((sum, emp) => {
    if (emp.salary.type === 'monthly') {
      return sum + emp.salary.baseSalary + emp.salary.mealAllowance +
             emp.salary.carAllowance + emp.salary.childcareAllowance;
    }
    return sum + (emp.salary.hourlyWage || 0) * emp.workCondition.weeklyHours * 4;
  }, 0);
  const currentMonth = `${new Date().getMonth() + 1}월`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">

      {/* ════════════════════════════════════════════
          FIRST-TIME VISITOR
      ════════════════════════════════════════════ */}
      {isLoaded && !companyName && (
        <>
          {/* ── 1. Hero ── */}
          <section className="mb-6 rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 50%, #234e82 100%)',
          }}>
            <div className="px-6 py-10 sm:px-10 sm:py-14 text-white text-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                2026년 최신 노동법 반영
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ letterSpacing: '-0.5px', lineHeight: 1.3 }}>
                노무서류 18종,<br />빈칸 채우기처럼 쉽게 만드세요
              </h1>
              <p className="text-sm sm:text-base opacity-80 mb-8 max-w-lg mx-auto leading-relaxed">
                근로계약서부터 퇴직금 정산까지.<br className="hidden sm:block" />
                직원 한 번 등록하면 모든 서류가 자동 완성됩니다.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:brightness-110"
                style={{ background: '#c9a028', color: '#0f2744' }}
              >
                3분 만에 시작하기 →
              </Link>
              <p className="text-xs opacity-50 mt-4">
                설치 불필요 · 브라우저에서 바로 사용 · 데이터는 내 PC에만 저장
              </p>
            </div>
          </section>

          {/* ── 2. Trust Bar ── */}
          <section className="mb-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '18종', label: '노무서류 템플릿', icon: '📄' },
                { value: '98조항', label: '취업규칙 완비', icon: '📖' },
                { value: '2026', label: '최신 법령 반영', icon: '⚖️' },
              ].map((stat) => (
                <div key={stat.label} className="stat-compact flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="text-2xl flex-shrink-0">{stat.icon}</span>
                  <div>
                    <p className="text-lg font-bold text-[var(--text)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 3. Pain Points → Solutions ── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4 text-center">
              이런 고민, 노무뚝딱이 해결합니다
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  pain: '계약서 양식 어디서 구하지?',
                  solve: '3종 표준계약서가 준비되어 있어요',
                  icon: '📋',
                },
                {
                  pain: '4대보험 계산이 너무 복잡해',
                  solve: '2026년 요율로 자동 계산해드려요',
                  icon: '🧮',
                },
                {
                  pain: '비용이 부담돼요',
                  solve: '고용노동부 표준양식 기반으로 직접 작성',
                  icon: '💸',
                },
              ].map((item) => (
                <div key={item.pain} className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <p className="pain-text text-sm text-[var(--text-muted)] line-through mb-1">{item.pain}</p>
                  <p className="text-sm font-semibold text-[var(--primary)]">{item.solve}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. How It Works (3 Steps) ── */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4 text-center">
              3단계로 시작하세요
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  step: 1, title: '회사 정보 설정',
                  desc: '사업자번호·대표자·주소 입력',
                  benefit: '모든 서류에 자동 반영',
                  color: '#1e3a5f', link: '/settings', cta: '설정하러 가기',
                },
                {
                  step: 2, title: '직원 등록',
                  desc: '인적사항·급여·근무조건 입력',
                  benefit: '절세까지 챙겨드려요',
                  color: '#0d9488', link: '/employees', cta: '직원 등록하기',
                },
                {
                  step: 3, title: '서류 작성 · 출력',
                  desc: '직원 선택 → 자동 완성 → PDF',
                  benefit: '자동으로 채워집니다',
                  color: '#059669',
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: s.color }}>
                    {s.step}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text)]">{s.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.desc}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: s.color }}>✓ {s.benefit}</p>
                    {s.link && (
                      <Link href={s.link} className="text-xs font-medium mt-1.5 inline-block text-[#2563eb] hover:underline">
                        {s.cta} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════
          RETURNING VISITOR DASHBOARD
      ════════════════════════════════════════════ */}
      {isLoaded && companyName && (
        <section className="mb-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(30,58,95,0.08)' }}>
                🏢
              </div>
              <h1 className="text-base font-bold text-[var(--text)] truncate">{companyName}</h1>
            </div>
            <Link href="/settings" className="btn btn-secondary btn-sm">⚙️ 설정</Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="stat-compact p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">재직 직원</p>
              <p className="text-xl font-bold text-[var(--text)]">{activeEmployees.length}<span className="text-sm font-normal text-[var(--text-muted)]">명</span></p>
            </div>
            <div className="stat-compact p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">정규 / 파트</p>
              <p className="text-xl font-bold text-[var(--text)]">{fulltimeCount} <span className="text-sm font-normal text-[var(--text-muted)]">/ {parttimeCount}</span></p>
            </div>
            <div className="stat-compact p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">{currentMonth} 예상 급여</p>
              <p className="text-lg font-bold text-[var(--text)]">{totalMonthlySalary > 0 ? formatCurrency(totalMonthlySalary) : '—'}</p>
            </div>
            <div className="stat-compact p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">2026 최저시급</p>
              <p className="text-lg font-bold text-[var(--text)]">{formatCurrency(MINIMUM_WAGE.hourly)}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="quick-actions flex flex-wrap gap-2">
            <Link href="/employees" className="btn btn-secondary btn-sm">👤 직원 관리</Link>
            <Link href="/contract/fulltime" className="btn btn-secondary btn-sm">📋 계약서 작성</Link>
            <Link href="/payslip" className="btn btn-secondary btn-sm">💵 급여명세서</Link>
            <Link href="/work-rules" className="btn btn-secondary btn-sm">📖 취업규칙</Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          SERVICE GRID — Tier 1 (3-col, large)
      ════════════════════════════════════════════ */}
      <section className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {primaryCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-sm transition-shadow">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: cat.bg }}>
                  {cat.icon}
                </span>
                <span className="font-semibold text-sm text-[var(--text)]">{cat.label}</span>
                {cat.badge && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(30,58,95,0.08)', color: 'var(--primary)' }}>
                    {cat.badge}
                  </span>
                )}
              </div>
              <div className="px-3 pb-3">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg)] transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-40 flex-shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SERVICE GRID — Tier 2 (4-col, compact)
      ════════════════════════════════════════════ */}
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {secondaryCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-sm transition-shadow">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: cat.bg }}>
                  {cat.icon}
                </span>
                <span className="font-semibold text-sm text-[var(--text)]">{cat.label}</span>
              </div>
              <div className="px-3 pb-3">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg)] transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-40 flex-shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          EMPLOYEE LIST (returning visitors)
      ════════════════════════════════════════════ */}
      {isLoaded && activeEmployees.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] tracking-wide">직원 목록</h2>
            <Link href="/employees" className="btn btn-secondary btn-sm">전체 보기</Link>
          </div>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>고용형태</th>
                  <th>부서</th>
                  <th className="text-right">급여</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.slice(0, 5).map(emp => (
                  <tr key={emp.id}>
                    <td className="font-medium">{emp.info.name}</td>
                    <td>
                      <span className={`badge ${emp.employmentType === 'fulltime' ? 'badge-primary' : 'badge-neutral'}`}>
                        {emp.employmentType === 'fulltime' ? '정규직' :
                         emp.employmentType === 'parttime' ? '파트타임' : '프리랜서'}
                      </span>
                    </td>
                    <td className="text-[var(--text-muted)]">{emp.department || '—'}</td>
                    <td className="text-right font-medium">
                      {emp.salary.type === 'monthly'
                        ? formatCurrency(emp.salary.baseSalary + emp.salary.mealAllowance + emp.salary.carAllowance)
                        : `${formatCurrency(emp.salary.hourlyWage || 0)}/시간`
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          EXPERT BRANDING SECTION (first-time visitors)
      ════════════════════════════════════════════ */}
      {isLoaded && !companyName && (
        <section className="brand-strip mb-8 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #faf5e4 0%, #f5edd6 50%, #ede3c4 100%)' }}>
          <div className="px-6 py-10 sm:px-10 sm:py-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <Image src="/logo.png" alt="L-BIZ Partners" fill className="object-contain" />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: '#8b6914' }}>
              엘비즈 파트너스가 만들었습니다
            </p>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#6b5310' }}>
              중소기업 경영지원 전문 파트너.<br />
              노무·세무·법률 실무 경험을 바탕으로<br className="sm:hidden" />
              사업주가 꼭 필요한 서류만 엄선했습니다.
            </p>
            <a href="mailto:sangsu0916@naver.com"
              className="inline-block mt-4 text-sm font-medium hover:underline"
              style={{ color: '#8b6914' }}>
              sangsu0916@naver.com →
            </a>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="border-t border-[var(--border)] pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image src="/logo.png" alt="L-BIZ Partners" fill className="object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold block" style={{ color: '#b8860b' }}>엘비즈 파트너스</span>
              <span className="text-xs text-[var(--text-light)]">© 2026 노무뚝딱</span>
            </div>
          </div>

          {/* Right: contact + legal */}
          <div className="text-xs text-[var(--text-muted)] sm:text-right space-y-1">
            <a href="mailto:sangsu0916@naver.com" className="hover:text-[var(--text)] block">
              sangsu0916@naver.com
            </a>
            <p className="text-[11px] text-[var(--text-light)] leading-relaxed">
              본 서비스의 문서 양식은 참고용이며, 법적 효력은 관할 기관 및 전문가 확인이 필요합니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
