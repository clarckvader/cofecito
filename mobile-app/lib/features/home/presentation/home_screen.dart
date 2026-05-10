import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/cofecito_nft.dart';
import '../../../shared/widgets/cofecito_app_bar.dart';
import 'widgets/nft_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final nfts = MockNFTs.collection;

    return Scaffold(
      appBar: CofecitorAppBar(
        showWalletAction: true,
        onWalletTap: () => context.go('/wallet'),
      ),
      body: ListView(
        padding: const EdgeInsets.only(top: 16, bottom: 120),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mi Colección', style: AppTypography.headlineLgMobile),
                const SizedBox(height: 4),
                Text(
                  '${nfts.length} experiencias únicas coleccionadas.',
                  style: AppTypography.bodyMdVariant,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          SizedBox(
            height: 310,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              clipBehavior: Clip.none,
              itemCount: nfts.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, i) => NftCard(
                nft: nfts[i],
                onTap: () => context.push('/traceability/${nfts[i].tokenId}'),
              ),
            ),
          ),

          const SizedBox(height: 32),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Historial de Catas', style: AppTypography.headlineMd),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    'VER TODO',
                    style: AppTypography.labelSmGold,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          ...nfts.map((nft) => _ExperienceListTile(nft: nft)),
        ],
      ),
    );
  }
}

class _ExperienceListTile extends StatelessWidget {
  const _ExperienceListTile({required this.nft});
  final CofecitoNFT nft;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      child: Material(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/tasting/${nft.tokenId}'),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: const Icon(Icons.coffee_rounded, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 14),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(nft.coffeeName, style: AppTypography.bodyMdBold),
                          const Spacer(),
                          if (nft.cuppingScore != null)
                            _ScoreBadge(score: nft.cuppingScore!),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${nft.farmName} · ${nft.region}',
                        style: AppTypography.bodyMdVariant.copyWith(fontSize: 13),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _InfoChip(label: nft.process),
                          const SizedBox(width: 6),
                          _InfoChip(label: '${nft.altitude} msnm'),
                          const SizedBox(width: 6),
                          _InfoChip(label: 'Lote ${nft.displayId}'),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),
                Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ScoreBadge extends StatelessWidget {
  const _ScoreBadge({required this.score});
  final double score;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.star_rounded, size: 12, color: AppColors.primary),
          const SizedBox(width: 3),
          Text(
            score.toStringAsFixed(1),
            style: AppTypography.labelSmGold.copyWith(fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Text(
        label.toUpperCase(),
        style: AppTypography.labelSm.copyWith(fontSize: 9),
      ),
    );
  }
}
