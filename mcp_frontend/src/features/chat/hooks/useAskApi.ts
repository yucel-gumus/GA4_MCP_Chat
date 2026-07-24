import { useMutation } from '@tanstack/react-query';
import { askQuestion } from '../../../api/ask';
import type { AskResponse } from '../../../api/ask';

export const useAskApi = () => {
  return useMutation<AskResponse, Error, string>({
    mutationFn: askQuestion,
    onError: (error) => {
      console.error('Error querying GA4 API:', error);
    }
  });
};