/**
 * Vitest Configuration
 * 
 * Unit test runner configuration for the Magic Auth project.
 * Tests server utilities and email library with V8 coverage.
 * 
 * @see https://vitest.dev/config/
 */
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Run tests in Node environment (server-side code)
    environment: 'node',
    
    // Enable global test functions (describe, it, expect)
    globals: true,
    
    // Test file patterns
    include: ['tests/**/*.test.ts'],
    
    // Code coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Cover server utilities and email library
      include: ['server/utils/**/*.ts', 'lib/**/*.ts']
    }
  },
  
  // Path aliases matching Nuxt conventions
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  }
})
