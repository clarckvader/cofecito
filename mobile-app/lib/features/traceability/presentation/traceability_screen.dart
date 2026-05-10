import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/cofecito_nft.dart';
import '../../../data/models/traceability_event.dart';

class TraceabilityScreen extends StatelessWidget {
  const TraceabilityScreen({super.key, required this.tokenId});

  final String tokenId;

  @override
  Widget build(BuildContext context) {
    final nft = MockNFTs.collection.firstWhere(
      (n) => n.tokenId == tokenId,
      orElse: () => MockNFTs.collection.first,
    );

    final events = nft.traceabilityEvents.isNotEmpty
        ? nft.traceabilityEvents
        : MockTraceability.forLot042();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppColors.surfaceContainerHighest,
            leading: IconButton(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.primary),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              title: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TRAZABILIDAD',
                    style: AppTypography.labelSmGold.copyWith(letterSpacing: 3),
                  ),
                  Text(
                    nft.coffeeName,
                    style: AppTypography.headlineMd.copyWith(fontSize: 16),
                  ),
                ],
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.surfaceContainerHighest,
                          const Color(0xFF1A1200),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                  Align(
                    alignment: const Alignment(0.8, -0.2),
                    child: Icon(
                      Icons.map_outlined,
                      size: 100,
                      color: AppColors.primary.withValues(alpha: 0.08),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: _LotInfoCard(nft: nft),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Text('Cadena de Origen', style: AppTypography.headlineMd),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
            sliver: SliverList.separated(
              itemCount: events.length,
              separatorBuilder: (_, __) => const SizedBox(height: 0),
              itemBuilder: (context, index) => _TimelineStep(
                event: events[index],
                isFirst: index == 0,
                isLast: index == events.length - 1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LotInfoCard extends StatelessWidget {
  const _LotInfoCard({required this.nft});
  final CofecitoNFT nft;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Expanded(child: _MetaTile(icon: Icons.tag, label: 'Lote', value: nft.displayId)),
          _Divider(),
          Expanded(child: _MetaTile(icon: Icons.terrain, label: 'Altitud', value: '${nft.altitude} m')),
          _Divider(),
          Expanded(child: _MetaTile(icon: Icons.local_florist, label: 'Variedad', value: nft.variety)),
          _Divider(),
          Expanded(child: _MetaTile(icon: Icons.water_drop, label: 'Proceso', value: nft.process)),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
        width: 1,
        height: 40,
        color: AppColors.outlineVariant.withValues(alpha: 0.3),
      );
}

class _MetaTile extends StatelessWidget {
  const _MetaTile({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 18),
        const SizedBox(height: 4),
        Text(value, style: AppTypography.bodyMdBold.copyWith(fontSize: 13), textAlign: TextAlign.center),
        Text(label, style: AppTypography.labelSm.copyWith(fontSize: 10), textAlign: TextAlign.center),
      ],
    );
  }
}

class _TimelineStep extends StatelessWidget {
  const _TimelineStep({
    required this.event,
    required this.isFirst,
    required this.isLast,
  });

  final TraceabilityEvent event;
  final bool isFirst;
  final bool isLast;

  Color get _nodeColor => event.isVerifiedOnChain ? AppColors.primary : AppColors.onSurfaceVariant;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 48,
            child: Column(
              children: [
                if (!isFirst)
                  Expanded(
                    flex: 1,
                    child: Center(
                      child: Container(width: 2, color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                  )
                else
                  const SizedBox(height: 12),

                _StepNode(event: event, color: _nodeColor),

                if (!isLast)
                  Expanded(
                    flex: 4,
                    child: Center(
                      child: Container(width: 2, color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                  )
                else
                  const SizedBox(height: 12),
              ],
            ),
          ),

          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                left: 12,
                bottom: isLast ? 0 : 16,
                top: isFirst ? 0 : 0,
              ),
              child: _StepCard(event: event),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepNode extends StatelessWidget {
  const _StepNode({required this.event, required this.color});
  final TraceabilityEvent event;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.12),
        border: Border.all(color: color.withValues(alpha: 0.5), width: 1.5),
      ),
      child: Icon(
        _iconForEvent(event.icon),
        color: color,
        size: 18,
      ),
    );
  }

  IconData _iconForEvent(String name) => switch (name) {
    'eco'                    => Icons.eco_rounded,
    'wb_sunny'               => Icons.wb_sunny_rounded,
    'local_fire_department'  => Icons.local_fire_department_rounded,
    'coffee'                 => Icons.coffee_rounded,
    _                        => Icons.circle_outlined,
  };
}

class _StepCard extends StatelessWidget {
  const _StepCard({required this.event});
  final TraceabilityEvent event;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: event.isVerifiedOnChain
              ? AppColors.primary.withValues(alpha: 0.2)
              : AppColors.outlineVariant.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  event.stage.label.toUpperCase(),
                  style: AppTypography.labelSmGold.copyWith(fontSize: 10),
                ),
              ),
              const Spacer(),
              Text(
                _formatDate(event.date),
                style: AppTypography.labelSm.copyWith(color: AppColors.onSurfaceVariant, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 8),

          Text(event.title, style: AppTypography.bodyMdBold),
          const SizedBox(height: 4),

          Text(event.description, style: AppTypography.bodyMdVariant.copyWith(fontSize: 13, height: 1.5)),

          if (event.metadata.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: event.metadata.entries.map((e) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '${e.key}: ',
                          style: AppTypography.labelSm.copyWith(fontSize: 11),
                        ),
                        TextSpan(
                          text: e.value,
                          style: AppTypography.labelSm.copyWith(
                            color: AppColors.onSurface,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          if (event.isVerifiedOnChain) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(Icons.verified_rounded, size: 14, color: AppColors.primary),
                const SizedBox(width: 6),
                Text(
                  'Verificado en Blockchain · ${event.txHash?.substring(0, 12) ?? ''}…',
                  style: AppTypography.labelSmGold.copyWith(fontSize: 10),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
