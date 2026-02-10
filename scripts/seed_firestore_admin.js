
const admin = require('firebase-admin');
const serviceAccount = require('../../automation-intake-form-4a1294840001.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const CATEGORIES = [
    'Process & Policy Improvement',
    'Productivity & Collaboration',
    'Data Quality & Reporting',
    'Customer Experience',
    'Cost Optimization',
    'Risk, Compliance & Controls',
    'AI Adoption Opportunities',
    'Automation Candidates',
    'Knowledge Management',
    'Internal Tools',
    'Infrastructure & DevOps'
];

const DEPARTMENTS = [
    'Customer Support & CX Ops',
    'Logistics & Fleet Operations',
    'Warehouse & Fulfillment',
    'Commercial / Sales',
    'Marketing & Growth',
    'Product / UX',
    'Finance & Accounting',
    'Procurement',
    'HR & People Operations',
    'Legal',
    'IT & Security',
    'Corporate Services'
];

async function seed() {
    console.log('Seeding Firestore...');

    const batch = db.batch();

    // categories
    for (const cat of CATEGORIES) {
        const ref = db.collection('categories').doc(cat);
        batch.set(ref, { label: cat, active: true }, { merge: true });
    }

    // departments
    for (const dept of DEPARTMENTS) {
        const ref = db.collection('departments').doc(dept);
        batch.set(ref, { label: dept, active: true }, { merge: true });
    }

    await batch.commit();
    console.log('Seeding Complete.');
}

seed().catch(console.error);
