// services/SITREPService.ts - SITREP Integration Service for HVDC Project

export interface SITREPData {
  date_gst: string;
  group_name: string;
  summary: string;
  top_keywords: string[];
  sla_breaches: number;
  attachments: string[];
}

export interface SITREPResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data?: any;
}

export interface SITREPConfig {
  apiUrl: string;
  apiKey: string;
  defaultGroup: string;
  retryAttempts: number;
  timeoutMs: number;
}

class SITREPService {
  private config: SITREPConfig;
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private readonly DEFAULT_RETRIES = 3;

  constructor(config?: Partial<SITREPConfig>) {
    this.config = {
      apiUrl: 'https://script.google.com/macros/s/AKfycbwTXeX36cR5tKd8GBP07-_EAKzedqFGhrdOZFPSmoFJMw9vMFfM5eFrljzQPDYj-KrR/exec',
      apiKey: process.env.GOOGLE_APPS_SCRIPT_API_KEY || 'YOUR_API_KEY',
      defaultGroup: '[HVDC] Project Lightning',
      retryAttempts: this.DEFAULT_RETRIES,
      timeoutMs: this.DEFAULT_TIMEOUT,
      ...config
    };
  }

  /**
   * Submit a SITREP to the Google Apps Script API
   */
  async submitSITREP(sitrepData: Partial<SITREPData>): Promise<SITREPResponse> {
    const payload: SITREPData = {
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

  /**
   * Submit a logistics-specific SITREP
   */
  async submitLogisticsSITREP(
    summary: string,
    keywords: string[] = [],
    slaBreaches: number = 0,
    attachments: string[] = []
  ): Promise<SITREPResponse> {
    return this.submitSITREP({
      summary: `[LOGISTICS] ${summary}`,
      top_keywords: ['LOGISTICS', 'MOSB', 'HVDC', ...keywords],
      sla_breaches: slaBreaches,
      attachments
    });
  }

  /**
   * Submit a container/stowage SITREP
   */
  async submitContainerSITREP(
    containerId: string,
    status: string,
    issues: string[] = []
  ): Promise<SITREPResponse> {
    const summary = `Container ${containerId}: ${status}`;
    const keywords = ['CONTAINER', 'STOWAGE', containerId, ...issues];
    
    return this.submitSITREP({
      summary: `[CONTAINER] ${summary}`,
      top_keywords: keywords,
      sla_breaches: issues.length > 0 ? 1 : 0
    });
  }

  /**
   * Submit a weather-related SITREP
   */
  async submitWeatherSITREP(
    weatherCondition: string,
    impact: string,
    etaDelay?: number
  ): Promise<SITREPResponse> {
    const summary = `Weather: ${weatherCondition} - ${impact}`;
    const keywords = ['WEATHER', 'ETA', weatherCondition];
    
    if (etaDelay) {
      keywords.push(`DELAY_${etaDelay}h`);
    }

    return this.submitSITREP({
      summary: `[WEATHER] ${summary}`,
      top_keywords: keywords,
      sla_breaches: etaDelay && etaDelay > 24 ? 1 : 0
    });
  }

  /**
   * Make the actual API call with retry logic
   */
  private async makeAPICall(payload: SITREPData): Promise<SITREPResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

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
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Wait before retry (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000);
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

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SITREPConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SITREPConfig {
    return { ...this.config };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.submitSITREP({
        summary: '[TEST] API connectivity test',
        top_keywords: ['TEST', 'CONNECTIVITY']
      });
      return result.success;
    } catch {
      return false;
    }
  }
}

export default SITREPService;

