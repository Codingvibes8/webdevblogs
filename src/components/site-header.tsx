import { Masthead } from "@/components/masthead";
import { ThemeToggle } from "@/components/theme-toggle";
import { TodaysDate } from "@/components/todays-date";

export function SiteHeader() {
  return (
    <>
      <div className="strip" role="banner">
        <div className="left">
          <TodaysDate />
          <span>Notes on the web platform and building with AI</span>
        </div>
        <ThemeToggle />
      </div>
      <Masthead word="Render Tree" />
      <hr className="double-rule" />
    </>
  );
}
