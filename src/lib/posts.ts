// Single source of truth for the Writing section: hand-maintained off-site
// posts merged with inline Substack posts, newest first.
import { manualPosts, type Post } from '../data/posts';
import { getSubstackPosts } from './substack';

export type { Post };

export async function getPosts(): Promise<Post[]> {
  const substack = await getSubstackPosts();
  return [...manualPosts, ...substack].sort((a, b) => b.iso.localeCompare(a.iso));
}
