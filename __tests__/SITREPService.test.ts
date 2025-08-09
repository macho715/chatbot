// __tests__/SITREPService.test.ts - SITREP Service Test Suite

import SITREPService, { SITREPData, SITREPResponse } from '../services/SITREPService';

// Mock fetch globally
global.fetch = jest.fn();

describe('SITREPService', () => {
  let service: SITREPService;
  const mockApiKey = 'test_api_key_12345';
  const mockApiUrl = 'https://script.google.com/macros/s/test/exec';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SITREPService({
      apiUrl: mockApiUrl,
      apiKey: mockApiKey,
      retryAttempts: 2,
      timeoutMs: 1000
    });
  });

  describe('Configuration', () => {
    test('should initialize with default values', () => {
      const config = service.getConfig();
      expect(config.apiUrl).toBe(mockApiUrl);
      expect(config.apiKey).toBe(mockApiKey);
      expect(config.retryAttempts).toBe(2);
      expect(config.timeoutMs).toBe(1000);
      expect(config.defaultGroup).toBe('[HVDC] Project Lightning');
    });

    test('should update configuration', () => {
      service.updateConfig({ retryAttempts: 5, timeoutMs: 5000 });
      const config = service.getConfig();
      expect(config.retryAttempts).toBe(5);
      expect(config.timeoutMs).toBe(5000);
    });
  });

  describe('submitSITREP', () => {
    test('should submit basic SITREP successfully', async () => {
      const mockResponse = { success: true, data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.submitSITREP({
        summary: 'Test SITREP',
        top_keywords: ['TEST']
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('SITREP submitted successfully');
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}?api_key=${mockApiKey}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test SITREP')
        })
      );
    });

    test('should use default values when not provided', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.submitSITREP({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('SITREP submitted successfully');
      
      // Verify default values were used
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.group_name).toBe('[HVDC] Project Lightning');
      expect(callBody.top_keywords).toContain('MOSB');
      expect(callBody.top_keywords).toContain('HVDC');
      expect(callBody.top_keywords).toContain('LOGISTICS');
    });

    test('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await service.submitSITREP({
        summary: 'Test Error'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to submit SITREP after 2 attempts');
    });

    test('should retry on failure with exponential backoff', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // First call fails, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const result = await service.submitSITREP({
        summary: 'Test Retry'
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    test('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 2000)
        )
      );

      const result = await service.submitSITREP({
        summary: 'Test Timeout'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to submit SITREP after 2 attempts');
    });
  });

  describe('Specialized SITREP methods', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
    });

    test('should submit logistics SITREP with proper formatting', async () => {
      const result = await service.submitLogisticsSITREP(
        'Container delivery completed',
        ['CONTAINER', 'DELIVERY'],
        0,
        ['invoice.pdf']
      );

      expect(result.success).toBe(true);
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.summary).toBe('[LOGISTICS] Container delivery completed');
      expect(callBody.top_keywords).toContain('LOGISTICS');
      expect(callBody.top_keywords).toContain('CONTAINER');
      expect(callBody.attachments).toEqual(['invoice.pdf']);
    });

    test('should submit container SITREP with SLA breach detection', async () => {
      const result = await service.submitContainerSITREP(
        'CONT-001',
        'Loading delayed due to weather',
        ['WEATHER_DELAY', 'LOADING_ISSUE']
      );

      expect(result.success).toBe(true);
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.summary).toBe('[CONTAINER] Container CONT-001: Loading delayed due to weather');
      expect(callBody.top_keywords).toContain('CONT-001');
      expect(callBody.top_keywords).toContain('WEATHER_DELAY');
      expect(callBody.sla_breaches).toBe(1);
    });

    test('should submit weather SITREP with ETA delay calculation', async () => {
      const result = await service.submitWeatherSITREP(
        'Storm warning',
        'Port operations suspended',
        36
      );

      expect(result.success).toBe(true);
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.summary).toBe('[WEATHER] Weather: Storm warning - Port operations suspended');
      expect(callBody.top_keywords).toContain('DELAY_36h');
      expect(callBody.sla_breaches).toBe(1); // >24h delay
    });

    test('should submit weather SITREP without SLA breach for short delays', async () => {
      const result = await service.submitWeatherSITREP(
        'Light rain',
        'Minor loading delays',
        6
      );

      expect(result.success).toBe(true);
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.sla_breaches).toBe(0); // <24h delay
    });
  });

  describe('testConnection', () => {
    test('should return true on successful connection', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await service.testConnection();
      expect(result).toBe(true);
    });

    test('should return false on connection failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('Error handling edge cases', () => {
    test('should handle malformed JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const result = await service.submitSITREP({
        summary: 'Test JSON Error'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to submit SITREP after 2 attempts');
    });

    test('should handle network timeout with AbortController', async () => {
      const mockAbortController = {
        signal: 'test-signal',
        abort: jest.fn()
      };
      
      jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);
      
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      const result = await service.submitSITREP({
        summary: 'Test AbortController'
      });

      expect(result.success).toBe(false);
      expect(mockAbortController.abort).toHaveBeenCalled();
    });
  });
});

