import { Outlet } from 'react-router-dom'
import Navbar from './Navbar/Navbar.jsx'
import Footer from './Footer/Footer.jsx'
import styles from './RootLayout.module.css'

export default function RootLayout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

