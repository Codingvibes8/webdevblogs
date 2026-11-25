import { Archive } from "@/components/archive";
import { getPublishedPosts, summarise } from "@/lib/posts";

export default async function Home() {
  const posts = await getPublishedPosts();
  const totalWords = posts.reduce((n, p) => n + p.words, 0);
  return (
    <>
      <div className="tagline">
        <p>
          A working journal by Dayo, a web developer writing slowly about CSS, the browser, building with language
          models, and the craft of software that holds up.
        </p>
        <span className="mono">
          Est. 2019 · {posts.length} essays · {totalWords.toLocaleString("en-GB")} words
        </span>
      </div>
      <Archive posts={posts.map(summarise)} />
    </>
  );
}
