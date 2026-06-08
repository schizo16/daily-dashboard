import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Background3D } from '@/components/shared/Background3D'

export function Shell() {
  return (
    <div className="flex min-h-screen relative">
      <Background3D />
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col relative z-10">
        <TopBar />
        <main className="mt-12 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
