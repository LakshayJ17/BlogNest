import {
  Users,
  ChevronRight,
  PenTool,
  BookOpen,
  Globe,
  Sparkles,
  Share2,
  Star,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBlogs } from "../hooks";
import { BlogCard } from "../components/BlogCard";
import { useAuthStore } from "../store/auth";
import { useEffect } from "react";
import { Heading } from "../components/heading";
import { Subheading } from "../components/subheading";
import { motion } from "motion/react";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === "user") {
        navigate("/blogs");
      } else {
        navigate("/admin-dashboard");
      }
    }
  }, [user, navigate]);

  const { blogs, loading } = useBlogs();
  const trendingBlogs = blogs?.slice(0, 3) || [];

  function handleSignup() {
    navigate("/signup");
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex flex-col items-center justify-center min-h-screen w-full bg-[f8fafc] relative"
        id="hero-section"
      >
        <div
          className="absolute inset-0 z-0 h-150"
          style={{
            backgroundImage: `
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
      `,
            backgroundSize: "20px 30px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          }}
        />
        <header className="fixed top-0 z-50 w-full">
          <div className="container mx-auto max-w-6xl flex h-18 items-center justify-between px-4">
            <Link to="/" className="text-xl font-bold cursor-pointer">
              BlogNest
            </Link>
            <nav className="hidden md:flex items-center gap-6 relative">
              <a
                href="#hero-section"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Home
              </a>
              <a
                href="#about-section"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                About
              </a>
              <a
                href="#trending-section"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Explore
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                to="/signin"
                className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900"
              >
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

        <section className="w-full relative mt-24 sm:mt-20 lg:mt-5 text-center md:text-left" id="hero-section">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Heading>Welcome to BlogNest</Heading>
                  <Subheading>
                    Your ideas, your stories, your nest. Share your thoughts,
                    discover new perspectives, and connect with a vibrant
                    community of writers and readers.
                  </Subheading>
                </div>
                <div className="flex flex-col justify-center lg:justify-start gap-2 sm:flex-row">
                  <button
                    onClick={handleSignup}
                    className="cursor-pointer w-full sm:w-auto text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg shadow text-sm px-6 py-3"
                  >
                    Start writing
                  </button>
                  <button
                    onClick={() => navigate("/blogs")}
                    className="cursor-pointer w-full sm:w-auto text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3"
                  >
                    Explore articles
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <img
                  src="/heroimage.png"
                  alt="hero-image"
                  className="max-w-full h-auto w-full sm:w-96 md:w-full"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1 relative">
        {/* About Section */}
        <section className="w-full py-20 bg-white" id="about-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <Heading>Why BlogNest?</Heading>
              <Subheading>
                A platform that combines creativity, community, and technology
                to empower writers.
              </Subheading>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-4 gap-6 auto-rows-[200px]">
              {[
                {
                  key: "write",
                  className:
                    "sm:col-span-2 sm:row-span-2 bg-blue-800 text-white rounded-2xl p-8 flex flex-col justify-between shadow-lg",
                  title: "Write Without Limits",
                  desc: "A distraction-free editor designed for writers. Focus on your words, we’ll handle the rest.",
                  Icon: PenTool,
                },
                {
                  key: "community",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "Community First",
                  desc: "Engage, comment, and collaborate with passionate writers.",
                  Icon: Users,
                },
                {
                  key: "spotlight",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "Writer’s Spotlight",
                  desc: "Highlighting top writers and their inspiring journeys.",
                  Icon: Star,
                },
                {
                  key: "summary",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "AI Content Summary",
                  desc: "Get instant summaries of long articles, making reading faster and easier.",
                  Icon: FileText,
                },
                {
                  key: "discover",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "Discover Stories",
                  desc: "Explore ideas and experiences shared by writers worldwide.",
                  Icon: BookOpen,
                },
                {
                  key: "global",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "Global Reach",
                  desc: "Your blogs instantly reach readers across the globe.",
                  Icon: Globe,
                },
                {
                  key: "sharing",
                  className:
                    "bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "Seamless Sharing",
                  desc: "Publish and share your content across platforms effortlessly.",
                  Icon: Share2,
                },
                {
                  key: "ai-tools",
                  className:
                    "sm:col-span-2 bg-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow",
                  title: "AI-Powered Tools",
                  desc: "Boost your creativity with AI-assisted brainstorming & editing.",
                  Icon: Sparkles,
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.key}
                  className={item.className}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                >
                  <item.Icon
                    className={`w-8 h-8 mb-3 ${item.className.includes("bg-blue-800") ? "text-white" : "text-black"}`}
                  />
                  <h4 className={`text-lg font-semibold ${item.className.includes("bg-blue-800") ? "text-white" : ""}`}>{item.title}</h4>
                  <p className={`text-sm ${item.className.includes("bg-blue-800") ? "text-white" : "text-black"}`}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="w-full min-h-screen mx-auto flex justify-center items-center relative"
          id="trending-section"
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
              backgroundSize: "25px 25px",
            }}
          />
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center space-y-2 mb-12">
              <Heading>Trending on BlogNest</Heading>
              <Subheading>
                Explore top stories, expert insights, and trending topics.
              </Subheading>
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <Subheading>Loading...</Subheading>
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, idx) => (
                  <motion.div
                    initial={{
                      opacity: 0,
                      filter: "blur(10px)",
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.1,
                      ease: "easeInOut",
                    }}
                    key={blog.title}
                    className="group relative"
                  >
                    {" "}
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
                      currentUserRole={user?.role ?? ""}
                    />
                  </motion.div>
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
                onClick={() => navigate("/blogs")}
                className="cursor-pointer text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center gap-2 shadow"
              >
                See more articles
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-slate-50"
          id="newsletter-section"
        >
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <Heading>Start your writing journey today</Heading>
                <Subheading>
                  Join thousands of writers who’ve already found their voice.
                </Subheading>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h3 className="text-xl font-bold">
                  Subscribe to our newsletter
                </h3>
                <p className="text-sm text-slate-500">
                  Get the best content delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
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
                  By subscribing, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-blue-950 text-white text-center"
          id="cta-section"
        >
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-4">
            <Heading>Ready to start writing?</Heading>
            <Subheading>
              Join our community of writers and readers. Share your perspective
              with the world.
            </Subheading>
            <div className="flex flex-col gap-2 sm:flex-row justify-center">
              <button
                onClick={handleSignup}
                className="cursor-pointer bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-sm px-5 py-2.5"
              >
                Get started
              </button>
              <button className="cursor-pointer bg-transparent border border-white hover:bg-blue-900 text-white rounded-lg text-sm px-5 py-2.5">
                Learn more
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-white py-6">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row justify-between items-center">
          <div className="text-lg font-bold">BlogNest</div>
          <nav className="flex gap-4 text-xs text-slate-500">
            <Link to="#" className="hover:underline">
              Terms of Service
            </Link>
            <Link to="#" className="hover:underline">
              Privacy
            </Link>
            <Link to="#" className="hover:underline">
              Cookies
            </Link>
          </nav>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} BlogNest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
