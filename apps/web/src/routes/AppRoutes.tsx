import {
  Route,
  Routes,
} from 'react-router-dom'

import {
  GuestRoute,
} from '../components/auth/GuestRoute'

import {
  ProtectedRoute,
} from '../components/auth/ProtectedRoute'

import {
  PublicLayout,
} from '../components/layout/PublicLayout'

import {
  DashboardPage,
} from '../pages/DashboardPage'

import {
  FaqPage,
} from '../pages/FaqPage'

import {
  FeaturesPage,
} from '../pages/FeaturesPage'

import {
  HomePage,
} from '../pages/HomePage'

import {
  LoginPage,
} from '../pages/LoginPage'

import {
  NotFoundPage,
} from '../pages/NotFoundPage'

import {
  PricingPage,
} from '../pages/PricingPage'

import {
  RegisterPage,
} from '../pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicLayout />
        }
      >
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/features"
          element={
            <FeaturesPage />
          }
        />

        <Route
          path="/pricing"
          element={
            <PricingPage />
          }
        />

        <Route
          path="/faq"
          element={
            <FaqPage />
          }
        />
      </Route>

      <Route
        element={
          <GuestRoute />
        }
      >
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />
    </Routes>
  )
}