import { Route, Routes } from 'react-router-dom'

import { FaqPage } from '../pages/FaqPage'
import { FeaturesPage } from '../pages/FeaturesPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PricingPage } from '../pages/PricingPage'
import { RegisterPage } from '../pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/features" element={<FeaturesPage />} />

      <Route path="/pricing" element={<PricingPage />} />

      <Route path="/faq" element={<FaqPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}