import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import StageNode from './StageNode';

const nodeTypes = { stage: StageNode };

// Turns the flat, ordered list of stages into React Flow's nodes/edges
// shape. Position is derived purely from `order` — there's no manual
// layout to maintain as stages are added.
export default function PipelineView({ stages, tasksByStage, onSelectStage, selectedStageId }) {
  const nodes = useMemo(
    () =>
      stages.map((stage, i) => {
        const tasks = tasksByStage[stage._id] || [];
        return {
          id: stage._id,
          type: 'stage',
          position: { x: i * 260, y: 0 },
          draggable: false,
          selected: stage._id === selectedStageId,
          data: {
            stage,
            taskCount: tasks.length,
            doneCount: tasks.filter((t) => t.status === 'done').length,
            onSelect: onSelectStage,
          },
        };
      }),
    [stages, tasksByStage, onSelectStage, selectedStageId]
  );

  const edges = useMemo(
    () =>
      stages.slice(1).map((stage, i) => ({
        id: `${stages[i]._id}-${stage._id}`,
        source: stages[i]._id,
        target: stage._id,
        animated: stage.status === 'active',
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [stages]
  );

  return (
    <div className="pipeline-view">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
