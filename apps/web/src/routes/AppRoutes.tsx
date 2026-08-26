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
  AppLayout,
} from '../components/layout/AppLayout'

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
  ForgotPasswordPage,
} from '../pages/ForgotPasswordPage'

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

import {
  ResetPasswordPage,
} from '../pages/ResetPasswordPage'

import {
  VerifyResetCodePage,
} from '../pages/VerifyResetCodePage'

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

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/verify-reset-code"
          element={
            <VerifyResetCodePage />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={
            <AppLayout />
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />
        </Route>
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