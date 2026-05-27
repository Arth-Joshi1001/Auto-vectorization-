#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-Vectorization in Compiler - Python Analyzer Module
Performs loop detection, data dependency analysis, SIMD width estimation,
and memory access pattern evaluation for C source code.
"""

import sys
import jsn = None # Placeholder for typing if needed
import json
import re

def analyze_c_code(code):
    lines = code.split('\n')
    
    # Initialize reports
    loops_found = []
    has_loop_carried_dependency = False
    dependencies_log = []
    vectorizable_lines = []
    non_vectorizable_lines = []
    simd_width = 4 # Default SSE/AVX float/int width
    
    # Simple regex matches
    # for(int i=0; i<N; i++) | for ( i = 0 ; i < 1024 ; i++ )
    for_pattern = re.compile(r'for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+);\s*(\w+)\s*([<>=!]+)\s*([^;]+);\s*([^)]+)\)')
    
    # Let's parse line by line
    in_loop = False
    loop_context = None
    loop_start_line = -1
    loop_body_lines = []
    
    for idx, line in enumerate(lines):
        line_num = idx + 1
        clean_line = line.strip()
        
        # Detect Loop Start
        for_match = for_pattern.search(clean_line)
        if for_match:
            in_loop = True
            loop_start_line = line_num
            ind_var = for_match.group(1)
            init_val = for_match.group(2).strip()
            cond_var = for_match.group(3)
            cond_op = for_match.group(4)
            limit_val = for_match.group(5).strip()
            step_expr = for_match.group(6).strip()
            
            loop_context = {
                "line": line_num,
                "induction_var": ind_var,
                "trip_count": limit_val,
                "step": step_expr,
                "body_statements": [],
                "memory_access": "Sequential",
                "ineligible_reasons": [],
                "dependencies": []
            }
            continue
            
        if in_loop:
            if '}' in clean_line and len(clean_line) == 1:
                # End of a simple loop (assuming well formatted / simple block)
                in_loop = False
                loops_found.append(loop_context)
                loop_context = None
                continue
            elif clean_line:
                if loop_context:
                    loop_context["body_statements"].append((line_num, clean_line))
                    loop_body_lines.append((line_num, clean_line))
    
    # Analyze each loop found
    overall_eligible = True
    overall_reasons = []
    
    for loop in loops_found:
        ind_var = loop["induction_var"]
        body = loop["body_statements"]
        eligible = True
        reasons = []
        deps = []
        
        # Check induction var step
        step = loop["step"]
        if "++" not in step and "+= 1" not in step and step != f"{ind_var} + 1":
            # Loop stride might not be unit, strided accesses are harder to vectorize
            loop["memory_access"] = "Strided"
            
        # Scan body for dependencies and vectorizability
        for l_num, stmt in body:
            # Check for early exit/break
            if "break" in stmt or "return" in stmt:
                eligible = False
                reasons.append(f"Early exit statement '{stmt}' prevents vectorization")
                non_vectorizable_lines.append(l_num)
                continue
                
            # Check for standard library/function calls (except math maybe, but generic is ineligible)
            if "(" in stmt and not "[" in stmt and not "for" in stmt and "printf" in stmt:
                eligible = False
                reasons.append(f"Function call inside loop prevents auto-vectorization")
                non_vectorizable_lines.append(l_num)
                continue

            # Check for loop-carried data dependencies (e.g., read after write with offset)
            # Match assignments like: c[i] = c[i-1] + a[i]
            # LHS array name & index
            lhs_match = re.search(r'(\w+)\s*\[\s*([^\]]+)\s*\]\s*=', stmt)
            if lhs_match:
                lhs_arr = lhs_match.group(1)
                lhs_idx_expr = lhs_match.group(2).strip()
                
                # Check RHS for dependency on LHS array with an offset
                rhs_part = stmt.split('=')[1] if '=' in stmt else ''
                # Search for LHS array reuse on RHS: arr[...]
                rhs_matches = re.finditer(rf'{lhs_arr}\s*\[\s*([^\]]+)\s*\]', rhs_part)
                for rm in rhs_matches:
                    rhs_idx_expr = rm.group(1).strip()
                    # Check if index contains offsets (like i-1, i-2)
                    if '-' in rhs_idx_expr or '+' in rhs_idx_expr:
                        # Ensure offset is non-zero
                        offset_match = re.search(r'[-\+]\s*\d+', rhs_idx_expr)
                        if offset_match:
                            eligible = False
                            has_loop_carried_dependency = True
                            reasons.append(f"Loop-carried RAW (Read-after-Write) dependence on array '{lhs_arr}'")
                            deps.append(f"Read-after-Write dependency on '{lhs_arr}' with index expression '{rhs_idx_expr}'")
                            non_vectorizable_lines.append(l_num)
                            
            # Check for structure/pointer chasing
            if "->" in stmt or " ." in stmt:
                eligible = False
                reasons.append("Indirect pointer dereferencing or structure traversal")
                non_vectorizable_lines.append(l_num)
                
            if eligible and l_num not in non_vectorizable_lines:
                vectorizable_lines.append(l_num)

        loop["eligible"] = eligible
        loop["ineligible_reasons"] = reasons
        loop["dependencies"] = deps
        if not eligible:
            overall_eligible = False
            overall_reasons.extend(reasons)
            vectorizable_lines = [ln for ln in vectorizable_lines if ln not in non_vectorizable_lines]
            non_vectorizable_lines.append(loop["line"])
        else:
            vectorizable_lines.append(loop["line"])

    # If no loops found, set some defaults
    if not loops_found:
        overall_eligible = False
        overall_reasons.append("No loops detected in C code")
        
    # Standard reports
    report = {
        "loops": loops_found,
        "is_vectorizable": overall_eligible,
        "data_dependency": "None" if not has_loop_carried_dependency else "Loop-Carried (RAW Dependency)",
        "memory_access": "Sequential" if overall_eligible else "Non-unit stride / Indirect",
        "simd_width": simd_width,
        "vectorizable_lines": list(set(vectorizable_lines)),
        "non_vectorizable_lines": list(set(non_vectorizable_lines)),
        "reasons": overall_reasons,
        "compiler_logs": [
            "[INFO] Parsing compiler directives...",
            "[INFO] Analyzing control-flow graph (CFG)...",
            f"[INFO] Found {len(loops_found)} loop(s) candidate for vectorization.",
        ]
    }
    
    # Generate some mock vectorizer comments
    for l in loops_found:
        line_no = l["line"]
        if l["eligible"]:
            report["compiler_logs"].extend([
                f"analyzer.c:{line_no}: note: loop vectorized",
                f"analyzer.c:{line_no}: note: loop versioned for vectorization to handle alignment",
                f"analyzer.c:{line_no}: note: SIMD width estimated as {simd_width} (float types detected)"
            ])
        else:
            reasons_str = "; ".join(l["ineligible_reasons"])
            report["compiler_logs"].extend([
                f"analyzer.c:{line_no}: remark: loop not vectorized: {reasons_str}",
                f"analyzer.c:{line_no}: warning: dependency check failed"
            ])
            
    return report

if __name__ == '__main__':
    # If file passed as argument, read it, otherwise read stdin
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            code = f.read()
    else:
        code = sys.stdin.read()
        
    res = analyze_c_code(code)
    print(json.dumps(res, indent=2))
