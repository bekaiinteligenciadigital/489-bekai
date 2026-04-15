import pb from '@/lib/pocketbase/client'

export interface JourneyStatus {
  setup: boolean
  diagnostico: boolean
  mapeamento: boolean
  ativacao: boolean
  rebalanceamento: boolean
  monitoramento: boolean
  progress: number
}

export interface ProfJourneyStatus {
  revisao: boolean
  avaliacao: boolean
  validacao: boolean
  refinamento: boolean
  supervisao: boolean
  progress: number
}

export async function getJourneyStatus(): Promise<JourneyStatus> {
  const defaultStatus = {
    setup: false,
    diagnostico: false,
    mapeamento: false,
    ativacao: false,
    rebalanceamento: false,
    monitoramento: false,
    progress: 0,
  }

  if (!pb.authStore.model?.id) return defaultStatus

  const userId = pb.authStore.model.id
  let setup = false,
    diagnostico = false,
    mapeamento = false,
    ativacao = false

  try {
    const children = await pb.collection('children').getFullList({
      filter: `parent = "${userId}"`,
    })
    setup = children.length > 0

    if (setup) {
      const childIds = children.map((c) => `child = "${c.id}"`).join(' || ')

      const assessments = await pb.collection('assessments').getList(1, 1, {
        filter: `(${childIds}) && (status = "submitted" || status = "analyzed")`,
      })
      diagnostico = assessments.totalItems > 0

      if (diagnostico) {
        const userAssessments = await pb.collection('assessments').getFullList({ filter: childIds })
        const assessmentIds = userAssessments.map((a) => `assessment = "${a.id}"`).join(' || ')

        if (assessmentIds) {
          const risks = await pb
            .collection('risk_profiles')
            .getList(1, 1, { filter: assessmentIds })
          mapeamento = risks.totalItems > 0
        }
      }

      const plans = await pb.collection('action_plans').getList(1, 1, { filter: childIds })
      const bundles = await pb
        .collection('recommendation_bundles')
        .getList(1, 1, { filter: childIds })
      ativacao = plans.totalItems > 0 || bundles.totalItems > 0
    }
  } catch (err) {
    console.error('Error fetching journey status', err)
  }

  const rebalanceamento = localStorage.getItem('kairos_visited_biblioteca') === 'true'
  const monitoramento = localStorage.getItem('kairos_visited_parent_dashboard') === 'true'

  const steps = [setup, diagnostico, mapeamento, ativacao, rebalanceamento, monitoramento]
  const completedCount = steps.filter(Boolean).length
  const progress = Math.round((completedCount / 6) * 100)

  return { setup, diagnostico, mapeamento, ativacao, rebalanceamento, monitoramento, progress }
}

export async function getProfessionalJourneyStatus(): Promise<ProfJourneyStatus> {
  const defaultStatus = {
    revisao: false,
    avaliacao: false,
    validacao: false,
    refinamento: false,
    supervisao: false,
    progress: 0,
  }

  if (!pb.authStore.model?.id) return defaultStatus

  let revisao = false,
    avaliacao = false,
    validacao = false,
    supervisao = false

  try {
    // 1. Revisão de Prontuário Digital: Has accessed children/assessments
    const assessments = await pb.collection('assessments').getList(1, 1)
    revisao = assessments.totalItems > 0

    if (revisao) {
      // 2. Avaliação de Padrões Clínicos: Has risk profiles to look at
      const risks = await pb.collection('risk_profiles').getList(1, 1)
      avaliacao = risks.totalItems > 0
    }

    // 3. Validação de Protocolo: Has approved/rejected clinical plans
    const validatedPlans = await pb.collection('clinical_plans').getList(1, 1, {
      filter: `status = "approved" || status = "rejected" || status = "executing" || status = "completed"`,
    })
    validacao = validatedPlans.totalItems > 0

    // 5. Supervisão de Evolução: Has completed plans
    const completedPlans = await pb.collection('clinical_plans').getList(1, 1, {
      filter: `status = "completed"`,
    })
    supervisao = completedPlans.totalItems > 0
  } catch (err) {
    console.error('Error fetching professional journey status', err)
  }

  // 4. Refinamento de Scripts: Tracked via local storage for now (simulating interaction)
  const refinamento = localStorage.getItem('kairos_prof_visited_scripts') === 'true'

  const steps = [revisao, avaliacao, validacao, refinamento, supervisao]
  const completedCount = steps.filter(Boolean).length
  const progress = Math.round((completedCount / 5) * 100)

  return { revisao, avaliacao, validacao, refinamento, supervisao, progress }
}
