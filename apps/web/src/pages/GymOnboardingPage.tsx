import {
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  useGym,
} from '../contexts/GymContext'

import {
  createGym,
} from '../services/gym.service'

interface GymFormState {
  name: string
  description: string
  phone: string
  email: string
}

const initialFormState:
  GymFormState = {
    name: '',
    description: '',
    phone: '',
    email: '',
  }

export function GymOnboardingPage() {
  const {
    refreshGyms,
  } = useGym()

  const [
    form,
    setForm,
  ] =
    useState<GymFormState>(
      initialFormState,
    )

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  function updateField(
    field: keyof GymFormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const name =
      form.name.trim()

    if (name.length < 3) {
      setError(
        'Informe um nome com pelo menos 3 caracteres.',
      )

      return
    }

    setIsSubmitting(
      true,
    )

    setError(
      null,
    )

    try {
      await createGym({
        name,

        description:
          form.description.trim() ||
          undefined,

        phone:
          form.phone.trim() ||
          undefined,

        email:
          form.email.trim() ||
          undefined,
      })

      await refreshGyms()
    } catch {
      setError(
        'Não foi possível criar a academia. Verifique os dados e tente novamente.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  return (
    <main
      className="gym-onboarding-page"
      data-testid="gym-onboarding-page"
    >
      <div className="gym-onboarding-container">
        <section className="gym-onboarding-intro">
          <span className="gym-onboarding-badge">
            Primeiros passos
          </span>

          <h1>
            Configure sua academia
          </h1>

          <p>
            Crie sua primeira academia para começar a utilizar o FightOps.
          </p>

          <div className="gym-onboarding-benefits">
            <div>
              <strong>
                Alunos
              </strong>

              <span>
                Centralize seus alunos e vínculos.
              </span>
            </div>

            <div>
              <strong>
                Professores
              </strong>

              <span>
                Organize sua equipe e permissões.
              </span>
            </div>

            <div>
              <strong>
                Operação
              </strong>

              <span>
                Gerencie sua academia em um único lugar.
              </span>
            </div>
          </div>
        </section>

        <section className="gym-onboarding-card">
          <div className="gym-onboarding-card-header">
            <span>
              FightOps
            </span>

            <h2>
              Dados da academia
            </h2>

            <p>
              Você poderá alterar essas informações posteriormente.
            </p>
          </div>

          <form
            className="gym-onboarding-form"
            data-testid="gym-onboarding-form"
            onSubmit={(event) => {
              void handleSubmit(
                event,
              )
            }}
          >
            <label>
              Nome da academia
              <span aria-hidden="true">
                *
              </span>

              <input
                type="text"
                value={form.name}
                placeholder="Ex.: Fight Club São Paulo"
                autoComplete="organization"
                maxLength={150}
                required
                disabled={isSubmitting}
                data-testid="gym-name-input"
                onChange={(event) => {
                  updateField(
                    'name',
                    event.target.value,
                  )
                }}
              />
            </label>

            <label>
              Descrição

              <textarea
                value={
                  form.description
                }
                placeholder="Conte um pouco sobre sua academia"
                maxLength={2000}
                rows={4}
                disabled={isSubmitting}
                data-testid="gym-description-input"
                onChange={(event) => {
                  updateField(
                    'description',
                    event.target.value,
                  )
                }}
              />
            </label>

            <div className="gym-onboarding-form-grid">
              <label>
                Telefone

                <input
                  type="tel"
                  value={form.phone}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  maxLength={30}
                  disabled={isSubmitting}
                  data-testid="gym-phone-input"
                  onChange={(event) => {
                    updateField(
                      'phone',
                      event.target.value,
                    )
                  }}
                />
              </label>

              <label>
                E-mail

                <input
                  type="email"
                  value={form.email}
                  placeholder="contato@academia.com"
                  autoComplete="email"
                  maxLength={255}
                  disabled={isSubmitting}
                  data-testid="gym-email-input"
                  onChange={(event) => {
                    updateField(
                      'email',
                      event.target.value,
                    )
                  }}
                />
              </label>
            </div>

            {error ? (
              <div
                className="gym-onboarding-error"
                role="alert"
                data-testid="gym-onboarding-error"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="button button-primary gym-onboarding-submit"
              disabled={isSubmitting}
              data-testid="gym-create-button"
            >
              {isSubmitting
                ? 'Criando academia...'
                : 'Criar academia'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}