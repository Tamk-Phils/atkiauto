import React from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('admin_auth') === 'true'

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
