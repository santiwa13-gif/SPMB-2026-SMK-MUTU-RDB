import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import fs from 'fs';
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log("Reading data...");
  const data = JSON.parse(fs.readFileSync('students_data.json', 'utf-8'));
  console.log(`Found ${data.length} students. Seeding to Firestore...`);
  
  let batch = writeBatch(db);
  let count = 0;
  let total = 0;
  for (const student of data) {
    if (!student.noPendaftaran) continue;
    const docRef = doc(db, 'students', String(student.noPendaftaran));
    batch.set(docRef, student);
    count++;
    total++;
    if (count === 400) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
  }
  console.log(`Successfully seeded ${total} students.`);
}

seed().catch(console.error);
