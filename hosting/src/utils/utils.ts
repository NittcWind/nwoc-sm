import { Score, ValidateResult } from '@/types';

export const isProduction = process.env.NODE_ENV === 'production';

export const getUrlParam = (() => {
  const params = new URL(window.location.href).searchParams;
  return (key: string) => {
    const result = params.get(key);
    if (result == null) return null;
    return decodeURIComponent(result);
  };
})();

export const isRequire = (val: string): ValidateResult => !!val || '必須項目です。';

export const lengthCheck = (
  formName: string,
  max: number,
  required = false,
): (
  (val: string) => string | true
) => (
  required
    ? (val: string) => (!!val && val.length <= max) || `${formName}は${max}文字以内で入力してください。`
    : (val: string) => (!!val && (val.length === 0 || val.length <= max)) || `${formName}は${max}文字以内で入力してください。`
);

export const generateBlankScore = (): Score => ({
  id: '',
  name: '',
  otherName: '',
  address: '',
  publisher: '',
  year: (new Date()).getFullYear(),
  singer: '',
  note: '',
});
