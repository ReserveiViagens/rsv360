// Componentes de Testes e Qualidade - FASE 10
export { TestRunner } from './TestRunner';
export { QualityMetrics } from './QualityMetrics';
export { TestSuites } from './TestSuites';
export { CodeCoverage } from './CodeCoverage';
export { PerformanceTesting } from './PerformanceTesting';

// Tipos e interfaces
export type {
  TestResult,
  TestSuite,
  TestRunnerProps
} from './TestRunner';

export type {
  CodeQualityMetric,
  FileQuality,
  QualityMetricsProps
} from './QualityMetrics';

export type {
  TestCase,
  TestSuite as TestSuiteType,
  TestSuitesProps
} from './TestSuites';

export type {
  CoverageData,
  CoverageSummary,
  CodeCoverageProps
} from './CodeCoverage';

export type {
  PerformanceMetric,
  PerformanceTest,
  PerformanceTestingProps
} from './PerformanceTesting';
