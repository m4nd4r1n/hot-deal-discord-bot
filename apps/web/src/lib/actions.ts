'use server';

import * as z from 'zod';
import { prisma } from '@repo/database';

import { formSchema } from '@/lib/schema';

interface SaveWebhookResponse {
  success: boolean;
  message: string;
}

export const saveWebhook = async (
  values: z.infer<typeof formSchema>,
): Promise<SaveWebhookResponse> => {
  const { webhookUrl, categories: selectedCategory } = values;
  const isValidWebhook = await validateWebhook(webhookUrl);
  if (!isValidWebhook) return { success: false, message: '등록에 실패했습니다.' };
  const categories = makeCategoryStructure(selectedCategory);
  const isExist = await findWebhook(webhookUrl);

  if (isExist) {
    await updateWebhook(webhookUrl, categories);
    return { success: true, message: '업데이트 되었습니다.' };
  }
  await saveWebhookToDB(webhookUrl, categories);
  return { success: true, message: '등록에 성공했습니다.' };
};

const validateWebhook = async (webhookUrl: string) => {
  let res: Response;
  try {
    res = await fetch(webhookUrl, { cache: 'no-store' });
    const { url } = await res.json();
    if (webhookUrl !== url) return false;
  } catch (e) {
    console.error(e);
  }
  return res.ok;
};

const findWebhook = (webhookUrl: string) =>
  prisma.channel.findUnique({
    where: { webhook_url: webhookUrl },
  });

const makeCategoryStructure = (categories: string[]) =>
  categories.map((category) => ({ category }));

const updateWebhook = (webhookUrl: string, categories: { category: string }[]) =>
  prisma.channel.update({
    data: { subscribed_categories: { set: categories }, updated_at: new Date() },
    where: { webhook_url: webhookUrl },
  });

const saveWebhookToDB = (webhookUrl: string, categories: { category: string }[]) =>
  prisma.channel.create({
    data: { subscribed_categories: { connect: categories }, webhook_url: webhookUrl },
  });
