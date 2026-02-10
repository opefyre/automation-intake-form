'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db, storage } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Loader2, Clock, DollarSign, Activity, Paperclip, X as XIcon, FileIcon } from 'lucide-react';
import { IdeaFormData, CATEGORIES, DEPARTMENTS } from '@/lib/types/schema';


const STEPS = [
    { id: 'intro', title: 'Start' },
    { id: 'title', title: 'The Spark' },
    { id: 'problem', title: 'The Problem' },
    { id: 'metrics', title: 'The Data' },
    { id: 'solution', title: 'The Vision' },
    { id: 'review', title: 'Review' }
];

export const SubmitWizard = () => {
    const { user, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState<Partial<IdeaFormData>>({});


    const [categories, setCategories] = useState<string[]>(CATEGORIES);
    const [departments, setDepartments] = useState<string[]>(DEPARTMENTS);



    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('label')));
                const deptSnap = await getDocs(query(collection(db, 'departments'), orderBy('label')));

                if (!catSnap.empty) {
                    setCategories(catSnap.docs.map(d => d.data().label));
                }
                if (!deptSnap.empty) {
                    setDepartments(deptSnap.docs.map(d => d.data().label));
                }
            } catch (e) {
                console.warn('Failed to load dynamic config, utilizing defaults:', e);
            }
        };
        fetchConfig();
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    const updateField = (field: keyof IdeaFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user) {
            signInWithGoogle();
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload Files if any
            let attachments: { name: string; url: string; type: string; size: number }[] = [];
            if (files.length > 0) {
                setUploadingFiles(true);
                const uploadPromises = files.map(async (file) => {
                    const storageRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(snapshot.ref);
                    return {
                        name: file.name,
                        url: url,
                        type: file.type,
                        size: file.size
                    };
                });
                attachments = await Promise.all(uploadPromises);
                setUploadingFiles(false);
            }

            await addDoc(collection(db, 'ideas'), {
                ...formData,
                status: 'Submitted',
                voteCount: 0,
                createdAt: serverTimestamp(),
                authorName: user.displayName || 'Anonymous',
                authorId: user.uid,
                authorPhoto: user.photoURL,
                impactType: formData.impactType || 'Other',
                aiAutomationFit: formData.aiAutomationFit || 'Unsure',
                attachments: attachments
            });
            router.push('/feed');
        } catch (e) {
            console.error('Error submitting idea:', e);
            alert('Failed to submit. Please try again.');
            setIsSubmitting(false);
            setUploadingFiles(false);
        }
    };


    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="animate-in">
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, color: 'var(--foreground)' }}>
                            Submit an Idea <br />
                            <span style={{ color: 'var(--accent)' }}>Drive Change.</span>
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: 'var(--muted)', marginBottom: '48px', maxWidth: '500px' }}>
                            Every major improvement starts with a single observation. Let's document yours.
                        </p>
                        <button
                            onClick={handleNext}
                            style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '16px 32px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            Start <ChevronRight size={18} />
                        </button>
                    </div>
                );

            case 1:
                return (
                    <div className="animate-in">
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Step 1: The Context
                        </label>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', color: 'var(--foreground)' }}>
                            What & Where?
                        </h2>

                        <div style={{ marginBottom: '32px' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Name your idea..."
                                value={formData.title || ''}
                                onChange={e => updateField('title', e.target.value)}
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)', fontSize: '2rem', padding: '16px 0', color: 'var(--foreground)', outline: 'none' }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Department</label>
                            <select
                                value={formData.department || ''}
                                onChange={e => updateField('department', e.target.value)}
                                style={{ width: '100%', background: 'var(--card)', color: 'var(--foreground)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none' }}
                            >
                                <option value="">Select Department...</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Category</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => updateField('categoryId', cat)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '9999px', fontSize: '13px',
                                            border: formData.categoryId === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                                            background: formData.categoryId === cat ? 'var(--accent)' : 'transparent',
                                            color: formData.categoryId === cat ? '#FFFFFF' : 'var(--muted)',
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!formData.title || !formData.categoryId || !formData.department}
                            style={{ opacity: (!formData.title || !formData.categoryId || !formData.department) ? 0.5 : 1, background: 'var(--foreground)', color: 'var(--background)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="animate-in">
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Step 2: The Pain Point
                        </label>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--foreground)' }}>
                            Describe the problem.
                        </h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                            What is broken, slow, or inefficient? Who does it affect?
                        </p>

                        <textarea
                            autoFocus
                            placeholder="Currently, the process involves..."
                            value={formData.problem || ''}
                            onChange={e => updateField('problem', e.target.value)}
                            style={{ width: '100%', minHeight: '200px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', fontSize: '1.125rem', color: 'var(--foreground)', lineHeight: '1.6', outline: 'none', resize: 'vertical' }}
                        />

                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            <button onClick={handleBack} style={{ background: 'transparent', color: 'var(--muted)', border: 'none', cursor: 'pointer', padding: '12px' }}>Back</button>
                            <button
                                onClick={handleNext}
                                disabled={!formData.problem || formData.problem.length < 20}
                                style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: (!formData.problem || formData.problem.length < 20) ? 0.5 : 1 }}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="animate-in">
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Step 3: The Data
                        </label>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', color: 'var(--foreground)' }}>
                            Quantify the impact.
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Frequency */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Frequency</label>
                                <select
                                    value={formData.processFrequency || ''}
                                    onChange={e => updateField('processFrequency', e.target.value)}
                                    style={{ width: '100%', background: 'var(--card)', color: 'var(--foreground)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none' }}
                                >
                                    <option value="">Select...</option>
                                    {['Hourly', 'Daily', 'Weekly', 'Monthly', 'Ad-hoc'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Time Spent */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Hours/Week (Est.)</label>
                                <input
                                    type="number"
                                    onChange={e => updateField('timeSpentHoursPerWeek', Number(e.target.value))}
                                    style={{ width: '100%', background: 'var(--card)', color: 'var(--foreground)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                            </div>
                        </div>


                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Attachments (Optional)</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; }}
                                onDrop={e => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    if (e.dataTransfer.files) {
                                        setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <Paperclip size={24} color="var(--muted)" />
                                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Click to upload or drag & drop files</span>
                                </label>
                            </div>


                            {files.length > 0 && (
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {files.map((file, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileIcon size={14} color="var(--accent)" />
                                                <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>{file.name}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>({(file.size / 1024).toFixed(0)} KB)</span>
                                            </div>
                                            <button onClick={() => removeFile(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                                                <XIcon size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            <button onClick={handleBack} style={{ background: 'transparent', color: 'var(--muted)', border: 'none', cursor: 'pointer', padding: '12px' }}>Back</button>
                            <button
                                onClick={handleNext}
                                disabled={!formData.processFrequency}
                                style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: !formData.processFrequency ? 0.5 : 1 }}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="animate-in">
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Step 4: The Vision
                        </label>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', color: 'var(--foreground)' }}>
                            What is the desired outcome?
                        </h2>

                        <textarea
                            placeholder="We want to automate this to reduce errors..."
                            value={formData.desiredOutcome || ''}
                            onChange={e => updateField('desiredOutcome', e.target.value)}
                            style={{ width: '100%', minHeight: '120px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', fontSize: '1.125rem', color: 'var(--foreground)', lineHeight: '1.6', outline: 'none', resize: 'vertical', marginBottom: '32px' }}
                        />

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--muted)', fontSize: '14px' }}>Estimated Benefit (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Save $50k/year or reduce churn by 10%"
                                value={formData.estimatedBenefit || ''}
                                onChange={e => updateField('estimatedBenefit', e.target.value)}
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', fontSize: '1.125rem', padding: '12px 0', color: 'var(--foreground)', outline: 'none' }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '16px', color: 'var(--muted)' }}>Primary Impact Type</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {['Time', 'Cost', 'Quality', 'Risk', 'Revenue', 'CX', 'Other'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateField('impactType', type)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '9999px',
                                            border: formData.impactType === type ? '1px solid var(--accent)' : '1px solid var(--border)',
                                            background: formData.impactType === type ? 'var(--accent)' : 'transparent',
                                            color: formData.impactType === type ? '#fff' : 'var(--muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            <button onClick={handleBack} style={{ background: 'transparent', color: 'var(--muted)', border: 'none', cursor: 'pointer', padding: '12px' }}>Back</button>
                            <button
                                onClick={handleNext}
                                disabled={!formData.desiredOutcome}
                                style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: !formData.desiredOutcome ? 0.5 : 1 }}
                            >
                                Review <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="animate-in">
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Final Step
                        </label>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', color: 'var(--foreground)' }}>
                            Ready to launch?
                        </h2>

                        <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '8px', marginBottom: '32px', border: '1px solid var(--border)', maxHeight: '50vh', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>{formData.title}</h3>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--accent)', color: 'white', fontSize: '12px' }}>{formData.categoryId}</span>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--border)', color: 'var(--muted)', fontSize: '12px' }}>{formData.department}</span>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--border)', color: 'var(--muted)', fontSize: '12px' }}>{formData.processFrequency}</span>
                            </div>

                            <h4 style={{ color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase', marginTop: '16px' }}>Problem</h4>
                            <p style={{ color: 'var(--foreground)', marginBottom: '16px' }}>{formData.problem}</p>

                            <h4 style={{ color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Outcome</h4>
                            <p style={{ color: 'var(--foreground)', marginBottom: '16px' }}>{formData.desiredOutcome}</p>

                            {formData.estimatedBenefit && (
                                <>
                                    <h4 style={{ color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Est. Benefit</h4>
                                    <p style={{ color: 'var(--foreground)' }}>{formData.estimatedBenefit}</p>
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <button onClick={handleBack} style={{ background: 'transparent', color: 'var(--muted)', border: 'none', cursor: 'pointer', padding: '12px' }}>Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '16px 48px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '1.125rem', opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? <><Loader2 className="animate-spin" /> {uploadingFiles ? 'Uploading Files...' : 'Launching...'}</> : 'Launch Idea'}
                            </button>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '48px 24px 100px',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            {renderStep()}
        </div>
    );
};
