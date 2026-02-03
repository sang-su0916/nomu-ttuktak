import { CompanyInfo } from '@/types';

const STORAGE_KEYS = {
  COMPANY_INFO: 'nomu_company_info',
  CONTRACTS: 'nomu_contracts',
  EMPLOYEES: 'nomu_employees',
};

// 회사 정보 저장/불러오기
export const saveCompanyInfo = (info: CompanyInfo): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COMPANY_INFO, JSON.stringify(info));
  }
};

export const loadCompanyInfo = (): CompanyInfo | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_INFO);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

// 기본 회사 정보
export const defaultCompanyInfo: CompanyInfo = {
  name: '',
  ceoName: '',
  businessNumber: '',
  address: '',
  phone: '',
};

// 숫자 포맷팅
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

// 금액 포맷팅 (원 단위)
export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)}원`;
};

// 날짜 포맷팅
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 주민등록번호 포맷팅 (마스킹)
export const formatResidentNumber = (num: string, mask = true): string => {
  const cleaned = num.replace(/[^0-9]/g, '');
  if (cleaned.length !== 13) return num;
  if (mask) {
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 7)}******`;
  }
  return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
};

// 사업자등록번호 포맷팅
export const formatBusinessNumber = (num: string): string => {
  const cleaned = num.replace(/[^0-9]/g, '');
  if (cleaned.length !== 10) return num;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};

// 전화번호 포맷팅
export const formatPhoneNumber = (num: string): string => {
  const cleaned = num.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return num;
};
