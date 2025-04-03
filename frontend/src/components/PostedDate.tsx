export const PostedDate = ({ date }: { date: string | Date }) => {
    // Parse the date and format it
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return <span>{formattedDate}</span>;
};