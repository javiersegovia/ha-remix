import { useNavigate } from '@remix-run/react'
import { motion } from 'framer-motion'

const HomeCreateChallengeRoute = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-20"
    >
      <div
        onClick={() => navigate('/home')}
        className="fixed bottom-0 left-0 right-0 top-0 min-h-screen w-full bg-white/80 backdrop-blur-sm"
      />
    </motion.div>
  )
}

export default HomeCreateChallengeRoute
