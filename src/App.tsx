import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Shell } from './components/layout/Shell'
import { PageTransition } from './components/shared/PageTransition'
import Home from './pages/Home'
import Radar from './pages/Radar'
import Movies from './pages/Movies'
import Games from './pages/Games'
import Watchlist from './pages/Watchlist'
import Media from './pages/Media'
import Tools from './pages/Tools'
import Settings from './pages/Settings'

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition>{children}</PageTransition>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="radar" element={<AnimatedPage><Radar /></AnimatedPage>} />
          <Route path="movies" element={<AnimatedPage><Movies /></AnimatedPage>} />
          <Route path="games" element={<AnimatedPage><Games /></AnimatedPage>} />
          <Route path="watchlist" element={<AnimatedPage><Watchlist /></AnimatedPage>} />
          <Route path="media" element={<AnimatedPage><Media /></AnimatedPage>} />
          <Route path="tools" element={<AnimatedPage><Tools /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
