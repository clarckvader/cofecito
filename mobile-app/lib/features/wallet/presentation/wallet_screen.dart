import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/cofecito_nft.dart';
import '../../../shared/widgets/cofecito_app_bar.dart';
import '../../../shared/widgets/primary_button.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  static const _walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  static const _balanceUsd = 1240.0;
  static const _exchangeRate = 6.96;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CofecitorAppBar(title: 'BÓVEDA DIGITAL'),
      body: ListView(
        padding: const EdgeInsets.only(top: 16, bottom: 120),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _BalanceCard(
              usd: _balanceUsd,
              bob: _balanceUsd * _exchangeRate,
              walletAddress: _walletAddress,
            ),
          ),

          const SizedBox(height: 24),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    label: 'CARGAR',
                    icon: Icons.add_circle_outline_rounded,
                    onPressed: () => _showOnRampSheet(context),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SecondaryButton(
                    label: 'RETIRAR',
                    icon: Icons.arrow_outward_rounded,
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text('Métodos de Carga', style: AppTypography.headlineMd),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
              children: const [
                _PaymentMethodCard(icon: Icons.credit_card_rounded, label: 'Tarjeta\nDébito / Crédito'),
                _PaymentMethodCard(icon: Icons.account_balance_rounded, label: 'Transferencia\nBancaria / QR'),
                _PaymentMethodCard(icon: Icons.qr_code_rounded, label: 'QR\nBoliviano'),
                _PaymentMethodCard(icon: Icons.phone_android_rounded, label: 'Tigo Money\n/ BNB Móvil'),
              ],
            ),
          ),

          const SizedBox(height: 32),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Colección Activa', style: AppTypography.headlineMd),
                TextButton(
                  onPressed: () {},
                  child: Text('VER TODO', style: AppTypography.labelSmGold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          SizedBox(
            height: 130,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: MockNFTs.collection.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, i) => _MiniNftCard(nft: MockNFTs.collection[i]),
            ),
          ),

          const SizedBox(height: 32),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text('Historial de Transacciones', style: AppTypography.headlineMd),
          ),
          const SizedBox(height: 12),

          ..._mockTransactions.map(
            (tx) => Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: _TransactionTile(tx: tx),
            ),
          ),
        ],
      ),
    );
  }

  void _showOnRampSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceContainer,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _OnRampSheet(),
    );
  }

  static const _mockTransactions = [
    _Tx(icon: Icons.shopping_bag_rounded, label: 'Adquisición Lote #042', date: 'Hoy, 14:30', amount: -150.0, isIncome: false),
    _Tx(icon: Icons.south_west_rounded, label: 'Carga de Saldo', date: 'Ayer, 09:15', amount: 500.0, isIncome: true),
    _Tx(icon: Icons.north_east_rounded, label: 'Retiro a Cuenta', date: '12 Oct, 18:45', amount: -200.0, isIncome: false),
    _Tx(icon: Icons.shopping_bag_rounded, label: 'Adquisición Lote #108', date: '10 Oct, 11:20', amount: -320.0, isIncome: false),
  ];
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({required this.usd, required this.bob, required this.walletAddress});
  final double usd;
  final double bob;
  final String walletAddress;

  String get _shortAddress => '${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.06),
            blurRadius: 32,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Align(
            alignment: Alignment.topRight,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          Text(
            'BALANCE DISPONIBLE',
            style: AppTypography.labelSm.copyWith(letterSpacing: 2),
          ),
          const SizedBox(height: 8),
          Text(
            '\$ ${usd.toStringAsFixed(2)}',
            style: AppTypography.headlineXl.copyWith(color: AppColors.primaryFixed),
          ),
          Text(
            '≈ Bs. ${bob.toStringAsFixed(2)}',
            style: AppTypography.bodyMdVariant,
          ),
          const SizedBox(height: 16),

          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: walletAddress));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Dirección copiada', style: AppTypography.bodyMd),
                  backgroundColor: AppColors.surfaceContainerHigh,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.account_balance_wallet_outlined, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text(_shortAddress, style: AppTypography.labelSm.copyWith(fontSize: 11)),
                  const SizedBox(width: 6),
                  Icon(Icons.copy_rounded, size: 12, color: AppColors.onSurfaceVariant),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodCard extends StatelessWidget {
  const _PaymentMethodCard({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainerLow,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
                ),
                child: Icon(icon, color: AppColors.onSurfaceVariant, size: 22),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: AppTypography.bodyMd.copyWith(fontSize: 13, height: 1.3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniNftCard extends StatelessWidget {
  const _MiniNftCard({required this.nft});
  final CofecitoNFT nft;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.coffee_rounded, color: AppColors.primary, size: 18),
              const Spacer(),
              Text('Lote ${nft.displayId}', style: AppTypography.labelSmGold.copyWith(fontSize: 10)),
            ],
          ),
          const SizedBox(height: 6),
          Text(nft.coffeeName, style: AppTypography.bodyMdBold.copyWith(fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(nft.rarity.label, style: AppTypography.labelSm.copyWith(fontSize: 10, color: AppColors.onSurfaceVariant)),
          const Spacer(),
          if (nft.cuppingScore != null)
            Row(
              children: [
                Icon(Icons.star_rounded, size: 12, color: AppColors.primary),
                const SizedBox(width: 3),
                Text(
                  nft.cuppingScore!.toStringAsFixed(1),
                  style: AppTypography.labelSmGold.copyWith(fontSize: 11),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _Tx {
  const _Tx({required this.icon, required this.label, required this.date, required this.amount, required this.isIncome});
  final IconData icon;
  final String label;
  final String date;
  final double amount;
  final bool isIncome;
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.tx});
  final _Tx tx;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: tx.isIncome
                  ? AppColors.primary.withValues(alpha: 0.1)
                  : AppColors.surfaceContainerHighest,
            ),
            child: Icon(tx.icon, size: 20, color: tx.isIncome ? AppColors.primary : AppColors.onSurfaceVariant),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx.label, style: AppTypography.bodyMdBold.copyWith(fontSize: 14)),
                Text(tx.date, style: AppTypography.labelSm.copyWith(color: AppColors.onSurfaceVariant.withValues(alpha: 0.7), fontSize: 11)),
              ],
            ),
          ),
          Text(
            '${tx.amount > 0 ? '+' : ''}\$ ${tx.amount.toStringAsFixed(2)}',
            style: AppTypography.bodyMdBold.copyWith(
              color: tx.isIncome ? AppColors.primaryFixed : AppColors.onSurface,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _OnRampSheet extends StatelessWidget {
  const _OnRampSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: AppColors.outlineVariant,
                borderRadius: BorderRadius.circular(100),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('Cargar Saldo', style: AppTypography.headlineMd),
          const SizedBox(height: 4),
          Text(
            'Elige el monto a cargar en tu Bóveda Digital',
            style: AppTypography.bodyMdVariant,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _QuickAmount(label: 'Bs. 50', usd: '7.18'),
              const SizedBox(width: 8),
              _QuickAmount(label: 'Bs. 100', usd: '14.37'),
              const SizedBox(width: 8),
              _QuickAmount(label: 'Bs. 500', usd: '71.84'),
              const SizedBox(width: 8),
              _QuickAmount(label: 'Bs. 1000', usd: '143.68'),
            ],
          ),
          const SizedBox(height: 20),
          PrimaryButton(
            label: 'CONTINUAR',
            icon: Icons.arrow_forward_rounded,
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }
}

class _QuickAmount extends StatelessWidget {
  const _QuickAmount({required this.label, required this.usd});
  final String label;
  final String usd;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text(label, style: AppTypography.bodyMdBold.copyWith(fontSize: 13), textAlign: TextAlign.center),
            Text('≈ \$$usd', style: AppTypography.labelSm.copyWith(fontSize: 10), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
