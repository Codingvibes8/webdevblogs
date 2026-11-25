export function Colophon() {
  return (
    <footer className="colophon">
      <div>
        <h3>About this journal</h3>
        <p>
          The Render Tree is where I write things down after I have argued with them for a while. Most entries start as a
          bug, a code review comment, or a question a colleague asked that I couldn’t answer in one sentence. New issues
          arrive when they’re ready, not on a schedule.
        </p>
      </div>
      <div>
        <h3>Colophon</h3>
        <p className="mono">
          Display: Fraunces, variable
          <br />
          Text: Newsreader
          <br />
          Metadata: IBM Plex Mono
          <br />
          Next.js, TypeScript and Tailwind. Posts live in Postgres.
        </p>
      </div>
      <div>
        <h3>Reading</h3>
        <p className="mono">
          Press <b>/</b> to search the archive.
          <br />
          Press <b>Esc</b> to clear it.
          <br />
          Hover the masthead slowly.
        </p>
      </div>
    </footer>
  );
}
