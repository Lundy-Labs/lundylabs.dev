import type { Metadata } from 'next'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Contact — Lundy Labs',
  description: 'Get in touch with Lundy Labs.',
}

const EMAIL = 'nic@lundylabs.dev'

export default function ContactPage() {
  return (
    <>
      <section className="ll-page ll-page--top ll-page--narrow">
        <header className="ll-page__head">
          <p className="ll-page__eyebrow">Contact</p>
          <h1 className="ll-page__title">Let's talk.</h1>
          <p className="ll-page__lede">
            Tool feedback, partnership, press — all welcome. We read everything.
          </p>
        </header>

        <div className="ll-contact-card">
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Email</span>
            <a href={`mailto:${EMAIL}`} className="ll-contact-row__value">{EMAIL}</a>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Location</span>
            <span className="ll-contact-row__value">Atlanta, Georgia</span>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Hours</span>
            <span className="ll-contact-row__value">Mon — Fri · 9am to 6pm ET</span>
          </div>
        </div>

        <form
          className="ll-form"
          action={`mailto:${EMAIL}`}
          method="post"
          encType="text/plain"
        >
          <div className="ll-form__row">
            <div className="ll-form__field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div className="ll-form__field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="ll-form__field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text" />
          </div>
          <div className="ll-form__field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={6} required />
          </div>
          <button type="submit" className="ll-form__submit">
            Send message
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M1 6h13M9 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </section>

      <Footer />
    </>
  )
}
