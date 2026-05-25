# R.O.L.L. Local Conversation Archive

This directory stores symlinks and copies of your AI assistant conversations for the **R.O.L.L.** repository. This ensures that you have complete local ownership over your coding sessions, planning documents, architectural diagrams, and chronological prompt histories.

## Current Session

- **Conversation ID:** `4006909b-5cde-4525-8f7d-02ebdeea0f3e`
- **Symlinked Path:** [.gemini/conversations/4006909b-5cde-4525-8f7d-02ebdeea0f3e](./4006909b-5cde-4525-8f7d-02ebdeea0f3e)

### Contents of the Conversation Folder

1. **Chronological Logs:**
   - [.system_generated/logs/transcript.jsonl](./4006909b-5cde-4525-8f7d-02ebdeea0f3e/.system_generated/logs/transcript.jsonl) - The raw, line-by-line JSON record of every message, tool call, system event, and response in this entire session. Great for search queries or backup restores.

2. **UI Assets & Screenshots:**
   - You'll find `.png` visual mockups and mobile responsiveness captures saved directly in the folder during UI design reviews.

3. **Session Artifacts:**
   - [implementation_plan.md](./4006909b-5cde-4525-8f7d-02ebdeea0f3e/implementation_plan.md) - The high-level planning architecture agreed upon for Workers deployment, edge compilation, and UI fixes.
   - [task.md](./4006909b-5cde-4525-8f7d-02ebdeea0f3e/task.md) - The interactive checklists tracking completed items (mobile scroll reveals, brand clipping, top-viewport margin alignments).
   - [walkthrough.md](./4006909b-5cde-4525-8f7d-02ebdeea0f3e/walkthrough.md) - Comprehensive summary of code updates, performance gains, and verified build pipelines.

4. **Temporary / Scratch Scripts:**
   - [scratch/](./4006909b-5cde-4525-8f7d-02ebdeea0f3e/scratch) - Local helper python scripts and data tools generated dynamically during development.

---

## Why a Symbolic Link?

The agent system's core execution engine and context state indices are managed in the global user-app-data folder (`~/.gemini/antigravity/brain`). Moving the folder entirely would break active session synchronization in the IDE UI. 

Using a symbolic link bridges this gap perfectly:
- **Zero UI Disruption:** The IDE continues tracking state, rendering chat flows, and processing tools correctly.
- **Local Ownership & Git Tracking:** You can easily inspect, reference, or commit your AI interaction documents and design artifacts directly alongside your code in `Creative Direction/R.O.L.L/`!
