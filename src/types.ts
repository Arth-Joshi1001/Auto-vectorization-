export interface SpeedupData {
  scalar_time: number;
  vector_time: number;
  ratio: string;
}

export interface AnalysisResult {
  is_vectorizable: boolean;
  data_dependency: string;
  memory_access: string;
  simd_width: number;
  loop_type: string;
  induction_var: string;
  trip_count: string;
  vector_lines?: number[];      
  vectorizable_lines: number[]; 
  non_vectorizable_lines: number[];
  reasons: string[];
  transformed_code_scalar: string;
  transformed_code_vector: string;
  compiler_logs: string[];
  speedup: SpeedupData;
}

export interface Preset {
  name: string;
  code: string;
  analysis: AnalysisResult;
}

export type SidebarTab = 
  | "dashboard" 
  | "editor" 
  | "performance" 
  | "about";
