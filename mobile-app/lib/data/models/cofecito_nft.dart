import 'tasting_note.dart';
import 'traceability_event.dart';

class CofecitoNFT {
  const CofecitoNFT({
    required this.tokenId,
    required this.lotNumber,
    required this.coffeeName,
    required this.farmName,
    required this.region,
    required this.variety,
    required this.process,
    required this.altitude,
    required this.harvestDate,
    required this.mintedDate,
    required this.ownerAddress,
    required this.contractAddress,
    this.imageUrl,
    this.tastingNote,
    this.traceabilityEvents = const [],
    this.rarity = NftRarity.common,
    this.cuppingScore,
    this.isMinting = false,
  });

  final String tokenId;

  final String lotNumber;

  final String coffeeName;
  final String farmName;
  final String region;
  final String variety;
  final String process;

  final int altitude;

  final DateTime harvestDate;
  final DateTime mintedDate;

  final String ownerAddress;

  final String contractAddress;

  final String? imageUrl;

  final TastingNote? tastingNote;
  final List<TraceabilityEvent> traceabilityEvents;
  final NftRarity rarity;

  final double? cuppingScore;

  final bool isMinting;

  String get displayId => '#$lotNumber';

  String get shortAddress =>
      '${ownerAddress.substring(0, 6)}...${ownerAddress.substring(ownerAddress.length - 4)}';

  CofecitoNFT copyWith({
    TastingNote? tastingNote,
    bool? isMinting,
    double? cuppingScore,
  }) {
    return CofecitoNFT(
      tokenId: tokenId,
      lotNumber: lotNumber,
      coffeeName: coffeeName,
      farmName: farmName,
      region: region,
      variety: variety,
      process: process,
      altitude: altitude,
      harvestDate: harvestDate,
      mintedDate: mintedDate,
      ownerAddress: ownerAddress,
      contractAddress: contractAddress,
      imageUrl: imageUrl,
      tastingNote: tastingNote ?? this.tastingNote,
      traceabilityEvents: traceabilityEvents,
      rarity: rarity,
      cuppingScore: cuppingScore ?? this.cuppingScore,
      isMinting: isMinting ?? this.isMinting,
    );
  }
}

enum NftRarity { common, uncommon, rare, legendary }

extension NftRarityLabel on NftRarity {
  String get label => switch (this) {
    NftRarity.common    => 'COMÚN',
    NftRarity.uncommon  => 'INUSUAL',
    NftRarity.rare      => 'RARO',
    NftRarity.legendary => 'LEGENDARIO',
  };
}

abstract final class MockNFTs {
  static final collection = [
    CofecitoNFT(
      tokenId: '1',
      lotNumber: '042',
      coffeeName: 'Yungas Oro',
      farmName: 'Finca El Mirador',
      region: 'Yungas, La Paz',
      variety: 'Caturra',
      process: 'Natural',
      altitude: 1850,
      harvestDate: DateTime(2024, 6, 15),
      mintedDate: DateTime(2024, 8, 10),
      ownerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      contractAddress: '0xCofecito...Contract',
      rarity: NftRarity.rare,
      cuppingScore: 87.5,
      traceabilityEvents: MockTraceability.forLot042(),
      tastingNote: const TastingNote(
        fragrance: 4.2,
        aroma: 4.5,
        flavor: 4.3,
        body: 3.8,
        acidity: 4.0,
        sweetness: 4.6,
        flavorNotes: ['Chocolate', 'Miel', 'Frutado'],
        personalNote: 'Retrogusto largo a cacao negro. Acidez brillante al enfriarse.',
      ),
    ),
    CofecitoNFT(
      tokenId: '2',
      lotNumber: '108',
      coffeeName: 'Geisha Andino',
      farmName: 'Finca Los Andes',
      region: 'Caranavi, La Paz',
      variety: 'Geisha',
      process: 'Lavado',
      altitude: 2100,
      harvestDate: DateTime(2024, 5, 20),
      mintedDate: DateTime(2024, 7, 15),
      ownerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      contractAddress: '0xCofecito...Contract',
      rarity: NftRarity.legendary,
      cuppingScore: 91.0,
      traceabilityEvents: [],
      tastingNote: const TastingNote(
        fragrance: 5.0,
        aroma: 4.8,
        flavor: 4.9,
        body: 3.5,
        acidity: 4.7,
        sweetness: 4.8,
        flavorNotes: ['Floral', 'Cítrico', 'Jazmín'],
        personalNote: 'Complejo y delicado. Reminiscente a té de flores.',
      ),
    ),
    CofecitoNFT(
      tokenId: '3',
      lotNumber: '073',
      coffeeName: 'Caranavi Honey',
      farmName: 'Finca Villa Nueva',
      region: 'Caranavi, La Paz',
      variety: 'Typica',
      process: 'Honey',
      altitude: 1650,
      harvestDate: DateTime(2024, 7, 1),
      mintedDate: DateTime(2024, 9, 5),
      ownerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      contractAddress: '0xCofecito...Contract',
      rarity: NftRarity.uncommon,
      cuppingScore: 84.0,
      traceabilityEvents: [],
    ),
  ];
}
