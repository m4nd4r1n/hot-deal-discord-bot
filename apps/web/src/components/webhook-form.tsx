'use client';

import { useTransition } from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CATEGORIES, ITEMS } from '@/lib/constants';
import { handleWebhookSubmit } from '@/lib/save-webhook-action';
import { type WebhookForm as WebhookFormType, webhookFormSchema } from '@/lib/schema';

export const WebhookForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      webhookUrl: '',
      categories: [...CATEGORIES],
    },
  });

  const onSubmit = (values: WebhookFormType) => {
    startTransition(async () => {
      const { success, message } = await handleWebhookSubmit(values);
      const richToast = success ? toast.success : toast.error;
      richToast(message);
    });
  };

  const checkboxes = ITEMS.map(({ id, label }) => (
    <FormField
      key={id}
      control={form.control}
      name='categories'
      render={({ field }) => (
        <FormItem key={id} className='flex items-start space-x-3 space-y-0'>
          <FormControl>
            <Checkbox
              checked={field.value?.includes(id)}
              onCheckedChange={(checked) =>
                checked
                  ? field.onChange([...field.value, id])
                  : field.onChange(field.value?.filter((value) => value !== id))
              }
            />
          </FormControl>
          <FormLabel className='text-sm font-normal'>{label}</FormLabel>
        </FormItem>
      )}
    />
  ));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='webhookUrl'
          render={({ field }) => (
            <FormItem>
              <div className='mb-4'>
                <FormLabel className='text-base'>디스코드 웹훅 URL</FormLabel>
                <FormDescription>
                  알림 받을 채널의 디스코드 웹훅 URL을 입력해 주세요.
                </FormDescription>
              </div>
              <FormControl>
                <Input placeholder='https://discord.com/api/webhooks/...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='categories'
          render={({ field }) => (
            <FormItem className='space-y-4'>
              <div>
                <FormLabel className='text-base'>카테고리</FormLabel>
                <FormDescription>알림 받을 카테고리를 선택해 주세요.</FormDescription>
              </div>
              <div className='space-x-4'>
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={() => field.onChange([...CATEGORIES])}
                >
                  전체 선택
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={() => field.onChange([])}
                >
                  전체 해제
                </Button>
              </div>
              <div className='space-y-4 md:space-y-2.5'>{checkboxes}</div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          등록하기
        </Button>
      </form>
    </Form>
  );
};
