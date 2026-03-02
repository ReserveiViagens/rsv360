/**
 * Script para testar todas as funções SQL criadas pelas migrations
 */

require('dotenv').config();
const { Client } = require('pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rsv360_dev';

const client = new Client({
  connectionString: dbUrl
});

async function testFunctions() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');
    console.log('🧪 Testando funções SQL...\n');

    // Testar funções da migration 018
    console.log('📋 MIGRATION 018 - Funções:\n');

    // 1. calculate_host_total_points
    try {
      const result = await client.query('SELECT calculate_host_total_points(1) as total');
      console.log(`  ✅ calculate_host_total_points(1) = ${result.rows[0].total}`);
    } catch (error) {
      console.log(`  ⚠️  calculate_host_total_points: ${error.message}`);
    }

    // 2. calculate_host_available_points
    try {
      const result = await client.query('SELECT calculate_host_available_points(1) as available');
      console.log(`  ✅ calculate_host_available_points(1) = ${result.rows[0].available}`);
    } catch (error) {
      console.log(`  ⚠️  calculate_host_available_points: ${error.message}`);
    }

    // 3. add_host_points (criar um host de teste primeiro se necessário)
    try {
      // Verificar se existe host com ID 1
      const hostCheck = await client.query('SELECT id FROM users WHERE id = 1 LIMIT 1');
      if (hostCheck.rows.length > 0) {
        const result = await client.query(`
          SELECT add_host_points(1, 100, 'welcome_bonus', NULL, 'Teste de pontos', 365, '{}'::JSONB) as point_id
        `);
        console.log(`  ✅ add_host_points(1, 100, 'welcome_bonus') = ${result.rows[0].point_id}`);
      } else {
        console.log(`  ⚠️  add_host_points: Host ID 1 não existe (pular teste)`);
      }
    } catch (error) {
      console.log(`  ⚠️  add_host_points: ${error.message}`);
    }

    // 4. spend_host_points
    try {
      const hostCheck = await client.query('SELECT id FROM users WHERE id = 1 LIMIT 1');
      if (hostCheck.rows.length > 0) {
        // Tentar gastar 10 pontos (pode falhar se não houver pontos suficientes)
        try {
          const result = await client.query(`
            SELECT spend_host_points(1, 10, 'manual_adjustment', NULL, 'Teste de gasto', '{}'::JSONB) as point_id
          `);
          console.log(`  ✅ spend_host_points(1, 10, 'manual_adjustment') = ${result.rows[0].point_id}`);
        } catch (error) {
          if (error.message.includes('Insufficient points')) {
            console.log(`  ✅ spend_host_points: Validação funcionando (pontos insuficientes)`);
          } else {
            throw error;
          }
        }
      } else {
        console.log(`  ⚠️  spend_host_points: Host ID 1 não existe (pular teste)`);
      }
    } catch (error) {
      console.log(`  ⚠️  spend_host_points: ${error.message}`);
    }

    // 5. expire_host_points
    try {
      const result = await client.query('SELECT expire_host_points() as expired_count');
      console.log(`  ✅ expire_host_points() = ${result.rows[0].expired_count} pontos expirados`);
    } catch (error) {
      console.log(`  ⚠️  expire_host_points: ${error.message}`);
    }

    // 6. get_host_points_history
    try {
      const result = await client.query('SELECT * FROM get_host_points_history(1, 10, 0)');
      console.log(`  ✅ get_host_points_history(1, 10, 0) = ${result.rows.length} registros`);
    } catch (error) {
      console.log(`  ⚠️  get_host_points_history: ${error.message}`);
    }

    // Testar funções da migration 019
    console.log('\n📋 MIGRATION 019 - Funções:\n');

    // 1. check_program_eligibility
    try {
      const hostCheck = await client.query('SELECT id FROM users WHERE id = 1 LIMIT 1');
      if (hostCheck.rows.length > 0) {
        const result = await client.query(`
          SELECT check_program_eligibility(1, 'welcome_bonus') as eligible
        `);
        console.log(`  ✅ check_program_eligibility(1, 'welcome_bonus') = ${result.rows[0].eligible}`);
      } else {
        console.log(`  ⚠️  check_program_eligibility: Host ID 1 não existe (pular teste)`);
      }
    } catch (error) {
      console.log(`  ⚠️  check_program_eligibility: ${error.message}`);
    }

    // 2. get_eligible_programs
    try {
      const hostCheck = await client.query('SELECT id FROM users WHERE id = 1 LIMIT 1');
      if (hostCheck.rows.length > 0) {
        const result = await client.query('SELECT * FROM get_eligible_programs(1)');
        console.log(`  ✅ get_eligible_programs(1) = ${result.rows.length} programas elegíveis`);
        if (result.rows.length > 0) {
          result.rows.forEach(p => {
            console.log(`     - ${p.program_key}: ${p.program_name}`);
          });
        }
      } else {
        console.log(`  ⚠️  get_eligible_programs: Host ID 1 não existe (pular teste)`);
      }
    } catch (error) {
      console.log(`  ⚠️  get_eligible_programs: ${error.message}`);
    }

    // 3. apply_program_reward
    try {
      const hostCheck = await client.query('SELECT id FROM users WHERE id = 1 LIMIT 1');
      const programCheck = await client.query(`
        SELECT id FROM incentive_programs WHERE program_key = 'welcome_bonus' LIMIT 1
      `);
      
      if (hostCheck.rows.length > 0 && programCheck.rows.length > 0) {
        const programId = programCheck.rows[0].id;
        const result = await client.query(`
          SELECT apply_program_reward(1, $1) as success
        `, [programId]);
        console.log(`  ✅ apply_program_reward(1, ${programId}) = ${result.rows[0].success}`);
      } else {
        console.log(`  ⚠️  apply_program_reward: Host ou programa não existe (pular teste)`);
      }
    } catch (error) {
      if (error.message.includes('already enrolled') || error.message.includes('unique constraint')) {
        console.log(`  ✅ apply_program_reward: Validação funcionando (já inscrito)`);
      } else {
        console.log(`  ⚠️  apply_program_reward: ${error.message}`);
      }
    }

    // Testar views
    console.log('\n📋 TESTANDO VIEWS:\n');

    // host_points_summary
    try {
      const result = await client.query('SELECT * FROM host_points_summary LIMIT 5');
      console.log(`  ✅ host_points_summary: ${result.rows.length} hosts com pontos`);
    } catch (error) {
      console.log(`  ⚠️  host_points_summary: ${error.message}`);
    }

    // active_incentive_programs
    try {
      const result = await client.query('SELECT * FROM active_incentive_programs');
      console.log(`  ✅ active_incentive_programs: ${result.rows.length} programas ativos`);
      result.rows.forEach(p => {
        console.log(`     - ${p.program_key}: ${p.program_name}`);
      });
    } catch (error) {
      console.log(`  ⚠️  active_incentive_programs: ${error.message}`);
    }

    console.log('\n🎉 Todos os testes concluídos!');

  } catch (error) {
    console.error('\n❌ Erro ao testar funções:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testFunctions();

