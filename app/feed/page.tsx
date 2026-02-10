'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useState, useEffect } from 'react';
import type { Idea } from '@/lib/types';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { IdeaDetailModal } from '@/components/features/common/IdeaDetailModal';

export default function FeedPage() {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
    const [loading, setLoading] = useState(true);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

    // Real-time ideas listener
    useEffect(() => {
        const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
                setIdeas(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching ideas:", error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Hydrate user votes
    useEffect(() => {
        if (!user || ideas.length === 0) return;

        const fetchUserVotes = async () => {
            const newVotes: Record<string, 'up' | 'down'> = {};
            await Promise.all(ideas.map(async (idea) => {
                // TODO: Optimize vote fetching (batch/cache)
                const voteRef = doc(db, 'ideas', idea.id, 'votes', user.uid);
                const voteSnap = await getDoc(voteRef);
                if (voteSnap.exists()) {
                    newVotes[idea.id] = voteSnap.data().type;
                }
            }));
            setUserVotes(prev => ({ ...prev, ...newVotes }));
        };

        // TODO: Optimize to only fetch for new ideas
        fetchUserVotes();
    }, [user?.uid, ideas.length]);


    const handleVote = async (e: React.MouseEvent, idea: Idea, type: 'up' | 'down') => {
        e.stopPropagation();
        if (!user) {
            alert('Please sign in to vote');
            return;
        }

        const currentVote = userVotes[idea.id];
        const currentScore = idea.score || 0;

        let newScore = currentScore;
        let newUserVote: 'up' | 'down' | undefined = type;

        // Optimistic UI update
        if (currentVote === type) {
            // Toggle off
            newScore = type === 'up' ? currentScore - 1 : currentScore + 1;
            newUserVote = undefined;
        } else if (currentVote) {
            // Switch vote
            newScore = type === 'up' ? currentScore + 2 : currentScore - 2;
        } else {
            // New vote
            newScore = type === 'up' ? currentScore + 1 : currentScore - 1;
        }

        setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, score: newScore } : i));

        setUserVotes(prev => {
            const copy = { ...prev };
            if (newUserVote) copy[idea.id] = newUserVote;
            else delete copy[idea.id];
            return copy;
        });

        try {
            await runTransaction(db, async (transaction) => {
                const ideaRef = doc(db, 'ideas', idea.id);
                const voteRef = doc(db, 'ideas', idea.id, 'votes', user.uid);

                const voteDoc = await transaction.get(voteRef);
                const ideaDoc = await transaction.get(ideaRef);

                if (!ideaDoc.exists()) throw "Idea does not exist!";

                let dbScore = ideaDoc.data().score || 0;
                const voteData = voteDoc.exists() ? voteDoc.data() : null;

                if (voteData && voteData.type === type) {
                    transaction.delete(voteRef);
                    dbScore = type === 'up' ? dbScore - 1 : dbScore + 1;
                } else {
                    transaction.set(voteRef, { type, timestamp: new Date() });
                    if (voteData) {
                        dbScore = type === 'up' ? dbScore + 2 : dbScore - 2;
                    } else {
                        dbScore = type === 'up' ? dbScore + 1 : dbScore - 1;
                    }
                }

                transaction.update(ideaRef, { score: dbScore });
            });
        } catch (err) {
            console.error(err);
            alert('Vote failed. Reverting...');
        }
    };


    const IdeaCard = ({ idea }: { idea: Idea }) => {
        const voteType = userVotes[idea.id];
        return (
            <div
                onClick={() => setSelectedIdea(idea)}
                className="group"
                style={{
                    // Removed marginBottom since grid gap handles spacing
                    breakInside: 'avoid',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.3)';
                    e.currentTarget.style.borderColor = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--muted)',
                        background: 'var(--border)',
                        padding: '6px 10px',
                        borderRadius: '6px'
                    }}>
                        {idea.categoryId}
                    </span>

                    <div title={idea.status} style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: idea.status === 'Done' ? '#10B981' : idea.status === 'In Progress' ? '#F59E0B' : 'var(--border)',
                        boxShadow: idea.status === 'In Progress' ? '0 0 8px #F59E0B' : 'none'
                    }} />
                </div>


                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                    }}>
                        {idea.title}
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--muted)',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {idea.problem}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                    marginTop: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--background)', padding: '4px', borderRadius: '99px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={(e) => handleVote(e, idea, 'up')}
                            style={{
                                padding: '6px',
                                borderRadius: '50%',
                                border: 'none',
                                background: voteType === 'up' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                color: voteType === 'up' ? '#3B82F6' : 'var(--muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ThumbsUp size={16} fill={voteType === 'up' ? "currentColor" : "none"} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', minWidth: '20px', textAlign: 'center' }}>
                            {idea.score || 0}
                        </span>
                        <button
                            onClick={(e) => handleVote(e, idea, 'down')}
                            style={{
                                padding: '6px',
                                borderRadius: '50%',
                                border: 'none',
                                background: voteType === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                color: voteType === 'down' ? '#EF4444' : 'var(--muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ThumbsDown size={16} fill={voteType === 'down' ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                        {idea.authorName?.split(' ')[0]}
                    </div>
                </div>
            </div >
        );
    };

    return (
        <div style={{ padding: '80px 24px 120px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '48px', maxWidth: '600px' }}>
                <h1 className="animate-in" style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: '1',
                    marginBottom: '24px',
                    color: 'var(--foreground)'
                }}>
                    INTELLIGENCE <br />
                    <span style={{ color: 'var(--muted)' }}>FEED</span>
                </h1>
            </div>

            {/* Error State */}
            {/* If error handling was stored in state, show it here. For now, rely on console or empty state */}

            {/* Loading State */}
            {loading && (
                <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Loading Intelligence...</div>
            )}

            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px',
                }}>
                    {ideas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            )}

            {!loading && ideas.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                    No signals detected. Submit an idea to start.
                </div>
            )}

            {selectedIdea && (
                <IdeaDetailModal idea={selectedIdea} isOpen={!!selectedIdea} onClose={() => setSelectedIdea(null)} />
            )}

        </div>
    );
}
