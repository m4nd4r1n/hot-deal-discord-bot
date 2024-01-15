import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { WebhookForm } from '@/components/webhook-form';
import { DISCORD_WEBHOOK_GUIDE_URL } from '@/lib/constants';

export default async function Home() {
  return (
    <main className='space-y-8'>
      <h1 className='bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 bg-clip-text p-4 text-center text-2xl font-bold text-transparent sm:text-3xl'>
        Quasarzone Hot Deal Discord Bot
      </h1>
      <hr />
      <div className='space-y-4'>
        <p>
          Quasarzone Hot Deal Discord Bot은 퀘이사존 핫딜 게시판에 올라오는 정보들을 디스코드 서버의
          채널로 자동 전송하는 디스코드 알림 봇 입니다.
        </p>
        <p>
          등록 이후 알림 받을 카테고리를 변경하려면 웹훅 URL을 다시 입력하고 변경할 카테고리를
          선택한 후, 등록하기를 클릭하여 변경할 수 있습니다.
        </p>
        <p>
          더 이상 알림을 받아보고 싶지 않을 때는 생성한 웹훅을 디스코드에서 삭제하여 알림을 받아보지
          않을 수 있습니다.
        </p>
        <Button variant='link' className='p-0' asChild>
          <Link href={DISCORD_WEBHOOK_GUIDE_URL} target='_blank' rel='noreferrer noopener'>
            웹훅 생성 방법 &rarr;
          </Link>
        </Button>
      </div>
      <hr />
      <WebhookForm />
    </main>
  );
}
