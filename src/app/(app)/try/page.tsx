import React from 'react'
import RightSidebar from '@/components/bar/right-side-bar';
import Chat from '@/components/chat/chat';

export default function page() {
  return (
    <div className='mt-48'>

        <Chat receiverId={''} />
        <RightSidebar />
    </div>
  )
}
