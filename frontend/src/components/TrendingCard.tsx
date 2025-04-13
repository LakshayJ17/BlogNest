import { FC } from "react"

interface TrendingCardProps {
  image: string
  title: string
  author: string
  readTime: string
  date: string
  category: string
}

const TrendingCard: FC<TrendingCardProps> = ({
  image,
  title,
  author,
  readTime,
  date,
  category,
}) => {
  return (
    <div className="group flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-5 space-y-3">
        <span className="text-xs font-medium text-gray-500">{category}</span>
        <h3 className="text-lg font-bold group-hover:text-blue-600">{title}</h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span>{author}</span> • <span>{readTime}</span> • <span>{date}</span>
        </div>
      </div>
    </div>
  )
}

export default TrendingCard
