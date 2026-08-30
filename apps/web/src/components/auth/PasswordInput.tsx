import {
  useState,
} from 'react'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  placeholder: string
  autoComplete:
    | 'current-password'
    | 'new-password'
  inputTestId: string
  toggleTestId: string
  disabled?: boolean
  required?: boolean
  minLength?: number
  maxLength?: number
  onChange: (
    value: string,
  ) => void
}

export function PasswordInput({
  id,
  name,
  value,
  placeholder,
  autoComplete,
  inputTestId,
  toggleTestId,
  disabled = false,
  required = false,
  minLength,
  maxLength,
  onChange,
}: PasswordInputProps) {
  const [
    isPasswordVisible,
    setIsPasswordVisible,
  ] = useState(false)

  function handleToggleVisibility() {
    setIsPasswordVisible(
      (currentValue) =>
        !currentValue,
    )
  }

  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        name={name}
        type={
          isPasswordVisible
            ? 'text'
            : 'password'
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        data-testid={inputTestId}
        onChange={(event) => {
          onChange(
            event.target.value,
          )
        }}
      />

      <button
        type="button"
        className="password-visibility-button"
        aria-label={
          isPasswordVisible
            ? 'Ocultar senha'
            : 'Mostrar senha'
        }
        aria-pressed={
          isPasswordVisible
        }
        title={
          isPasswordVisible
            ? 'Ocultar senha'
            : 'Mostrar senha'
        }
        disabled={disabled}
        data-testid={toggleTestId}
        onClick={
          handleToggleVisibility
        }
      >
        {isPasswordVisible ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5 9 5a15.8 15.8 0 01-2.1 2.5M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx="12"
              cy="12"
              r="2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </button>
    </div>
  )
}