import * as z from 'zod';

import { CATEGORIES } from '@/lib/constants';

export const webhookFormSchema = z.object({
  webhookUrl: z.string().regex(/^https:\/\/.+\/api\/webhooks\/([^/]+)\/([^/]+)\/?$/, {
    message: '유효한 URL을 입력해 주세요.',
  }),
  categories: z.array(z.enum(CATEGORIES)).refine((value) => value.some((category) => category), {
    message: '하나 이상의 항목을 선택해 주세요.',
  }),
});

export type WebhookForm = z.infer<typeof webhookFormSchema>;
