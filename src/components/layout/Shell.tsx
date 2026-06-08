import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function Shell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col">
        <TopBar />
        <main className="mt-12 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
