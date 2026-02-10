'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Idea } from '@/lib/types';
import { Loader2, User, Layout } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor
} from '@dnd-kit/core';
import { IdeaDetailModal } from '@/components/features/common/IdeaDetailModal';

const COLUMNS = [
    { id: 'Submitted', label: 'In Review', color: '#3B82F6', description: 'New ideas awaiting triage' },
    { id: 'In Progress', label: 'Building', color: '#F59E0B', description: 'Active development' },
    { id: 'Approved', label: 'Approved', color: '#10B981', description: 'Ready for implementation' },
    { id: 'Rejected', label: 'Rejected', color: '#EF4444', description: 'Closed or deprioritized' },
    { id: 'Done', label: 'Shipped', color: '#8B5CF6', description: 'Live in production' }
];

// --- Draggable Card Component ---
const DraggableCard = ({ idea, onClick }: { idea: Idea; onClick: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: idea.id,
        data: { idea }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        opacity: isDragging ? 0.5 : 1
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'grab',
                position: 'relative',
                marginBottom: '12px',
                boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
                ...style
            }}
            {...listeners}
            {...attributes}
            onClick={onClick}
        >
            {/* Header: Category & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                <span style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    background: 'var(--border)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    maxWidth: '60%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {idea.categoryId}
                </span>
                {idea.createdAt && (
                    <span style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(idea.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>

            <h4 style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px', lineHeight: '1.4', marginBottom: '8px', wordBreak: 'break-word' }}>
                {idea.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={10} color="var(--muted)" />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{idea.authorName?.split(' ')[0] || 'Anon'}</span>
            </div>
        </div>
    );
};

// --- Droppable Column Component ---
const DroppableColumn = ({ col, ideas, onCardClick }: { col: any, ideas: Idea[], onCardClick: (idea: Idea) => void }) => {
    const { setNodeRef } = useDroppable({ id: col.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                minWidth: '320px',
                width: '320px',
                background: 'rgba(var(--background), 0.5)', // slightly transparent
                borderRadius: '16px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden' // Ensure header stays put
            }}
        >
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                        <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '14px' }}>{col.label}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '99px' }}>{ideas.length}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{col.description}</p>
            </div>

            {/* Ideas List Area - Scrollable */}
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
                {ideas.map(idea => (
                    <DraggableCard key={idea.id} idea={idea} onClick={() => onCardClick(idea)} />
                ))}
                {ideas.length === 0 && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', gap: '8px' }}>
                        <Layout size={20} style={{ opacity: 0.2 }} />
                        <span style={{ fontSize: '12px', fontStyle: 'italic' }}>Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Board Component ---
export const AdminKanban = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

    // Sensors configuration with activation constraint
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Requires 8px movement before drag starts, enabling click events
            },
        }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
            setIdeas(data);
        });
        return () => unsubscribe();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const newStatus = over.id as Idea['status'];
            if (COLUMNS.some(c => c.id === newStatus)) {
                setIdeas(prev => prev.map(i => i.id === active.id ? { ...i, status: newStatus } : i));
                await updateDoc(doc(db, 'ideas', active.id as string), { status: newStatus });
            }
        }
    };

    const activeIdea = activeId ? ideas.find(i => i.id === activeId) : null;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{
                display: 'flex',
                gap: '16px',
                height: '100%',
                overflowX: 'auto',
                overflowY: 'hidden', // Prevent vertical scroll on container
                padding: '0 24px 24px',
                alignItems: 'flex-start',
                whiteSpace: 'nowrap' // Help force horizontal layout
            }}>
                {COLUMNS.map(col => (
                    <DroppableColumn
                        key={col.id}
                        col={col}
                        ideas={ideas.filter(i => i.status === col.id)}
                        onCardClick={setSelectedIdea}
                    />
                ))}
                {/* Spacer for right padding */}
                <div style={{ minWidth: '1px', height: '1px' }} />
            </div>

            <DragOverlay>
                {activeIdea ? (
                    <div style={{ background: 'var(--card)', border: '1px solid #3B82F6', borderRadius: '12px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '320px' }}>
                        <h4 style={{ color: 'var(--foreground)', fontWeight: 600 }}>{activeIdea.title}</h4>
                    </div>
                ) : null}
            </DragOverlay>

            {selectedIdea && (
                <IdeaDetailModal idea={selectedIdea} isOpen={!!selectedIdea} onClose={() => setSelectedIdea(null)} />
            )}
        </DndContext>
    );
};
