import "./floatingShape.scss";
import { motion } from "framer-motion";

function FloatingShape() {
  const ballAnimation1 = {
    initial: { x: 0, y: 0 },
    animate: {
      x: [0, 200, -200, 0], // Horizontal movement
      y: [0, -150, 150, 0], // Vertical movement
      opacity: [0.6, 1, 0.6], // Pulsing effect
      scale: [1, 1.5, 1, 1.5], // Scaling effect
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const ballAnimation2 = {
    initial: { x: 0, y: 0 },
    animate: {
      x: [0, -150, 150, 0], // Opposite horizontal movement
      y: [0, 100, -100, 0], // Opposite vertical movement
      opacity: [0.5, 0.9, 0.5], // Pulsing effect
      scale: [1, 2, 1], // Scaling effect
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="floating-background">
      <motion.div
        className="ball ball1"
        variants={ballAnimation1}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="ball ball2"
        variants={ballAnimation2}
        initial="initial"
        animate="animate"
      />
    </div>
  );
}

export default FloatingShape;
