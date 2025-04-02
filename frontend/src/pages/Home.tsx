import { Edit, TrendingUp, Users, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"


export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
          <div className="text-xl font-bold">Blogvault</div>

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
            <Link to="/signin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Where good ideas find you
                  </h1>
                  <p className="max-w-[600px] text-slate-500 md:text-xl">
                    Read and share ideas from independent voices, world-class publications, and experts from around the
                    globe. Anyone can publish on Blogvault.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <button
                    type="button"
                    className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Start writing
                  </button>
                  <button
                    type="button"
                    className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Explore articles
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-[350px] w-full max-w-[550px] rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  Hero Image Placeholder
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Blogvault?</h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A platform that puts your ideas first. No distractions, just pure content.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <Edit className="h-6 w-6 text-slate-800" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy Publishing</h3>
                  <p className="text-sm text-slate-500">
                    Write your story, format it with our intuitive editor, and publish with a single click.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <Users className="h-6 w-6 text-slate-800" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Engaged Community</h3>
                  <p className="text-sm text-slate-500">
                    Connect with readers and writers who share your interests and passions.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <TrendingUp className="h-6 w-6 text-slate-800" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Grow Your Audience</h3>
                  <p className="text-sm text-slate-500">
                    Our recommendation system helps your content reach the right readers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-b">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trending on Blogvault</h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover stories, thinking, and expertise from writers on any topic.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group flex flex-col space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full overflow-hidden h-10 w-10 border bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                      A{i}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:underline">
                        How I Built a Successful Blog in 30 Days
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        The journey of creating content that resonates with readers and builds a loyal following.
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>John Doe</span>
                        <span>•</span>
                        <span>5 min read</span>
                        <span>•</span>
                        <span>May 26</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/blogs")}
                className="cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center gap-2"
              >
                See more articles
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Start your writing journey today</h2>
                  <p className="max-w-[600px] text-slate-500 md:text-xl/relaxed">
                    Join thousands of writers who have already found their voice on Blogvault. It's free to start.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Learn More
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="space-y-4 rounded-lg border bg-white p-8 shadow-sm w-full max-w-md">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Subscribe to our newsletter</h3>
                    <p className="text-sm text-slate-500">Get the best content delivered directly to your inbox.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                      >
                        Subscribe
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      By subscribing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-900 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to start writing?</h2>
                <p className="max-w-[600px] text-slate-300 md:text-xl/relaxed">
                  Join our community of writers and readers. Share your perspective with the world.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="cursor-pointer bg-white text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Get started
                </button>
                <button
                  type="button"
                  className="cursor-pointer bg-transparent text-white border border-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-700 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-6">
        <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <div className="flex items-center">
            <span className="text-lg font-bold">BlogVault</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link to="#" className="cursor-pointer text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link to="#" className="cursor-pointer text-xs hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link to="#" className="cursor-pointer text-xs hover:underline underline-offset-4">
              Cookies
            </Link>
          </nav>
          <div className="flex items-center">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} BlogVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

