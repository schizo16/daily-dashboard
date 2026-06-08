import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { PlayerBar } from './PlayerBar'
import { Background } from '@/components/shared/Background'

export function Shell() {
  return (
    <div className="flex min-h-screen relative">
      <Background />
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col relative z-10">
        <TopBar />
        <main className="mt-12 flex-1 p-6 pb-16">
          <Outlet />
        </main>
        <PlayerBar />
      </div>
    </div>
  )
}
