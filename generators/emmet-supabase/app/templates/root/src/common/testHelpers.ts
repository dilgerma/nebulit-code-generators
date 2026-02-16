import {execSync} from 'child_process';
import {writeFileSync, unlinkSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';

/**
 * Runs Flyway migrations against a test database
 * @param connectionString PostgreSQL connection string
 */
export async function runFlywayMigrations(connectionString: string): Promise<void> {
    // Parse connection string to extract components
    const url = new URL(connectionString);
    const jdbcUrl = `jdbc:postgresql://${url.hostname}:${url.port || 5432}${url.pathname}`;
    const user = url.username;
    const password = url.password;

    // Create temporary Flyway config file
    const tempConfigPath = join(tmpdir(), `flyway-test-${Date.now()}.conf`);
    const migrationsPath = join(process.cwd(), 'supabase', 'migrations');

    const config = `
flyway.url=${jdbcUrl}
flyway.user=${user}
flyway.password=${password}
flyway.locations=filesystem:${migrationsPath}
flyway.schemas=public
flyway.placeholderReplacement=false
flyway.validateOnMigrate=true
flyway.cleanDisabled=false
`;

    try {
        writeFileSync(tempConfigPath, config, 'utf8');

        // Run Flyway migrate
        execSync(`flyway -configFiles=${tempConfigPath} migrate`, {
            stdio: 'pipe',
            encoding: 'utf8'
        });
    } catch (error: any) {
        console.error('Flyway migration failed:', error.message);
        if (error.stdout) console.error('STDOUT:', error.stdout);
        if (error.stderr) console.error('STDERR:', error.stderr);
        throw new Error(`Flyway migration failed: ${error.message}`);
    } finally {
        // Cleanup temp config file
        try {
            unlinkSync(tempConfigPath);
        } catch {
            // Ignore cleanup errors
        }
    }
}
