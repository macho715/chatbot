#!/usr/bin/env node

/**
 * Test Monitor Script
 * 지속적 품질 관리를 위한 테스트 상태 모니터링
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {},
      details: {},
      trends: [],
      recommendations: []
    };
    
    this.config = {
      testTimeout: 30000, // 30초
      coverageThreshold: 80, // 80% 커버리지
      maxTestTime: 12000, // 12초 이내 테스트 완료
      criticalTests: [
        'MOSBEntry.test.tsx',
        'LPOInboundMatch.test.tsx',
        'MatchingService.test.ts'
      ]
    };
  }

  async runTests() {
    console.log('🧪 테스트 실행 중...');
    
    try {
      const startTime = Date.now();
      
      // 테스트 실행
      const testOutput = execSync('npm test -- --json --silent', {
        encoding: 'utf8',
        timeout: this.config.testTimeout
      });
      
      const testTime = Date.now() - startTime;
      const testResults = JSON.parse(testOutput);
      
      this.results.summary = {
        totalTests: testResults.numTotalTests,
        passedTests: testResults.numPassedTests,
        failedTests: testResults.numFailedTests,
        testTime: testTime,
        successRate: (testResults.numPassedTests / testResults.numTotalTests) * 100
      };
      
      this.results.details = testResults.testResults;
      
      console.log(`✅ 테스트 완료: ${this.results.summary.passedTests}/${this.results.summary.totalTests} 통과`);
      
    } catch (error) {
      console.error('❌ 테스트 실행 실패:', error.message);
      this.results.summary = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runCoverage() {
    console.log('📊 커버리지 분석 중...');
    
    try {
      const coverageOutput = execSync('npm run test:coverage -- --json --silent', {
        encoding: 'utf8',
        timeout: this.config.testTimeout
      });
      
      // 커버리지 결과 파싱 (간단한 텍스트 분석)
      const coverageMatch = coverageOutput.match(/File.*% Stmts.*% Branch.*% Funcs.*% Lines/);
      if (coverageMatch) {
        this.results.coverage = {
          status: 'available',
          details: coverageOutput
        };
      }
      
    } catch (error) {
      console.log('⚠️ 커버리지 분석 실패 (정상적인 경우)');
    }
  }

  analyzePerformance() {
    console.log('⚡ 성능 분석 중...');
    
    const { testTime, successRate } = this.results.summary;
    
    // 성능 지표 분석
    if (testTime > this.config.maxTestTime) {
      this.results.recommendations.push({
        type: 'performance',
        severity: 'warning',
        message: `테스트 실행 시간이 ${this.config.maxTestTime/1000}초를 초과합니다 (${testTime/1000}초)`,
        suggestion: '테스트 병렬화 또는 불필요한 테스트 제거를 고려하세요'
      });
    }
    
    if (successRate < 100) {
      this.results.recommendations.push({
        type: 'quality',
        severity: 'critical',
        message: `테스트 성공률이 100%가 아닙니다 (${successRate.toFixed(1)}%)`,
        suggestion: '실패한 테스트를 즉시 수정하세요'
      });
    }
  }

  checkCriticalTests() {
    console.log('🔍 중요 테스트 상태 확인 중...');
    
    this.results.details.forEach(testSuite => {
      if (this.config.criticalTests.some(critical => testSuite.name.includes(critical))) {
        if (testSuite.status === 'failed') {
          this.results.recommendations.push({
            type: 'critical',
            severity: 'critical',
            message: `중요 테스트 스위트 실패: ${testSuite.name}`,
            suggestion: '즉시 수정이 필요합니다'
          });
        }
      }
    });
  }

  generateReport() {
    console.log('📋 리포트 생성 중...');
    
    const report = {
      timestamp: this.results.timestamp,
      summary: this.results.summary,
      recommendations: this.results.recommendations,
      nextActions: this.generateNextActions()
    };
    
    // 리포트 저장
    const reportPath = path.join(__dirname, '../reports/test-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 콘솔 출력
    this.displayReport(report);
    
    return report;
  }

  generateNextActions() {
    const actions = [];
    
    if (this.results.recommendations.some(r => r.severity === 'critical')) {
      actions.push('🚨 즉시 수정이 필요한 테스트가 있습니다');
    }
    
    if (this.results.summary.successRate === 100) {
      actions.push('✅ 모든 테스트가 통과했습니다 - 배포 준비 완료');
    }
    
    if (this.results.summary.testTime > this.config.maxTestTime) {
      actions.push('⚡ 테스트 성능 최적화가 필요합니다');
    }
    
    return actions;
  }

  displayReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 테스트 모니터링 리포트');
    console.log('='.repeat(60));
    
    console.log(`📅 생성 시간: ${report.timestamp}`);
    console.log(`📊 테스트 요약:`);
    console.log(`   - 총 테스트: ${report.summary.totalTests || 'N/A'}`);
    console.log(`   - 통과: ${report.summary.passedTests || 'N/A'}`);
    console.log(`   - 실패: ${report.summary.failedTests || 'N/A'}`);
    console.log(`   - 성공률: ${report.summary.successRate ? report.summary.successRate.toFixed(1) + '%' : 'N/A'}`);
    console.log(`   - 실행 시간: ${report.summary.testTime ? (report.summary.testTime/1000).toFixed(1) + '초' : 'N/A'}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n⚠️ 권장사항:`);
      report.recommendations.forEach((rec, index) => {
        const icon = rec.severity === 'critical' ? '🚨' : '⚠️';
        console.log(`   ${index + 1}. ${icon} ${rec.message}`);
        console.log(`      💡 ${rec.suggestion}`);
      });
    }
    
    if (report.nextActions.length > 0) {
      console.log(`\n🎯 다음 단계:`);
      report.nextActions.forEach(action => {
        console.log(`   - ${action}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async run() {
    console.log('🚀 테스트 모니터링 시작...\n');
    
    await this.runTests();
    await this.runCoverage();
    
    if (this.results.summary.totalTests) {
      this.analyzePerformance();
      this.checkCriticalTests();
    }
    
    const report = this.generateReport();
    
    // 트렌드 데이터 저장
    this.saveTrendData();
    
    return report;
  }

  saveTrendData() {
    const trendsPath = path.join(__dirname, '../reports/test-trends.json');
    
    let trends = [];
    if (fs.existsSync(trendsPath)) {
      trends = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
    }
    
    trends.push({
      timestamp: this.results.timestamp,
      successRate: this.results.summary.successRate,
      testTime: this.results.summary.testTime,
      totalTests: this.results.summary.totalTests
    });
    
    // 최근 30개 데이터만 유지
    if (trends.length > 30) {
      trends = trends.slice(-30);
    }
    
    fs.writeFileSync(trendsPath, JSON.stringify(trends, null, 2));
  }
}

// 스크립트 실행
if (require.main === module) {
  const monitor = new TestMonitor();
  monitor.run().catch(console.error);
}

module.exports = TestMonitor;
