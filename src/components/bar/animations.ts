export const sidebarVariants = {
    expanded: {
      width: "240px",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
      },
    },
    collapsed: {
      width: "70px",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
      },
    },
  }
  
  export const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: 0.1,
      },
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transitionEnd: {
        display: "none",
      },
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
      },
    },
  }
  
  export const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  }
  
  