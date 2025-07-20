'use client';
import usePosts from '@/hooks/usePosts';
import PostItem from './PostItem';

export default function PostList( {userId = null} ) {
  const posts = usePosts(userId);

  return (
    <div className="flex flex-col gap-6 p-4">
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada postingan.</p>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
