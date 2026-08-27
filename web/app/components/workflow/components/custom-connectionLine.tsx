import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';

export const CustomConnectionLine = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionStatus,
}: ConnectionLineComponentProps) => {
  // 生成贝塞尔曲线路径
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  // 根据当前连接状态动态决定颜色（有效：绿，无效：红，常规：灰）
  const strokeColor =
    connectionStatus === 'valid'
      ? '#22c55e'
      : connectionStatus === 'invalid'
        ? '#ef4444'
        : '#94a3b8';

  return (
    <g>
      {/* 拖拽中的主体虚线 */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="5,5"
        className="animated"
        d={edgePath}
      />
      {/* 鼠标末端的指示圆点 */}
      <circle
        cx={toX}
        cy={toY}
        fill="#ffffff"
        r={5}
        stroke={strokeColor}
        strokeWidth={2}
      />
    </g>
  );
};