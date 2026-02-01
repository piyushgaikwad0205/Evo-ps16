import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

const FloatingAIButton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link to="/ai" aria-label="Open AI Assistant">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full border border-white/10 bg-neutral-100/20 backdrop-blur px-4 py-3 shadow-3xl hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">Ask AI</span>
          </div>
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default FloatingAIButton;