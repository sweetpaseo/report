import styles from "./login.module.css";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";
  return (
    <main className={styles.page}>
      <aside className={styles.visual}>
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />
        <div className={styles.card}>
          <span className={styles.pill}>BERTUMBUH</span>
          <strong className={styles.cardTitle}>Website semakin mudah ditemukan.</strong>
          <p className={styles.cardText}>Tayangan Google, sesi, dan interaksi penting meningkat dibanding periode sebelumnya.</p>
        </div>
      </aside>
      <section className={styles.panel}>
        <div className={styles.brand}>W</div>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>WEBSITE HEALTH REPORT</p>
          <h1 className={styles.title}>Masuk ke dashboard</h1>
          <p className={styles.subtitle}>Kelola website, unggah report, dan pahami kondisi performa dalam bahasa yang mudah dipahami.</p>
        </div>
        <LoginForm nextPath={nextPath} />
        <p className={styles.footnote}>Akses untuk administrator dan client. Sesi dienkripsi dan kedaluwarsa otomatis.</p>
      </section>
    </main>
  );
}
