import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="ll-footer">
      <div className="ll-footer__top">
        <div className="ll-footer__brand">
          <h3 className="ll-footer__wordmark">Lundy Labs</h3>
          <p className="ll-footer__tag">Dream it, build it, live it.</p>
          <a href="mailto:hello@lundylabs.dev" className="ll-footer__email">hello@lundylabs.dev</a>
        </div>

        <div className="ll-footer__cols">
          <div className="ll-footer__col">
            <p className="ll-footer__heading">Explore</p>
            <Link href="/" className="ll-footer__link">Home</Link>
            {/* <Link href="/about" className="ll-footer__link">About</Link> */}
            <Link href="/projects" className="ll-footer__link">Projects</Link>
            {/* <Link href="/blog" className="ll-footer__link">Blog</Link> */}
          </div>
          <div className="ll-footer__col">
            <p className="ll-footer__heading">Tools</p>
            <a href="https://utilitypilot.co" className="ll-footer__link">Utility Pilot</a>
          </div>
          <div className="ll-footer__col">
            <p className="ll-footer__heading">Company</p>
            <Link href="/contact" className="ll-footer__link">Contact</Link>
            <a href="mailto:hello@lundylabs.dev" className="ll-footer__link">Email</a>
          </div>
        </div>
      </div>

      <div className="ll-footer__bigmark" aria-hidden="true">Lundy Labs</div>

      <div className="ll-footer__bar">
        <p>© {new Date().getFullYear()} Lundy Labs LLC</p>
        <p>Built in Georgia</p>
      </div>
    </footer>
  )
}
