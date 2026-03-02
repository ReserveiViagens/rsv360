"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  delay?: number;
  duration?: number;
  hoverScale?: number;
  tapScale?: number;
  children: React.ReactNode;
}

export function AnimatedButton({
  children,
  className,
  delay = 0,
  duration = 0.2,
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: tapScale,
        transition: { duration: 0.1 }
      }}
    >
      <Button
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}

// Botão com efeito de loading
export function LoadingButton({
  children,
  loading = false,
  className,
  ...props
}: AnimatedButtonProps & { loading?: boolean }) {
  return (
    <AnimatedButton
      className={cn("relative", className)}
      disabled={loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </AnimatedButton>
  );
}
