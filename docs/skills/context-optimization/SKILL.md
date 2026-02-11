---
name: context-optimization
description: This skill should be used when the user asks to "optimize context", "reduce token costs", "improve context efficiency", "implement KV-cache optimization", "partition context", or mentions context limits, observation masking, context budgeting, or extending effective context capacity.
---

# Context Optimization Techniques

Context optimization extends the effective capacity of limited context windows through strategic compression, masking, caching, and partitioning. The goal is not to magically increase context windows but to make better use of available capacity. Effective optimization can double or triple effective context capacity without requiring larger models or longer contexts.

## When to Activate

Activate this skill when:
- Context limits constrain task complexity
- - Optimizing for cost reduction (fewer tokens = lower costs)
  - - Reducing latency for long conversations
    - - Implementing long-running agent systems
      - - Needing to handle larger documents or conversations
        - - Building production systems at scale
         
          - ## Core Concepts
         
          - Context optimization extends effective capacity through four primary strategies: compaction (summarizing context near limits), observation masking (replacing verbose outputs with references), KV-cache optimization (reusing cached computations), and context partitioning (splitting work across isolated contexts).
         
          - The key insight is that context quality matters more than quantity. Optimization preserves signal while reducing noise.
         
          - ## Detailed Topics
         
          - ### Compaction Strategies
         
          - Compaction is the practice of summarizing context contents when approaching limits, then reinitializing a new context window with the summary.
         
          - Priority for compression goes to tool outputs (replace with summaries), old turns (summarize early conversation), retrieved docs (summarize if recent versions exist), and never compress system prompt.
         
          - ### Observation Masking
         
          - Tool outputs can comprise 80%+ of token usage in agent trajectories. Observation masking replaces verbose tool outputs with compact references.
         
          - Never mask: Observations critical to current task, observations from the most recent turn, observations used in active reasoning.
         
          - Consider masking: Observations from 3+ turns ago, verbose outputs with key points extractable, observations whose purpose has been served.
         
          - ### KV-Cache Optimization
         
          - Prefix caching reuses KV blocks across requests with identical prefixes using hash-based block matching.
         
          - Optimize by placing stable elements first (system prompt, tool definitions), then frequently reused elements, then unique elements last.
         
          - ### Context Partitioning
         
          - The most aggressive form of context optimization is partitioning work across sub-agents with isolated contexts.
         
          - ## Guidelines
         
          - 1. Measure before optimizing—know your current state
            2. 2. Apply compaction before masking when possible
               3. 3. Design for cache stability with consistent prompts
                  4. 4. Partition before context becomes problematic
                     5. 5. Monitor optimization effectiveness over time
                        6. 6. Balance token savings against quality preservation
                           7. 7. Test optimization at production scale
                              8. 8. Implement graceful degradation for edge cases
                                
                                 9. ## Skill Metadata
                                
                                 10. **Created**: 2025-12-20
                                 11. **Last Updated**: 2025-12-20
                                 12. **Author**: Agent Skills for Context Engineering Contributors
                                 13. **Version**: 1.0.0
