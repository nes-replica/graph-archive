import React, {useCallback, useMemo, useState} from 'react';
import './App.css';
import ReactFlow, {Controls, Handle, MiniMap, Node, NodeProps, Position} from "react-flow-renderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';


function MarkdownNode(node: NodeProps) {
  console.log(node);
  return (
    <div className={'markdown-node'}>
      <ReactMarkdown children={node.data.content} remarkPlugins={[remarkGfm]}></ReactMarkdown>
    </div>
  );
}


const initialNodes: Node[] = [
  {
    id: '1',
    type: 'markdown',
    data: {
      label: 'labl',
      content: `**bold**

_italic_

| test1 | test2 |
| test3 | test4 |
      `
    },
    position: {x: 250, y: 25},
  }
];


function App() {
  const nodeTypes = useMemo(() => ({markdown: MarkdownNode}), []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
    >
      <MiniMap/>
      <Controls/>
    </ReactFlow>
  );
}

export default App;
