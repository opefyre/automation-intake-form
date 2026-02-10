import { db, storage } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { IdeaFormData } from '@/lib/types/schema';
import { User } from 'firebase/auth';

export const submitIdea = async (data: IdeaFormData, user: User) => {
    try {
        const ideaData = {
            ...data,
            // Metadata
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            },
            // Stats
            voteCount: 0,
            status: 'Submitted',
            reviewStage: 'Backlog',
            hotScore: 0,
            // Ensure numeric is saved as number
            timeSpentHoursPerWeek: data.timeSpentHoursPerWeek ? Number(data.timeSpentHoursPerWeek) : null
        };

        const docRef = await addDoc(collection(db, 'ideas'), ideaData);
        return docRef.id;
    } catch (error) {
        console.error("Error submitting idea:", error);
        throw error;
    }
};

export const updateIdeaStatus = async (ideaId: string, status: string, notes?: string) => {
    try {
        const ideaRef = doc(db, 'ideas', ideaId);
        await updateDoc(ideaRef, {
            status,
            reviewNotes: notes || '',
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};
