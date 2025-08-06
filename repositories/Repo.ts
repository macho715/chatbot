export interface LpoItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
}

export interface InboundItem {
  itemCode: string;
  receivedQuantity: number;
}

export class Repo {
  static async getLpoItems(lpoNo: string): Promise<LpoItem[]> {
    // TODO: 실제 데이터베이스 연동 구현
    // 현재는 테스트를 위한 mock 데이터 반환
    return [];
  }

  static async getInboundItems(lpoNo: string): Promise<InboundItem[]> {
    // TODO: 실제 데이터베이스 연동 구현
    // 현재는 테스트를 위한 mock 데이터 반환
    return [];
  }
} 