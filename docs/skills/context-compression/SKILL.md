---
name: context-compression
description: This skill should be used when the user asks to "compress context", "summarize conversation history", "implement compaction", "reduce token usage", or mentions context compression, structured summarization, tokens-per-task optimization, or long-running agent sessions exceeding context limits.
---

# Context Compression Strategies

When agent sessions generate millions of tokens of conversation history, compression becomes mandatory. The naive approach is aggressive compression to minimize tokens per request. The correct optimization target is tokens per task: total tokens consumed to complete a task, including re-fetching costs when compression loses critical information.

## When to Activate

Activate this skill when:
- Agent sessions exceed context window limits
- - Codebases exceed context windows (5M+ token systems)
  - - Designing conversation summarization strategies
    - - Debugging cases where agents "forget" what files they modified
      - - Building evaluation frameworks for compression quality
       
        - ## Core Concepts
       
        - Context compression trades token savings against information loss. Three production-ready approaches exist:
       
        - 1. **Anchored Iterative Summarization**: Maintain structured, persistent summaries with explicit sections for session intent, file modifications, decisions, and next steps.
         
          2. 2. **Opaque Compression**: Produce compressed representations optimized for reconstruction fidelity. Achieves highest compression ratios (99%+) but sacrifices interpretability.
            
             3. 3. **Regenerative Full Summary**: Generate detailed structured summaries on each compression. Produces readable output but may lose details across repeated compression cycles.
               
                4. The critical insight: structure forces preservation. Dedicated sections act as checklists that the summarizer must populate, preventing silent information drift.
               
                5. ## Practical Guidance
               
                6. ### Three-Phase Compression Workflow
               
                7. For large codebases or agent systems exceeding context windows, apply compression through three phases:
               
                8. 1. **Research Phase**: Produce a research document from architecture diagrams, documentation, and key interfaces.
                   2. 2. **Planning Phase**: Convert research into implementation specification with function signatures, type definitions, and data flow.
                      3. 3. **Implementation Phase**: Execute against the specification.
                        
                         4. ## Guidelines
                        
                         5. 1. Optimize for tokens-per-task, not tokens-per-request
                            2. 2. Use structured summaries with explicit sections for file tracking
                               3. 3. Trigger compression at 70-80% context utilization
                                  4. 4. Implement incremental merging rather than full regeneration
                                     5. 5. Test compression quality with probe-based evaluation
                                        6. 6. Track artifact trail separately if file tracking is critical
                                           7. 7. Accept slightly lower compression ratios for better quality retention
                                              8. 8. Monitor re-fetching frequency as a compression quality signal
                                                
                                                 9. ## Skill Metadata
                                                
                                                 10. **Created**: 2025-12-22
                                                 11. **Last Updated**: 2025-12-26
                                                 12. **Author**: Agent Skills for Context Engineering Contributors
                                                 13. **Version**: 1.1.0
