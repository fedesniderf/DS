const fs = require('fs');
const path = require('path');

/**
 * Script de gestión de versiones para DS Training Management System
 * 
 * Uso:
 *   node scripts/version-manager.js patch    # 3.0.0 -> 3.0.1
 *   node scripts/version-manager.js minor    # 3.0.0 -> 3.1.0
 *   node scripts/version-manager.js major    # 3.0.0 -> 4.0.0
 *   node scripts/version-manager.js --info   # Mostrar información actual
 */

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const VERSION_JSON_PATH = path.join(__dirname, '..', 'version.json');
const VERSION_CONFIG_PATH = path.join(__dirname, '..', 'src', 'config', 'version.js');

// Leer archivo JSON de forma segura
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

// Escribir archivo JSON de forma segura
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error escribiendo ${filePath}:`, error.message);
    return false;
  }
}

// Incrementar versión según tipo
function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Tipo de versión inválido: ${type}`);
  }
}

// Obtener fecha actual en formato ISO
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Mostrar información actual
function showVersionInfo() {
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  const versionJson = readJsonFile(VERSION_JSON_PATH);
  
  if (!packageJson || !versionJson) {
    console.error('No se pudo leer la información de versión');
    return;
  }

  console.log('\n=== DS Training Management System ===');
  console.log(`Versión actual: ${packageJson.version}`);
  console.log(`Nombre: ${versionJson.current.name}`);
  console.log(`Fecha de release: ${versionJson.current.release_date}`);
  console.log(`Estabilidad: ${versionJson.current.stability}`);
  console.log('\nFeatures activos:');
  
  Object.entries(versionJson.features).forEach(([feature, info]) => {
    if (info.enabled) {
      console.log(`  - ${feature}: v${info.version}`);
    }
  });
  
  console.log('\n');
}

// Actualizar todos los archivos de versión
function updateVersion(newVersion, versionType, releaseName) {
  console.log(`\nActualizando versión a ${newVersion}...`);
  
  // Actualizar package.json
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  if (!packageJson) return false;
  
  packageJson.version = newVersion;
  if (!writeJsonFile(PACKAGE_JSON_PATH, packageJson)) return false;
  
  // Actualizar version.json
  const versionJson = readJsonFile(VERSION_JSON_PATH);
  if (!versionJson) return false;
  
  // Mover versión actual al historial
  versionJson.history = versionJson.history || [];
  versionJson.history.unshift({
    version: versionJson.current.version,
    name: versionJson.current.name,
    release_date: versionJson.current.release_date,
    stability: versionJson.current.stability
  });
  
  // Actualizar versión actual
  versionJson.current = {
    version: newVersion,
    name: releaseName || `Version ${newVersion}`,
    release_date: getCurrentDate(),
    stability: versionType === 'major' ? 'beta' : 'stable'
  };
  
  if (!writeJsonFile(VERSION_JSON_PATH, versionJson)) return false;
  
  // Actualizar version.js
  try {
    let versionConfigContent = fs.readFileSync(VERSION_CONFIG_PATH, 'utf8');
    
    // Actualizar campos específicos usando regex
    versionConfigContent = versionConfigContent.replace(
      /version: '[\d.]+'/,
      `version: '${newVersion}'`
    );
    
    versionConfigContent = versionConfigContent.replace(
      /release_date: '\d{4}-\d{2}-\d{2}'/,
      `release_date: '${getCurrentDate()}'`
    );
    
    versionConfigContent = versionConfigContent.replace(
      /name: '[^']*'/,
      `name: '${releaseName || `Version ${newVersion}`}'`
    );
    
    fs.writeFileSync(VERSION_CONFIG_PATH, versionConfigContent);
  } catch (error) {
    console.error('Error actualizando version.js:', error.message);
    return false;
  }
  
  console.log('✅ Versión actualizada exitosamente');
  console.log(`📦 package.json: ${newVersion}`);
  console.log(`📋 version.json: actualizado`);
  console.log(`⚙️  version.js: actualizado`);
  
  return true;
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Uso: node scripts/version-manager.js <comando> [opciones]

Comandos:
  patch         Incrementar versión patch (3.0.0 -> 3.0.1)
  minor         Incrementar versión minor (3.0.0 -> 3.1.0)  
  major         Incrementar versión major (3.0.0 -> 4.0.0)
  --info        Mostrar información de versión actual
  --help        Mostrar esta ayuda

Opciones:
  --name <name> Especificar nombre para el release
  
Ejemplos:
  node scripts/version-manager.js patch
  node scripts/version-manager.js minor --name "Nueva funcionalidad"
  node scripts/version-manager.js major --name "Arquitectura v4"
`);
    return;
  }
  
  if (args[0] === '--info') {
    showVersionInfo();
    return;
  }
  
  const versionType = args[0];
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error(`Tipo de versión inválido: ${versionType}`);
    console.error('Usa: patch, minor, major o --info');
    return;
  }
  
  // Buscar nombre del release
  let releaseName = null;
  const nameIndex = args.indexOf('--name');
  if (nameIndex !== -1 && args[nameIndex + 1]) {
    releaseName = args[nameIndex + 1];
  }
  
  // Leer versión actual
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  if (!packageJson) return;
  
  const currentVersion = packageJson.version;
  const newVersion = incrementVersion(currentVersion, versionType);
  
  console.log(`Versión actual: ${currentVersion}`);
  console.log(`Nueva versión: ${newVersion}`);
  console.log(`Tipo de cambio: ${versionType}`);
  if (releaseName) {
    console.log(`Nombre del release: ${releaseName}`);
  }
  
  // Confirmar cambio
  console.log('\n¿Continuar con la actualización? (y/N)');
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', (input) => {
    const answer = input.trim().toLowerCase();
    
    if (answer === 'y' || answer === 'yes') {
      updateVersion(newVersion, versionType, releaseName);
    } else {
      console.log('Actualización cancelada');
    }
    
    process.exit(0);
  });
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  incrementVersion,
  updateVersion,
  showVersionInfo
};
