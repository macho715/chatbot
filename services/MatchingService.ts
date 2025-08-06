import { Repo, LpoItem, InboundItem } from '../repositories/Repo';

export interface MatchingItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
  inboundQuantity: number;
  difference: number;
  status: 'MATCH' | 'MISSING' | 'EXCESS';
}

export interface MatchingResult {
  lpoNo: string;
  items: MatchingItem[];
}

export class MatchingService {
  static async matchLpo(lpoNo: string): Promise<MatchingResult | null> {
    const lpoItems = await Repo.getLpoItems(lpoNo);
    const inboundItems = await Repo.getInboundItems(lpoNo);

    if (!lpoItems || lpoItems.length === 0) {
      return null;
    }

    // Inbound 아이템들을 itemCode별로 합산
    const inboundMap = new Map<string, number>();
    inboundItems.forEach(item => {
      inboundMap.set(item.itemCode, (inboundMap.get(item.itemCode) ?? 0) + item.receivedQuantity);
    });

    // 모든 itemCode 수집 (LPO + Inbound)
    const allCodes = new Set([
      ...lpoItems.map(item => item.itemCode),
      ...inboundMap.keys()
    ]);

    // 각 아이템에 대해 매칭 결과 생성
    const items: MatchingItem[] = Array.from(allCodes).map(code => {
      const lpoItem = lpoItems.find(item => item.itemCode === code);
      const inboundQty = inboundMap.get(code) ?? 0;
      const lpoQty = lpoItem?.lpoQuantity ?? 0;
      const name = lpoItem?.itemName ?? '(unknown)';
      const diff = inboundQty - lpoQty;
      
      let status: 'MATCH' | 'MISSING' | 'EXCESS';
      if (diff === 0) {
        status = 'MATCH';
      } else if (diff < 0) {
        status = 'MISSING';
      } else {
        status = 'EXCESS';
      }

      return {
        itemCode: code,
        itemName: name,
        lpoQuantity: lpoQty,
        inboundQuantity: inboundQty,
        difference: diff,
        status
      };
    });

    return {
      lpoNo,
      items
    };
  }
} 