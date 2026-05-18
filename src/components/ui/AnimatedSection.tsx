"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Smooth fade + slide-up wrapper for sections / cards on mount.
 * Subtle (0.96 → 1, 8px), respects prefers-reduced-motion via framer-motion.
 */
export function AnimatedSection({
  delay = 0,
  className,
  children,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list container — children animate one after another.
 * Use with AnimatedItem.
 */
export function AnimatedList({
  className,
  children,
  stagger = 0.05,
}: {
  className?: string;
  children: React.ReactNode;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
