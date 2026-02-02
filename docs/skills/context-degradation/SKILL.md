---
name: context-degradation
description: This skill should be used when the user asks to "diagnose context problems", "fix lost-in-middle issues", "debug agent failures", "understand context poisoning", or mentions context degradation, attention patterns, context clash, context confusion, or agent performance degradation. Provides patterns for recognizing and mitigating context failures.
---

# Context Degradation Patterns

Language models exhibit predictable degradation patterns as context length increases. Understanding these patterns is essential for diagnosing failures and designing resilient systems.

## When to Activate

Activate this skill when:
- Agent performance degrades unexpectedly during long conversations
- - Debugging cases where agents produce incorrect or irrelevant outputs
  - - Designing systems that must handle large contexts reliably
    - - Evaluating context engineering choices for production systems
      - - Investigating "lost in middle" phenomena in agent outputs
        - - Analyzing context-related failures in agent behavior
         
          - ## Core Concepts
         
          - Context degradation manifests through several distinct patterns:
         
          - 1. **Lost-in-Middle Phenomenon** - Information in the center of context receives less attention
            2. 2. **Context Poisoning** - Errors compound through repeated reference
               3. 3. **Context Distraction** - Irrelevant information overwhelms relevant content
                  4. 4. **Context Confusion** - Model cannot determine which context applies
                     5. 5. **Context Clash** - Accumulated information directly conflicts
                       
                        6. These patterns are predictable and can be mitigated through architectural patterns like compaction, masking, partitioning, and isolation.
                       
                        7. ## Practical Guidance
                       
                        8. ### The Four-Bucket Approach
                       
                        9. Four strategies address different aspects of context degradation:
                       
                        10. 1. **Write**: Save context outside the window using scratchpads, file systems, or external storage
                            2. 2. **Select**: Pull relevant context into the window through retrieval, filtering, and prioritization
                               3. 3. **Compress**: Reduce tokens while preserving information through summarization and masking
                                  4. 4. **Isolate**: Split context across sub-agents to prevent degradation
                                    
                                     5. ## Guidelines
                                    
                                     6. 1. Monitor context length and performance correlation during development
                                        2. 2. Place critical information at beginning or end of context
                                           3. 3. Implement compaction triggers before degradation becomes severe
                                              4. 4. Validate retrieved documents for accuracy before adding to context
                                                 5. 5. Use versioning to prevent outdated information from causing clash
                                                    6. 6. Segment tasks to prevent context confusion across different objectives
                                                       7. 7. Design for graceful degradation rather than assuming perfect conditions
                                                          8. 8. Test with progressively larger contexts to find degradation thresholds
                                                            
                                                             9. ## Skill Metadata
                                                            
                                                             10. **Created**: 2025-12-20
                                                             11. **Last Updated**: 2025-12-20
                                                             12. **Author**: Agent Skills for Context Engineering Contributors
                                                             13. **Version**: 1.0.0
