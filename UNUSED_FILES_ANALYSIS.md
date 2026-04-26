# HEALIX Workspace - Unused Files Analysis

## Summary
This analysis identifies unused and dead code files in both the backend (Python) and frontend (JavaScript/React) directories. These files are not imported or referenced anywhere in the active codebase.

---

## BACKEND (Python) - UNUSED FILES

### 1. **Unused ML/Feature Engineering Module**
Files that are part of an unused ML pipeline.

#### `backend/ml/feature_engineering.py`
- **Status**: UNUSED
- **Size**: ~40KB (estimated)
- **Description**: Converts parsed patient input into numeric feature vectors
- **Why Unused**: This module is only used by `condition_classifier.py` and `cost_regressor.py`, which are themselves never called in the pipeline
- **Reason Disabled**: The current pipeline implementation uses hardcoded "HACKATHON DEMO FAST-TRACK" responses to meet the <3 second requirement, completely bypassing ML inference
- **Location in Code**: `modules/pipeline_orchestrator.py` lines 51-125 show the demo fast-track that replaces actual ML calls
- **Safe to Delete**: YES, but only after confirming ML features aren't needed for production

#### `backend/ml/condition_classifier.py`
- **Status**: UNUSED
- **Size**: ~3KB
- **Description**: Random Forest symptom→condition classifier used as cross-check with LLM output
- **Why Unused**: Never imported or called in the main pipeline
- **Imports**: Uses `ml/feature_engineering.py`
- **Safe to Delete**: YES, but keep if plan to use ML models instead of LLM-only inference

#### `backend/ml/cost_regressor.py`
- **Status**: UNUSED
- **Size**: ~2KB
- **Description**: XGBoost cost regression model for predicting treatment costs
- **Why Unused**: Never imported or called in the main pipeline
- **Imports**: Uses `ml/feature_engineering.py`
- **Safe to Delete**: YES, but keep if plan to use ML models for cost estimation

---

### 2. **Unused Service Modules**
Advanced features that have been bypassed for MVP.

#### `backend/services/cache.py`
- **Status**: UNUSED
- **Size**: ~2KB
- **Description**: Redis wrapper for caching pipeline results with graceful degradation
- **Why Unused**: Never imported or referenced anywhere in the codebase
- **Dependencies**: Requires Redis (optional dependency)
- **Purpose**: Was intended to cache results by SHA256 hash of input text
- **Safe to Delete**: YES, can be removed without breaking functionality

#### `backend/services/embeddings.py`
- **Status**: UNUSED
- **Size**: ~2KB
- **Description**: Sentence-transformer embeddings + ChromaDB semantic symptom search
- **Why Unused**: Never imported or referenced anywhere in the codebase
- **Dependencies**: Requires sentence-transformers and chromadb (optional dependencies)
- **Purpose**: Was intended for semantic search of symptoms in vector database
- **Safe to Delete**: YES, can be removed without breaking functionality

---

### 3. **Empty/Stub Test Files**
Test files that exist but contain no actual tests.

#### `backend/tests/test_api.py`
- **Status**: EMPTY
- **Safe to Delete**: YES, no content

#### `backend/tests/test_modules.py`
- **Status**: EMPTY
- **Safe to Delete**: YES, no content

#### `backend/tests/test_pipeline.py`
- **Status**: EMPTY
- **Safe to Delete**: YES, no content

---

## FRONTEND (JavaScript/React) - UNUSED FILES

### 1. **Unused UI Components**

#### `frontend/src/components/WaterBackground.jsx`
- **Status**: EMPTY FILE (0 bytes)
- **Description**: Intended as water animation background effect
- **Why Unused**: Never imported in any screen or component file
- **Search Results**: No references found in entire frontend codebase
- **Safe to Delete**: YES, completely unused

---

## DEPENDENCY ANALYSIS

### Components Actually Used in Frontend
The following components ARE properly imported and used:

**Screens (all 14 imported in App.jsx):**
- Landing.jsx ✓
- InputScreen.jsx ✓
- ProcessingScreen.jsx ✓
- Dashboard.jsx ✓
- HospitalMatches.jsx ✓
- CostTransparency.jsx ✓
- Welcome.jsx ✓
- About.jsx ✓
- Support.jsx ✓
- HowItWorks.jsx ✓
- AITechnology.jsx ✓
- WhyHealix.jsx ✓
- SecurityCompliance.jsx ✓
- ImpactResults.jsx ✓

**Components Used:**
- Navbar.jsx → Used in 14 screens ✓
- Footer.jsx → Used in 13 screens ✓
- SectionReveal.jsx → Used in 9 screens ✓
- HealixLogo.jsx → Used in About.jsx ✓
- DNA3D.jsx / MiniDNA → Used in Landing, InputScreen, Welcome, Dashboard, ProcessingScreen ✓
- AnimatedCounter.jsx → Used in Landing, CostTransparency, WhyHealix, ImpactResults ✓
- GaugeChart.jsx → Used in Dashboard, AITechnology ✓
- SeverityBadge.jsx → Used in Dashboard ✓
- HospitalCard.jsx → Used in HospitalMatches ✓
- FilterBar.jsx → Used in HospitalMatches ✓
- CostBreakdownCard.jsx → Used in CostTransparency ✓

---

## RECOMMENDATION SUMMARY

### Safe to Delete Immediately (No Dependencies)
1. `frontend/src/components/WaterBackground.jsx` - Empty file, no references
2. `backend/services/cache.py` - Unused service, no references
3. `backend/services/embeddings.py` - Unused service, no references
4. `backend/tests/test_api.py` - Empty test file
5. `backend/tests/test_modules.py` - Empty test file
6. `backend/tests/test_pipeline.py` - Empty test file

### Safe to Delete (But Consider Future Use)
7. `backend/ml/condition_classifier.py` - Only if not planning to use RF models
8. `backend/ml/cost_regressor.py` - Only if not planning to use XGBoost models
9. `backend/ml/feature_engineering.py` - Only if deleting both classifiers above

---

## Additional Notes

### Why These Files Exist
The codebase appears to be from a hackathon project (National Hackathon 2026) with the following evolution:
1. **Initial Plan**: Full 6-module pipeline with ML models (condition classifier, cost regressor)
2. **Optimization**: Services for advanced features (semantic search, result caching)
3. **Final Implementation**: Simplified demo-fast-track to meet <3 second latency requirement

### Pipeline Architecture
The current active pipeline in `modules/pipeline_orchestrator.py`:
- M1: Input Understanding (Hardcoded demo)
- M2: Clinical Reasoning (Hardcoded demo)
- M3: Risk Engine (Rule-based, not ML)
- M4: Decision Engine (Multi-factor ranking, not ML)
- M5: Cost Model (Heuristic-based, not XGBoost)
- M6: Confidence Engine (Rule-based)
- M7: Explainability (Rule-based)

### Impact of Cleanup
Removing unused files will:
- ✅ Reduce codebase complexity
- ✅ Reduce deployment size (~10KB)
- ✅ Remove optional dependencies (redis, sentence-transformers, chromadb)
- ✅ Improve code clarity
- ❌ Make it harder to add ML features later (would need to recreate these)

---

## File Statistics

| Category | Count | Status |
|----------|-------|--------|
| Unused Components (Frontend) | 1 | Ready to delete |
| Unused Services (Backend) | 2 | Ready to delete |
| Unused ML Modules (Backend) | 3 | Safe to delete (caution: future) |
| Empty Test Files (Backend) | 3 | Ready to delete |
| **TOTAL** | **9** | **Safe to remove** |
