"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hover?: boolean;
  tap?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  duration = 0.3,
  hover = true,
  tap = true
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? {
        y: -5,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={tap ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
      className={cn("cursor-pointer", className)}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}

// Componente para animação de entrada em sequência
export function StaggeredCards({
  children,
  className,
  staggerDelay = 0.1
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
