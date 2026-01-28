---
name: context-fundamentals
description: This skill should be used when the user asks to "understand context", "explain context windows", "design agent architecture", "debug context issues", "optimize context usage", or discusses context components, attention mechanics, progressive disclosure, or context budgeting. Provides foundational understanding of context engineering for AI agent systems.
---

# Context Engineering Fundamentals

Context is the complete state available to a language model at inference time. It includes everything the model can attend to when generating responses: system instructions, tool definitions, retrieved documents, message history, and tool outputs. Understanding context fundamentals is prerequisite to effective context engineering.

## When to Activate

Activate this skill when:
- Designing new agent systems or modifying existing architectures
- - Debugging unexpected agent behavior that may relate to context
  - - Optimizing context usage to reduce token costs or improve performance
    - - Onboarding new team members to context engineering concepts
      - - Reviewing context-related design decisions
       
        - ## Core Concepts
       
        - Context comprises several distinct components, each with different characteristics and constraints. The attention mechanism creates a finite budget that constrains effective context usage. Progressive disclosure manages this constraint by loading information only as needed. The engineering discipline is curating the smallest high-signal token set that achieves desired outcomes.
       
        - ## Detailed Topics
       
        - ### The Anatomy of Context
       
        - **System Prompts**
        - System prompts establish the agent's core identity, constraints, and behavioral guidelines. They are loaded once at session start and typically persist throughout the conversation. System prompts should be extremely clear and use simple, direct language at the right altitude for the agent.
       
        - The right altitude balances two failure modes. At one extreme, engineers hardcode complex brittle logic that creates fragility and maintenance burden. At the other extreme, engineers provide vague high-level guidance that fails to give concrete signals for desired outputs or falsely assumes shared context. The optimal altitude strikes a balance: specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics.
       
        - Organize prompts into distinct sections using XML tagging or Markdown headers to delineate background information, instructions, tool guidance, and output description. The exact formatting matters less as models become more capable, but structural clarity remains valuable.
       
        - **Tool Definitions**
        - Tool definitions specify the actions an agent can take. Each tool includes a name, description, parameters, and return format. Tool definitions live near the front of context after serialization, typically before or after the system prompt.
       
        - Tool descriptions collectively steer agent behavior. Poor descriptions force agents to guess; optimized descriptions include usage context, examples, and defaults. The consolidation principle states that if a human engineer cannot definitively say which tool should be used in a given situation, an agent cannot be expected to do better.
       
        - **Retrieved Documents**
        - Retrieved documents provide domain-specific knowledge, reference materials, or task-relevant information. Agents use retrieval augmented generation to pull relevant documents into context at runtime rather than pre-loading all possible information.
       
        - The just-in-time approach maintains lightweight identifiers (file paths, stored queries, web links) and uses these references to load data into context dynamically. This mirrors human cognition: we generally do not memorize entire corpuses of information but rather use external organization and indexing systems to retrieve relevant information on demand.
       
        - **Message History**
        - Message history contains the conversation between the user and agent, including previous queries, responses, and reasoning. For long-running tasks, message history can grow to dominate context usage.
       
        - Message history serves as scratchpad memory where agents track progress, maintain task state, and preserve reasoning across turns. Effective management of message history is critical for long-horizon task completion.
       
        - **Tool Outputs**
        - Tool outputs are the results of agent actions: file contents, search results, command execution output, API responses, and similar data. Tool outputs comprise the majority of tokens in typical agent trajectories, with research showing observations (tool outputs) can reach 83.9% of total context usage.
       
        - Tool outputs consume context whether they are relevant to current decisions or not. This creates pressure for strategies like observation masking, compaction, and selective tool result retention.
       
        - ## Guidelines
       
        - 1. Treat context as a finite resource with diminishing returns
          2. 2. Place critical information at attention-favored positions (beginning and end)
             3. 3. Use progressive disclosure to defer loading until needed
                4. 4. Organize system prompts with clear section boundaries
                   5. 5. Monitor context usage during development
                      6. 6. Implement compaction triggers at 70-80% utilization
                         7. 7. Design for context degradation rather than hoping to avoid it
                            8. 8. Prefer smaller high-signal context over larger low-signal context
                              
                               9. ## Skill Metadata
                              
                               10. **Created**: 2025-12-20
                               11. **Last Updated**: 2025-12-20
                               12. **Author**: Agent Skills for Context Engineering Contributors
                               13. **Version**: 1.0.0
