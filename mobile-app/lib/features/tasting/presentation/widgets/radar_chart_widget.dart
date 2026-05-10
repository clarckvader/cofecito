import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../data/models/tasting_note.dart';

class SensoryRadarChart extends StatelessWidget {
  const SensoryRadarChart({super.key, required this.note});

  final TastingNote note;

  static const _labels = ['Fragancia', 'Aroma', 'Sabor', 'Cuerpo', 'Acidez', 'Dulzor'];

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.1,
      child: RadarChart(
        RadarChartData(
          radarShape: RadarShape.polygon,
          tickCount: 5,
          ticksTextStyle: const TextStyle(color: Colors.transparent, fontSize: 0),
          tickBorderData: const BorderSide(
            color: Color(0x22E6C364),
            width: 1,
          ),
          gridBorderData: const BorderSide(
            color: Color(0x22E6C364),
            width: 1,
          ),
          radarBorderData: const BorderSide(
            color: Color(0x44E6C364),
            width: 1.5,
          ),
          titlePositionPercentageOffset: 0.22,
          titleTextStyle: AppTypography.labelSm.copyWith(
            color: AppColors.onSurfaceVariant,
            fontSize: 11,
          ),
          getTitle: (index, angle) {
            return RadarChartTitle(
              text: _labels[index],
              angle: angle,
            );
          },
          dataSets: [
            RadarDataSet(
              fillColor: AppColors.primary.withValues(alpha: 0.15),
              borderColor: AppColors.primary,
              borderWidth: 2,
              entryRadius: 4,
              dataEntries: [
                RadarEntry(value: note.fragrance),
                RadarEntry(value: note.aroma),
                RadarEntry(value: note.flavor),
                RadarEntry(value: note.body),
                RadarEntry(value: note.acidity),
                RadarEntry(value: note.sweetness),
              ],
            ),
          ],
        ),
        swapAnimationDuration: const Duration(milliseconds: 400),
        swapAnimationCurve: Curves.easeInOut,
      ),
    );
  }
}

class SensorySlider extends StatelessWidget {
  const SensorySlider({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.bodyMd),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(
                value.toStringAsFixed(1),
                style: AppTypography.labelSmGold,
              ),
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            trackHeight: 3,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
            overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
          ),
          child: Slider(
            value: value,
            min: 1,
            max: 5,
            divisions: 8,
            onChanged: onChanged,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(5, (i) {
              return Text(
                '${i + 1}',
                style: AppTypography.labelSm.copyWith(
                  color: AppColors.outlineVariant,
                  fontSize: 10,
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class CuppingScoreRing extends StatelessWidget {
  const CuppingScoreRing({super.key, required this.score});

  final double score;

  @override
  Widget build(BuildContext context) {
    final normalized = ((score - 70) / 30).clamp(0.0, 1.0);

    return SizedBox(
      width: 90,
      height: 90,
      child: CustomPaint(
        painter: _RingPainter(progress: normalized),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                score.toStringAsFixed(1),
                style: AppTypography.headlineMd.copyWith(
                  color: AppColors.primary,
                  fontSize: 20,
                ),
              ),
              Text('pts', style: AppTypography.labelSm),
            ],
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({required this.progress});
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 6;

    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = AppColors.surfaceContainerHigh
        ..style = PaintingStyle.stroke
        ..strokeWidth = 5,
    );

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      Paint()
        ..color = AppColors.primary
        ..style = PaintingStyle.stroke
        ..strokeWidth = 5
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) => old.progress != progress;
}
