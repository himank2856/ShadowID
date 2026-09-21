/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Interactive Evidence Graph & Accessible Tabular Alternative
 * Compliant with Prompt 10
 */

import React, { useState } from 'react';
import { EvidenceNode, EvidenceEdge } from '../types.ts';
import { Network, List, Filter, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface EvidenceGraphProps {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ nodes, edges }) => {
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(nodes[0] || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredNodes = filterCategory === 'all'
    ? nodes
    : nodes.filter((n) => n.category === filterCategory);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const getNodeColor = (category: EvidenceNode['category']) => {
    switch (category) {
      case 'identity':
        return '#A3E635'; // Signal Lime
      case 'telecom':
        return '#EF4444'; // Red for phone leaks
      case 'handle':
        return '#38BDF8'; // Cyan for handles
      case 'document':
        return '#F59E0B'; // Amber for documents
      case 'employer':
        return '#C084FC'; // Purple for employer
      default:
        return '#94A3B8';
    }
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#38BDF8]" />
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Exposure Correlation Graph
            </h3>
            <span className="text-[11px] font-mono-code bg-[#172A42] text-[#38BDF8] px-2 py-0.5 rounded">
              {filteredNodes.length} Nodes • {filteredEdges.length} Edges
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Demonstrates deterministic links discovered across submitted evidence tokens.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#07111F] border border-[#1E3A5F] rounded px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-[#94A3B8]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-[#F1F5F9] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#07111F]">All Vectors</option>
              <option value="identity" className="bg-[#07111F]">Identity</option>
              <option value="handle" className="bg-[#07111F]">Handles</option>
              <option value="telecom" className="bg-[#07111F]">Telecom Leaks</option>
              <option value="employer" className="bg-[#07111F]">Workplace</option>
              <option value="document" className="bg-[#07111F]">Document Tokens</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[#07111F] border border-[#1E3A5F] rounded p-0.5 text-xs">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'graph' ? 'bg-[#172A42] text-[#A3E635] font-semibold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <Network className="w-3 h-3" />
              Graph
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-[#172A42] text-[#A3E635] font-semibold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <List className="w-3 h-3" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'graph' ? (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Interactive SVG Canvas */}
          <div className="lg:col-span-2 relative bg-[#07111F] rounded border border-[#1E3A5F] h-[340px] overflow-hidden">
            <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

            <svg className="w-full h-full" viewBox="0 0 500 400">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8" opacity="0.7" />
                </marker>
              </defs>

              {/* Render Edges */}
              {filteredEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const x1 = sourceNode.x || 100;
                const y1 = sourceNode.y || 100;
                const x2 = targetNode.x || 300;
                const y2 = targetNode.y || 200;

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={edge.relationType === 'contradicts' ? '#EF4444' : '#1E3A5F'}
                      strokeWidth={edge.relationType === 'contradicts' ? 2 : 1.5}
                      strokeDasharray={edge.relationType === 'contradicts' ? '4 3' : 'none'}
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill={edge.relationType === 'contradicts' ? '#EF4444' : '#64748B'}
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      className="select-none bg-[#07111F]"
                    >
                      {edge.label} ({edge.certainty}%)
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.category);
                const x = node.x || 200;
                const y = node.y || 150;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 18 : 14}
                      fill="#0F1D2E"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                    <circle cx={x} cy={y} r={4} fill={color} />
                    <text
                      x={x}
                      y={y + 24}
                      fill="#F1F5F9"
                      fontSize="10"
                      fontFamily="Space Grotesk"
                      fontWeight="600"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Canvas Legend */}
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[10px] font-mono-code bg-[#0F1D2E]/90 p-1.5 rounded border border-[#1E3A5F]">
              <span className="flex items-center gap-1 text-[#A3E635]">
                <span className="w-2 h-2 rounded-full bg-[#A3E635]" /> Identity
              </span>
              <span className="flex items-center gap-1 text-[#38BDF8]">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Handle
              </span>
              <span className="flex items-center gap-1 text-[#EF4444]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Telecom
              </span>
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Document
              </span>
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="bg-[#07111F] rounded border border-[#1E3A5F] p-4 flex flex-col justify-between">
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
                  <span className="text-[11px] font-mono-code uppercase text-[#38BDF8]">
                    Vector Inspector
                  </span>
                  <span
                    className="text-[10px] font-mono-code px-1.5 py-0.5 rounded border uppercase"
                    style={{
                      borderColor: getNodeColor(selectedNode.category),
                      color: getNodeColor(selectedNode.category),
                    }}
                  >
                    {selectedNode.category}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-display font-bold text-[#F1F5F9]">
                    {selectedNode.label}
                  </h4>
                  <div className="text-xs font-mono-code text-[#38BDF8] mt-0.5">
                    {selectedNode.val}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#172A42]">
                    <span className="text-[#94A3B8]">Risk Weight:</span>
                    <span className="font-mono-code font-bold text-[#EF4444]">
                      {selectedNode.riskWeight} / 10
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172A42]">
                    <span className="text-[#94A3B8]">Evidence Provenance:</span>
                    <span className="text-[#F1F5F9] font-medium">{selectedNode.source}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172A42]">
                    <span className="text-[#94A3B8]">Connected Edges:</span>
                    <span className="font-mono-code text-[#A3E635]">
                      {edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length} links
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#94A3B8]">
                Click on any node in the canvas to inspect evidence provenance.
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#172A42] text-[11px] text-[#64748B]">
              Deterministic matching rule: Nodes represent strictly verified supplied evidence. No uncorroborated links allowed.
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Tabular Representation */
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07111F] text-[#94A3B8] font-mono-code uppercase text-[11px] border-b border-[#1E3A5F]">
              <tr>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Entity Label</th>
                <th className="px-3 py-2.5">Extracted Value</th>
                <th className="px-3 py-2.5">Provenance Source</th>
                <th className="px-3 py-2.5 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0E2338]">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-[#172A42]/50">
                  <td className="px-3 py-2.5 font-mono-code">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] border uppercase"
                      style={{
                        borderColor: getNodeColor(node.category),
                        color: getNodeColor(node.category),
                      }}
                    >
                      {node.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-[#F1F5F9]">{node.label}</td>
                  <td className="px-3 py-2.5 font-mono-code text-[#38BDF8]">{node.val}</td>
                  <td className="px-3 py-2.5 text-[#94A3B8]">{node.source}</td>
                  <td className="px-3 py-2.5 text-right font-mono-code font-bold text-[#EF4444]">
                    {node.riskWeight}/10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
