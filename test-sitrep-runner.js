#!/usr/bin/env node

/**
 * SITREP API Test Runner - Command Line Testing Tool
 * HVDC Project - MOSB System Integration
 * 
 * Usage:
 *   node test-sitrep-runner.js --api-key YOUR_API_KEY
 *   node test-sitrep-runner.js --test-connection
 *   node test-sitrep-runner.js --submit-test
 */

const fetch = require('node-fetch');

// Configuration
const DEFAULT_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycbwTXeX36cR5tKd8GBP07-_EAKzedqFGhrdOZFPSmoFJMw9vMFfM5eFrljzQPDYj-KrR/exec',
  apiKey: process.env.GOOGLE_APPS_SCRIPT_API_KEY || '',
  retryAttempts: 3,
  timeoutMs: 10000,
  defaultGroup: '[HVDC] Project Lightning'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++; // Skip next arg if it was consumed
    }
  }
  
  return options;
}

// SITREP Service Class
class SITREPService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async submitSITREP(sitrepData) {
    const payload = {
      date_gst: sitrepData.date_gst || new Date().toISOString().slice(0, 19).replace('T', ' '),
      group_name: sitrepData.group_name || this.config.defaultGroup,
      summary: sitrepData.summary || '[ACTION] SITREP submitted via MOSB System',
      top_keywords: sitrepData.top_keywords || ['MOSB', 'HVDC', 'LOGISTICS'],
      sla_breaches: sitrepData.sla_breaches || 0,
      attachments: sitrepData.attachments || [],
      ...sitrepData
    };

    return this.makeAPICall(payload);
  }

  async makeAPICall(payload) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        console.log(`Attempt ${attempt}/${this.config.retryAttempts}: Submitting SITREP...`);
        
        const response = await fetch(`${this.config.apiUrl}?api_key=${this.config.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        return {
          success: true,
          message: 'SITREP submitted successfully',
          timestamp: new Date().toISOString(),
          data: result
        };

      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.config.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await this.delay(delay);
          continue;
        }
      }
    }

    return {
      success: false,
      message: `Failed to submit SITREP after ${this.config.retryAttempts} attempts: ${lastError?.message}`,
      timestamp: new Date().toISOString()
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection() {
    try {
      console.log('Testing API connection...');
      const result = await this.submitSITREP({
        summary: '[TEST] API connectivity test',
        top_keywords: ['TEST', 'CONNECTIVITY']
      });
      return result.success;
    } catch (error) {
      console.error('Connection test error:', error.message);
      return false;
    }
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Test functions
async function testConnection(service) {
  console.log('\n🔌 Testing API Connection...');
  console.log('=' .repeat(50));
  
  const isConnected = await service.testConnection();
  
  if (isConnected) {
    console.log('✅ Connection successful!');
    return true;
  } else {
    console.log('❌ Connection failed!');
    console.log('Please check:');
    console.log('  - API key is correct');
    console.log('  - API URL is accessible');
    console.log('  - Google Apps Script is deployed as web app');
    return false;
  }
}

async function submitTestSITREP(service) {
  console.log('\n📝 Submitting Test SITREP...');
  console.log('=' .repeat(50));
  
  const testData = {
    summary: '[TEST] SITREP API integration test via MOSB System',
    top_keywords: ['TEST', 'SITREP', 'MOSB', 'HVDC', 'INTEGRATION'],
    sla_breaches: 0,
    attachments: []
  };

  console.log('Payload:', JSON.stringify(testData, null, 2));
  
  const result = await service.submitSITREP(testData);
  
  if (result.success) {
    console.log('✅ SITREP submitted successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ SITREP submission failed!');
    console.log('Error:', result.message);
  }
  
  return result.success;
}

async function submitLogisticsSITREP(service) {
  console.log('\n🚢 Submitting Logistics SITREP...');
  console.log('=' .repeat(50));
  
  const logisticsData = {
    summary: '[LOGISTICS] Container delivery completed successfully',
    top_keywords: ['LOGISTICS', 'CONTAINER', 'DELIVERY', 'MOSB', 'HVDC'],
    sla_breaches: 0,
    attachments: ['delivery_confirmation.pdf']
  };

  console.log('Payload:', JSON.stringify(logisticsData, null, 2));
  
  const result = await service.submitSITREP(logisticsData);
  
  if (result.success) {
    console.log('✅ Logistics SITREP submitted successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Logistics SITREP submission failed!');
    console.log('Error:', result.message);
  }
  
  return result.success;
}

async function submitContainerSITREP(service) {
  console.log('\n📦 Submitting Container SITREP...');
  console.log('=' .repeat(50));
  
  const containerData = {
    summary: '[CONTAINER] Container CONT-001: Loading delayed due to weather',
    top_keywords: ['CONTAINER', 'STOWAGE', 'CONT-001', 'WEATHER_DELAY', 'LOADING_ISSUE'],
    sla_breaches: 1
  };

  console.log('Payload:', JSON.stringify(containerData, null, 2));
  
  const result = await service.submitSITREP(containerData);
  
  if (result.success) {
    console.log('✅ Container SITREP submitted successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Container SITREP submission failed!');
    console.log('Error:', result.message);
  }
  
  return result.success;
}

async function submitWeatherSITREP(service) {
  console.log('\n🌦️ Submitting Weather SITREP...');
  console.log('=' .repeat(50));
  
  const weatherData = {
    summary: '[WEATHER] Storm warning - Port operations suspended',
    top_keywords: ['WEATHER', 'ETA', 'STORM', 'PORT_OPERATIONS', 'DELAY_36h'],
    sla_breaches: 1
  };

  console.log('Payload:', JSON.stringify(weatherData, null, 2));
  
  const result = await service.submitSITREP(weatherData);
  
  if (result.success) {
    console.log('✅ Weather SITREP submitted successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Weather SITREP submission failed!');
    console.log('Error:', result.message);
  }
  
  return result.success;
}

async function runAllTests(service) {
  console.log('\n🧪 Running All SITREP Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Basic SITREP Test', fn: submitTestSITREP },
    { name: 'Logistics SITREP Test', fn: submitLogisticsSITREP },
    { name: 'Container SITREP Test', fn: submitContainerSITREP },
    { name: 'Weather SITREP Test', fn: submitWeatherSITREP }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    try {
      const success = await test.fn(service);
      if (success) passed++;
    } catch (error) {
      console.error(`❌ Test failed with error: ${error.message}`);
    }
  }

  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
}

function showHelp() {
  console.log(`
🚢 SITREP API Test Runner - HVDC Project

Usage:
  node test-sitrep-runner.js [options]

Options:
  --api-key <key>           Set API key for testing
  --test-connection         Test API connectivity only
  --submit-test             Submit a test SITREP
  --run-all                 Run all tests
  --help                    Show this help message

Environment Variables:
  GOOGLE_APPS_SCRIPT_API_KEY  API key (alternative to --api-key)

Examples:
  node test-sitrep-runner.js --api-key YOUR_KEY --test-connection
  node test-sitrep-runner.js --api-key YOUR_KEY --submit-test
  node test-sitrep-runner.js --api-key YOUR_KEY --run-all

Default Configuration:
  API URL: ${DEFAULT_CONFIG.apiUrl}
  Retry Attempts: ${DEFAULT_CONFIG.retryAttempts}
  Timeout: ${DEFAULT_CONFIG.timeoutMs}ms
  Default Group: ${DEFAULT_CONFIG.defaultGroup}
`);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }

  // Check for API key
  if (!options['api-key'] && !DEFAULT_CONFIG.apiKey) {
    console.error('❌ Error: API key is required!');
    console.error('Use --api-key YOUR_KEY or set GOOGLE_APPS_SCRIPT_API_KEY environment variable');
    process.exit(1);
  }

  // Initialize service
  const service = new SITREPService({
    apiKey: options['api-key'] || DEFAULT_CONFIG.apiKey
  });

  console.log('🚢 SITREP API Test Runner - HVDC Project');
  console.log('=' .repeat(50));
  console.log('Configuration:', JSON.stringify(service.getConfig(), null, 2));

  try {
    if (options['test-connection']) {
      await testConnection(service);
    } else if (options['submit-test']) {
      await submitTestSITREP(service);
    } else if (options['run-all']) {
      await runAllTests(service);
    } else {
      // Default: run all tests
      await runAllTests(service);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { SITREPService, testConnection, submitTestSITREP };

