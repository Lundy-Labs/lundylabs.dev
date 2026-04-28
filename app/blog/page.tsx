import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts, formatDate } from '@/lib/blog'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Blog — Lundy Labs',
  description: 'Notes on energy, tools, and building in public.',
}

export default async function BlogIndex() {
  const posts = await getAllPosts()
  return (
    <>
      <section className="ll-page ll-page--top">
        <header className="ll-page__head">
          <p className="ll-page__eyebrow">Blog</p>
          <h1 className="ll-page__title">Notes from the lab.</h1>
          <p className="ll-page__lede">Writing on energy, tools, and building in public.</p>
        </header>

        <div className="ll-blog-list">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="ll-blog-row">
              <div className="ll-blog-row__meta">
                <span className="ll-blog-row__tag">{p.tag}</span>
                <span className="ll-blog-row__date">{formatDate(p.date)}</span>
              </div>
              <h2 className="ll-blog-row__title">{p.title}</h2>
              <p className="ll-blog-row__excerpt">{p.excerpt}</p>
              <span className="ll-blog-row__more">
                Read
                <svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M1 6h13M9 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
