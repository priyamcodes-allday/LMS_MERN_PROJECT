import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { LoginModal, SignUpModal } from "./components/AuthModals";
import Sponsors from "./components/Sponsors";
import Journey from "./components/Journey";
import Courses from "./components/Courses";
import Experience from "./components/Experience";
import Testimonials from "./components/Testimonials";
import Articles from "./components/Articles";


function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <header className="bg-[#0c3c2e] relative">
          <Navbar />
          <Hero />
        </header>
        <Sponsors />
        <main className="flex-grow">
          <Courses />
          <Journey />
          <Experience />
          <Testimonials />
          <Articles/>
        </main>

        <LoginModal />
        <SignUpModal />
      </div>
    </>
  );
}

export default App;
