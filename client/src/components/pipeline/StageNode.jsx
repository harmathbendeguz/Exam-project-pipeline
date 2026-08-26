import { Handle, Position } from 'reactflow';

const STATUS_LABEL = { locked: 'Locked', active: 'Active', done: 'Done' };

// A custom React Flow node. `data` is whatever PipelineView hands it —
// this component only renders, it never fetches or mutates anything
// itself (onSelect is a callback owned by the page).
export default function StageNode({ data }) {
  const { stage, taskCount, doneCount, onSelect } = data;

  return (
    <button
      type="button"
      className={`stage-node stage-node--${stage.status}`}
      onClick={() => onSelect(stage._id)}
    >
      <Handle type="target" position={Position.Left} />
      <div className="stage-node__name">{stage.name}</div>
      <div className="stage-node__status">{STATUS_LABEL[stage.status]}</div>
      <div className="stage-node__tasks">
        {doneCount}/{taskCount} tasks done
      </div>
      <Handle type="source" position={Position.Right} />
    </button>
  );
}
