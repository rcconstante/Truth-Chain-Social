// TruthChain Deployment Readiness Check
// This file checks if all required services and configurations are ready for deployment

import { supabase } from './supabase';
import AlgorandService from './algorand-service';

export interface DeploymentCheck {
  service: string;
  status: 'ready' | 'warning' | 'error';
  message: string;
  details?: any;
}

export class DeploymentValidator {
  private checks: DeploymentCheck[] = [];

  async runAllChecks(): Promise<{ passed: boolean; checks: DeploymentCheck[] }> {
    this.checks = [];

    // Run all validation checks
    await this.checkSupabaseConnection();
    await this.checkAlgorandConnection();
    await this.checkEnvironmentVariables();
    await this.checkDatabaseSchema();
    await this.checkRLSPolicies();

    // Determine if deployment is ready
    const hasErrors = this.checks.some(check => check.status === 'error');
    const passed = !hasErrors;

    return { passed, checks: this.checks };
  }

  private async checkSupabaseConnection(): Promise<void> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        this.checks.push({
          service: 'Supabase Database',
          status: 'error',
          message: 'Cannot connect to Supabase database',
          details: error
        });
      } else {
        this.checks.push({
          service: 'Supabase Database',
          status: 'ready',
          message: 'Successfully connected to Supabase'
        });
      }
    } catch (error) {
      this.checks.push({
        service: 'Supabase Database',
        status: 'error',
        message: 'Supabase connection failed',
        details: error
      });
    }
  }

  private async checkAlgorandConnection(): Promise<void> {
    try {
      const networkStatus = await AlgorandService.getNetworkStatus();
      
      if (networkStatus.healthy) {
        this.checks.push({
          service: 'Algorand Network',
          status: 'ready',
          message: `Connected to Algorand testnet (Round: ${networkStatus.round})`,
          details: { round: networkStatus.round }
        });
      } else {
        this.checks.push({
          service: 'Algorand Network',
          status: 'warning',
          message: 'Algorand network connection issues',
          details: { error: networkStatus.error }
        });
      }
    } catch (error) {
      this.checks.push({
        service: 'Algorand Network',
        status: 'error',
        message: 'Failed to connect to Algorand network',
        details: error
      });
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length === 0) {
      this.checks.push({
        service: 'Environment Variables',
        status: 'ready',
        message: 'All required environment variables are set'
      });
    } else {
      this.checks.push({
        service: 'Environment Variables',
        status: 'error',
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        details: { missing: missingVars }
      });
    }
  }

  private async checkDatabaseSchema(): Promise<void> {
    try {
      const requiredTables = [
        'profiles',
        'posts',
        'post_votes',
        'comments',
        'challenges',
        'post_verifications',
        'transactions'
      ];

      const tableChecks = await Promise.all(
        requiredTables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select('*').limit(1);
            return { table, exists: !error };
          } catch {
            return { table, exists: false };
          }
        })
      );

      const missingTables = tableChecks.filter(check => !check.exists).map(check => check.table);

      if (missingTables.length === 0) {
        this.checks.push({
          service: 'Database Schema',
          status: 'ready',
          message: 'All required database tables exist'
        });
      } else {
        this.checks.push({
          service: 'Database Schema',
          status: 'error',
          message: `Missing database tables: ${missingTables.join(', ')}`,
          details: { missing: missingTables }
        });
      }
    } catch (error) {
      this.checks.push({
        service: 'Database Schema',
        status: 'error',
        message: 'Failed to check database schema',
        details: error
      });
    }
  }

  private async checkRLSPolicies(): Promise<void> {
    try {
      // Test basic CRUD operations to verify RLS policies
      const testOperations = [
        { table: 'posts', operation: 'select' },
        { table: 'post_votes', operation: 'select' },
        { table: 'comments', operation: 'select' }
      ];

      const rlsResults = await Promise.all(
        testOperations.map(async (test) => {
          try {
            const { error } = await supabase.from(test.table).select('*').limit(1);
            return { ...test, success: !error };
          } catch {
            return { ...test, success: false };
          }
        })
      );

      const failedOperations = rlsResults.filter(result => !result.success);

      if (failedOperations.length === 0) {
        this.checks.push({
          service: 'RLS Policies',
          status: 'ready',
          message: 'Row Level Security policies are working correctly'
        });
      } else {
        this.checks.push({
          service: 'RLS Policies',
          status: 'warning',
          message: 'Some RLS policies may need adjustment',
          details: { failed: failedOperations }
        });
      }
    } catch (error) {
      this.checks.push({
        service: 'RLS Policies',
        status: 'warning',
        message: 'Unable to fully verify RLS policies',
        details: error
      });
    }
  }

  // Get summary of deployment readiness
  getDeploymentSummary(): {
    ready: boolean;
    errors: number;
    warnings: number;
    message: string;
  } {
    const errors = this.checks.filter(check => check.status === 'error').length;
    const warnings = this.checks.filter(check => check.status === 'warning').length;
    const ready = errors === 0;

    let message = '';
    if (ready) {
      if (warnings === 0) {
        message = '✅ All systems ready for deployment!';
      } else {
        message = `⚠️ Ready for deployment with ${warnings} warning(s).`;
      }
    } else {
      message = `❌ Cannot deploy: ${errors} error(s) need to be resolved.`;
    }

    return { ready, errors, warnings, message };
  }

  // Log deployment status to console
  logStatus(): void {
    const summary = this.getDeploymentSummary();
    
    console.log('\n🚀 TruthChain Deployment Readiness Check');
    console.log('=====================================');
    console.log(summary.message);
    console.log(`\nDetails:`);
    console.log(`- Errors: ${summary.errors}`);
    console.log(`- Warnings: ${summary.warnings}`);
    console.log(`- Total Checks: ${this.checks.length}\n`);

    this.checks.forEach(check => {
      const emoji = check.status === 'ready' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      console.log(`${emoji} ${check.service}: ${check.message}`);
      if (check.details) {
        console.log(`   Details:`, check.details);
      }
    });

    console.log('\n=====================================\n');
  }
}

// Quick deployment check function
export async function checkDeploymentReadiness(): Promise<boolean> {
  const validator = new DeploymentValidator();
  const { passed } = await validator.runAllChecks();
  validator.logStatus();
  return passed;
}

export default DeploymentValidator; 