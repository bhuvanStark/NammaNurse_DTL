require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const Resident = require('../models/Resident');

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        await Organization.deleteMany({});
        await Resident.deleteMany({});
        console.log('🗑️  Cleared existing data\n');

        // Create organization
        const org = new Organization({
            name: 'Sandhya Old Age Home',
            location: 'Jayanagar, Bangalore, Karnataka',
            email: 'admin@sandhyahome.org',
            password: 'Admin@123', // Will be hashed automatically
            phone: '+918012345678'
        });

        await org.save();
        console.log('🏥 Created organization: Sandhya Old Age Home\n');

        // 10 Diverse Indian Patients
        const residents = [
            {
                name: 'Ramesh Kumar',
                age: 72,
                gender: 'Male',
                room: 'A-101',
                conditions: ['Type 2 Diabetes', 'Hypertension'],
                medications: [
                    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
                    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }
                ],
                allergies: ['Penicillin'],
                emergencyContacts: [
                    { name: 'Suresh Kumar', relationship: 'Son', phone: '+919876543210' }
                ],
                riskLevel: 'attention',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Lakshmi Devi',
                age: 68,
                gender: 'Female',
                room: 'B-205',
                conditions: ['Osteoarthritis'],
                medications: [
                    { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Priya K', relationship: 'Daughter', phone: '+919123456780' }
                ],
                riskLevel: 'normal',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Venkatesh Rao',
                age: 75,
                gender: 'Male',
                room: 'A-103',
                conditions: ['Chronic Kidney Disease', 'Anemia'],
                medications: [
                    { name: 'Erythropoietin', dosage: '4000 units', frequency: 'Weekly' },
                    { name: 'Iron supplement', dosage: '325mg', frequency: 'Daily' }
                ],
                allergies: ['Sulfa drugs'],
                emergencyContacts: [
                    { name: 'Ravi Rao', relationship: 'Son', phone: '+919998887770' }
                ],
                riskLevel: 'critical',
                preferredLanguage: 'english'
            },
            {
                name: 'Saraswati Bai',
                age: 70,
                gender: 'Female',
                room: 'C-304',
                conditions: ['Glaucoma', 'Hypothyroidism'],
                medications: [
                    { name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily' },
                    { name: 'Latanoprost eye drops', dosage: '1 drop', frequency: 'Nightly' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Manjunath B', relationship: 'Nephew', phone: '+918888777766' }
                ],
                riskLevel: 'attention',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Gopal Shetty',
                age: 77,
                gender: 'Male',
                room: 'A-102',
                conditions: ['COPD', 'Type 2 Diabetes'],
                medications: [
                    { name: 'Albuterol inhaler', dosage: '2 puffs', frequency: 'As needed' },
                    { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily' }
                ],
                allergies: ['Aspirin'],
                emergencyContacts: [
                    { name: 'Anita Shetty', relationship: 'Daughter', phone: '+917777666655' }
                ],
                riskLevel: 'critical',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Radha Hegde',
                age: 65,
                gender: 'Female',
                room: 'B-201',
                conditions: ['Mild Dementia'],
                medications: [
                    { name: 'Donepezil', dosage: '10mg', frequency: 'Once daily' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Shyam Hegde', relationship: 'Husband', phone: '+916666555544' }
                ],
                riskLevel: 'normal',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Krishnan Iyer',
                age: 80,
                gender: 'Male',
                room: 'C-301',
                conditions: ['Heart Failure', 'Hypertension'],
                medications: [
                    { name: 'Furosemide', dosage: '40mg', frequency: 'Once daily' },
                    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
                ],
                allergies: ['Codeine'],
                emergencyContacts: [
                    { name: 'Lakshmi Iyer', relationship: 'Wife', phone: '+915555444433' }
                ],
                riskLevel: 'critical',
                preferredLanguage: 'english'
            },
            {
                name: 'Sumitra Nair',
                age: 69,
                gender: 'Female',
                room: 'A-104',
                conditions: ['Osteoporosis'],
                medications: [
                    { name: 'Calcium + Vitamin D', dosage: '600mg', frequency: 'Twice daily' },
                    { name: 'Alendronate', dosage: '70mg', frequency: 'Weekly' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Vijay Nair', relationship: 'Son', phone: '+914444333322' }
                ],
                riskLevel: 'normal',
                preferredLanguage: 'english'
            },
            {
                name: 'Manjunath Gowda',
                age: 73,
                gender: 'Male',
                room: 'B-203',
                conditions: ['Prostate Enlargement', 'Type 2 Diabetes'],
                medications: [
                    { name: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily' },
                    { name: 'Glipizide', dosage: '5mg', frequency: 'Twice daily' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Deepa Gowda', relationship: 'Daughter-in-law', phone: '+913333222211' }
                ],
                riskLevel: 'attention',
                preferredLanguage: 'kannada'
            },
            {
                name: 'Parvati Amma',
                age: 71,
                gender: 'Female',
                room: 'C-302',
                conditions: ['Cataract', 'Hypertension'],
                medications: [
                    { name: 'Atenolol', dosage: '50mg', frequency: 'Once daily' }
                ],
                allergies: [],
                emergencyContacts: [
                    { name: 'Mohan K', relationship: 'Son', phone: '+912222111100' }
                ],
                riskLevel: 'normal',
                preferredLanguage: 'kannada'
            }
        ];

        // Add orgId to each resident
        const residentsWithOrg = residents.map(r => ({ ...r, orgId: org._id }));

        // Insert residents
        const createdResidents = await Resident.insertMany(residentsWithOrg);

        console.log('👥 Created 10 residents:\n');
        createdResidents.forEach((r, i) => {
            const riskIcon = r.riskLevel === 'critical' ? '🔴' : r.riskLevel === 'attention' ? '🟡' : '🟢';
            console.log(`   ${i + 1}. ${riskIcon} ${r.name} (${r.age}y, ${r.gender}) - Room ${r.room}`);
            console.log(`      Risk: ${r.riskLevel.toUpperCase()}, Language: ${r.preferredLanguage}`);
            console.log(`      Conditions: ${r.conditions.join(', ')}\n`);
        });

        console.log('='.repeat(60));
        console.log('✅ Database seeding completed successfully!\n');
        console.log('📋 Login Credentials:');
        console.log('   Email: admin@sandhyahome.org');
        console.log('   Password: Admin@123\n');
        console.log('🎯 Next steps:');
        console.log('   1. Copy .env.example to .env');
        console.log('   2. Add your GEMINI_API_KEY to .env');
        console.log('   3. Run: npm start');
        console.log('='.repeat(60) + '\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
