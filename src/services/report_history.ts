import pb from '@/lib/pocketbase/client'

export interface ReportFilter {
  childId?: string
  type?: string
  startDate?: Date
  endDate?: Date
}

export const getReportHistory = (filters?: ReportFilter) => {
  const filterParts: string[] = []

  if (filters?.childId && filters.childId !== 'all') {
    filterParts.push(`child = "${filters.childId}"`)
  }
  if (filters?.type && filters.type !== 'all') {
    filterParts.push(`type = "${filters.type}"`)
  }
  if (filters?.startDate) {
    const start = new Date(filters.startDate)
    start.setHours(0, 0, 0, 0)
    filterParts.push(`created >= "${start.toISOString().replace('T', ' ')}"`)
  }
  if (filters?.endDate) {
    const end = new Date(filters.endDate)
    end.setHours(23, 59, 59, 999)
    filterParts.push(`created <= "${end.toISOString().replace('T', ' ')}"`)
  }

  const filterStr = filterParts.join(' && ')

  return pb.collection('report_history').getFullList({
    expand: 'child',
    sort: '-created',
    filter: filterStr || undefined,
  })
}

export const createReportHistory = (data: { child: string; title: string; type: string }) => {
  return pb.collection('report_history').create(data)
}
