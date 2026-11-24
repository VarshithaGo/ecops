import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { caseApi } from '../api/caseApi'
import {
  Fir,
  IoAssignment,
  MahajarReport,
  PropertySeizure,
  ArrestWarrant,
  ChargeSheet,
  FinalReport,
  CourtDisposal,
  AuditEvent,
  Deadline,
  DashboardStats,
} from '../types/case.types'
import { CriminalRecord } from '../types/criminal.types'

export function useFIR(id: string): UseQueryResult<Fir> {
  return useQuery({ queryKey: ['fir', id], queryFn: () => caseApi.getFir(id) })
}

export function useIoAssignments(firId: string): UseQueryResult<IoAssignment[]> {
  return useQuery({
    queryKey: ['fir-io', firId],
    queryFn: () => caseApi.getFirIoAssignments(firId),
  })
}

export function useMahajar(firId: string): UseQueryResult<MahajarReport[]> {
  return useQuery({
    queryKey: ['fir-mahajar', firId],
    queryFn: () => caseApi.getFirMahajar(firId),
  })
}

export function usePropertySeizures(firId: string): UseQueryResult<PropertySeizure[]> {
  return useQuery({
    queryKey: ['fir-property', firId],
    queryFn: () => caseApi.getFirProperty(firId),
  })
}

export function useFIRWarrants(firId: string): UseQueryResult<ArrestWarrant[]> {
  return useQuery({
    queryKey: ['fir-warrants', firId],
    queryFn: () => caseApi.getFirWarrants(firId),
  })
}

export function useFIRCriminals(firId: string): UseQueryResult<CriminalRecord[]> {
  return useQuery({
    queryKey: ['fir-criminals', firId],
    queryFn: () => caseApi.getFirCriminals(firId),
  })
}

// These return null on 404 (no charge sheet / final report filed yet)
export function useChargeSheet(firId: string): UseQueryResult<ChargeSheet | null> {
  return useQuery({
    queryKey: ['fir-chargesheet', firId],
    queryFn: () =>
      caseApi.getFirChargeSheet(firId).catch((e) => {
        if (e?.response?.status === 404) return null
        throw e
      }),
  })
}

export function useFinalReport(firId: string): UseQueryResult<FinalReport | null> {
  return useQuery({
    queryKey: ['fir-finalreport', firId],
    queryFn: () =>
      caseApi.getFirFinalReport(firId).catch((e) => {
        if (e?.response?.status === 404) return null
        throw e
      }),
  })
}

export function useCourtDisposal(firId: string): UseQueryResult<CourtDisposal | null> {
  return useQuery({
    queryKey: ['fir-disposal', firId],
    queryFn: () =>
      caseApi.getFirCourtDisposal(firId).catch((e) => {
        if (e?.response?.status === 404) return null
        throw e
      }),
  })
}

export function useFIRAudit(firId: string): UseQueryResult<AuditEvent[]> {
  return useQuery({
    queryKey: ['fir-audit', firId],
    queryFn: () => caseApi.getFirAudit(firId),
  })
}

export function useFIRDeadline(firId: string): UseQueryResult<Deadline> {
  return useQuery({
    queryKey: ['fir-deadline', firId],
    queryFn: () => caseApi.getFirDeadline(firId),
  })
}

export function useDashboardStats(): UseQueryResult<DashboardStats> {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => caseApi.getDashboardStats(),
    refetchOnWindowFocus: true,
  })
}
