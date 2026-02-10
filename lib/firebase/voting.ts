import { db } from '@/lib/firebase/client';
import { doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';

export const toggleVote = async (ideaId: string, userId: string) => {
    const ideaRef = doc(db, 'ideas', ideaId);
    const voteRef = doc(db, 'votes', `${ideaId}_${userId}`);

    try {
        await runTransaction(db, async (transaction) => {
            const voteDoc = await transaction.get(voteRef);

            if (voteDoc.exists()) {
                // Remove vote
                transaction.delete(voteRef);
                transaction.update(ideaRef, {
                    voteCount: increment(-1)
                });
            } else {
                // Add vote
                transaction.set(voteRef, {
                    ideaId,
                    userId,
                    createdAt: serverTimestamp()
                });
                transaction.update(ideaRef, {
                    voteCount: increment(1)
                });
            }
        });
    } catch (error) {
        console.error("Vote transaction failed: ", error);
        throw error;
    }
};
