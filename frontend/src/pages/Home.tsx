import { Edit, TrendingUp, Users, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroimage from "../assets/heroimage.png";
import trending1 from "../assets/trending1.png";
import trending2 from "../assets/trending2.jpeg";
import trending3 from "../assets/trending3.jpeg";
import TrendingCard from "../components/TrendingCard";
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
  const navigate = useNavigate();

  function handleSignin() {
    navigate("/signin");
  }

  function handleSignup() {
    navigate("/signup");
  }

  return (
    <div style={{ fontFamily: '"Signika", sans-serif' }}
    className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
          <div className="text-xl font-bold">BlogNest</div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Home
            </Link>
            <Link to="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Explore
            </Link>
            <Link to="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              About
            </Link>
            <Link to="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/signin" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <button
              type="button"
              onClick={handleSignup}
              className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <div style={{
                  fontFamily: '"Signika", sans-serif',
                  fontWeight: 800,
                }}
                  className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  <TypeAnimation
                    sequence={[
                      "Welcome to BlogNest", 2000,
                      "Where good ideas find you", 2000,
                      "Where creativity meets clarity", 2000,
                      "Where words carry weight", 2000,
                      "Where stories begin again", 2000,
                    ]}
                    wrapper="span"
                    speed={30}
                    deletionSpeed={20}
                    repeat={Infinity}
                    className="text-gray-900 inline-block transition-all duration-300"
                  />

                </div>
                <p className="max-w-[600px] text-slate-500 md:text-xl">
                  Read and share ideas from independent voices, world-class publications, and experts from around the globe. Anyone can publish on BlogNest.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleSignup}
                    className="cursor-pointer w-full sm:w-auto text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Start writing
                  </button>
                  <button
                    onClick={handleSignin}
                    className="cursor-pointer w-full sm:w-auto text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Explore articles
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <img src={heroimage} alt="hero" className="w-full max-w-md h-auto rounded-lg object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-3xl sm:text-5xl font-bold">Why BlogNest?</h2>
              <p className="text-slate-500 md:text-xl">
                A platform that puts your ideas first. No distractions, just pure content.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Edit, title: "Easy Publishing", desc: "Write your story, format it with our intuitive editor, and publish with a single click." },
                { Icon: Users, title: "Engaged Community", desc: "Connect with readers and writers who share your interests and passions." },
                { Icon: TrendingUp, title: "Grow Your Audience", desc: "Our recommendation system helps your content reach the right readers." },
              ].map(({ Icon, title, desc }, index) => (
                <div key={index} className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                  <div className="h-12 w-12 flex items-center justify-center bg-slate-100 rounded-lg">
                    <Icon className="h-6 w-6 text-slate-800" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-b">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-2xl sm:text-5xl font-bold">Trending on BlogNest</h2>
              <p className="text-slate-500 md:text-xl">Explore top stories, expert insights, and trending topics.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: 1,
                  title: "How I Built a Successful Blog in 30 Days",
                  author: "John Doe",
                  readTime: "5 min read",
                  date: "May 26",
                  category: "Blogging",
                  image: trending1,
                },
                {
                  id: 2,
                  title: "The Future of AI: Opportunities & Risks",
                  author: "Sarah Lee",
                  readTime: "6 min read",
                  date: "May 28",
                  category: "Technology",
                  image: trending2,
                },
                {
                  id: 3,
                  title: "10 Essential Tips for Stock Market Beginners",
                  author: "Michael Smith",
                  readTime: "7 min read",
                  date: "May 25",
                  category: "Finance",
                  image: trending3,
                },
              ].map((article) => (
                <TrendingCard key={article.id} {...article} />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                type="button"
                className="cursor-pointer text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center gap-2"
              >
                See more articles
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-center text-4xl sm:text-left font-bold">Start your writing journey today</h2>
                <p className="text-center text-slate-500 md:text-xl">Join thousands of writers who’ve already found their voice.</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h3 className="text-xl font-bold">Subscribe to our newsletter</h3>
                <p className="text-sm text-slate-500">Get the best content delivered to your inbox.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button className="text-white bg-gray-800 hover:bg-gray-900 rounded-lg text-sm px-5 py-2.5">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-900 text-white text-center">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to start writing?</h2>
            <p className="max-w-xl mx-auto text-slate-300 md:text-xl">
              Join our community of writers and readers. Share your perspective with the world.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row justify-center">
              <button
                onClick={handleSignup}
                className="bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-sm px-5 py-2.5"
              >
                Get started
              </button>
              <button
                className="bg-transparent border border-white hover:bg-slate-800 text-white rounded-lg text-sm px-5 py-2.5"
              >
                Learn more
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-6">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row justify-between items-center">
          <div className="text-lg font-bold">BlogNest</div>
          <nav className="flex gap-4 text-xs text-slate-500">
            <Link to="#" className="hover:underline">Terms of Service</Link>
            <Link to="#" className="hover:underline">Privacy</Link>
            <Link to="#" className="hover:underline">Cookies</Link>
          </nav>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} BlogNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

