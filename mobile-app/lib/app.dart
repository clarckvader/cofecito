import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'features/auth/presentation/splash_screen.dart';
import 'features/auth/presentation/role_selection_screen.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/scan/presentation/scan_screen.dart';
import 'features/tasting/presentation/tasting_screen.dart';
import 'features/traceability/presentation/traceability_screen.dart';
import 'features/wallet/presentation/wallet_screen.dart';
import 'features/barista/presentation/barista_shell.dart';
import 'features/barista/presentation/barista_dashboard_screen.dart';
import 'features/barista/presentation/generate_qr_screen.dart';
import 'shared/widgets/app_shell.dart';

final router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      pageBuilder: (context, state) => _fadePage(state, const SplashScreen()),
    ),
    GoRoute(
      path: '/role-selection',
      pageBuilder: (context, state) =>
          _fadePage(state, const RoleSelectionScreen()),
    ),

    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/',
          builder: (_, __) => const HomeScreen(),
        ),
        GoRoute(
          path: '/wallet',
          builder: (_, __) => const WalletScreen(),
        ),
      ],
    ),

    GoRoute(
      path: '/scan',
      pageBuilder: (context, state) => _fadePage(state, const ScanScreen()),
    ),
    GoRoute(
      path: '/tasting/:tokenId',
      builder: (context, state) =>
          TastingScreen(tokenId: state.pathParameters['tokenId']!),
    ),
    GoRoute(
      path: '/traceability/:tokenId',
      builder: (context, state) =>
          TraceabilityScreen(tokenId: state.pathParameters['tokenId']!),
    ),

    ShellRoute(
      builder: (context, state, child) => BaristaShell(child: child),
      routes: [
        GoRoute(
          path: '/barista',
          builder: (_, __) => const BaristaDashboardScreen(),
        ),
        GoRoute(
          path: '/barista/cafe',
          builder: (_, __) => const _StubScreen(title: 'Cafés', icon: Icons.local_cafe_rounded),
        ),
        GoRoute(
          path: '/barista/stock',
          builder: (_, __) => const _StubScreen(title: 'Stock', icon: Icons.inventory_2_rounded),
        ),
        GoRoute(
          path: '/barista/perfil',
          builder: (_, __) => const _StubScreen(title: 'Perfil', icon: Icons.person_rounded),
        ),
      ],
    ),

    GoRoute(
      path: '/barista/generate-qr',
      pageBuilder: (context, state) =>
          _slidePage(state, const GenerateQrScreen()),
    ),
  ],
);

CustomTransitionPage<void> _fadePage(GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (_, animation, __, child) =>
        FadeTransition(opacity: animation, child: child),
    transitionDuration: const Duration(milliseconds: 350),
  );
}

CustomTransitionPage<void> _slidePage(GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (_, animation, __, child) {
      final offset = Tween<Offset>(
        begin: const Offset(0, 0.06),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut));
      return FadeTransition(
        opacity: animation,
        child: SlideTransition(position: offset, child: child),
      );
    },
  );
}

class _StubScreen extends StatelessWidget {
  const _StubScreen({required this.title, required this.icon});
  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: const Color(0xFFE6C364).withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFFD0C5B2),
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Próximamente',
              style: TextStyle(color: Color(0xFF99907E), fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
