import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

export type PostFrontmatter = {
  title: string
  date: string
  tag: string
  excerpt: string
}

export type Post = PostFrontmatter & {
  slug: string
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(BLOG_DIR)
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.mdx'))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, '')
        const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8')
        const { data, content } = matter(raw)
        return { slug, content, ...(data as PostFrontmatter) }
      }),
  )
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const raw = await fs.readFile(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8')
    const { data, content } = matter(raw)
    return { slug, content, ...(data as PostFrontmatter) }
  } catch {
    return null
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
