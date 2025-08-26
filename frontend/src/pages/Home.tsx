import { Edit, TrendingUp, Users, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroimage from "../assets/heroimage.png";
import { TypeAnimation } from 'react-type-animation';
import { useBlogs } from "../hooks";
import { BlogCard } from "../components/BlogCard";

export default function Home() {
  const navigate = useNavigate();

  const { blogs, loading } = useBlogs();
  const trendingBlogs = blogs?.slice(0, 3) || [];

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
              className="cursor-pointer text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
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
                  className="px-2 text-center text-4xl font-bold tracking-tight  sm:text-5xl md:text-left xl:text-6xl">
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
                <p className="text-justify max-w-[700px] text-slate-500 sm:text-xl">
                  Read and share ideas from independent voices, world-class publications, and experts from around the globe. Anyone can publish on BlogNest.
                </p>
                <div className="flex flex-col justify-center lg:justify-start gap-2 sm:flex-row">
                  <button
                    onClick={handleSignup}
                    className="cursor-pointer w-full sm:w-auto text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Start writing
                  </button>
                  <button
                    onClick={() => navigate('/blogs')}
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
              {loading ? (
                <div className="col-span-full text-center text-gray-400">Loading...</div>
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog) => (
                  <BlogCard
                    type="publish"
                    key={blog.id}
                    id={blog.id}
                    author={blog.author}
                    authorId={blog.authorId}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={blog.date}
                    _count={blog._count}
                    labels={blog.labels}
                    status={blog.status}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400">
                  No trending blogs found.
                </div>
              )}
            </div>

            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => navigate('/blogs')}
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
                <h2 className="text-center text-4xl md:text-left font-bold">Start your writing journey today</h2>
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-950 text-white text-center">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to start writing?</h2>
            <p className="max-w-xl mx-auto text-slate-300 md:text-xl">
              Join our community of writers and readers. Share your perspective with the world.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row justify-center">
              <button
                onClick={handleSignup}
                className="cursor-pointer bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-sm px-5 py-2.5"
              >
                Get started
              </button>
              <button
                className="cursor-pointer bg-transparent border border-white hover:bg-blue-900 text-white rounded-lg text-sm px-5 py-2.5"
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

