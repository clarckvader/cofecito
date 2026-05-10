import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';

enum MintingState { scanning, detected, minting, success }

final _mintingStateProvider =
    StateProvider<MintingState>((_) => MintingState.scanning);

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen>
    with TickerProviderStateMixin {
  late final AnimationController _scanLineCtrl;
  late final AnimationController _pulseCtrl;
  Timer? _autoDetectTimer;

  @override
  void initState() {
    super.initState();

    _scanLineCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);

    _autoDetectTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted &&
          ref.read(_mintingStateProvider) == MintingState.scanning) {
        ref.read(_mintingStateProvider.notifier).state = MintingState.detected;
      }
    });
  }

  @override
  void dispose() {
    _scanLineCtrl.dispose();
    _pulseCtrl.dispose();
    _autoDetectTimer?.cancel();
    Future.microtask(() {
      if (ref.context.mounted) {
        ref.read(_mintingStateProvider.notifier).state = MintingState.scanning;
      }
    });
    super.dispose();
  }

  Future<void> _startMinting() async {
    ref.read(_mintingStateProvider.notifier).state = MintingState.minting;
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      ref.read(_mintingStateProvider.notifier).state = MintingState.success;
    }
  }

  void _reset() {
    ref.read(_mintingStateProvider.notifier).state = MintingState.scanning;
    _autoDetectTimer?.cancel();
    _autoDetectTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted &&
          ref.read(_mintingStateProvider) == MintingState.scanning) {
        ref.read(_mintingStateProvider.notifier).state = MintingState.detected;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(_mintingStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          if (state == MintingState.scanning) _MockCameraView(scanLineCtrl: _scanLineCtrl),

          if (state == MintingState.scanning)
            _ScanOverlay(pulseCtrl: _pulseCtrl),

          if (state == MintingState.detected)
            _DetectedPanel(onMint: _startMinting, onReset: _reset),

          if (state == MintingState.minting)
            const _MintingPanel(),

          if (state == MintingState.success)
            _SuccessPanel(onDone: () => context.pop()),

          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.close_rounded,
                      color: Colors.white, size: 28),
                  style: IconButton.styleFrom(
                      backgroundColor: Colors.black45,
                      shape: const CircleBorder()),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MockCameraView extends StatelessWidget {
  const _MockCameraView({required this.scanLineCtrl});
  final AnimationController scanLineCtrl;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: Alignment.center,
              radius: 1.2,
              colors: [
                const Color(0xFF1A1200),
                Colors.black,
              ],
            ),
          ),
        ),

        CustomPaint(painter: _NoisePainter()),

        AnimatedBuilder(
          animation: scanLineCtrl,
          builder: (_, __) {
            final h = MediaQuery.of(context).size.height;
            final top = h * 0.28 + scanLineCtrl.value * 260;
            return Positioned(
              left: (MediaQuery.of(context).size.width - 260) / 2,
              top: top,
              child: Container(
                width: 260,
                height: 2,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      AppColors.primary.withValues(alpha: 0.8),
                      AppColors.primary,
                      AppColors.primary.withValues(alpha: 0.8),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _NoisePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rng = math.Random(42);
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.015);
    for (var i = 0; i < 800; i++) {
      canvas.drawCircle(
        Offset(rng.nextDouble() * size.width, rng.nextDouble() * size.height),
        rng.nextDouble() * 1.5,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

class _ScanOverlay extends StatelessWidget {
  const _ScanOverlay({required this.pulseCtrl});
  final AnimationController pulseCtrl;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          const SizedBox(height: 72),

          Text(
            'ESCANEAR TAZA',
            style: AppTypography.labelSmGold.copyWith(letterSpacing: 3),
          ),
          const SizedBox(height: 8),
          Text(
            'Apunta al código QR\nimpreso en tu taza Cofecito',
            textAlign: TextAlign.center,
            style: AppTypography.bodyMd.copyWith(color: Colors.white70),
          ),

          const SizedBox(height: 32),

          Center(
            child: SizedBox(
              width: 260,
              height: 260,
              child: CustomPaint(
                painter: _CornersPainter(),
                child: Center(
                  child: AnimatedBuilder(
                    animation: pulseCtrl,
                    builder: (_, __) => Opacity(
                      opacity: 0.3 + pulseCtrl.value * 0.5,
                      child: Icon(
                        Icons.qr_code_2_rounded,
                        size: 80,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 32),

          Text(
            'Buscando código…',
            style: AppTypography.bodyMdVariant.copyWith(
              color: Colors.white38,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}

class _CornersPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    const c = 28.0;

    canvas.drawPath(Path()..moveTo(0, c)..lineTo(0, 0)..lineTo(c, 0), p);
    canvas.drawPath(
        Path()
          ..moveTo(size.width - c, 0)
          ..lineTo(size.width, 0)
          ..lineTo(size.width, c),
        p);
    canvas.drawPath(
        Path()
          ..moveTo(0, size.height - c)
          ..lineTo(0, size.height)
          ..lineTo(c, size.height),
        p);
    canvas.drawPath(
        Path()
          ..moveTo(size.width - c, size.height)
          ..lineTo(size.width, size.height)
          ..lineTo(size.width, size.height - c),
        p);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

class _DetectedPanel extends StatelessWidget {
  const _DetectedPanel({required this.onMint, required this.onReset});
  final VoidCallback onMint;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return _FullPanel(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withValues(alpha: 0.12),
              border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3), width: 1.5),
            ),
            child: const Icon(Icons.qr_code_2_rounded,
                color: AppColors.primary, size: 40),
          ),
          const SizedBox(height: 28),
          Text('¡QR Detectado!', style: AppTypography.headlineMd),
          const SizedBox(height: 10),
          Text(
            'Lote: COFECITO-042-YUNGAS\n\nConfirma para acuñar tu NFT ERC-721\nen la red Polygon.',
            textAlign: TextAlign.center,
            style: AppTypography.bodyMdVariant,
          ),
          const SizedBox(height: 40),
          PrimaryButton(
            label: 'ACUÑAR MI NFT',
            icon: Icons.toll_rounded,
            onPressed: onMint,
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: onReset,
            child: Text('Escanear otro código',
                style: AppTypography.bodyMdVariant),
          ),
        ],
      ),
    );
  }
}

class _MintingPanel extends StatelessWidget {
  const _MintingPanel();

  @override
  Widget build(BuildContext context) {
    return _FullPanel(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 80,
            height: 80,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: AppColors.primary,
              backgroundColor: AppColors.surfaceContainerHigh,
            ),
          ),
          const SizedBox(height: 28),
          Text('Acuñando en Blockchain…', style: AppTypography.headlineMd),
          const SizedBox(height: 10),
          Text(
            'Enviando transacción a Polygon…',
            style: AppTypography.bodyMdVariant,
          ),
          const SizedBox(height: 40),
          _MintingSteps(),
        ],
      ),
    );
  }
}

class _MintingSteps extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        _Step(label: 'Verificando QR',               done: true),
        _Step(label: 'Preparando metadata IPFS',      done: true),
        _Step(label: 'Enviando tx a Polygon',         done: false, active: true),
        _Step(label: 'Confirmando bloque',            done: false),
      ],
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.label, required this.done, this.active = false});
  final String label;
  final bool done;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final color = done
        ? AppColors.primary
        : active
            ? AppColors.primary.withValues(alpha: 0.7)
            : AppColors.onSurfaceVariant.withValues(alpha: 0.4);
    final icon = done
        ? Icons.check_circle_rounded
        : active
            ? Icons.radio_button_checked_rounded
            : Icons.radio_button_unchecked_rounded;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 12),
        Text(label, style: AppTypography.bodyMd.copyWith(color: color)),
      ]),
    );
  }
}

class _SuccessPanel extends StatelessWidget {
  const _SuccessPanel({required this.onDone});
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    return _FullPanel(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withValues(alpha: 0.12),
              border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3), width: 1.5),
            ),
            child: const Icon(Icons.check_circle_rounded,
                color: AppColors.primary, size: 40),
          ),
          const SizedBox(height: 28),
          Text('¡NFT Acuñado!', style: AppTypography.headlineMd),
          const SizedBox(height: 10),
          Text(
            '"Yungas Oro #042" ha sido acuñado\nen tu wallet. ¡Disfruta el café!',
            textAlign: TextAlign.center,
            style: AppTypography.bodyMdVariant,
          ),
          const SizedBox(height: 12),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerHigh,
              borderRadius: BorderRadius.circular(100),
              border: Border.all(
                  color: AppColors.outlineVariant.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.link_rounded,
                    size: 14, color: AppColors.primary),
                const SizedBox(width: 6),
                Text(
                  'Tx: 0x4a7f...3e2d',
                  style: AppTypography.labelSm.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
          PrimaryButton(
            label: 'VER MI COLECCIÓN',
            icon: Icons.collections_bookmark_rounded,
            onPressed: onDone,
          ),
        ],
      ),
    );
  }
}

class _FullPanel extends StatelessWidget {
  const _FullPanel({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          child: child,
        ),
      ),
    );
  }
}
