import React, { useCallback, useState, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    addEdge,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";

let id = 0;
const getId = () => `node_${id++}`;

// Custom Block
const CustomBlock = ({ label }) => (
    <div className="p-4 rounded bg-gray-800 text-white border border-white relative w-28 text-center">
        {label}
        <Handle
            type="target"
            position={Position.Top}
            id="input"
            className="w-3 h-3 bg-red-500 absolute -top-1 left-1/2 transform -translate-x-1/2"
        />
        <Handle
            type="source"
            position={Position.Bottom}
            id="output"
            className="w-3 h-3 bg-green-500 absolute -bottom-1 left-1/2 transform -translate-x-1/2"
        />
    </div>
);

function FlowCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [blockList, setBlockList] = useState([]);
    const [nodeTypes, setNodeTypes] = useState({});

    // Fetch block list from JSON file
    useEffect(() => {
        fetch("./blocks.json")
            .then((res) => res.json())
            .then((data) => {
                setBlockList(data);
                // Dynamically create nodeTypes from block list
                const dynamicTypes = {};
                data.forEach((block) => {
                    dynamicTypes[block.id] = (props) => (
                        <CustomBlock {...props} label={block.label} />
                    );
                });
                setNodeTypes(dynamicTypes);
            })
            .catch((err) => console.error("Error loading blocks:", err));
    }, []);

    const onConnect = useCallback(
        (params) => {
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);

            if (sourceNode?.type === "blockB" && targetNode?.type === "blockA") {
                alert("❌ Connection from Block B to Block A is not allowed.");
                return;
            }

            setEdges((eds) => addEdge(params, eds));
        },
        [nodes]
    );

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");

            if (!type) return;

            const position = reactFlowInstance.project({
                x: event.clientX,
                y: event.clientY - 40,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: type },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onNodeContextMenu = (event, node) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY });
    };

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <div className="w-1/4 p-4 border-r border-white">
                {/* Dropdown */}
                <div className="mb-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                        Open Dropdown
                    </button>
                    {dropdownOpen && (
                        <div className="mt-2 max-h-40 w-48 overflow-y-auto rounded border bg-white text-white shadow">
                            {[...Array(20).keys()].map((i) => (
                                <div
                                    key={i}
                                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                >
                                    Item {i + 1}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dynamic Draggable Blocks */}
                {blockList.map((block) => (
                    <div
                        key={block.id}
                        className={`mb-2 p-2 cursor-pointer rounded text-white ${block.classNames}`}
                        onDragStart={(e) =>
                            e.dataTransfer.setData("application/reactflow", block.id)
                        }
                        draggable
                    >
                        {block.label}
                    </div>
                ))}
            </div>

            {/* Flow Canvas */}
            <div className="flex-1 relative" onContextMenu={(e) => e.preventDefault()}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeContextMenu={onNodeContextMenu}
                    fitView
                    nodeTypes={nodeTypes}
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="absolute bg-white border p-2 rounded shadow text-black"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={() => setContextMenu(null)}
                    >
                        Hello World
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlowCanvas;
