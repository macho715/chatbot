import nlp from 'compromise';
import compromiseNumbers from 'compromise-numbers';

// compromise-numbers 플러그인 추가
nlp.extend(compromiseNumbers);

export interface CommandIntent {
  action: string;
  entity?: string;
  parameters: Record<string, any>;
  confidence: number;
  originalText: string;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
  suggestions?: string[];
}

export class NaturalLanguageProcessor {
  private commandPatterns: Map<string, RegExp>;
  private actionMappings: Map<string, string>;

  constructor() {
    this.commandPatterns = new Map();
    this.actionMappings = new Map();
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // MOSB Entry 관련 패턴
    this.commandPatterns.set('mosb_entry', /(mosb|entry|신청|출입|게이트)/i);
    this.commandPatterns.set('mosb_status', /(status|상태|확인|조회|진행상황)/i);
    this.commandPatterns.set('lpo_find', /(lpo|위치|찾기|검색|location)/i);
    this.commandPatterns.set('lpo_scan', /(scan|스캔|qr|코드)/i);
    this.commandPatterns.set('weather_check', /(weather|날씨|기상|기후)/i);
    this.commandPatterns.set('port_status', /(port|항구|선박|vessel)/i);
    this.commandPatterns.set('document_upload', /(document|문서|업로드|upload|파일)/i);
    this.commandPatterns.set('contact_support', /(contact|연락|지원|support|도움)/i);
    this.commandPatterns.set('help', /(help|도움|도움말|가이드|guide)/i);

    // 액션 매핑
    this.actionMappings.set('mosb_entry', 'MOSB 출입 신청');
    this.actionMappings.set('mosb_status', '신청 상태 확인');
    this.actionMappings.set('lpo_find', 'LPO 위치 조회');
    this.actionMappings.set('lpo_scan', 'LPO QR 스캔');
    this.actionMappings.set('weather_check', '기상 조건 확인');
    this.actionMappings.set('port_status', '항구 상태 확인');
    this.actionMappings.set('document_upload', '문서 업로드');
    this.actionMappings.set('contact_support', '지원팀 연락');
    this.actionMappings.set('help', '도움말 표시');
  }

  public processCommand(userInput: string): CommandIntent {
    const doc = nlp(userInput.toLowerCase());
    let bestMatch: CommandIntent | null = null;
    let highestConfidence = 0;

    // 각 명령어 패턴에 대해 매칭 시도
    for (const [action, pattern] of this.commandPatterns) {
      const match = userInput.match(pattern);
      if (match) {
        const confidence = this.calculateConfidence(userInput, action, match);
        
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = {
            action,
            entity: this.extractEntity(doc, action),
            parameters: this.extractParameters(doc, action),
            confidence,
            originalText: userInput
          };
        }
      }
    }

    // 기본 도움말 응답
    if (!bestMatch) {
      bestMatch = {
        action: 'help',
        entity: undefined,
        parameters: {},
        confidence: 0.5,
        originalText: userInput
      };
    }

    return bestMatch;
  }

  private calculateConfidence(input: string, action: string, match: RegExpMatchArray): number {
    let confidence = 0.3; // 기본 신뢰도

    // 키워드 매칭 점수
    const keywords = this.getKeywordsForAction(action);
    const matchedKeywords = keywords.filter(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
    
    confidence += (matchedKeywords.length / keywords.length) * 0.4;

    // 패턴 매칭 강도
    if (match[0].length > 2) {
      confidence += 0.2;
    }

    // 문맥 점수
    if (this.hasContextualClues(input, action)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private getKeywordsForAction(action: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'mosb_entry': ['mosb', 'entry', '신청', '출입', '게이트', '신청서'],
      'mosb_status': ['status', '상태', '확인', '조회', '진행상황', '신청서'],
      'lpo_find': ['lpo', '위치', '찾기', '검색', 'location', '창고'],
      'lpo_scan': ['scan', '스캔', 'qr', '코드', '바코드'],
      'weather_check': ['weather', '날씨', '기상', '기후', '폭풍', '바람'],
      'port_status': ['port', '항구', '선박', 'vessel', '선착', '출항'],
      'document_upload': ['document', '문서', '업로드', 'upload', '파일', '첨부'],
      'contact_support': ['contact', '연락', '지원', 'support', '도움', '문의'],
      'help': ['help', '도움', '도움말', '가이드', 'guide', '사용법']
    };

    return keywordMap[action] || [];
  }

  private hasContextualClues(input: string, action: string): boolean {
    const contextualWords = ['지금', '현재', '바로', '빨리', 'urgent', 'now', 'immediately'];
    return contextualWords.some(word => input.toLowerCase().includes(word));
  }

  private extractEntity(doc: any, action: string): string | undefined {
    // LPO 번호 추출
    if (action === 'lpo_find' || action === 'mosb_status') {
      const numbers = doc.numbers().out('array');
      const lpoPattern = /LPO-?\d{4}-?\d{6}/i;
      const lpoMatch = doc.text().match(lpoPattern);
      
      if (lpoMatch) {
        return lpoMatch[0];
      }
      
      if (numbers.length > 0) {
        return `LPO-${numbers[0]}`;
      }
    }

    // 날짜 추출
    if (action === 'weather_check' || action === 'port_status') {
      try {
        const dates = doc.dates().out('array');
        if (dates.length > 0) {
          return dates[0];
        }
      } catch (error) {
        // dates() 메서드가 없는 경우 무시
      }
    }

    return undefined;
  }

  private extractParameters(doc: any, action: string): Record<string, any> {
    const params: Record<string, any> = {};

    // 시간 관련 파라미터
    try {
      const times = doc.time().out('array');
      if (times.length > 0) {
        params.time = times[0];
      }
    } catch (error) {
      // time() 메서드가 없는 경우 무시
    }

    // 숫자 파라미터
    try {
      const numbers = doc.numbers().out('array');
      if (numbers.length > 0) {
        params.numbers = numbers;
      }
    } catch (error) {
      // numbers() 메서드가 없는 경우 무시
    }

    // 장소 파라미터
    try {
      const places = doc.places().out('array');
      if (places.length > 0) {
        params.location = places[0];
      }
    } catch (error) {
      // places() 메서드가 없는 경우 무시
    }

    return params;
  }

  public generateResponse(intent: CommandIntent): CommandResponse {
    const responses: Record<string, CommandResponse> = {
      'mosb_entry': {
        success: true,
        message: 'MOSB 출입 신청을 시작합니다. 신청서 작성을 위해 MOSB Entry 페이지로 이동합니다.',
        action: 'navigate_to_mosb_entry',
        suggestions: ['신청서 작성', '문서 업로드', '상태 확인']
      },
      'mosb_status': {
        success: true,
        message: intent.entity ? 
          `${intent.entity} 신청서 상태를 확인합니다.` : 
          '신청서 상태 확인을 위해 Application ID를 입력해주세요.',
        action: 'check_mosb_status',
        data: { applicationId: intent.entity },
        suggestions: ['상태 확인', '진행상황 보기', '다른 신청서 확인']
      },
      'lpo_find': {
        success: true,
        message: intent.entity ? 
          `${intent.entity} 위치를 조회합니다.` : 
          'LPO 위치 조회를 위해 LPO 번호를 입력하거나 QR 코드를 스캔해주세요.',
        action: 'find_lpo_location',
        data: { lpoNumber: intent.entity },
        suggestions: ['QR 스캔', '수동 입력', '위치 지도 보기']
      },
      'lpo_scan': {
        success: true,
        message: 'LPO QR 코드 스캔을 시작합니다. 카메라를 QR 코드에 맞춰주세요.',
        action: 'start_qr_scan',
        suggestions: ['QR 스캔', '수동 입력', '스캔 취소']
      },
      'weather_check': {
        success: true,
        message: '현재 기상 조건을 확인합니다. Abu Dhabi 항구 지역의 날씨 정보를 제공합니다.',
        action: 'check_weather',
        suggestions: ['실시간 날씨', '예보 확인', '항해 조건']
      },
      'port_status': {
        success: true,
        message: 'Abu Dhabi 항구 상태를 확인합니다. 선박 입출항 정보와 운영 상황을 제공합니다.',
        action: 'check_port_status',
        suggestions: ['선박 현황', '운영 시간', '연락처']
      },
      'document_upload': {
        success: true,
        message: '문서 업로드를 시작합니다. 필요한 서류를 선택하여 업로드해주세요.',
        action: 'start_document_upload',
        suggestions: ['운전면허증', '차량등록증', '보험증명서']
      },
      'contact_support': {
        success: true,
        message: '지원팀에 연락합니다. 어떤 도움이 필요하신가요?',
        action: 'contact_support',
        suggestions: ['전화 문의', '이메일 문의', 'WhatsApp 문의']
      },
      'help': {
        success: true,
        message: '사용 가능한 명령어를 안내합니다. 어떤 기능을 사용하고 싶으신가요?',
        action: 'show_help',
        suggestions: ['MOSB 신청', 'LPO 조회', '상태 확인', '문서 업로드']
      }
    };

    return responses[intent.action] || responses['help'];
  }

  public getSuggestions(intent: CommandIntent): string[] {
    const suggestions: Record<string, string[]> = {
      'mosb_entry': ['신청서 작성', '문서 업로드', '상태 확인', '도움말'],
      'mosb_status': ['상태 확인', '진행상황 보기', '다른 신청서 확인', 'MOSB 신청'],
      'lpo_find': ['QR 스캔', '수동 입력', '위치 지도 보기', '연락처 확인'],
      'lpo_scan': ['QR 스캔', '수동 입력', '스캔 취소', 'LPO 검색'],
      'weather_check': ['실시간 날씨', '예보 확인', '항해 조건', '항구 상태'],
      'port_status': ['선박 현황', '운영 시간', '연락처', '기상 확인'],
      'document_upload': ['운전면허증', '차량등록증', '보험증명서', '기타 서류'],
      'contact_support': ['전화 문의', '이메일 문의', 'WhatsApp 문의', '온라인 채팅'],
      'help': ['MOSB 신청', 'LPO 조회', '상태 확인', '문서 업로드', '지원팀 연락']
    };

    return suggestions[intent.action] || suggestions['help'];
  }
}
