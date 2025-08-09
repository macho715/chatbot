# SITREP API Testing Guide - HVDC Project

This guide provides comprehensive testing instructions for the SITREP (Situation Report) API integration with your Google Apps Script system.

## 🚀 Quick Start

### 1. Test API Connection
```bash
# Test basic connectivity
curl -X POST 'https://script.google.com/macros/s/AKfycbwTXeX36cR5tKd8GBP07-_EAKzedqFGhrdOZFPSmoFJMw9vMFfM5eFrljzQPDYj-KrR/exec?api_key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "date_gst": "2025-08-09 15:45",
    "group_name": "[HVDC] Project Lightning",
    "summary": "[ACTION] SITREP 테스트 기록",
    "top_keywords": ["SITREP","AGI"],
    "sla_breaches": 0,
    "attachments": []
  }'
```

### 2. Run Node.js Test Suite
```bash
# Install dependencies
npm install node-fetch

# Test connection only
node test-sitrep-runner.js --api-key YOUR_API_KEY --test-connection

# Run all tests
node test-sitrep-runner.js --api-key YOUR_API_KEY --run-all
```

### 3. Use Web Test Console
Open `test-sitrep-api.html` in your browser for interactive testing.

## 📋 Testing Checklist

### Phase 1: Basic Connectivity
- [ ] API endpoint is accessible
- [ ] API key authentication works
- [ ] Basic POST request succeeds
- [ ] Response format is correct

### Phase 2: Data Validation
- [ ] Required fields are processed
- [ ] Optional fields have defaults
- [ ] Data types are handled correctly
- [ ] Special characters are preserved

### Phase 3: Error Handling
- [ ] Invalid API key returns error
- [ ] Missing required fields handled
- [ ] Network timeouts handled
- [ ] Retry logic works

### Phase 4: Integration Testing
- [ ] SITREP data appears in spreadsheet
- [ ] Keywords are properly indexed
- [ ] SLA breach detection works
- [ ] Timestamps are accurate

## 🔧 Testing Tools

### 1. Command Line Test Runner
```bash
# Available commands
node test-sitrep-runner.js --help

# Test specific functionality
node test-sitrep-runner.js --api-key YOUR_KEY --test-connection
node test-sitrep-runner.js --api-key YOUR_KEY --submit-test
node test-sitrep-runner.js --api-key YOUR_KEY --run-all
```

### 2. Web Test Console
- **Basic Test Tab**: Test fundamental SITREP submission
- **Specialized Tests Tab**: Test logistics, container, and weather SITREPs
- **Debug Tools Tab**: Configure API settings and run diagnostics
- **cURL Commands Tab**: Generate ready-to-use terminal commands

### 3. Jest Test Suite
```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. "API Key Invalid" Error
**Symptoms**: 401 Unauthorized or "Invalid API key" response
**Solutions**:
- Verify API key in Google Apps Script project settings
- Check Script Properties for `API_KEY` variable
- Ensure key is copied exactly (no extra spaces)

#### 2. "Web App Not Found" Error
**Symptoms**: 404 Not Found response
**Solutions**:
- Verify Google Apps Script is deployed as web app
- Check deployment URL is correct
- Ensure web app is accessible to "Anyone"

#### 3. "Execution Timeout" Error
**Symptoms**: Request hangs or times out
**Solutions**:
- Check Google Apps Script execution logs
- Verify spreadsheet operations aren't blocking
- Increase timeout in test configuration

#### 4. "Spreadsheet Access Denied" Error
**Symptoms**: 403 Forbidden or "Access denied" response
**Solutions**:
- Check spreadsheet sharing permissions
- Verify Google Apps Script has access
- Use explicit spreadsheet ID in configuration

### Debugging Steps

#### Step 1: Check Google Apps Script Logs
1. Open Google Apps Script editor
2. Go to "Executions" tab
3. Look for recent execution logs
4. Check for error messages or timeouts

#### Step 2: Verify Script Properties
1. In Google Apps Script editor
2. Go to "Project Settings" → "Script Properties"
3. Verify `API_KEY` exists and is correct
4. Add `SPREADSHEET_ID` if using specific spreadsheet

#### Step 3: Test Spreadsheet Access
1. Try manual spreadsheet operations in Apps Script
2. Check if `getActive()` or `openById()` works
3. Verify sheet names and structure

#### Step 4: Check Web App Deployment
1. Ensure web app is deployed as "New"
2. Set access to "Anyone" for testing
3. Copy the correct web app URL

## 📊 Test Data Examples

### Basic SITREP
```json
{
  "date_gst": "2025-08-09 15:45",
  "group_name": "[HVDC] Project Lightning",
  "summary": "[ACTION] SITREP 테스트 기록",
  "top_keywords": ["SITREP", "AGI", "MOSB"],
  "sla_breaches": 0,
  "attachments": []
}
```

### Logistics SITREP
```json
{
  "summary": "[LOGISTICS] Container delivery completed",
  "top_keywords": ["LOGISTICS", "CONTAINER", "DELIVERY"],
  "sla_breaches": 0,
  "attachments": ["invoice.pdf"]
}
```

### Container SITREP with Issues
```json
{
  "summary": "[CONTAINER] Container CONT-001: Loading delayed",
  "top_keywords": ["CONTAINER", "STOWAGE", "CONT-001", "WEATHER_DELAY"],
  "sla_breaches": 1
}
```

### Weather SITREP with ETA Delay
```json
{
  "summary": "[WEATHER] Storm warning - Port operations suspended",
  "top_keywords": ["WEATHER", "ETA", "STORM", "DELAY_36h"],
  "sla_breaches": 1
}
```

## 🔍 Advanced Testing

### Load Testing
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  node test-sitrep-runner.js --api-key YOUR_KEY --submit-test &
done
wait
```

### Data Validation Testing
```bash
# Test with various data types
node test-sitrep-runner.js --api-key YOUR_KEY --test-edge-cases
```

### Performance Testing
```bash
# Measure response times
time node test-sitrep-runner.js --api-key YOUR_KEY --submit-test
```

## 📝 Test Results Documentation

### Template for Test Results
```
Test Date: [YYYY-MM-DD HH:MM]
API Key: [Last 4 characters only]
Environment: [Development/Staging/Production]

Test Results:
✅ Connection Test: PASSED
✅ Basic SITREP: PASSED
✅ Logistics SITREP: PASSED
✅ Container SITREP: PASSED
✅ Weather SITREP: PASSED

Performance Metrics:
- Average Response Time: [X]ms
- Success Rate: [X]%
- Error Types: [List any errors]

Notes:
[Any observations or issues]
```

## 🚨 Emergency Procedures

### If API is Down
1. Check Google Apps Script execution logs
2. Verify spreadsheet is accessible
3. Check Google Apps Script quotas
4. Contact system administrator

### If Data is Corrupted
1. Check recent SITREP submissions
2. Verify spreadsheet data integrity
3. Check for duplicate entries
4. Review execution logs for errors

### If Performance Degrades
1. Check Google Apps Script execution times
2. Verify spreadsheet size and complexity
3. Check for infinite loops or blocking operations
4. Review recent code changes

## 📞 Support

### Internal Support
- **MOSB Team**: [Contact Information]
- **HVDC Project Lead**: [Contact Information]
- **System Administrator**: [Contact Information]

### External Resources
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Stack Overflow - Google Apps Script](https://stackoverflow.com/questions/tagged/google-apps-script)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Maintainer**: MOSB Development Team

