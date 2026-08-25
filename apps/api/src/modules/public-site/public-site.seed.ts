import { prisma } from '../../database/prisma.js'

export async function seedPublicSite() {
  const existingSettings = await prisma.siteSetting.findFirst()

  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: {
        siteName: 'FightOps',

        primaryColor: '#E63737',
        secondaryColor: '#F04747',

        backgroundColor: '#080808',
        surfaceColor: '#141414',

        textColor: '#F6F6F6',
        mutedTextColor: '#9D9D9D',

        headingFont: 'Inter',
        bodyFont: 'Inter',

        supportEmail: null,
        instagramUrl: null,
        linkedinUrl: null,
      },
    })
  }

  const home = await prisma.publicPage.upsert({
    where: {
      slug: 'home',
    },

    update: {
      active: true,
    },

    create: {
      slug: 'home',
      name: 'Home',
      active: true,
    },
  })

  const features = await prisma.publicPage.upsert({
    where: {
      slug: 'features',
    },

    update: {
      active: true,
    },

    create: {
      slug: 'features',
      name: 'Funcionalidades',
      active: true,
    },
  })

  const pricing = await prisma.publicPage.upsert({
    where: {
      slug: 'pricing',
    },

    update: {
      active: true,
    },

    create: {
      slug: 'pricing',
      name: 'Planos',
      active: true,
    },
  })

  const faq = await prisma.publicPage.upsert({
    where: {
      slug: 'faq',
    },

    update: {
      active: true,
    },

    create: {
      slug: 'faq',
      name: 'FAQ',
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: home.id,
        key: 'hero',
      },
    },

    update: {},

    create: {
      pageId: home.id,
      key: 'hero',

      eyebrow: 'Gestão inteligente para o seu CT',

      title: 'Organize sua academia. Evolua sua operação.',

      content:
        'O FightOps centraliza alunos, professores, planos, turmas, pagamentos e toda a operação do seu centro de treinamento em uma única plataforma.',

      buttonText: 'Começar gratuitamente',
      buttonUrl: '/register',

      secondaryButtonText: 'Conhecer funcionalidades',
      secondaryButtonUrl: '/features',

      metadata: {
        benefits: [
          'Sem cartão de crédito',
          'Configuração rápida',
          'Gestão em qualquer lugar',
        ],
      },

      sortOrder: 10,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: home.id,
        key: 'features',
      },
    },

    update: {},

    create: {
      pageId: home.id,
      key: 'features',

      eyebrow: 'Tudo em um só lugar',

      title: 'Menos planilhas. Mais controle.',

      content:
        'Ferramentas pensadas para simplificar a rotina de quem administra uma academia ou centro de treinamento.',

      metadata: {
        items: [
          {
            key: 'students',
            title: 'Gestão de alunos',
            description:
              'Cadastre alunos, acompanhe status, histórico, planos e informações importantes.',
          },
          {
            key: 'classes',
            title: 'Turmas e professores',
            description:
              'Organize horários, professores, capacidade das turmas e presença dos alunos.',
          },
          {
            key: 'finance',
            title: 'Financeiro',
            description:
              'Acompanhe mensalidades, pagamentos, inadimplência e indicadores financeiros.',
          },
          {
            key: 'access',
            title: 'Gestão de acessos',
            description:
              'Controle as permissões de donos, administradores, recepcionistas, professores e alunos.',
          },
          {
            key: 'multi-gym',
            title: 'Multiacademia',
            description:
              'Gerencie diferentes unidades dentro da mesma estrutura de forma organizada e segura.',
          },
          {
            key: 'indicators',
            title: 'Indicadores',
            description:
              'Tenha uma visão rápida da operação com informações úteis para decisões do dia a dia.',
          },
        ],
      },

      sortOrder: 20,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: home.id,
        key: 'martial-arts',
      },
    },

    update: {},

    create: {
      pageId: home.id,
      key: 'martial-arts',

      eyebrow: 'Feito para artes marciais',

      title: 'Do tatame para a gestão.',

      content:
        'O FightOps nasce para atender a realidade de academias, professores e equipes que precisam de organização sem burocracia.',

      metadata: {
        items: [
          'Organização operacional',
          'Experiência do aluno',
          'Controle financeiro',
          'Crescimento sustentável',
        ],
      },

      sortOrder: 30,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: home.id,
        key: 'cta',
      },
    },

    update: {},

    create: {
      pageId: home.id,
      key: 'cta',

      eyebrow: 'Comece agora',

      title: 'Sua operação merece mais controle.',

      content:
        'Crie sua conta e prepare sua academia para uma gestão mais simples e profissional.',

      buttonText: 'Criar minha conta',
      buttonUrl: '/register',

      sortOrder: 40,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: features.id,
        key: 'hero',
      },
    },

    update: {},

    create: {
      pageId: features.id,
      key: 'hero',

      eyebrow: 'Funcionalidades',

      title: 'Tudo que sua academia precisa para operar melhor.',

      content:
        'O FightOps reúne as principais rotinas administrativas e operacionais em uma plataforma única.',

      sortOrder: 10,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: features.id,
        key: 'items',
      },
    },

    update: {},

    create: {
      pageId: features.id,
      key: 'items',

      metadata: {
        items: [
          {
            title: 'Alunos',
            description:
              'Cadastro, acompanhamento, status, contatos, histórico e informações dos alunos.',
          },
          {
            title: 'Professores',
            description:
              'Organização da equipe, funções, permissões e vínculo com turmas.',
          },
          {
            title: 'Turmas',
            description:
              'Controle de horários, capacidade, modalidade, professor responsável e participantes.',
          },
          {
            title: 'Planos',
            description:
              'Estruturação de planos, mensalidades, regras e vínculos com alunos.',
          },
          {
            title: 'Financeiro',
            description:
              'Acompanhamento de cobranças, pagamentos, inadimplência e indicadores.',
          },
          {
            title: 'Permissões',
            description:
              'Controle de acesso para proprietários, administradores, recepção, professores e alunos.',
          },
          {
            title: 'Multiacademia',
            description:
              'Gerencie mais de uma unidade com separação de dados e permissões.',
          },
          {
            title: 'Dashboard',
            description:
              'Indicadores rápidos para acompanhar a saúde e evolução da operação.',
          },
        ],
      },

      sortOrder: 20,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: pricing.id,
        key: 'hero',
      },
    },

    update: {},

    create: {
      pageId: pricing.id,
      key: 'hero',

      eyebrow: 'Planos',

      title: 'Um plano para cada fase da sua academia.',

      content:
        'Escolha a estrutura que mais combina com o momento da sua operação.',

      sortOrder: 10,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: pricing.id,
        key: 'plans',
      },
    },

    update: {},

    create: {
      pageId: pricing.id,
      key: 'plans',

      metadata: {
        items: [
          {
            key: 'starter',
            name: 'Starter',
            title: 'Para começar',
            price: 'Em breve',
            description:
              'Para academias que estão começando a organizar sua operação.',
            featured: false,
            features: [
              'Gestão de alunos',
              'Gestão de turmas',
              'Professores',
              'Dashboard básico',
            ],
          },
          {
            key: 'pro',
            name: 'Pro',
            title: 'Para crescer',
            price: 'Em breve',
            description:
              'Para academias que precisam de mais controle e gestão.',
            featured: true,
            features: [
              'Tudo do Starter',
              'Financeiro',
              'Permissões avançadas',
              'Relatórios e indicadores',
            ],
          },
          {
            key: 'multi',
            name: 'Multi',
            title: 'Para redes',
            price: 'Sob consulta',
            description:
              'Para equipes e grupos que administram múltiplas unidades.',
            featured: false,
            features: [
              'Múltiplas academias',
              'Gestão centralizada',
              'Perfis avançados',
              'Suporte dedicado',
            ],
          },
        ],
      },

      sortOrder: 20,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: faq.id,
        key: 'hero',
      },
    },

    update: {},

    create: {
      pageId: faq.id,
      key: 'hero',

      eyebrow: 'FAQ',

      title: 'Perguntas frequentes.',

      content:
        'Algumas respostas sobre a plataforma, funcionamento e próximos passos.',

      sortOrder: 10,
      active: true,
    },
  })

  await prisma.publicPageSection.upsert({
    where: {
      pageId_key: {
        pageId: faq.id,
        key: 'questions',
      },
    },

    update: {},

    create: {
      pageId: faq.id,
      key: 'questions',

      metadata: {
        items: [
          {
            question: 'O que é o FightOps?',
            answer:
              'O FightOps é uma plataforma de gestão para academias e centros de treinamento.',
          },
          {
            question: 'O FightOps serve apenas para Jiu-Jitsu?',
            answer:
              'Não. A plataforma foi pensada para evoluir para diferentes modalidades de artes marciais e atividades esportivas.',
          },
          {
            question: 'Posso gerenciar mais de uma academia?',
            answer:
              'Sim. A arquitetura suporta múltiplas academias com usuários, papéis e dados separados.',
          },
          {
            question: 'Os professores terão acesso próprio?',
            answer:
              'Sim. Professores terão permissões específicas de acordo com seu papel dentro da academia.',
          },
          {
            question: 'Os alunos terão área própria?',
            answer:
              'Sim. A área do aluno terá funcionalidades específicas para a experiência do praticante.',
          },
          {
            question: 'Meus dados estarão protegidos?',
            answer:
              'O FightOps utiliza autenticação, controle de acesso, sessões e separação entre frontend, API e banco de dados.',
          },
        ],
      },

      sortOrder: 20,
      active: true,
    },
  })

  const seoEntries = [
    {
      pageId: home.id,
      title: 'FightOps | Gestão para academias e centros de treinamento',
      description:
        'Gerencie alunos, professores, turmas, pagamentos e a operação da sua academia com o FightOps.',
    },

    {
      pageId: features.id,
      title: 'Funcionalidades | FightOps',
      description:
        'Conheça as funcionalidades do FightOps para gestão de academias, alunos, professores, turmas e financeiro.',
    },

    {
      pageId: pricing.id,
      title: 'Planos | FightOps',
      description:
        'Conheça os planos do FightOps para academias e centros de treinamento.',
    },

    {
      pageId: faq.id,
      title: 'FAQ | FightOps',
      description:
        'Confira as principais dúvidas sobre o FightOps.',
    },
  ]

  for (const seo of seoEntries) {
    await prisma.seoSetting.upsert({
      where: {
        pageId: seo.pageId,
      },

      update: {},

      create: {
        pageId: seo.pageId,

        title: seo.title,
        description: seo.description,

        ogTitle: seo.title,
        ogDescription: seo.description,

        robotsIndex: true,
        robotsFollow: true,
      },
    })
  }
}