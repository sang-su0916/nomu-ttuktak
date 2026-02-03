import Link from 'next/link';

const features = [
  {
    href: '/contract/fulltime',
    icon: '📝',
    title: '정규직 근로계약서',
    description: '무기계약 정규직 근로계약서 작성',
    color: 'bg-blue-500',
  },
  {
    href: '/contract/parttime',
    icon: '⏰',
    title: '파트타임 근로계약서',
    description: '시간제 근로자 계약서 작성',
    color: 'bg-purple-500',
  },
  {
    href: '/contract/freelancer',
    icon: '💼',
    title: '프리랜서 계약서',
    description: '용역/도급 계약서 작성',
    color: 'bg-emerald-500',
  },
  {
    href: '/wage-ledger',
    icon: '📊',
    title: '임금대장',
    description: '월별 급여 내역 관리 및 출력',
    color: 'bg-orange-500',
  },
  {
    href: '/payslip',
    icon: '💰',
    title: '급여명세서',
    description: '개인별 급여명세서 발급',
    color: 'bg-pink-500',
  },
  {
    href: '/work-rules',
    icon: '📋',
    title: '취업규칙',
    description: '표준 취업규칙 작성 및 출력',
    color: 'bg-indigo-500',
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          👷 노무뚝딱
        </h1>
        <p className="text-xl text-gray-600">
          쉽고 빠른 노무서류 작성 서비스
        </p>
        <p className="text-gray-500 mt-2">
          근로계약서, 임금대장, 급여명세서, 취업규칙을 간편하게 작성하고 출력하세요
        </p>
      </div>

      {/* 기능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <Link 
            key={feature.href} 
            href={feature.href}
            className="dashboard-card group"
          >
            <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-500 text-sm">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      {/* 안내 사항 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <span>💡</span> 사용 안내
        </h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li>• 먼저 <Link href="/settings" className="underline font-medium">설정</Link>에서 회사 정보를 입력하세요. 모든 서류에 자동으로 반영됩니다.</li>
          <li>• 작성한 서류는 PDF로 저장하거나 바로 인쇄할 수 있습니다.</li>
          <li>• 입력한 데이터는 브라우저에 저장되며, 다른 기기에서는 사용할 수 없습니다.</li>
          <li>• 표준 양식을 기반으로 하며, 필요시 전문가 상담을 권장합니다.</li>
        </ul>
      </div>

      {/* 푸터 */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>© 2026 노무뚝딱. 본 서비스는 참고용이며, 법적 효력을 보장하지 않습니다.</p>
      </footer>
    </div>
  );
}
