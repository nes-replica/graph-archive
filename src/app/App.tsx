import React, {FC, Reducer, useEffect, useReducer, useState} from 'react';
import './App.css';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Controls, Edge, EdgeChange,
  MiniMap,
  Node, NodeChange, NodeProps,
} from "react-flow-renderer";
import {Markdown, MDEditor} from "../core/editor/MDEditor";
import {MDStub} from "./MDStub";
import Modal from "react-modal";
import {v4 as uuidv4} from 'uuid';
import {eqSet} from "../core/ComparisonUtil";

interface NodeData {
  label: string
  content: string
  onEdit: () => void
}

interface EdgeData {}

interface EditorState {
  id: string
  content: string
}

interface HotKeysState {
  keysPressed: string[]
}

interface ReducerState {
  nodes: Node<NodeData>[]
  edges: Edge<EdgeData>[]
  editor?: EditorState
  hotKeys: HotKeysState
}

interface EditAction {
  type: 'edit'
  id: string
  isEditing: boolean
}

interface ContentChangeAction {
  type: 'contentChange'
  id: string
  content: string
}

interface NodeChangeAction {
  type: 'nodeChange'
  changes: NodeChange[]
}

interface EdgeChangeAction {
  type: 'edgeChange'
  changes: EdgeChange[]
}

interface KeyPressedAction {
  type: 'keyPressed'
  value: string
}

interface KeyReleasedAction {
  type: 'keyReleased'
  value: string
}

type ReducerAction = EditAction | ContentChangeAction | NodeChangeAction | EdgeChangeAction | KeyPressedAction | KeyReleasedAction

const graphReducer: Reducer<ReducerState, ReducerAction> = (state: ReducerState, action: ReducerAction): ReducerState => {
  if (action.type === 'edit') {
    if (action.isEditing) {
      const node = state.nodes.find(node => node.id === action.id)
      if (!!node) {
        return { ...state, editor: { id: action.id, content: node.data.content } }
      } else {
        return state
      }
    } else {
      if (state.editor) {
        const updatedNodes = state.nodes.slice().map(node => {
          if (node.id === action.id) {
            node.data.content = state.editor!.content
          }
          return node
        })
        return {...state, nodes: updatedNodes, editor: undefined }
      } else {
        return state
      }
    }
  } else if (action.type === 'contentChange') {
    if (state.editor) {
      return { ...state, editor: {...state.editor, content: action.content}}
    } else {
      return state
    }
  } else if (action.type === 'nodeChange') {
    const updatedNodes = applyNodeChanges(action.changes, state.nodes)
    return {...state, nodes: updatedNodes}
  } else if (action.type === 'edgeChange') {
    const updatedEdges = applyEdgeChanges(action.changes, state.edges)
    return {...state, edges: updatedEdges}
  } else if (action.type === 'keyPressed') {
    const updatedHotKeys = state.hotKeys.keysPressed.slice()
    updatedHotKeys.push(action.value)
    console.log(updatedHotKeys)
    if (eqSet(new Set(updatedHotKeys), new Set(['Alt', 'n']))) {
      const onEdit = (id: string) => () => graphReducer(state, {type: 'edit', id, isEditing: true})
      const updatedNodes = applyNodeChanges([{type: 'add', item: createNode((onEdit))}], state.nodes)
      return {...state, nodes: updatedNodes, hotKeys: { keysPressed: [] }}
    } else {
      return {...state, hotKeys: { keysPressed: updatedHotKeys }}
    }
  } else if (action.type === "keyReleased") {
    const updatedHotKeys = state.hotKeys.keysPressed.slice()
    updatedHotKeys.splice(updatedHotKeys.findIndex(k => k === action.value), 1)
    return {...state, hotKeys: { keysPressed: updatedHotKeys }}
  } else {
    return state
  }
}

const MarkdownNode: FC<NodeProps<NodeData>> = (node: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <div className={'markdown-node'}>
      <Markdown content={isExpanded ? node.data.content : node.data.label} />
      <button onClick={node.data.onEdit}>Edit</button>
      <button onClick={() => setIsExpanded(!isExpanded)}>Toggle</button>
    </div>
  )
}

const NODE_TYPES = {
  markdown: MarkdownNode,
}

const createNode = (onEdit: (id: string) => () => void) => {
  const id = uuidv4()
  return {
    id,
    type: 'markdown',
    data: {
      label: "test md node",
      content: MDStub,
      onEdit: onEdit(id)
    },
    position: {x: 250, y: 25},
  }
}

Modal.setAppElement('#root');

function App() {
  const [state, dispatch]: [ReducerState, (action: ReducerAction) => void] = useReducer(graphReducer, {
    nodes: [],
    edges: [],
    hotKeys: { keysPressed: [] }
  })

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => dispatch({type: 'keyPressed', value: e.key})
    const keyup = (e: KeyboardEvent) => dispatch({type: 'keyReleased', value: e.key})
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('keyup', keyup)
    }
  }, [])

  return (
    <>
      <ReactFlow
        nodes={state.nodes}
        edges={state.edges}
        onNodesChange={(changes) => dispatch({type: 'nodeChange', changes})}
        onEdgesChange={(changes) => dispatch({type: 'edgeChange', changes})}
        fitView
        nodeTypes={NODE_TYPES}
        onKeyDown={e => dispatch({type: 'keyPressed', value: e.key})}
        onKeyUp={e => dispatch({type: 'keyReleased', value: e.key})}
      >
        <MiniMap/>
        <Controls/>
      </ReactFlow>
      {state.editor && <Modal
          isOpen={!!state.editor}
          onRequestClose={() => dispatch({type: 'edit', id: state.editor!.id, isEditing: false})}
          style={{
            overlay: {
              zIndex: 7
            },
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              zIndex: '100',
            }
          }}
      >
          <MDEditor content={state.editor!.content} onChange={(value) => {
            dispatch({type: 'contentChange', id: state.editor!.id, content: value })
          }}/>
      </Modal>}
    </>)
}

export default App;
