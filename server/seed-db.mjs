import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { children, guardians, authorizations, exitLogs } from "../drizzle/schema.ts";

// Configuração do banco de dados
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/facial_recognition";
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada");
}

// Parse da URL de conexão
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname || "localhost",
  user: decodeURIComponent(url.username) || "root",
  password: decodeURIComponent(url.password) || "",
  database: url.pathname.slice(1) || "facial_recognition",
  port: parseInt(url.port || "3306"),
});

const db = drizzle(connection, { mode: "default" });

// Nomes para geração
const firstNames = [
  "Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena",
  "Igor", "Julia", "Kevin", "Laura", "Matheus", "Natalia", "Oscar", "Patricia",
  "Quentin", "Rafaela", "Samuel", "Tania", "Ulisses", "Vanessa", "Wagner", "Ximena",
  "Yuri", "Zoe", "Adriano", "Beatriz", "Claudio", "Daniela", "Emilio", "Fabiana"
];

const lastNames = [
  "Silva", "Santos", "Oliveira", "Costa", "Ferreira", "Gomes", "Martins", "Alves",
  "Pereira", "Carvalho", "Ribeiro", "Sousa", "Dias", "Rocha", "Barbosa", "Marques",
  "Lopes", "Nunes", "Monteiro", "Correia", "Teixeira", "Mendes", "Tavares", "Pinto"
];

const relationships = ["Pai", "Mãe", "Avó", "Avô", "Tio", "Tia", "Irmão", "Irmã"];
const classrooms = ["Turma A", "Turma B", "Turma C", "Turma D", "Turma E", "Turma F", "Turma G", "Turma H", "Turma I", "Turma J"];

// Função auxiliar para gerar nome aleatório
function getRandomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

// Função para gerar embedding facial simulado
function generateFakeEmbedding() {
  const embedding = [];
  for (let i = 0; i < 128; i++) {
    embedding.push(Math.random() * 2 - 1); // Valores entre -1 e 1
  }
  return embedding;
}

// Função para gerar CPF válido (formato apenas, não validação real)
function generateCPF() {
  let cpf = "";
  for (let i = 0; i < 11; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Função para gerar telefone
function generatePhone() {
  const area = String(Math.floor(Math.random() * 90) + 10);
  const number = String(Math.floor(Math.random() * 900000000) + 100000000);
  return `(${area}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

// Função para gerar email
function generateEmail(name) {
  const domain = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"][Math.floor(Math.random() * 4)];
  const sanitized = name.toLowerCase().replace(/\s+/g, ".");
  return `${sanitized}${Math.floor(Math.random() * 1000)}@${domain}`;
}

console.log("🌱 Iniciando seed do banco de dados...");

try {
  // Limpar dados existentes (opcional)
  console.log("🗑️  Limpando dados anteriores...");
  await connection.execute("DELETE FROM exitLogs");
  await connection.execute("DELETE FROM authorizations");
  await connection.execute("DELETE FROM children");
  await connection.execute("DELETE FROM guardians");

  // 1. Criar 150 crianças em 10 salas
  console.log("👶 Criando 150 crianças...");
  const childrenData = [];
  for (let i = 0; i < 150; i++) {
    const name = getRandomName();
    const classroom = classrooms[i % 10];
    const age = Math.floor(Math.random() * 4) + 2; // 2-5 anos
    
    childrenData.push({
      name,
      age,
      classroom,
      photoUrl: `https://via.placeholder.com/200?text=${encodeURIComponent(name)}`,
      faceEmbedding: JSON.stringify(generateFakeEmbedding()),
      parentName: getRandomName(),
      parentPhone: generatePhone(),
      parentEmail: generateEmail(name),
      notes: `Criança ${i + 1} - Sala ${classroom}`,
    });
  }

  const insertedChildren = await db.insert(children).values(childrenData);
  console.log(`✅ ${childrenData.length} crianças criadas`);

  // 2. Criar 350 responsáveis
  console.log("👨‍👩‍👧 Criando 350 responsáveis...");
  const guardiansData = [];
  for (let i = 0; i < 350; i++) {
    const name = getRandomName();
    guardiansData.push({
      name,
      cpf: generateCPF(),
      relationship: relationships[Math.floor(Math.random() * relationships.length)],
      phone: generatePhone(),
      email: generateEmail(name),
      photoUrl: `https://via.placeholder.com/200?text=${encodeURIComponent(name)}`,
      faceEmbedding: JSON.stringify(generateFakeEmbedding()),
      isActive: Math.random() > 0.1, // 90% ativos
    });
  }

  const insertedGuardians = await db.insert(guardians).values(guardiansData);
  console.log(`✅ ${guardiansData.length} responsáveis criados`);

  // 3. Criar autorizações (cada criança tem 2-3 responsáveis autorizados)
  console.log("🔐 Criando autorizações...");
  const authorizationsData = [];
  
  // Buscar IDs de crianças e responsáveis
  const [childrenRows] = await connection.query("SELECT id FROM children LIMIT 150");
  const [guardiansRows] = await connection.query("SELECT id FROM guardians LIMIT 350");
  
  const childIds = childrenRows.map(row => row.id);
  const guardianIds = guardiansRows.map(row => row.id);

  for (const childId of childIds) {
    const numGuardians = Math.floor(Math.random() * 2) + 2; // 2-3 responsáveis por criança
    const selectedGuardians = new Set();
    
    while (selectedGuardians.size < numGuardians) {
      const randomGuardian = guardianIds[Math.floor(Math.random() * guardianIds.length)];
      selectedGuardians.add(randomGuardian);
    }

    for (const guardianId of selectedGuardians) {
      authorizationsData.push({
        childId,
        guardianId,
        isAuthorized: true,
        notes: `Autorizado para buscar a criança`,
      });
    }
  }

  await db.insert(authorizations).values(authorizationsData);
  console.log(`✅ ${authorizationsData.length} autorizações criadas`);

  // 4. Criar 5 dias de registros de saída (entrada e saída)
  console.log("📋 Criando 5 dias de registros de saída...");
  const exitLogsData = [];
  
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 5); // Começar 5 dias atrás

  for (let day = 0; day < 5; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + day);

    // Cada dia: 80-120 crianças saem
    const childrenPerDay = Math.floor(Math.random() * 40) + 80;
    
    for (let i = 0; i < childrenPerDay; i++) {
      const randomChild = childIds[Math.floor(Math.random() * childIds.length)];
      
      // Buscar autorizações para esta criança
      const [authRows] = await connection.query(
        "SELECT guardianId FROM authorizations WHERE childId = ? LIMIT 3",
        [randomChild]
      );
      
      if (authRows.length > 0) {
        const randomAuth = authRows[Math.floor(Math.random() * authRows.length)];
        const guardianId = randomAuth.guardianId;

        // Hora de entrada (8h-11h)
        const entryTime = new Date(currentDate);
        entryTime.setHours(Math.floor(Math.random() * 3) + 8, Math.floor(Math.random() * 60));

        exitLogsData.push({
          childId: randomChild,
          guardianId,
          guardianPhotoUrl: `https://via.placeholder.com/200?text=Guardian${guardianId}`,
          childPhotoUrl: `https://via.placeholder.com/200?text=Child${randomChild}`,
          isAuthorized: true,
          matchConfidence: 0.85 + Math.random() * 0.15, // 0.85-1.0
          status: "approved",
          exitTime: entryTime,
          notes: "Entrada na escola",
        });

        // Hora de saída (16h-18h)
        const exitTime = new Date(currentDate);
        exitTime.setHours(Math.floor(Math.random() * 2) + 16, Math.floor(Math.random() * 60));

        exitLogsData.push({
          childId: randomChild,
          guardianId,
          guardianPhotoUrl: `https://via.placeholder.com/200?text=Guardian${guardianId}`,
          childPhotoUrl: `https://via.placeholder.com/200?text=Child${randomChild}`,
          isAuthorized: true,
          matchConfidence: 0.85 + Math.random() * 0.15,
          status: "approved",
          exitTime,
          notes: "Saída da escola",
        });
      }
    }

    console.log(`  ✅ Dia ${day + 1}: ${childrenPerDay * 2} registros (entrada/saída)`);
  }

  await db.insert(exitLogs).values(exitLogsData);
  // Inserir em lotes para evitar timeout
  const batchSize = 100;
  for (let i = 0; i < exitLogsData.length; i += batchSize) {
    const batch = exitLogsData.slice(i, i + batchSize);
    await db.insert(exitLogs).values(batch);
  }
  console.log(`✅ Total de ${exitLogsData.length} registros de saída criados`);

  console.log("\n✨ Seed concluído com sucesso!");
  console.log(`
📊 Resumo dos dados criados:
  - 150 crianças em 10 salas
  - 350 responsáveis autorizados
  - ${authorizationsData.length} autorizações (2-3 por criança)
  - ${exitLogsData.length} registros de saída (5 dias)
  `);

} catch (error) {
  console.error("❌ Erro ao fazer seed:", error);
  process.exit(1);
} finally {
  await connection.end();
}
