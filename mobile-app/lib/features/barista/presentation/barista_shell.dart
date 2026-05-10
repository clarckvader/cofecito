import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/role_provider.dart';

final _baristaTabProvider = StateProvider<int>((_) => 0);

class BaristaShell extends ConsumerWidget {
  const BaristaShell({super.key, required this.child});
  final Widget child;

  static const _tabs = [
    (label: 'Inicio',   icon: Icons.dashboard_outlined,     activeIcon: Icons.dashboard_rounded,       route: '/barista'),
    (label: 'Café',     icon: Icons.local_cafe_outlined,    activeIcon: Icons.local_cafe_rounded,      route: '/barista/cafe'),
    (label: 'Stock',    icon: Icons.inventory_2_outlined,   activeIcon: Icons.inventory_2_rounded,     route: '/barista/stock'),
    (label: 'Perfil',   icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded,          route: '/barista/perfil'),
  ];

  int _tabIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    if (loc.startsWith('/barista/cafe'))   return 1;
    if (loc.startsWith('/barista/stock'))  return 2;
    if (loc.startsWith('/barista/perfil')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final idx = _tabIndex(context);

    return Scaffold(
      extendBody: true,
      body: child,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/barista/generate-qr'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        elevation: 4,
        shape: const CircleBorder(),
        child: const Icon(Icons.qr_code_2_rounded, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _BaristaNavBar(
        selectedIndex: idx,
        onTap: (i) => context.go(_tabs[i].route),
        tabs: _tabs,
      ),
    );
  }
}

class _BaristaNavBar extends StatelessWidget {
  const _BaristaNavBar({
    required this.selectedIndex,
    required this.onTap,
    required this.tabs,
  });

  final int selectedIndex;
  final ValueChanged<int> onTap;
  final List<({String label, IconData icon, IconData activeIcon, String route})> tabs;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow.withValues(alpha: 0.97),
        border: Border(top: BorderSide(color: AppColors.primary.withValues(alpha: 0.1))),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              Expanded(child: _Tab(tab: tabs[0], selected: selectedIndex == 0, onTap: () => onTap(0))),
              Expanded(child: _Tab(tab: tabs[1], selected: selectedIndex == 1, onTap: () => onTap(1))),
              const SizedBox(width: 80),
              Expanded(child: _Tab(tab: tabs[2], selected: selectedIndex == 2, onTap: () => onTap(2))),
              Expanded(child: _Tab(tab: tabs[3], selected: selectedIndex == 3, onTap: () => onTap(3))),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.tab, required this.selected, required this.onTap});
  final ({String label, IconData icon, IconData activeIcon, String route}) tab;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.primary : AppColors.onSurfaceVariant;
    return InkWell(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(selected ? tab.activeIcon : tab.icon, color: color, size: 24),
          const SizedBox(height: 3),
          Text(tab.label,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                  color: color)),
        ],
      ),
    );
  }
}
