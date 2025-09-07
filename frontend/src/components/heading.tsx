"use client"

import { cn } from "../lib/utils";
import React from "react";
import { motion } from 'motion/react'


export const Heading = ({
    as: Tag = "h1",
    children,
    className,
}: {
    as?: "h1" | "h2" | "h3" | "h4";
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
        initial={{
            opacity: 0,
            filter: "blur(10px)",
            y: 10
        }}
        whileInView={{
            opacity:1,
            filter : 'blur(0px)',
            y: 0,

        }}
        transition={{
            duration: 0.3,
            ease: "easeInOut",
        }}
        viewport={{once: true}}
        >
        <Tag
            className={cn(
                "text-black text-4xl font-semibold tracking-tighter drop-shadow-md md:text-6xl",
                className,
            )}
        >
            {children}
        </Tag>
        </motion.div>
    );
};