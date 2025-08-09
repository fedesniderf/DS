// DEBUGGING: Verificar estado de usuario en la app
// Ejecutar esto en la consola del navegador

console.log("🔍 DEBUGGING USUARIO:");
console.log("===================");

// 1. Verificar localStorage
const savedUser = localStorage.getItem('ds_user');
console.log("📦 localStorage 'ds_user':", savedUser);

if (savedUser) {
  try {
    const user = JSON.parse(savedUser);
    console.log("✅ Usuario parseado:", user);
    console.log("📊 ID del usuario:", user.id);
    console.log("📊 Email:", user.email);
    console.log("📊 Nombre completo:", user.fullName);
    console.log("📊 Rol:", user.role);
  } catch (e) {
    console.error("❌ Error parseando usuario:", e);
  }
} else {
  console.log("❌ No hay usuario en localStorage");
}

// 2. Verificar todas las keys en localStorage
console.log("\n📋 Todas las keys en localStorage:");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}

// 3. Verificar sessionStorage también
console.log("\n📋 SessionStorage:");
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`- ${key}: ${sessionStorage.getItem(key)?.substring(0, 100)}...`);
}

console.log("\n🔍 Fin del debugging");
