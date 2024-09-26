"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"


export default function EduConnectLoader() {
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    light: ["#3B82F6", "#10B981", "#6366F1", "#EC4899", "#F59E0B"],
    dark: ["#60A5FA", "#34D399", "#818CF8", "#F472B6", "#FBBF24"]
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  }

  const letterVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse" as const,
        duration: 1.5,
      } 
    },
  }

  const backgroundVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "100% 100%"],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 10,
      },
    },
  }

  return (
    <motion.div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-500 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}
      variants={{
        animate: {
          backgroundPosition: ["0% 0%", "100% 100%"],
          transition: {
            repeat: Infinity,
            repeatType: "reverse",
            duration: 10,
          },
        },
      }}
      animate="animate"
      style={{
        background: darkMode 
          ? 'radial-gradient(circle, #2C3E50 0%, #1A202C 100%)' 
          : 'radial-gradient(circle, #E0E7FF 0%, #EEF2FF 100%)',
      }}
    >
      <motion.div
        className={`text-center transition-opacity duration-500 ${
          loading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        aria-label="Loading EduConnect"
        role="progressbar"
        aria-valuetext={loading ? "Loading" : "Loaded"}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {"EduConnect".split('').map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              style={{
                display: 'inline-block',
                color: darkMode ? colors.dark[index % colors.dark.length] : colors.light[index % colors.light.length],
                textShadow: `0 0 10px ${darkMode ? colors.dark[index % colors.dark.length] : colors.light[index % colors.light.length]}`,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Connecting Minds, Empowering Education
        </p>
      </motion.div>
      
    </motion.div>
  )
}