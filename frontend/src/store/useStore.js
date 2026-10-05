/**
 * store/useStore.js
 * Global Zustand store for Healix patient session state.
 * Persists history, result, and patient details to localStorage.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      symptomsText:    '',
      sessionId:       null,
      pipelineStage:   null,
      pipelineLabel:   '',
      completedStages: [],
      result:          null,
      patientName:      '',
      patientAge:       '',
      patientGender:    '',
      location:         null,
      nearbyHospitals:  [],
      error:           null,
      
      // Patient Assessment History
      history: [],

      // Setters
      setSymptomsText:  (t) => set({ symptomsText: t }),
      setError:         (e) => set({ error: e }),
      setResult:        (r) => {
        set({ result: r })
        if (r && r.run_id) {
          const currentHistory = get().history || []
          const exists = currentHistory.some((item) => item.run_id === r.run_id)
          if (!exists) {
            const historyItem = {
              run_id: r.run_id,
              timestamp: new Date().toISOString(),
              symptoms: r.parsed_input?.symptoms?.join(', ') || get().symptomsText,
              top_condition: r.clinical?.conditions?.[0]?.name || 'Assessment Complete',
              urgency: r.risk?.urgency_level || 'routine',
              is_emergency: r.risk?.is_emergency || false,
              result: r
            }
            set({ history: [historyItem, ...currentHistory].slice(0, 20) })
          }
        }
      },

      setPipelineStage: (stage, label) =>
        set((s) => ({
          pipelineStage:   stage,
          pipelineLabel:   label,
          completedStages: [...new Set([...s.completedStages, s.pipelineStage].filter(Boolean))],
        })),

      resetPipeline: () => set({ pipelineStage: null, pipelineLabel: '', completedStages: [], error: null }),

      setPatientName:   (n) => set({ patientName: n }),
      setPatientAge:    (a) => set({ patientAge: a }),
      setPatientGender: (g) => set({ patientGender: g }),
      setLocation:      (l) => set({ location: l }),
      setNearbyHospitals: (h) => set({ nearbyHospitals: h }),

      deleteHistoryItem: (runId) =>
        set((s) => ({ history: s.history.filter((item) => item.run_id !== runId) })),

      clearHistory: () => set({ history: [] }),

      /** Clear the current error message. */
      clearError: () => set({ error: null }),

      reset: () => set({
        symptomsText: '', sessionId: null, pipelineStage: null,
        pipelineLabel: '', completedStages: [], result: null, error: null,
        patientName: '', patientAge: '', patientGender: '', location: null, nearbyHospitals: []
      }),
    }),
    {
      name: 'healix-patient-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        result: state.result,
        patientName: state.patientName,
        patientAge: state.patientAge,
        patientGender: state.patientGender,
        location: state.location,
      }),
    }
  )
)

export default useStore
