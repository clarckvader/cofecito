import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/role_provider.dart';

class _ActiveCoffee {
  const _ActiveCoffee({
    required this.name,
    required this.lot,
    required this.tags,
    required this.stockRemaining,
    required this.stockTotal,
    required this.isLowStock,
    required this.process,
    required this.altitude,
  });

  final String name;
  final String lot;
  final List<String> tags;
  final int stockRemaining;
  final int stockTotal;
  final bool isLowStock;
  final String process;
  final String altitude;
}

const _coffees = [
  _ActiveCoffee(
    name: 'Geisha Finca El Sol',
    lot: 'LOTE #402',
    tags: ['Floral', 'Jazmín', 'Bergamota'],
    stockRemaining: 8,
    stockTotal: 60,
    isLowStock: true,
    process: 'Lavado',
    altitude: '1800m',
  ),
  _ActiveCoffee(
    name: 'Yungas Oro',
    lot: 'LOTE #042',
    tags: ['Chocolate', 'Miel', 'Frutado'],
    stockRemaining: 38,
    stockTotal: 60,
    isLowStock: false,
    process: 'Natural',
    altitude: '1850m',
  ),
];

class BaristaDashboardScreen extends ConsumerWidget {
  const BaristaDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MODO BARISTA',
                          style: AppTypography.labelSmGold.copyWith(letterSpacing: 3),
                        ),
                        const SizedBox(height: 4),
                        Text('Truck #01', style: AppTypography.headlineLgMobile),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => context.push('/wallet'),
                          icon: const Icon(Icons.account_balance_wallet_outlined,
                              color: AppColors.primary),
                        ),
                        GestureDetector(
                          onTap: () {
                            ref.read(roleProvider.notifier).state = UserRole.none;
                            context.go('/role-selection');
                          },
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: AppColors.primary.withValues(alpha: 0.3)),
                              color: AppColors.surfaceContainerHigh,
                            ),
                            child: const Icon(Icons.coffee_maker_rounded,
                                color: AppColors.primary, size: 20),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            sliver: SliverToBoxAdapter(
              child: Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'TAZAS SERVIDAS HOY',
                      value: '142',
                      suffix: '+12% vs ayer',
                      icon: Icons.coffee_rounded,
                      suffixPositive: true,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'NFTS GENERADOS',
                      value: '85',
                      suffix: 'Nuevas historias',
                      icon: Icons.toll_rounded,
                      isGold: true,
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Cafés Activos', style: AppTypography.headlineMd),
                  const SizedBox(height: 4),
                  Text('Lotes disponibles para servir hoy',
                      style: AppTypography.bodyMdVariant.copyWith(fontSize: 13)),
                ],
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
            sliver: SliverList.separated(
              itemCount: _coffees.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, i) => _CoffeeCard(
                coffee: _coffees[i],
                onGenerateQr: () => context.push('/barista/generate-qr'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.suffix,
    required this.icon,
    this.isGold = false,
    this.suffixPositive = false,
  });

  final String label;
  final String value;
  final String suffix;
  final IconData icon;
  final bool isGold;
  final bool suffixPositive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: isGold
                ? AppColors.primary.withValues(alpha: 0.2)
                : AppColors.outlineVariant.withValues(alpha: 0.2)),
        boxShadow: isGold
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(label,
                    style: AppTypography.labelSm
                        .copyWith(fontSize: 10, letterSpacing: 0.5)),
              ),
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.1),
                ),
                child:
                    Icon(icon, size: 16, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTypography.headlineXl.copyWith(
              fontSize: 36,
              color:
                  isGold ? AppColors.primary : AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              if (suffixPositive)
                Icon(Icons.trending_up_rounded,
                    size: 14, color: AppColors.primary),
              if (suffixPositive) const SizedBox(width: 4),
              Expanded(
                child: Text(
                  suffix,
                  style: AppTypography.bodyMdVariant.copyWith(
                    fontSize: 12,
                    color: suffixPositive
                        ? AppColors.primary
                        : AppColors.onSurfaceVariant,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CoffeeCard extends StatelessWidget {
  const _CoffeeCard({required this.coffee, required this.onGenerateQr});
  final _ActiveCoffee coffee;
  final VoidCallback onGenerateQr;

  @override
  Widget build(BuildContext context) {
    final stockPct = coffee.stockRemaining / coffee.stockTotal;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1200),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(15)),
            child: SizedBox(
              height: 120,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFF2C1810),
                          const Color(0xFF0D0800),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                  Center(
                    child: Icon(
                      Icons.coffee_rounded,
                      size: 48,
                      color: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  const Align(
                    alignment: Alignment.bottomCenter,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.transparent, Color(0xFF1A1200)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                      child: SizedBox(height: 60, width: double.infinity),
                    ),
                  ),
                  if (coffee.isLowStock)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(
                              color: AppColors.error.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.warning_rounded,
                                size: 12, color: AppColors.error),
                            const SizedBox(width: 4),
                            Text('Low Stock',
                                style: AppTypography.labelSm.copyWith(
                                    color: AppColors.error, fontSize: 10)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(coffee.name,
                          style: AppTypography.headlineMd.copyWith(fontSize: 18)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(coffee.lot,
                          style: AppTypography.labelSmGold.copyWith(fontSize: 10)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                Wrap(
                  spacing: 6,
                  children: coffee.tags
                      .map((t) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color:
                                  AppColors.primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: Text(t,
                                style: AppTypography.labelSm.copyWith(
                                    color: AppColors.secondary,
                                    fontSize: 11)),
                          ))
                      .toList(),
                ),

                const SizedBox(height: 14),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Stock Restante',
                        style: AppTypography.labelSm.copyWith(fontSize: 11)),
                    Text(
                      '${coffee.stockRemaining} Tazas',
                      style: AppTypography.labelSm.copyWith(
                        color: coffee.isLowStock
                            ? AppColors.error
                            : AppColors.primary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(100),
                  child: LinearProgressIndicator(
                    value: stockPct,
                    minHeight: 4,
                    backgroundColor: AppColors.surfaceContainerHigh,
                    valueColor: AlwaysStoppedAnimation(
                      coffee.isLowStock ? AppColors.error : AppColors.primary,
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                Row(
                  children: [
                    _MiniChip(label: coffee.process),
                    const SizedBox(width: 6),
                    _MiniChip(label: coffee.altitude),
                    const Spacer(),
                    GestureDetector(
                      onTap: onGenerateQr,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppColors.primaryFixed,
                              AppColors.primaryContainer
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.qr_code_2_rounded,
                                size: 16, color: AppColors.onPrimary),
                            const SizedBox(width: 6),
                            Text('Generar QR',
                                style: AppTypography.labelSm.copyWith(
                                    color: AppColors.onPrimary)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniChip extends StatelessWidget {
  const _MiniChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(100),
        border:
            Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Text(label,
          style: AppTypography.labelSm
              .copyWith(color: AppColors.onSurfaceVariant, fontSize: 10)),
    );
  }
}
