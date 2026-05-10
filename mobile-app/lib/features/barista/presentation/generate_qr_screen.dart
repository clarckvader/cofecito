import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';

class GenerateQrScreen extends StatefulWidget {
  const GenerateQrScreen({super.key});

  @override
  State<GenerateQrScreen> createState() => _GenerateQrScreenState();
}

class _GenerateQrScreenState extends State<GenerateQrScreen>
    with SingleTickerProviderStateMixin {
  static const _totalSeconds = 5 * 60;
  int _remaining = _totalSeconds;
  Timer? _timer;

  late final AnimationController _shimmerCtrl;

  @override
  void initState() {
    super.initState();
    _shimmerCtrl = AnimationController(
        vsync: this, duration: const Duration(seconds: 2))
      ..repeat();

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remaining > 0) {
        setState(() => _remaining--);
      } else {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _shimmerCtrl.dispose();
    super.dispose();
  }

  void _regenerate() => setState(() => _remaining = _totalSeconds);

  String get _timeLabel {
    final m = (_remaining ~/ 60).toString().padLeft(2, '0');
    final s = (_remaining % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  bool get _isExpiringSoon => _remaining < 60;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface.withValues(alpha: 0.9),
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_rounded,
              color: AppColors.primary),
        ),
        title: Text(
          'COFECITO',
          style: AppTypography.labelSmGold.copyWith(
              letterSpacing: 4, fontSize: 16),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.account_balance_wallet_outlined,
                color: AppColors.onSurfaceVariant),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding:
            const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              children: [
                const SizedBox(height: 8),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.2)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.5),
                        blurRadius: 32,
                        offset: const Offset(0, 8),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        height: 1,
                        width: 80,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.transparent,
                              AppColors.primary.withValues(alpha: 0.5),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),

                      Text(
                        'Escanea para reclamar NFT',
                        style: AppTypography.headlineMd
                            .copyWith(fontSize: 18),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 24),

                      _QrDisplay(shimmerCtrl: _shimmerCtrl),

                      const SizedBox(height: 20),

                      _CountdownBadge(
                          label: _timeLabel,
                          isExpiring: _isExpiringSoon),

                      const SizedBox(height: 20),

                      Divider(
                          color:
                              AppColors.outlineVariant.withValues(alpha: 0.2)),
                      const SizedBox(height: 16),

                      Text(
                        'LOTE ACTIVO',
                        style: AppTypography.labelSm.copyWith(
                            letterSpacing: 3,
                            color: AppColors.outline),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Geisha – Finca El Sol',
                        style: AppTypography.headlineMd.copyWith(
                            color: AppColors.primary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _InfoChip(label: 'Lavado'),
                          const SizedBox(width: 8),
                          _InfoChip(label: '1800m'),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                SecondaryButton(
                  label: 'Regenerar QR',
                  icon: Icons.refresh_rounded,
                  onPressed: _regenerate,
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QrDisplay extends StatelessWidget {
  const _QrDisplay({required this.shimmerCtrl});
  final AnimationController shimmerCtrl;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: shimmerCtrl,
      builder: (_, __) {
        final glowOpacity = 0.08 + 0.07 * math.sin(shimmerCtrl.value * math.pi * 2);
        return Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 224,
              height: 224,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: glowOpacity * 2),
                    blurRadius: 32,
                    spreadRadius: 4,
                  ),
                ],
              ),
            ),

            Container(
              width: 220,
              height: 220,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.8),
                  width: 2,
                ),
              ),
              child: CustomPaint(
                painter: _MockQrPainter(),
              ),
            ),

            ..._corners(),
          ],
        );
      },
    );
  }

  List<Widget> _corners() {
    const s = 220.0;
    const c = 18.0;
    const w = 3.0;
    final color = AppColors.primary;
    return [
      Positioned(top: 0, left: 0, child: _Corner(color: color, size: c, strokeWidth: w, quadrant: 0)),
      Positioned(top: 0, right: 0, child: _Corner(color: color, size: c, strokeWidth: w, quadrant: 1)),
      Positioned(bottom: 0, left: 0, child: _Corner(color: color, size: c, strokeWidth: w, quadrant: 2)),
      Positioned(bottom: 0, right: 0, child: _Corner(color: color, size: c, strokeWidth: w, quadrant: 3)),
    ];
  }
}

class _Corner extends StatelessWidget {
  const _Corner({required this.color, required this.size, required this.strokeWidth, required this.quadrant});
  final Color color;
  final double size;
  final double strokeWidth;
  final int quadrant;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _CornerPainter(color: color, strokeWidth: strokeWidth, quadrant: quadrant)),
    );
  }
}

class _CornerPainter extends CustomPainter {
  const _CornerPainter({required this.color, required this.strokeWidth, required this.quadrant});
  final Color color;
  final double strokeWidth;
  final int quadrant;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.square;
    final w = size.width;
    final h = size.height;
    switch (quadrant) {
      case 0: canvas.drawPath(Path()..moveTo(0, h)..lineTo(0, 0)..lineTo(w, 0), p);
      case 1: canvas.drawPath(Path()..moveTo(0, 0)..lineTo(w, 0)..lineTo(w, h), p);
      case 2: canvas.drawPath(Path()..moveTo(0, 0)..lineTo(0, h)..lineTo(w, h), p);
      case 3: canvas.drawPath(Path()..moveTo(0, h)..lineTo(w, h)..lineTo(w, 0), p);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

class _MockQrPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black;
    const grid = 21;
    final cell = size.width / grid;

    final rng = _SimpleRng(seed: 99991);

    _drawFinder(canvas, paint, cell, 0, 0);
    _drawFinder(canvas, paint, cell, grid - 7, 0);
    _drawFinder(canvas, paint, cell, 0, grid - 7);

    for (var r = 0; r < grid; r++) {
      for (var c = 0; c < grid; c++) {
        if (_inFinder(r, c, grid)) continue;
        if (rng.next() > 0.55) {
          canvas.drawRect(
            Rect.fromLTWH(c * cell + 0.5, r * cell + 0.5, cell - 1, cell - 1),
            paint,
          );
        }
      }
    }
  }

  void _drawFinder(Canvas c, Paint p, double cell, int col, int row) {
    for (var r = row; r < row + 7; r++) {
      for (var col2 = col; col2 < col + 7; col2++) {
        final inOuter = r == row || r == row + 6 || col2 == col || col2 == col + 6;
        final inInner = r >= row + 2 && r <= row + 4 && col2 >= col + 2 && col2 <= col + 4;
        if (inOuter || inInner) {
          c.drawRect(
            Rect.fromLTWH(col2 * cell + 0.5, r * cell + 0.5, cell - 1, cell - 1),
            p,
          );
        }
      }
    }
  }

  bool _inFinder(int r, int c, int grid) {
    if (r < 8 && c < 8) return true;
    if (r < 8 && c >= grid - 8) return true;
    if (r >= grid - 8 && c < 8) return true;
    return false;
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

class _SimpleRng {
  _SimpleRng({required int seed}) : _seed = seed;
  int _seed;
  double next() {
    _seed = (_seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (_seed & 0xFFFF) / 0xFFFF;
  }
}

class _CountdownBadge extends StatelessWidget {
  const _CountdownBadge({required this.label, required this.isExpiring});
  final String label;
  final bool isExpiring;

  @override
  Widget build(BuildContext context) {
    final color = isExpiring ? AppColors.error : AppColors.onSurfaceVariant;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isExpiring
            ? AppColors.error.withValues(alpha: 0.1)
            : AppColors.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(
            color: (isExpiring ? AppColors.error : AppColors.outlineVariant)
                .withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_rounded, size: 18, color: color),
          const SizedBox(width: 8),
          Text(
            'Expira en $label',
            style: AppTypography.bodyMdBold.copyWith(color: color, fontSize: 14),
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(100),
        border:
            Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Text(label,
          style: AppTypography.labelSm
              .copyWith(color: AppColors.onSurfaceVariant)),
    );
  }
}
