import { create } from 'zustand'

const useStore = create((set) => ({
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

  // Setters
  setSymptomsText:  (t) => set({ symptomsText: t }),
  setError:         (e) => set({ error: e }),
  setResult:        (r) => set({ result: r }),

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

  reset: () => set({
    symptomsText: '', sessionId: null, pipelineStage: null,
    pipelineLabel: '', completedStages: [], result: null, error: null,
    patientName: '', patientAge: '', patientGender: '', location: null, nearbyHospitals: []
  }),
}))

export default useStore
