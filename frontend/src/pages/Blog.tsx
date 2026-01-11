import { useParams } from "react-router-dom"
import { useBlog } from "../hooks"
import { FullBlog } from "../components/FullBlog"
import { Spinner } from "../components/Spinner"
import { Appbar } from "../components/Appbar"
import { Helmet } from "react-helmet-async"

export const Blog = () => {
    const { id } = useParams()
    const { loading, blog } = useBlog({
        id: id || ""
    })

    if (loading || !blog) {
        return <div>
            <Appbar navigateTo="/" label="BlogNest" />
            <div className="h-screen flex flex-col justify-center">
                <div className="flex justify-center">
                    <Spinner size="big" />
                </div>
            </div>
        </div>
    }

    // Extract plain text from HTML content for description
    const plainText = blog.content.replace(/<[^>]+>/g, "").trim();
    const description = plainText.slice(0, 160) || "Read this blog post on BlogNest.";
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : undefined;
    const blogUrl = `https://blognest.bylakshayjain.online/blog/${blog.id}`;
    
    return (
        <>
            <Helmet>
                <title>{`${blog.title} | BlogNest`}</title>
                <meta name="description" content={description} />
                <meta name="author" content={blog.author.name} />
                <meta name="keywords" content={`${blog.labels?.join(", ")}, blog, article, BlogNest`} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={blogUrl} />
                <meta property="article:author" content={blog.author.name} />
                <meta property="article:published_time" content={blog.date} />
                {blog.labels?.map((label) => (
                    <meta key={label} property="article:tag" content={label} />
                ))}
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blog.title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:creator" content={blog.author.name} />
                
                <link rel="canonical" href={blogUrl} />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: blog.title,
                        description,
                        datePublished: blog.date,
                        dateModified: blog.date,
                        author: { "@type": "Person", name: blog.author.name },
                        publisher: { "@type": "Organization", name: "BlogNest" },
                        mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl },
                        url: blogUrl,
                        articleSection: blog.labels?.[0],
                        keywords: blog.labels,
                        wordCount,
                        isAccessibleForFree: true,
                        interactionStatistic: {
                            "@type": "InteractionCounter",
                            interactionType: { "@type": "LikeAction" },
                            userInteractionCount: blog._count?.likes ?? 0,
                        },
                    })}
                </script>
            </Helmet>

            <div>
                <FullBlog blog={blog} />
            </div>
        </>
    )
}