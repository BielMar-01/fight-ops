import {
  Route,
  Routes,
} from 'react-router-dom'

import {
  GuestRoute,
} from '../components/auth/GuestRoute'

import {
  GymRequired,
} from '../components/auth/GymRequired'

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
  GymProvider,
} from '../contexts/GymContext'

import {
  AuditPage,
} from '../pages/AuditPage'

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
  MembersPage,
} from '../pages/MembersPage'

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
  StudentsPage,
} from '../pages/StudentsPage'

import {
  ProfessorsPage,
} from '../pages/ProfessorsPage'

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
            <GymProvider>
              <GymRequired>
                <AppLayout />
              </GymRequired>
            </GymProvider>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/members"
            element={
              <MembersPage />
            }
          />

          <Route
            path="/students"
            element={
              <StudentsPage />
            }
          />

          <Route
            path="/professors"
            element={
              <ProfessorsPage />
            }
          />

          <Route
            path="/professors"
            element={
              <AuditPage />
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