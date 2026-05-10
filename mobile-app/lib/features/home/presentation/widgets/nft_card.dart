import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../data/models/cofecito_nft.dart';

class NftCard extends StatelessWidget {
  const NftCard({super.key, required this.nft, this.onTap});

  final CofecitoNFT nft;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 220,
        height: 300,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              _CardBackground(imageUrl: nft.imageUrl, rarity: nft.rarity),

              const DecoratedBox(
                decoration: BoxDecoration(gradient: AppColors.cardOverlayGradient),
              ),

              DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Align(
                      alignment: Alignment.topRight,
                      child: _RarityBadge(rarity: nft.rarity),
                    ),
                    const Spacer(),

                    Text(
                      'Lote ${nft.displayId}',
                      style: AppTypography.labelSmGold,
                    ),
                    const SizedBox(height: 4),

                    Text(
                      nft.coffeeName,
                      style: AppTypography.headlineMd.copyWith(
                        fontSize: 18,
                        height: 1.2,
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 8),

                    if (nft.cuppingScore != null) ...[
                      Row(
                        children: [
                          Icon(Icons.star_rounded, size: 14, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            '${nft.cuppingScore!.toStringAsFixed(1)} pts',
                            style: AppTypography.labelSm.copyWith(color: AppColors.primary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                    ],

                    if (nft.tastingNote?.flavorNotes.isNotEmpty == true)
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: nft.tastingNote!.flavorNotes.take(3).map((note) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainerHighest.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(100),
                              border: Border.all(
                                color: AppColors.outlineVariant.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              note.toUpperCase(),
                              style: AppTypography.labelSm.copyWith(
                                fontSize: 9,
                                color: AppColors.onSurfaceVariant,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CardBackground extends StatelessWidget {
  const _CardBackground({this.imageUrl, required this.rarity});
  final String? imageUrl;
  final NftRarity rarity;

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null) {
      return Image.network(
        imageUrl!,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    final colors = switch (rarity) {
      NftRarity.legendary => [const Color(0xFF2A1A00), const Color(0xFF503D00)],
      NftRarity.rare      => [const Color(0xFF1A1200), const Color(0xFF392F14)],
      NftRarity.uncommon  => [const Color(0xFF1C1B1B), const Color(0xFF2A2A2A)],
      NftRarity.common    => [const Color(0xFF131313), const Color(0xFF201F1F)],
    };

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          Icons.coffee_rounded,
          size: 64,
          color: AppColors.primary.withValues(alpha: 0.2),
        ),
      ),
    );
  }
}

class _RarityBadge extends StatelessWidget {
  const _RarityBadge({required this.rarity});
  final NftRarity rarity;

  @override
  Widget build(BuildContext context) {
    final isGold = rarity == NftRarity.rare || rarity == NftRarity.legendary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isGold
            ? AppColors.primary.withValues(alpha: 0.2)
            : AppColors.surfaceContainer.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(
          color: isGold
              ? AppColors.primary.withValues(alpha: 0.3)
              : AppColors.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Text(
        rarity.label,
        style: AppTypography.labelSm.copyWith(
          color: isGold ? AppColors.primaryFixed : AppColors.onSurfaceVariant,
          fontSize: 9,
        ),
      ),
    );
  }
}
