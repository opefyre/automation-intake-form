'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { CATEGORIES, DEPARTMENTS } from '@/lib/types/schema';

export default function CheckFirestore() {
    const [logs, setLogs] = useState<string[]>([]);

    const log = (msg: string) => setLogs(p => [...p, msg]);

    useEffect(() => {
        const checkAndSeed = async () => {
            log('Starting Firestore Check...');

            try {
                // Check Categories
                const catSnap = await getDocs(collection(db, 'categories'));
                log(`Found ${catSnap.size} categories.`);

                if (catSnap.empty) {
                    log('Seeding Categories from schema.ts...');
                    for (const cat of CATEGORIES) {
                        await setDoc(doc(db, 'categories', cat), { label: cat, active: true });
                    }
                    log('Seeding Categories Complete.');
                }

                // Check Departments
                const deptSnap = await getDocs(collection(db, 'departments'));
                log(`Found ${deptSnap.size} departments.`);

                if (deptSnap.empty) {
                    log('Seeding Departments from schema.ts...');
                    for (const dept of DEPARTMENTS) {
                        await setDoc(doc(db, 'departments', dept), { label: dept, active: true });
                    }
                    log('Seeding Departments Complete.');
                }

                log('Check Complete.');

            } catch (e: any) {
                log(`Error: ${e.message}`);
            }
        };

        checkAndSeed();
    }, []);

    return (
        <div style={{ padding: 40, background: '#050505', color: '#0f0', fontFamily: 'monospace' }}>
            <h1>System Check</h1>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
    );
}
