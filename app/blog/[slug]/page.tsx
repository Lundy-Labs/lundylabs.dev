import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/blog'
import Footer from '@/components/footer'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not found' }
  return {
    title: `${post.title} — Lundy Labs`,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <article className="ll-article">
        <header className="ll-article__head">
          <div className="ll-article__meta">
            <span className="ll-article__tag">{post.tag}</span>
            <span className="ll-article__date">{formatDate(post.date)}</span>
          </div>
          <h1 className="ll-article__title">{post.title}</h1>
          <p className="ll-article__excerpt">{post.excerpt}</p>
        </header>

        <div className="ll-prose ll-prose--article">
          <MDXRemote
            source={post.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        <div className="ll-article__back">
          <Link href="/blog" className="ll-article__back-link">
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M15 6H2M7 1L2 6l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All posts
          </Link>
        </div>
      </article>

      <Footer />
    </>
  )
}
