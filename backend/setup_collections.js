/**
 * Script para criar as coleções no PocketBase via API.
 * Execute APÓS criar o admin no painel:
 *
 *   node setup_collections.js <admin-email> <admin-password>
 *
 * Requisito: Node.js 18+
 */

const [, , adminEmail, adminPassword] = process.argv
const PB_URL = 'http://127.0.0.1:8090'

if (!adminEmail || !adminPassword) {
  console.error('Uso: node setup_collections.js <email> <senha>')
  process.exit(1)
}

async function run() {
  // Login admin
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: adminEmail, password: adminPassword }),
  })
  if (!authRes.ok) { console.error('Falha no login admin'); process.exit(1) }
  const { token } = await authRes.json()

  const headers = { 'Content-Type': 'application/json', Authorization: token }

  // 1. Adicionar campos extras na coleção users (auth)
  console.log('→ Configurando coleção users...')
  const usersRes = await fetch(`${PB_URL}/api/collections/users`, { headers })
  const usersCol = await usersRes.json()

  const extraFields = [
    { name: 'name',        type: 'text',   required: true,  options: { min: 2 } },
    { name: 'role',        type: 'select', required: true,
      options: { maxSelect: 1, values: ['researcher', 'institution', 'business', 'investor'] } },
    { name: 'institution', type: 'text',   required: false, options: {} },
    { name: 'bio',         type: 'text',   required: false, options: {} },
  ]

  const existingNames = (usersCol.schema || []).map((f) => f.name)
  const newFields = extraFields.filter((f) => !existingNames.includes(f.name))

  if (newFields.length > 0) {
    await fetch(`${PB_URL}/api/collections/users`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ schema: [...(usersCol.schema || []), ...newFields] }),
    })
    console.log('  ✓ Campos adicionados:', newFields.map((f) => f.name).join(', '))
  } else {
    console.log('  ✓ Campos já existem')
  }

  // 2. Criar coleções via import
  console.log('→ Importando coleções...')
  const schema = await import('./pb_schema.json', { assert: { type: 'json' } })
  const importRes = await fetch(`${PB_URL}/api/collections/import`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ collections: schema.default, deleteMissing: false }),
  })

  if (importRes.ok) {
    console.log('  ✓ Coleções criadas com sucesso!')
  } else {
    const err = await importRes.json()
    console.error('  ✗ Erro ao importar:', JSON.stringify(err, null, 2))
  }

  console.log('\n✅ Setup completo! Inicie o frontend com: cd frontend && npm run dev')
}

run().catch(console.error)
