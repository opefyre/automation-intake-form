import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Idea } from '@/lib/types';
import { X, Calendar, User, Tag, Clock, CheckCircle, Target, ArrowRight, Paperclip, Download, FileIcon } from 'lucide-react';

interface IdeaDetailModalProps {
    idea: Idea;
    isOpen: boolean;
    onClose: () => void;
}

export const IdeaDetailModal = ({ idea, isOpen, onClose }: IdeaDetailModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                margin: '24px'
            }} onClick={e => e.stopPropagation()}>


                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--card)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    flexShrink: 0
                }}>
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', background: 'var(--accent)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {idea.status}
                        </span>
                        <span style={{ fontSize: '12px', background: 'var(--border)', color: 'var(--muted)', padding: '4px 8px', borderRadius: '4px' }}>
                            {idea.categoryId}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                    }}>
                        {idea.title}
                    </h2>
                </div>


                <div style={{
                    padding: '32px',
                    overflowY: 'auto',
                    display: 'grid',
                    gap: '32px'
                }}>

                    <section>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>The Problem</h3>
                        <p style={{
                            fontSize: '16px',
                            color: 'var(--foreground)',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }}>{idea.problem}</p>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>Desired Outcome</h3>
                        <p style={{
                            fontSize: '16px',
                            color: 'var(--foreground)',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }}>{idea.desiredOutcome}</p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', background: 'var(--card-hover)', padding: '24px', borderRadius: '12px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', display: 'block' }}>Department</label>
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{idea.department}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', display: 'block' }}>Impact Type</label>
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{idea.impactType}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', display: 'block' }}>Est. Benefit</label>
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{idea.estimatedBenefit || 'N/A'}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', display: 'block' }}>Author</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {idea.authorPhoto && <img src={idea.authorPhoto} style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{idea.authorName}</span>
                            </div>
                        </div>
                    </div>


                    {idea.attachments && idea.attachments.length > 0 && (
                        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Paperclip size={14} /> Attachments
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {idea.attachments.map((file, i) => (
                                    <a
                                        key={i}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            background: 'var(--card)', border: '1px solid var(--border)',
                                            padding: '12px 16px', borderRadius: '8px',
                                            textDecoration: 'none', color: 'var(--foreground)',
                                            fontSize: '13px', transition: 'all 0.2s',
                                            maxWidth: '100%'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--accent)'
                                        }}>
                                            <FileIcon size={18} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                                            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                            <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                                                {Math.round(file.size / 1024)} KB
                                            </span>
                                        </div>
                                        <div style={{
                                            padding: '6px',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--muted)'
                                        }}>
                                            <Download size={16} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

            </div>
        </div>,
        document.body
    );
};
