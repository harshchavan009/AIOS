import json
import asyncio
from typing import AsyncGenerator
from app.agents.base import AgentState
from app.agents.specialized import (
    PlannerAgent,
    RetrieverAgent,
    ToolAgent,
    ReasoningAgent,
    CriticAgent,
    ResponseAgent
)


class LangGraphOrchestrator:
    """
    LangGraph Multi-Agent DAG Orchestrator:
    Executes Planner -> Retriever -> Tool -> Reasoning -> Critic -> Response graph.
    """
    def __init__(self):
        self.agents = {
            "PlannerAgent": PlannerAgent(),
            "RetrieverAgent": RetrieverAgent(),
            "ToolAgent": ToolAgent(),
            "ReasoningAgent": ReasoningAgent(),
            "CriticAgent": CriticAgent(),
            "ResponseAgent": ResponseAgent()
        }

    async def execute_graph(self, goal: str) -> AgentState:
        state = AgentState(goal=goal)

        while state.active_agent in self.agents:
            agent = self.agents[state.active_agent]
            state = await agent.process(state)

        return state

    async def stream_graph_events(self, goal: str) -> AsyncGenerator[str, None]:
        state = AgentState(goal=goal)

        yield f"data: {json.dumps({'event': 'START', 'goal': goal})}\n\n"

        while state.active_agent in self.agents:
            agent_name = state.active_agent
            agent = self.agents[agent_name]
            
            yield f"data: {json.dumps({'event': 'NODE_START', 'agent': agent_name})}\n\n"
            await asyncio.sleep(0.15)
            
            state = await agent.process(state)
            
            yield f"data: {json.dumps({'event': 'NODE_COMPLETE', 'agent': agent_name, 'active_agent': state.active_agent})}\n\n"

        yield f"data: {json.dumps({'event': 'COMPLETE', 'final_output': state.final_output})}\n\n"


multi_agent_orchestrator = LangGraphOrchestrator()
