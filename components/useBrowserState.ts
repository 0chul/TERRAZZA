import { useEffect, useState } from 'react';

export function useBrowserState<T>(key: string, initial: T) {
  const [error, setError] = useState('');
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...initial, ...JSON.parse(saved) } : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError('');
    } catch {
      setError('브라우저에 저장하지 못했습니다. 백업을 내려받아 변경 내용을 보관해 주세요.');
    }
  }, [key, value]);
  return [value, setValue, error] as const;
}
