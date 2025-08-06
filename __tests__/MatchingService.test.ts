import { MatchingService } from '../services/MatchingService';
import { Repo } from '../repositories/Repo';

// Mock the Repo module
jest.mock('../repositories/Repo');

describe('MatchingService', () => {
  const mockRepo = Repo as jest.Mocked<typeof Repo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('matchLpo', () => {
    it('shouldReturnMatchingStatusForLpoItems', async () => {
      // Arrange - Setup mock data
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', itemName: 'Widget A', lpoQuantity: 10 },
        { itemCode: 'B', itemName: 'Widget B', lpoQuantity: 5 },
      ]);
      
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', receivedQuantity: 10 },
        { itemCode: 'B', receivedQuantity: 7 },
      ]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('LPO_TEST');

      // Assert - Verify the results
      expect(result).not.toBeNull();
      expect(result?.lpoNo).toBe('LPO_TEST');
      expect(result?.items).toHaveLength(2);

      // Check item A (MATCH)
      const itemA = result?.items.find(i => i.itemCode === 'A');
      expect(itemA).toMatchObject({
        itemCode: 'A',
        itemName: 'Widget A',
        lpoQuantity: 10,
        inboundQuantity: 10,
        difference: 0,
        status: 'MATCH',
      });

      // Check item B (EXCESS)
      const itemB = result?.items.find(i => i.itemCode === 'B');
      expect(itemB).toMatchObject({
        itemCode: 'B',
        itemName: 'Widget B',
        lpoQuantity: 5,
        inboundQuantity: 7,
        difference: 2,
        status: 'EXCESS',
      });

      // Verify repository calls
      expect(mockRepo.getLpoItems).toHaveBeenCalledWith('LPO_TEST');
      expect(mockRepo.getInboundItems).toHaveBeenCalledWith('LPO_TEST');
    });

    it('shouldReturn404IfLpoNotFound', async () => {
      // Arrange - Setup empty mock data
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([]);
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('NON_EXISTENT_LPO');

      // Assert - Should return null for non-existent LPO
      expect(result).toBeNull();
    });

    it('shouldHandleInboundOnlyItemsAsExcess', async () => {
      // Arrange - Setup mock data with inbound-only item
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', itemName: 'Widget A', lpoQuantity: 10 },
      ]);
      
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', receivedQuantity: 10 },
        { itemCode: 'B', receivedQuantity: 5 }, // Inbound only
      ]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('LPO_TEST');

      // Assert - Verify inbound-only item is marked as EXCESS
      expect(result?.items).toHaveLength(2);
      
      const inboundOnlyItem = result?.items.find(i => i.itemCode === 'B');
      expect(inboundOnlyItem).toMatchObject({
        itemCode: 'B',
        itemName: '(unknown)',
        lpoQuantity: 0,
        inboundQuantity: 5,
        difference: 5,
        status: 'EXCESS',
      });
    });
  });
}); 